import type { PageLayouts } from '@affiliate/shared';
import { v4 as uuid } from 'uuid';

// Default block layouts for each template
// When a project has no pageLayouts, we auto-populate based on its template

interface TemplateBlockConfig {
  blockType: string;
  properties: Record<string, unknown>;
}

interface TemplatePageConfig {
  [pageName: string]: TemplateBlockConfig[];
}

const templateBlockConfigs: Record<string, TemplatePageConfig> = {
  // Modern template - clean and minimal
  modern: {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'hero-standard', properties: { title: 'Welcome', subtitle: 'Discover our top-rated products', alignment: 'center' } },
      { blockType: 'products-grid', properties: { columns: 3, showRatings: true, showPrices: true } },
      { blockType: 'content-trust', properties: { showSecurePayment: true, showMoneyBack: true, showSupport: true, layout: 'horizontal' } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
    products: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'products-grid', properties: { columns: 3, showRatings: true, showPrices: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
    about: [
      { blockType: 'nav-simple', properties: { sticky: true } },
      { blockType: 'content-text', properties: { heading: 'About Us', body: 'Learn more about our mission and values.', alignment: 'left' } },
      { blockType: 'content-trust', properties: { showSecurePayment: true, showMoneyBack: true, layout: 'grid' } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
  },

  // Landing page template - conversion focused (matches actual landing HTML template)
  landing: {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: false } },
      { blockType: 'hero-standard', properties: { badge: 'TOP RATED 2024', alignment: 'left' } },
      { blockType: 'features-grid', properties: { columns: 4 } },
      { blockType: 'products-grid', properties: { columns: 3, showRatings: true, showPrices: true } },
      { blockType: 'comparison-table', properties: {} },
      { blockType: 'testimonials', properties: {} },
      { blockType: 'cta-banner', properties: { style: 'primary', fullWidth: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 4 } },
    ],
    products: [
      { blockType: 'nav-simple', properties: { sticky: true } },
      { blockType: 'products-grid', properties: { columns: 3, showRatings: true, showPrices: true } },
      { blockType: 'cta-banner', properties: { style: 'secondary' } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 4 } },
    ],
  },

  // Review Hub template
  'review-hub': {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'hero-standard', properties: { title: 'Expert Reviews You Can Trust', subtitle: 'In-depth analysis and honest ratings', alignment: 'center' } },
      { blockType: 'products-grid', properties: { columns: 3, showRatings: true, showPrices: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
    reviews: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'reviews-summary', properties: { showProscons: true, rating: 4 } },
      { blockType: 'products-spotlight', properties: { layout: 'left', showSpecs: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
  },

  // Comparison template
  comparison: {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'hero-standard', properties: { title: 'Compare & Choose', subtitle: 'Side-by-side product comparisons', alignment: 'center' } },
      { blockType: 'products-grid', properties: { columns: 2, showRatings: true, showPrices: true } },
      { blockType: 'content-trust', properties: { showSecurePayment: true, showMoneyBack: true, layout: 'horizontal' } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
    compare: [
      { blockType: 'nav-simple', properties: { sticky: true } },
      { blockType: 'products-grid', properties: { columns: 2, showRatings: true, showPrices: true } },
      { blockType: 'reviews-summary', properties: { showProscons: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 2 } },
    ],
  },

  // Deal Finder template
  deals: {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'cta-banner', properties: { text: 'Limited Time Offers - Shop Now!', style: 'accent', fullWidth: true } },
      { blockType: 'hero-standard', properties: { title: 'Today\'s Best Deals', subtitle: 'Save big on top products', alignment: 'center' } },
      { blockType: 'products-grid', properties: { columns: 3, showRatings: true, showPrices: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
  },

  // Classic template
  classic: {
    home: [
      { blockType: 'nav-simple', properties: { sticky: false, showSearch: true } },
      { blockType: 'hero-standard', properties: { title: 'Welcome to Our Store', subtitle: 'Quality products for every need', alignment: 'left' } },
      { blockType: 'products-grid', properties: { columns: 4, showRatings: true, showPrices: true } },
      { blockType: 'content-text', properties: { heading: 'About Our Products', body: 'We carefully select each product to ensure quality and value.' } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 4 } },
    ],
  },

  // Minimal template
  minimal: {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: false } },
      { blockType: 'hero-standard', properties: { title: 'Simple. Clean. Essential.', alignment: 'center' } },
      { blockType: 'products-spotlight', properties: { layout: 'left', showSpecs: false } },
      { blockType: 'footer-standard', properties: { showSocialLinks: false, columns: 2 } },
    ],
  },

  // Single Product template
  'single-product': {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: false } },
      { blockType: 'hero-standard', properties: { title: 'Introducing Our Flagship Product', alignment: 'center' } },
      { blockType: 'products-spotlight', properties: { layout: 'right', showSpecs: true } },
      { blockType: 'reviews-summary', properties: { showProscons: true, rating: 5 } },
      { blockType: 'content-faq', properties: { heading: 'Common Questions', expandable: true } },
      { blockType: 'cta-banner', properties: { text: 'Get yours today!', style: 'primary', fullWidth: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 2 } },
    ],
  },

  // Tech Review template
  'tech-review': {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'hero-standard', properties: { title: 'Tech Reviews & Guides', subtitle: 'Expert analysis for informed decisions', alignment: 'center' } },
      { blockType: 'products-grid', properties: { columns: 3, showRatings: true, showPrices: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
    reviews: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'reviews-summary', properties: { showProscons: true, rating: 4 } },
      { blockType: 'products-spotlight', properties: { layout: 'left', showSpecs: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
  },

  // Lifestyle template
  lifestyle: {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: false } },
      { blockType: 'hero-standard', properties: { title: 'Elevate Your Lifestyle', subtitle: 'Curated products for modern living', alignment: 'center' } },
      { blockType: 'products-grid', properties: { columns: 3, showRatings: false, showPrices: true } },
      { blockType: 'content-text', properties: { heading: 'Our Philosophy', body: 'We believe in quality over quantity.', alignment: 'center' } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
  },

  // Blog Affiliate template
  'blog-affiliate': {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'hero-standard', properties: { title: 'Insights & Recommendations', subtitle: 'Expert advice and product picks', alignment: 'left' } },
      { blockType: 'content-text', properties: { heading: 'Latest Articles', body: 'Check out our recent posts for tips and reviews.' } },
      { blockType: 'products-grid', properties: { columns: 3, showRatings: true, showPrices: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 4 } },
    ],
  },

  // Top Lists template
  'top-lists': {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'hero-standard', properties: { title: 'Top 10 Best Products', subtitle: 'Our expert picks ranked and reviewed', alignment: 'center' } },
      { blockType: 'products-grid', properties: { columns: 2, showRatings: true, showPrices: true } },
      { blockType: 'cta-banner', properties: { text: 'See the full list', style: 'primary' } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
  },

  // Niche Authority template
  'niche-authority': {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'hero-standard', properties: { title: 'Your Trusted Resource', subtitle: 'Comprehensive guides and expert recommendations', alignment: 'center' } },
      { blockType: 'products-grid', properties: { columns: 3, showRatings: true, showPrices: true } },
      { blockType: 'content-text', properties: { heading: 'Why Trust Us', body: 'Years of experience and thousands of products tested.' } },
      { blockType: 'content-faq', properties: { heading: 'Buying Guide FAQ', expandable: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 4 } },
    ],
  },

  // Quick Picks template
  'quick-picks': {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
      { blockType: 'hero-standard', properties: { title: 'Quick Picks', subtitle: 'Fast decisions, great products', alignment: 'center' } },
      { blockType: 'products-grid', properties: { columns: 4, showRatings: true, showPrices: true } },
      { blockType: 'footer-standard', properties: { showSocialLinks: false, columns: 2 } },
    ],
  },

  // Premium Showcase template
  premium: {
    home: [
      { blockType: 'nav-simple', properties: { sticky: true, showSearch: false } },
      { blockType: 'hero-standard', properties: { title: 'Premium Collection', subtitle: 'Exceptional quality for discerning tastes', alignment: 'center' } },
      { blockType: 'products-spotlight', properties: { layout: 'left', showSpecs: true } },
      { blockType: 'content-trust', properties: { showSecurePayment: true, showMoneyBack: true, layout: 'horizontal' } },
      { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
    ],
  },
};

// Default fallback for templates without specific config
const defaultConfig: TemplatePageConfig = {
  home: [
    { blockType: 'nav-simple', properties: { sticky: true, showSearch: true } },
    { blockType: 'hero-standard', properties: { title: 'Welcome', subtitle: 'Discover our products', alignment: 'center' } },
    { blockType: 'products-grid', properties: { columns: 3, showRatings: true, showPrices: true } },
    { blockType: 'footer-standard', properties: { showSocialLinks: true, columns: 3 } },
  ],
};

/**
 * Generate default page layouts based on project template
 */
export function generateDefaultLayouts(template: string, selectedPages: string[]): PageLayouts {
  const config = templateBlockConfigs[template] || defaultConfig;
  const layouts: PageLayouts = {};

  for (const page of selectedPages) {
    // Use page-specific config if available, otherwise use home config, otherwise default
    const pageBlocks = config[page] || config['home'] || defaultConfig['home'];

    layouts[page] = {
      blocks: pageBlocks.map((blockConfig, index) => ({
        instanceId: uuid(),
        blockType: blockConfig.blockType,
        order: index,
        properties: { ...blockConfig.properties },
      })),
    };
  }

  return layouts;
}
