import { Router } from 'express';
import { z } from 'zod';
import { prisma, io } from '../index.js';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import archiver from 'archiver';
import * as aiProvider from '../services/ai/provider.js';
import { renderBlocksToHtml, type RenderContext } from '../services/blockRenderer.js';
import type { PageLayouts } from '@affiliate/shared';

export const generationRouter = Router();

// Generation options schema
const generateOptionsSchema = z.object({
  useAI: z.boolean().default(false),
  regenerateContent: z.boolean().default(false),
  regenerateImages: z.boolean().default(false),
  textProvider: z.enum(['openai', 'gemini']).optional(),
  imageProvider: z.enum(['dalle', 'imagen']).optional(),
});

// GET /api/projects/:id/generate/ai-status - Check AI availability
generationRouter.get('/:id/generate/ai-status', (_req, res) => {
  const status = aiProvider.getAIStatus();
  res.json(status);
});

// POST /api/projects/:id/generate - Start generation
generationRouter.post('/:id/generate', async (req, res) => {
  try {
    const options = generateOptionsSchema.parse(req.body);

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { products: true, ctas: true, domains: true },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get settings for API keys
    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });

    // Get next version number
    const lastGeneration = await prisma.generation.findFirst({
      where: { projectId: req.params.id },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (lastGeneration?.version ?? 0) + 1;

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        version: nextVersion,
        projectId: req.params.id,
        zipPath: '',
        settingsSnapshot: JSON.stringify({
          project,
          options,
          generatedAt: new Date().toISOString(),
        }),
        pagesGenerated: 0,
        imagesGenerated: 0,
        totalFiles: 0,
        status: 'pending',
        aiProvider: JSON.stringify({
          text: options.textProvider || settings?.defaultTextProvider || 'openai',
          images: options.imageProvider || settings?.defaultImageProvider || 'dalle',
        }),
      },
    });

    // TODO: Queue the generation job
    // For now, emit started event and return
    io.to(`project:${req.params.id}`).emit('generation:started', {
      generationId: generation.id,
      version: nextVersion,
    });

    // Simulate starting the generation (will be replaced with job queue)
    processGeneration(generation.id, project, options).catch(console.error);

    res.status(202).json({
      generationId: generation.id,
      version: nextVersion,
      status: 'pending',
      message: 'Generation started',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error starting generation:', error);
    res.status(500).json({ error: 'Failed to start generation' });
  }
});

// Simple template engine - replace {{variable}} and handle {{#array}}...{{/array}}
function renderTemplate(template: string, data: Record<string, unknown>): string {
  let result = template;

  // Handle negated conditionals: {{^key}}...{{/key}} (show content if key is falsy)
  const negatedRegex = /\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  result = result.replace(negatedRegex, (_, key, content) => {
    const value = data[key];
    // Show content only if value is falsy
    if (!value) {
      return renderTemplate(content, data);
    }
    return '';
  });

  // Handle boolean conditionals: {{#key}}...{{/key}} (for booleans, show content if truthy)
  // and array loops: {{#array}}...{{/array}}
  const loopRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  result = result.replace(loopRegex, (_, key, content) => {
    const value = data[key];

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => {
        let itemContent = content;
        // Replace item properties
        if (typeof item === 'object' && item !== null) {
          for (const [k, v] of Object.entries(item)) {
            itemContent = itemContent.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v ?? ''));
          }
        }
        // Handle {{.}} for simple arrays
        itemContent = itemContent.replace(/\{\{\.\}\}/g, String(item));
        return itemContent;
      }).join('');
    }

    // Handle booleans/truthy values - show content if truthy
    if (value) {
      return renderTemplate(content, data);
    }

    return '';
  });

  // Handle simple variables: {{variable}}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'object' || value === null) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value ?? ''));
    }
  }

  return result;
}

// Generate Amazon affiliate URL
function generateAffiliateUrl(asin: string, trackingId: string, marketplace: string): string {
  const domain = marketplace.startsWith('amazon.') ? marketplace : `amazon.${marketplace}`;
  return `https://www.${domain}/dp/${asin}?tag=${trackingId}`;
}

