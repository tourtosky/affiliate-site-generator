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
  {
    id: 'review-hub',
    name: 'Review Hub',
    description: 'In-depth product reviews with ratings and pros/cons',
    thumbnail: '/templates/review-hub.png',
    features: ['Star ratings', 'Pros/Cons lists', 'Expert scores', 'User reviews'],
    pages: ['home', 'reviews', 'review-detail', 'categories', 'about'],
  },
  {
    id: 'comparison',
    name: 'Comparison Pro',
    description: 'Side-by-side product comparisons with feature matrices',
    thumbnail: '/templates/comparison.png',
    features: ['Comparison tables', 'Feature filters', 'Winner badges', 'Price tracking'],
    pages: ['home', 'compare', 'product-detail', 'categories', 'deals'],
  },
  {
    id: 'deals',
    name: 'Deal Finder',
    description: 'Deal-focused layout with urgency elements and price drops',
    thumbnail: '/templates/deals.png',
    features: ['Countdown timers', 'Price alerts', 'Deal badges', 'Flash sales'],
    pages: ['home', 'deals', 'product-detail', 'categories', 'price-drops'],
  },
  {
    id: 'tech-review',
    name: 'Tech Insider',
    description: 'Tech product reviews with specs and benchmarks',
    thumbnail: '/templates/tech-review.png',
    features: ['Spec tables', 'Benchmark charts', 'Tech scores', 'Video embeds'],
    pages: ['home', 'reviews', 'review-detail', 'specs', 'guides', 'news'],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'Visual-first design for fashion, home, and lifestyle products',
    thumbnail: '/templates/lifestyle.png',
    features: ['Gallery layouts', 'Instagram feed', 'Lookbooks', 'Mood boards'],
    pages: ['home', 'shop', 'product-detail', 'collections', 'blog', 'about'],
  },
  {
    id: 'single-product',
    name: 'Single Product',
    description: 'Focused template for promoting one product or product line',
    thumbnail: '/templates/single-product.png',
    features: ['Full-screen hero', 'Feature showcase', 'Video section', 'Social proof'],
    pages: ['home', 'features', 'pricing', 'faq'],
  },
  {
    id: 'blog-affiliate',
    name: 'Blog Affiliate',
    description: 'Content-first blog with seamless product integration',
    thumbnail: '/templates/blog-affiliate.png',
    features: ['Article layouts', 'In-content CTAs', 'Related products', 'Author bios'],
    pages: ['home', 'blog', 'article', 'categories', 'products', 'about'],
  },
  {
    id: 'top-lists',
    name: 'Top 10 Lists',
    description: 'Listicle-style template for "Best of" content',
    thumbnail: '/templates/top-lists.png',
    features: ['Numbered rankings', 'Quick nav', 'Summary boxes', 'Verdict cards'],
    pages: ['home', 'lists', 'list-detail', 'categories', 'about'],
  },
  {
    id: 'niche-authority',
    name: 'Niche Authority',
    description: 'Comprehensive niche site with guides and resources',
    thumbnail: '/templates/niche-authority.png',
    features: ['Resource library', 'Buying guides', 'Expert tips', 'Newsletter'],
    pages: ['home', 'guides', 'guide-detail', 'products', 'resources', 'about', 'contact'],
  },
  {
    id: 'quick-picks',
    name: 'Quick Picks',
    description: 'Fast, scannable layout for quick purchase decisions',
    thumbnail: '/templates/quick-picks.png',
    features: ['Card grid', 'Quick filters', 'Instant compare', 'One-click CTAs'],
    pages: ['home', 'products', 'product-detail'],
  },
  {
    id: 'premium',
    name: 'Premium Showcase',
    description: 'Luxury feel for high-end product promotions',
    thumbnail: '/templates/premium.png',
    features: ['Elegant typography', 'Subtle animations', 'White space', 'Premium CTAs'],
    pages: ['home', 'collection', 'product-detail', 'about', 'contact'],
  },
];

