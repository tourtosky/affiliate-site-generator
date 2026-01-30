import { Router } from 'express';

export const templatesRouter = Router();

// Built-in templates
const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, minimalist design with bold typography',
    thumbnail: '/templates/modern.png',
    features: ['Responsive', 'Dark mode', 'Animations'],
    pages: ['home', 'products', 'product-detail', 'about', 'contact'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional layout with sidebar navigation',
    thumbnail: '/templates/classic.png',
    features: ['Sidebar', 'Breadcrumbs', 'Categories'],
    pages: ['home', 'products', 'product-detail', 'about', 'contact', 'blog'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean single page design',
    thumbnail: '/templates/minimal.png',
    features: ['Single page', 'Scroll animations', 'Fast loading'],
    pages: ['home'],
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'High-converting landing page template',
    thumbnail: '/templates/landing.png',
    features: ['Hero section', 'Testimonials', 'FAQ', 'CTA focused'],
    pages: ['home', 'products'],
  },
];

// Built-in blocks
const blocks = [
  {
    id: 'hero-standard',
    name: 'Hero - Standard',
    category: 'hero',
    description: 'Full-width hero with headline, description, and CTA',
    thumbnail: '/blocks/hero-standard.png',
    ctaSlots: ['hero-main', 'hero-secondary'],
  },
  {
    id: 'hero-split',
    name: 'Hero - Split',
    category: 'hero',
    description: 'Two-column hero with image and text',
    thumbnail: '/blocks/hero-split.png',
    ctaSlots: ['hero-main'],
  },
  {
    id: 'product-grid',
    name: 'Product Grid',
    category: 'products',
    description: 'Grid layout for product cards',
    thumbnail: '/blocks/product-grid.png',
    ctaSlots: ['product-card-cta'],
  },
  {
    id: 'product-carousel',
    name: 'Product Carousel',
    category: 'products',
    description: 'Horizontal scrolling product showcase',
    thumbnail: '/blocks/product-carousel.png',
    ctaSlots: ['product-card-cta'],
  },
  {
    id: 'comparison-table',
    name: 'Comparison Table',
    category: 'products',
    description: 'Side-by-side product comparison',
    thumbnail: '/blocks/comparison-table.png',
    ctaSlots: ['comparison-buy-btn'],
  },
  {
    id: 'features',
    name: 'Features',
    category: 'content',
    description: 'Icon-based feature highlights',
    thumbnail: '/blocks/features.png',
    ctaSlots: [],
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    category: 'content',
    description: 'Customer review carousel',
    thumbnail: '/blocks/testimonials.png',
    ctaSlots: [],
  },
  {
    id: 'faq',
    name: 'FAQ',
    category: 'content',
    description: 'Accordion-style FAQ section',
    thumbnail: '/blocks/faq.png',
    ctaSlots: [],
  },
  {
    id: 'cta-banner',
    name: 'CTA Banner',
    category: 'cta',
    description: 'Full-width call-to-action banner',
    thumbnail: '/blocks/cta-banner.png',
    ctaSlots: ['banner-cta'],
  },
  {
    id: 'sticky-bar',
    name: 'Sticky Bar',
    category: 'cta',
    description: 'Fixed bottom bar with CTA',
    thumbnail: '/blocks/sticky-bar.png',
    ctaSlots: ['sticky-cta'],
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    category: 'content',
    description: 'Email signup form',
    thumbnail: '/blocks/newsletter.png',
    ctaSlots: [],
  },
  {
    id: 'footer-standard',
    name: 'Footer - Standard',
    category: 'footer',
    description: 'Multi-column footer with links',
    thumbnail: '/blocks/footer-standard.png',
    ctaSlots: ['footer-cta'],
  },
];

// GET /api/templates - List available templates
templatesRouter.get('/', (_req, res) => {
  res.json(templates);
});

// GET /api/templates/:id - Get template details
templatesRouter.get('/:id', (req, res) => {
  const template = templates.find((t) => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

// GET /api/templates/:id/preview - Get template preview HTML
templatesRouter.get('/:id/preview', (req, res) => {
  const template = templates.find((t) => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  // Return a simple preview HTML
  const previewHtml = `<!DOCTYPE html>
<html>
<head>
  <title>${template.name} Preview</title>
  <style>
    body { font-family: system-ui; padding: 20px; background: #f5f5f5; }
    .preview-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="preview-card">
    <h1>${template.name}</h1>
    <p>${template.description}</p>
    <p>Features: ${template.features.join(', ')}</p>
    <p>Pages: ${template.pages.join(', ')}</p>
  </div>
</body>
</html>`;

  res.type('html').send(previewHtml);
});

// GET /api/blocks - List available blocks
templatesRouter.get('/blocks/all', (_req, res) => {
  res.json(blocks);
});

// GET /api/blocks/:id - Get block details
templatesRouter.get('/blocks/:id', (req, res) => {
  const block = blocks.find((b) => b.id === req.params.id);
  if (!block) {
    return res.status(404).json({ error: 'Block not found' });
  }
  res.json(block);
});

// GET /api/blocks/:id/preview - Get block preview HTML
templatesRouter.get('/blocks/:id/preview', (req, res) => {
  const block = blocks.find((b) => b.id === req.params.id);
  if (!block) {
    return res.status(404).json({ error: 'Block not found' });
  }

  const previewHtml = `<!DOCTYPE html>
<html>
<head>
  <title>${block.name} Preview</title>
  <style>
    body { font-family: system-ui; padding: 20px; background: #f5f5f5; }
    .preview-card { background: white; padding: 20px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="preview-card">
    <h2>${block.name}</h2>
    <p>${block.description}</p>
    <p>Category: ${block.category}</p>
    <p>CTA Slots: ${block.ctaSlots.join(', ') || 'None'}</p>
  </div>
</body>
</html>`;

  res.type('html').send(previewHtml);
});