// Darken a hex color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// Generate .htaccess content
interface HtaccessConfig {
  enableGzip?: boolean;
  enableCaching?: boolean;
  forceHttps?: boolean;
  wwwRedirect?: 'to-www' | 'to-non-www' | 'none';
  customRules?: string;
}

function generateHtaccess(config: HtaccessConfig, primaryDomain?: string): string {
  const lines: string[] = [
    '# Generated by Affiliate Site Generator',
    `# Generated at: ${new Date().toISOString()}`,
    '',
  ];

  // Force HTTPS
  if (config.forceHttps) {
    lines.push('# Force HTTPS');
    lines.push('RewriteEngine On');
    lines.push('RewriteCond %{HTTPS} off');
    lines.push('RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
    lines.push('');
  }

  // WWW Redirect
  if (config.wwwRedirect === 'to-www' && primaryDomain) {
    lines.push('# Redirect to www');
    lines.push('RewriteEngine On');
    lines.push('RewriteCond %{HTTP_HOST} !^www\\. [NC]');
    lines.push(`RewriteRule ^(.*)$ https://www.${primaryDomain}/$1 [L,R=301]`);
    lines.push('');
  } else if (config.wwwRedirect === 'to-non-www' && primaryDomain) {
    lines.push('# Redirect to non-www');
    lines.push('RewriteEngine On');
    lines.push('RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]');
    lines.push(`RewriteRule ^(.*)$ https://${primaryDomain.replace(/^www\./, '')}/$1 [L,R=301]`);
    lines.push('');
  }

  // Gzip Compression
  if (config.enableGzip) {
    lines.push('# Enable Gzip Compression');
    lines.push('<IfModule mod_deflate.c>');
    lines.push('  AddOutputFilterByType DEFLATE text/html');
    lines.push('  AddOutputFilterByType DEFLATE text/css');
    lines.push('  AddOutputFilterByType DEFLATE text/javascript');
    lines.push('  AddOutputFilterByType DEFLATE application/javascript');
    lines.push('  AddOutputFilterByType DEFLATE application/json');
    lines.push('  AddOutputFilterByType DEFLATE application/xml');
    lines.push('  AddOutputFilterByType DEFLATE image/svg+xml');
    lines.push('</IfModule>');
    lines.push('');
  }

  // Browser Caching
  if (config.enableCaching) {
    lines.push('# Enable Browser Caching');
    lines.push('<IfModule mod_expires.c>');
    lines.push('  ExpiresActive On');
    lines.push('  ');
    lines.push('  # Images');
    lines.push('  ExpiresByType image/jpeg "access plus 1 year"');
    lines.push('  ExpiresByType image/png "access plus 1 year"');
    lines.push('  ExpiresByType image/gif "access plus 1 year"');
    lines.push('  ExpiresByType image/webp "access plus 1 year"');
    lines.push('  ExpiresByType image/svg+xml "access plus 1 year"');
    lines.push('  ExpiresByType image/x-icon "access plus 1 year"');
    lines.push('  ');
    lines.push('  # CSS and JavaScript');
    lines.push('  ExpiresByType text/css "access plus 1 month"');
    lines.push('  ExpiresByType application/javascript "access plus 1 month"');
    lines.push('  ExpiresByType text/javascript "access plus 1 month"');
    lines.push('  ');
    lines.push('  # Fonts');
    lines.push('  ExpiresByType font/woff2 "access plus 1 year"');
    lines.push('  ExpiresByType font/woff "access plus 1 year"');
    lines.push('  ExpiresByType font/ttf "access plus 1 year"');
    lines.push('  ');
    lines.push('  # HTML');
    lines.push('  ExpiresByType text/html "access plus 1 hour"');
    lines.push('</IfModule>');
    lines.push('');
    lines.push('# Cache-Control Headers');
    lines.push('<IfModule mod_headers.c>');
    lines.push('  <FilesMatch "\\.(ico|jpe?g|png|gif|webp|svg|woff2?|ttf|css|js)$">');
    lines.push('    Header set Cache-Control "public, max-age=31536000, immutable"');
    lines.push('  </FilesMatch>');
    lines.push('  <FilesMatch "\\.(html|htm)$">');
    lines.push('    Header set Cache-Control "public, max-age=3600, must-revalidate"');
    lines.push('  </FilesMatch>');
    lines.push('</IfModule>');
    lines.push('');
  }

  // Security Headers
  lines.push('# Security Headers');
  lines.push('<IfModule mod_headers.c>');
  lines.push('  Header always set X-Content-Type-Options "nosniff"');
  lines.push('  Header always set X-Frame-Options "SAMEORIGIN"');
  lines.push('  Header always set X-XSS-Protection "1; mode=block"');
  lines.push('  Header always set Referrer-Policy "strict-origin-when-cross-origin"');
  lines.push('</IfModule>');
  lines.push('');

  // Prevent directory listing
  lines.push('# Prevent Directory Listing');
  lines.push('Options -Indexes');
  lines.push('');

  // Block sensitive files
  lines.push('# Block Access to Sensitive Files');
  lines.push('<FilesMatch "^\\.(htaccess|htpasswd|env|git|gitignore)">');
  lines.push('  Order allow,deny');
  lines.push('  Deny from all');
  lines.push('</FilesMatch>');
  lines.push('');

  // Custom 404
  lines.push('# Custom Error Pages');
  lines.push('ErrorDocument 404 /index.html');
  lines.push('');

  // Custom rules
  if (config.customRules?.trim()) {
    lines.push('# Custom Rules');
    lines.push(config.customRules.trim());
    lines.push('');
  }

  return lines.join('\n');
}

// Product interface for type safety
interface ProductData {
  id: string;
  asin: string;
  title?: string | null;
  customTitle?: string | null;
  customDescription?: string | null;
  imageUrl?: string | null;
}

interface CTAData {
  id: string;
  name: string;
  label: string;
  placement: string;
  customUrl?: string | null;
}

// Background generation processor
async function processGeneration(
  generationId: string,
  project: Awaited<ReturnType<typeof prisma.project.findUnique>> & {
    products: ProductData[];
    ctas: CTAData[];
    domains: { domain: string; isPrimary: boolean }[];
  },
  options: z.infer<typeof generateOptionsSchema>
) {
  if (!project) return;

  const startTime = Date.now();

  try {
    // Update status to processing
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'processing' },
    });

    io.to(`project:${project.id}`).emit('generation:progress', {
      generationId,
      phase: 'starting',
      progress: 5,
      message: 'Initializing generation...',
    });

    // Create output directory
    const outputDir = path.join(process.cwd(), 'output', project.slug);
    await fs.mkdir(outputDir, { recursive: true });

    // Load template
    io.to(`project:${project.id}`).emit('generation:progress', {
      generationId,
      phase: 'template',
      progress: 15,
      message: 'Loading template...',
    });

    const templateDir = path.join(process.cwd(), 'src', 'templates', project.template || 'landing');
    let templateHtml: string;
    try {
      templateHtml = await fs.readFile(path.join(templateDir, 'index.html'), 'utf-8');
    } catch {
      // Fallback to landing template
      templateHtml = await fs.readFile(path.join(process.cwd(), 'src', 'templates', 'landing', 'index.html'), 'utf-8');
    }

    // Prepare template data
    const brandColors = JSON.parse(project.brandColors);
    const primaryColor = brandColors.primary || '#2563eb';
    const mainCta = project.ctas.find(c => c.placement === 'hero') || project.ctas[0];

    // Check if AI generation is enabled
    let aiContent: aiProvider.GeneratedContent | null = null;
    if (options.useAI) {
      io.to(`project:${project.id}`).emit('generation:progress', {
        generationId,
        phase: 'ai',
        progress: 25,
        message: 'Generating content with AI...',
      });

      try {
        aiContent = await aiProvider.generateContent(
          {
            brandName: project.brandName,
            brandDescription: project.brandDescription || undefined,
            products: project.products.map(p => ({
              asin: p.asin,
              title: p.title || undefined,
              customTitle: p.customTitle || undefined,
              customDescription: p.customDescription || undefined,
            })),
            template: project.template,
          },
          options.textProvider
        );
        console.log('AI content generated successfully');
      } catch (error) {
        console.error('AI content generation failed, using defaults:', error);
        io.to(`project:${project.id}`).emit('generation:progress', {
          generationId,
          phase: 'ai-fallback',
          progress: 30,
          message: 'AI generation failed, using default content...',
        });
      }
    }

    io.to(`project:${project.id}`).emit('generation:progress', {
      generationId,
      phase: 'content',
      progress: 40,
      message: 'Preparing content...',
    });

    // Prepare products data - merge with AI content if available
    const productsData = project.products.map((p, idx) => {
      const aiProduct = aiContent?.products?.find(ap => ap.asin === p.asin) || aiContent?.products?.[idx];
      return {
        title: p.customTitle || aiProduct?.title || p.title || `Product ${idx + 1}`,
        description: p.customDescription || aiProduct?.description || `High-quality product available on Amazon. ASIN: ${p.asin}`,
        imageUrl: p.imageUrl || `https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=${encodeURIComponent(p.asin)}`,
        affiliateUrl: generateAffiliateUrl(p.asin, project.amazonTrackingId, project.amazonMarketplace),
        rating: aiProduct?.rating || '4.5',
        price: 'Check Price',
        ctaLabel: mainCta?.label || 'View on Amazon',
      };
    });

    // Generate features based on brand - use AI if available
    const defaultFeatures = aiContent?.features || [
      { icon: '★', title: 'Premium Quality', description: `${project.brandName} products are carefully selected for quality and durability.` },
      { icon: '✓', title: 'Expert Reviews', description: 'Our team thoroughly tests and reviews each product before recommendation.' },
      { icon: '⚡', title: 'Fast Shipping', description: 'All products are available with Amazon Prime for quick delivery.' },
      { icon: '🛡️', title: 'Buyer Protection', description: 'Shop with confidence through Amazon\'s trusted marketplace.' },
    ];

    // Generate comparison data
    const comparisonProducts = productsData.slice(0, 3).map(p => ({ name: p.title.substring(0, 20) }));
    const comparisonFeatures = [
      { name: 'Quality Rating', values: productsData.slice(0, 3).map(() => '★★★★★') },
      { name: 'Prime Eligible', values: productsData.slice(0, 3).map(() => '<span class="check">✓ Yes</span>') },
      { name: 'Free Returns', values: productsData.slice(0, 3).map(() => '<span class="check">✓ Yes</span>') },
      { name: 'Our Pick', values: productsData.slice(0, 3).map((_, i) => i === 0 ? '<span class="check">★ Best</span>' : '-') },
    ];

    // Generate testimonials - use AI if available
    const testimonials = aiContent?.testimonials || [
      { text: `I've been using products from ${project.brandName} for months now. The quality is outstanding and the recommendations are always spot-on!`, name: 'Sarah M.', title: 'Verified Buyer', initial: 'S' },
      { text: `Great selection and honest reviews. ${project.brandName} helped me find exactly what I needed without the hassle.`, name: 'Michael R.', title: 'Verified Buyer', initial: 'M' },
      { text: `The comparison guides saved me hours of research. Highly recommend checking out their product picks!`, name: 'Jennifer K.', title: 'Verified Buyer', initial: 'J' },
    ];

    // Check for uploaded assets
    const uploadsDir = path.join(process.cwd(), 'uploads', project.id);
    let logoFile: string | null = null;
    let faviconFile: string | null = null;

    try {
      const uploadedFiles = await fs.readdir(uploadsDir);
      logoFile = uploadedFiles.find(f => f.startsWith('logo')) || null;
      faviconFile = uploadedFiles.find(f => f.startsWith('favicon')) || null;
    } catch {
      // No uploads directory - that's fine
    }

    const templateData: Record<string, unknown> = {
      // Brand
      brandName: project.brandName,
      brandDescription: project.brandDescription || `${project.brandName} - Your trusted source for product recommendations.`,

      // Uploaded assets
      logoUrl: logoFile ? `assets/${logoFile}` : '',
      faviconUrl: faviconFile ? `assets/${faviconFile}` : '',
      hasLogo: !!logoFile,
      hasFavicon: !!faviconFile,

      // Meta - use AI content if available
      metaDescription: aiContent?.meta?.description || `${project.brandName} - ${project.brandDescription || 'Discover the best products with honest reviews and comparisons.'}`,
      tagline: aiContent?.meta?.tagline || project.brandDescription?.substring(0, 50) || 'Expert Product Recommendations',

      // Colors
      primaryColor,
      primaryDark: darkenColor(primaryColor, 15),
      secondaryColor: brandColors.secondary || '#1e40af',
      accentColor: brandColors.accent || '#f59e0b',

      // Hero - use AI content if available
      heroBadge: aiContent?.hero?.badge || 'Top Rated Products',
      heroTitle: aiContent?.hero?.title || `Discover the Best ${project.brandName} Products`,
      heroDescription: aiContent?.hero?.description || project.brandDescription || `We've researched and tested the top products to help you make the right choice. Find expert reviews, comparisons, and the best deals.`,
      heroImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&auto=format',

      // CTA - use AI content if available
      mainCtaLabel: aiContent?.cta?.buttonLabel || mainCta?.label || 'Shop Now on Amazon',
      mainCtaUrl: productsData[0]?.affiliateUrl || '#products',

      // Features - use AI content if available
      featuresTitle: aiContent?.featuresSection?.title || `Why Choose ${project.brandName}?`,
      featuresSubtitle: aiContent?.featuresSection?.subtitle || 'We make finding the right products easy with expert guidance and honest reviews.',
      features: defaultFeatures,

      // Products - use AI content if available
      productsTitle: aiContent?.productsSection?.title || 'Our Top Picks',
      productsSubtitle: aiContent?.productsSection?.subtitle || `Hand-selected products reviewed by our ${project.brandName} experts.`,
      products: productsData,

      // Comparison - use AI content if available
      comparisonTitle: aiContent?.comparisonSection?.title || 'Quick Comparison',
      comparisonSubtitle: aiContent?.comparisonSection?.subtitle || 'See how our top picks stack up against each other.',
      comparisonProducts,
      comparisonFeatures,

      // Testimonials - use AI content if available
      testimonialsTitle: aiContent?.testimonialsSection?.title || 'What Our Readers Say',
      testimonialsSubtitle: aiContent?.testimonialsSection?.subtitle || 'Join thousands of satisfied customers who found their perfect products.',
      testimonials,

      // CTA Section - use AI content if available
      ctaSectionTitle: aiContent?.cta?.sectionTitle || 'Ready to Find Your Perfect Product?',
      ctaSectionDescription: aiContent?.cta?.sectionDescription || `Browse our curated selection and discover why thousands trust ${project.brandName} for their purchasing decisions.`,

      // Footer
      year: new Date().getFullYear(),
      affiliateDisclosure: `${project.brandName} is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate, we earn from qualifying purchases.`,
    };

    // Render template
    io.to(`project:${project.id}`).emit('generation:progress', {
      generationId,
      phase: 'html',
      progress: 70,
      message: 'Building HTML pages...',
    });

    // Check if project has custom pageLayouts (from block editor)
    let indexHtml: string;
    const pageLayouts: PageLayouts = JSON.parse(project.pageLayouts || '{}');
    const homeLayout = pageLayouts['home'];

    if (homeLayout && homeLayout.blocks && homeLayout.blocks.length > 0) {
      // Use block renderer to generate HTML based on editor layout
      console.log(`Using block layout with ${homeLayout.blocks.length} blocks`);

      // Sort blocks by order
      const sortedBlocks = [...homeLayout.blocks].sort((a, b) => a.order - b.order);

      // Prepare render context
      const renderContext: RenderContext = {
        brandName: project.brandName,
        brandDescription: templateData.brandDescription as string,
        primaryColor: templateData.primaryColor as string,
        primaryDark: templateData.primaryDark as string,
        secondaryColor: templateData.secondaryColor as string,
        accentColor: templateData.accentColor as string,
        logoUrl: templateData.logoUrl as string | null,
        faviconUrl: templateData.faviconUrl as string | null,
        hasLogo: templateData.hasLogo as boolean,
        hasFavicon: templateData.hasFavicon as boolean,
        metaDescription: templateData.metaDescription as string,
        tagline: templateData.tagline as string,
        year: templateData.year as number,
        affiliateDisclosure: templateData.affiliateDisclosure as string,
        heroBadge: templateData.heroBadge as string,
        heroTitle: templateData.heroTitle as string,
        heroDescription: templateData.heroDescription as string,
        heroImage: templateData.heroImage as string,
        mainCtaLabel: templateData.mainCtaLabel as string,
        mainCtaUrl: templateData.mainCtaUrl as string,
        featuresTitle: templateData.featuresTitle as string,
        featuresSubtitle: templateData.featuresSubtitle as string,
        features: templateData.features as RenderContext['features'],
        productsTitle: templateData.productsTitle as string,
        productsSubtitle: templateData.productsSubtitle as string,
        products: templateData.products as RenderContext['products'],
        comparisonTitle: templateData.comparisonTitle as string,
        comparisonSubtitle: templateData.comparisonSubtitle as string,
        comparisonProducts: templateData.comparisonProducts as RenderContext['comparisonProducts'],
        comparisonFeatures: templateData.comparisonFeatures as RenderContext['comparisonFeatures'],
        testimonialsTitle: templateData.testimonialsTitle as string,
        testimonialsSubtitle: templateData.testimonialsSubtitle as string,
        testimonials: templateData.testimonials as RenderContext['testimonials'],
        ctaSectionTitle: templateData.ctaSectionTitle as string,
        ctaSectionDescription: templateData.ctaSectionDescription as string,
        ctas: project.ctas.map(cta => ({
          name: cta.name,
          label: cta.label,
          placement: cta.placement,
          customUrl: cta.customUrl,
        })),
      };

      // Render blocks to HTML
      const bodyContent = renderBlocksToHtml(sortedBlocks, renderContext);

      // Get just the CSS from the template (everything between <style> tags)
      const styleMatch = templateHtml.match(/<style>([\s\S]*?)<\/style>/);
      let styles = styleMatch ? styleMatch[1] : '';

      // Replace CSS variables in the styles
      styles = styles
        .replace(/\{\{primaryColor\}\}/g, renderContext.primaryColor)
        .replace(/\{\{primaryDark\}\}/g, renderContext.primaryDark)
        .replace(/\{\{secondaryColor\}\}/g, renderContext.secondaryColor)
        .replace(/\{\{accentColor\}\}/g, renderContext.accentColor);

      // Build the complete HTML document
      indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${renderContext.metaDescription}">
  <title>${renderContext.brandName} - ${renderContext.tagline}</title>
  ${renderContext.hasFavicon ? `<link rel="icon" type="image/x-icon" href="${renderContext.faviconUrl}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${styles}
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
    } else {
      // Fall back to static template rendering
      console.log('Using static template (no block layout)');
      indexHtml = renderTemplate(templateHtml, templateData);
    }

    const htmlPath = path.join(outputDir, 'index.html');
    await fs.writeFile(htmlPath, indexHtml);

    // Generate .htaccess
    io.to(`project:${project.id}`).emit('generation:progress', {
      generationId,
      phase: 'htaccess',
      progress: 80,
      message: 'Generating .htaccess...',
    });

    const htaccessConfig = JSON.parse(project.htaccessConfig) as HtaccessConfig;
    const primaryDomain = project.domains.find(d => d.isPrimary)?.domain || project.domains[0]?.domain;
    const htaccessContent = generateHtaccess(htaccessConfig, primaryDomain);
    const htaccessPath = path.join(outputDir, '.htaccess');
    await fs.writeFile(htaccessPath, htaccessContent);

    // Create ZIP
    io.to(`project:${project.id}`).emit('generation:progress', {
      generationId,
      phase: 'packaging',
      progress: 90,
      message: 'Finalizing...',
    });

    const generation = await prisma.generation.findUnique({ where: { id: generationId } });
    const zipPath = path.join(outputDir, `v${generation?.version || 1}.zip`);

    // Create proper ZIP archive
    let totalFiles = 2; // index.html + .htaccess
    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.append(indexHtml, { name: 'index.html' });
      archive.append(htaccessContent, { name: '.htaccess' });

      // Add uploaded assets to the ZIP
      if (logoFile) {
        archive.file(path.join(uploadsDir, logoFile), { name: `assets/${logoFile}` });
        totalFiles++;
      }
      if (faviconFile) {
        archive.file(path.join(uploadsDir, faviconFile), { name: `assets/${faviconFile}` });
        totalFiles++;
      }

      archive.finalize();
    });

    const zipStats = await fs.stat(zipPath);
    const generationTime = Date.now() - startTime;

    // Update generation record
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'completed',
        zipPath,
        zipSize: zipStats.size,
        pagesGenerated: 1,
        imagesGenerated: 0,
        totalFiles,
        generationTimeMs: generationTime,
      },
    });

    // Update project
    await prisma.project.update({
      where: { id: project.id },
      data: {
        lastGeneratedAt: new Date(),
        generationCount: { increment: 1 },
      },
    });

    io.to(`project:${project.id}`).emit('generation:completed', {
      generationId,
      version: generation?.version,
      zipPath,
    });
  } catch (error) {
    console.error('Generation error:', error);

    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'failed',
        errorLog: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    io.to(`project:${project.id}`).emit('generation:failed', {
      generationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// GET /api/projects/:id/generate/status - Get generation status (for polling fallback)
generationRouter.get('/:id/generate/status', async (req, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: { projectId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!generation) {
      return res.status(404).json({ error: 'No generation found' });
    }

    // Calculate progress based on status and elapsed time
    let progress = 0;
    if (generation.status === 'completed') {
      progress = 100;
    } else if (generation.status === 'failed') {
      progress = 0;
    } else if (generation.status === 'pending') {
      progress = 5;
    } else if (generation.status === 'processing') {
      // Estimate progress based on elapsed time (simulated ~4 seconds total)
      const elapsed = Date.now() - new Date(generation.createdAt).getTime();
      progress = Math.min(95, Math.floor((elapsed / 4000) * 90) + 10);
    }

    res.json({
      id: generation.id,
      version: generation.version,
      status: generation.status,
      progress,
    });
  } catch (error) {
    console.error('Error getting generation status:', error);
    res.status(500).json({ error: 'Failed to get generation status' });
  }
});

// POST /api/projects/:id/generate/cancel - Cancel generation
generationRouter.post('/:id/generate/cancel', async (req, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: {
        projectId: req.params.id,
        status: { in: ['pending', 'processing'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!generation) {
      return res.status(404).json({ error: 'No active generation to cancel' });
    }

    // TODO: Actually cancel the job
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: 'failed', errorLog: 'Cancelled by user' },
    });

    io.to(`project:${req.params.id}`).emit('generation:cancelled', {
      generationId: generation.id,
    });

    res.json({ message: 'Generation cancelled' });
  } catch (error) {
    console.error('Error cancelling generation:', error);
    res.status(500).json({ error: 'Failed to cancel generation' });
  }
});

// GET /api/projects/:id/history - Get generation history
generationRouter.get('/:id/history', async (req, res) => {
  try {
    const generations = await prisma.generation.findMany({
      where: { projectId: req.params.id },
      orderBy: { version: 'desc' },
      take: 20,
    });

    res.json(generations.map(g => ({
      ...g,
      aiProvider: JSON.parse(g.aiProvider),
      generationLog: g.generationLog ? JSON.parse(g.generationLog) : null,
    })));
  } catch (error) {
    console.error('Error getting generation history:', error);
    res.status(500).json({ error: 'Failed to get generation history' });
  }
});

// GET /api/projects/:id/history/:version - Get specific version details
generationRouter.get('/:id/history/:version', async (req, res) => {
  try {
    const generation = await prisma.generation.findUnique({
      where: {
        projectId_version: {
          projectId: req.params.id,
          version: parseInt(req.params.version),
        },
      },
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    res.json({
      ...generation,
      aiProvider: JSON.parse(generation.aiProvider),
      settingsSnapshot: JSON.parse(generation.settingsSnapshot),
      generationLog: generation.generationLog ? JSON.parse(generation.generationLog) : null,
    });
  } catch (error) {
    console.error('Error getting generation:', error);
    res.status(500).json({ error: 'Failed to get generation' });
  }
});

// GET /api/projects/:id/preview - Preview generated site
generationRouter.get('/:id/preview', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const generation = await prisma.generation.findFirst({
      where: { projectId: req.params.id, status: 'completed' },
      orderBy: { version: 'desc' },
    });

    if (!generation) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>No Preview Available</title></head>
        <body style="font-family: system-ui; padding: 40px; text-align: center;">
          <h1>No Preview Available</h1>
          <p>Generate the site first to see a preview.</p>
        </body>
        </html>
      `);
    }

    const outputDir = path.join(process.cwd(), 'output', project.slug);
    const indexPath = path.join(outputDir, 'index.html');

    try {
      const html = await fs.readFile(indexPath, 'utf-8');
      res.type('html').send(html);
    } catch {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Preview Not Found</title></head>
        <body style="font-family: system-ui; padding: 40px; text-align: center;">
          <h1>Preview Not Found</h1>
          <p>The generated files could not be found. Try regenerating the site.</p>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error serving preview:', error);
    res.status(500).json({ error: 'Failed to serve preview' });
  }
});