// Built-in blocks
const blocks = [
  // Hero blocks
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
    id: 'hero-video',
    name: 'Hero - Video Background',
    category: 'hero',
    description: 'Full-screen hero with video background',
    thumbnail: '/blocks/hero-video.png',
    ctaSlots: ['hero-main', 'hero-secondary'],
  },
  {
    id: 'hero-slider',
    name: 'Hero - Slider',
    category: 'hero',
    description: 'Multiple slides with auto-rotation',
    thumbnail: '/blocks/hero-slider.png',
    ctaSlots: ['slide-cta'],
  },
  {
    id: 'hero-minimal',
    name: 'Hero - Minimal',
    category: 'hero',
    description: 'Clean text-only hero with subtle animation',
    thumbnail: '/blocks/hero-minimal.png',
    ctaSlots: ['hero-main'],
  },

  // Product blocks
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
    id: 'product-spotlight',
    name: 'Product Spotlight',
    category: 'products',
    description: 'Featured product with large image and details',
    thumbnail: '/blocks/product-spotlight.png',
    ctaSlots: ['spotlight-cta', 'spotlight-secondary'],
  },
  {
    id: 'top-picks',
    name: 'Top Picks',
    category: 'products',
    description: 'Numbered list of recommended products',
    thumbnail: '/blocks/top-picks.png',
    ctaSlots: ['pick-cta'],
  },
  {
    id: 'deal-cards',
    name: 'Deal Cards',
    category: 'products',
    description: 'Product cards with price and discount badges',
    thumbnail: '/blocks/deal-cards.png',
    ctaSlots: ['deal-cta'],
  },
  {
    id: 'quick-view',
    name: 'Quick View Grid',
    category: 'products',
    description: 'Compact product grid with hover details',
    thumbnail: '/blocks/quick-view.png',
    ctaSlots: ['quick-cta'],
  },

  // Review blocks
  {
    id: 'review-summary',
    name: 'Review Summary',
    category: 'reviews',
    description: 'Overall score with pros, cons, and verdict',
    thumbnail: '/blocks/review-summary.png',
    ctaSlots: ['review-cta'],
  },
  {
    id: 'rating-breakdown',
    name: 'Rating Breakdown',
    category: 'reviews',
    description: 'Detailed ratings by category with bars',
    thumbnail: '/blocks/rating-breakdown.png',
    ctaSlots: [],
  },
  {
    id: 'pros-cons',
    name: 'Pros & Cons',
    category: 'reviews',
    description: 'Two-column pros and cons list',
    thumbnail: '/blocks/pros-cons.png',
    ctaSlots: [],
  },
  {
    id: 'spec-table',
    name: 'Specifications Table',
    category: 'reviews',
    description: 'Technical specifications in table format',
    thumbnail: '/blocks/spec-table.png',
    ctaSlots: [],
  },
  {
    id: 'verdict-box',
    name: 'Verdict Box',
    category: 'reviews',
    description: 'Final verdict with score and recommendation',
    thumbnail: '/blocks/verdict-box.png',
    ctaSlots: ['verdict-cta'],
  },

  // Content blocks
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
    id: 'newsletter',
    name: 'Newsletter',
    category: 'content',
    description: 'Email signup form',
    thumbnail: '/blocks/newsletter.png',
    ctaSlots: [],
  },
  {
    id: 'trust-badges',
    name: 'Trust Badges',
    category: 'content',
    description: 'Security and trust indicators',
    thumbnail: '/blocks/trust-badges.png',
    ctaSlots: [],
  },
  {
    id: 'stats-counter',
    name: 'Stats Counter',
    category: 'content',
    description: 'Animated number counters for social proof',
    thumbnail: '/blocks/stats-counter.png',
    ctaSlots: [],
  },
  {
    id: 'video-embed',
    name: 'Video Embed',
    category: 'content',
    description: 'YouTube/Vimeo video with text overlay option',
    thumbnail: '/blocks/video-embed.png',
    ctaSlots: ['video-cta'],
  },
  {
    id: 'image-gallery',
    name: 'Image Gallery',
    category: 'content',
    description: 'Masonry or grid image gallery with lightbox',
    thumbnail: '/blocks/image-gallery.png',
    ctaSlots: [],
  },
  {
    id: 'buying-guide',
    name: 'Buying Guide',
    category: 'content',
    description: 'Step-by-step guide with tips',
    thumbnail: '/blocks/buying-guide.png',
    ctaSlots: ['guide-cta'],
  },
  {
    id: 'author-box',
    name: 'Author Box',
    category: 'content',
    description: 'Author bio with photo and credentials',
    thumbnail: '/blocks/author-box.png',
    ctaSlots: [],
  },

  // CTA blocks
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
    id: 'exit-popup',
    name: 'Exit Intent Popup',
    category: 'cta',
    description: 'Popup triggered on exit intent',
    thumbnail: '/blocks/exit-popup.png',
    ctaSlots: ['popup-cta'],
  },
  {
    id: 'floating-cta',
    name: 'Floating CTA',
    category: 'cta',
    description: 'Fixed floating button in corner',
    thumbnail: '/blocks/floating-cta.png',
    ctaSlots: ['floating-cta'],
  },
  {
    id: 'countdown-banner',
    name: 'Countdown Banner',
    category: 'cta',
    description: 'Urgency banner with countdown timer',
    thumbnail: '/blocks/countdown-banner.png',
    ctaSlots: ['countdown-cta'],
  },
  {
    id: 'inline-cta',
    name: 'Inline CTA',
    category: 'cta',
    description: 'CTA box for embedding in content',
    thumbnail: '/blocks/inline-cta.png',
    ctaSlots: ['inline-cta'],
  },

  // Navigation blocks
  {
    id: 'header-standard',
    name: 'Header - Standard',
    category: 'navigation',
    description: 'Logo, nav links, and search',
    thumbnail: '/blocks/header-standard.png',
    ctaSlots: ['header-cta'],
  },
  {
    id: 'header-centered',
    name: 'Header - Centered',
    category: 'navigation',
    description: 'Centered logo with split navigation',
    thumbnail: '/blocks/header-centered.png',
    ctaSlots: ['header-cta'],
  },
  {
    id: 'sidebar-nav',
    name: 'Sidebar Navigation',
    category: 'navigation',
    description: 'Vertical sidebar with categories',
    thumbnail: '/blocks/sidebar-nav.png',
    ctaSlots: [],
  },
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    category: 'navigation',
    description: 'Navigation breadcrumb trail',
    thumbnail: '/blocks/breadcrumbs.png',
    ctaSlots: [],
  },
  {
    id: 'category-nav',
    name: 'Category Navigation',
    category: 'navigation',
    description: 'Visual category cards for navigation',
    thumbnail: '/blocks/category-nav.png',
    ctaSlots: [],
  },

  // Footer blocks
  {
    id: 'footer-standard',
    name: 'Footer - Standard',
    category: 'footer',
    description: 'Multi-column footer with links',
    thumbnail: '/blocks/footer-standard.png',
    ctaSlots: ['footer-cta'],
  },
  {
    id: 'footer-minimal',
    name: 'Footer - Minimal',
    category: 'footer',
    description: 'Simple single-row footer',
    thumbnail: '/blocks/footer-minimal.png',
    ctaSlots: [],
  },
  {
    id: 'footer-newsletter',
    name: 'Footer - With Newsletter',
    category: 'footer',
    description: 'Footer with integrated newsletter signup',
    thumbnail: '/blocks/footer-newsletter.png',
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