// GET /api/projects/:id/preview/:version - Preview specific version
generationRouter.get('/:id/preview/:version', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const generation = await prisma.generation.findUnique({
      where: {
        projectId_version: {
          projectId: req.params.id,
          version: parseInt(req.params.version),
        },
      },
    });

    if (!generation || generation.status !== 'completed') {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Version Not Found</title></head>
        <body style="font-family: system-ui; padding: 40px; text-align: center;">
          <h1>Version Not Found</h1>
          <p>Version ${req.params.version} was not found or is not completed.</p>
        </body>
        </html>
      `);
    }

    // For now, versions share the same output file (latest)
    // In a full implementation, each version would have its own archived HTML
    const outputDir = path.join(process.cwd(), 'output', project.slug);
    const indexPath = path.join(outputDir, 'index.html');

    try {
      const html = await fs.readFile(indexPath, 'utf-8');
      res.type('html').send(html);
    } catch {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Preview Not Found</title></head>
        <body style="font-family: system-ui; padding: 40px; text-align: center;">
          <h1>Preview Not Found</h1>
          <p>The generated files for version ${req.params.version} could not be found.</p>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error serving version preview:', error);
    res.status(500).json({ error: 'Failed to serve preview' });
  }
});

// GET /api/projects/:id/download/latest - Download latest ZIP
generationRouter.get('/:id/download/latest', async (req, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: { projectId: req.params.id, status: 'completed' },
      orderBy: { version: 'desc' },
    });

    if (!generation || !generation.zipPath) {
      return res.status(404).json({ error: 'No completed generation found' });
    }

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    const filename = `${project?.slug || 'site'}-v${generation.version}.zip`;

    res.download(generation.zipPath, filename);
  } catch (error) {
    console.error('Error downloading:', error);
    res.status(500).json({ error: 'Failed to download' });
  }
});

// GET /api/projects/:id/download/:version - Download specific version
generationRouter.get('/:id/download/:version', async (req, res) => {
  try {
    const generation = await prisma.generation.findUnique({
      where: {
        projectId_version: {
          projectId: req.params.id,
          version: parseInt(req.params.version),
        },
      },
    });

    if (!generation || !generation.zipPath) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    const filename = `${project?.slug || 'site'}-v${generation.version}.zip`;

    res.download(generation.zipPath, filename);
  } catch (error) {
    console.error('Error downloading:', error);
    res.status(500).json({ error: 'Failed to download' });
  }
});
