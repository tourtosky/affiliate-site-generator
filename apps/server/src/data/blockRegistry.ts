import type { BlockTypeDefinition } from '@affiliate/shared';

export const blockRegistry: BlockTypeDefinition[] = [
  // Hero
  {
    id: 'hero-standard',
    name: 'Hero - Standard',
    category: 'hero',
    description: 'Full-width hero with headline, description, and CTA',
    ctaSlots: ['hero-main', 'hero-secondary'],
    properties: [
      { name: 'title', label: 'Title', type: 'text', required: true, defaultValue: 'Welcome to Our Site' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', defaultValue: '' },
      { name: 'backgroundImage', label: 'Background Image', type: 'image' },
      { name: 'alignment', label: 'Alignment', type: 'select', options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ], defaultValue: 'center' },
      { name: 'ctaId', label: 'Primary CTA', type: 'ctaRef' },
    ],
    defaultProperties: {
      title: 'Welcome to Our Site',
      subtitle: '',
      backgroundImage: '',
      alignment: 'center',
      ctaId: null,
    },
  },

  // Navigation
  {
    id: 'nav-simple',
    name: 'Navigation - Simple',
    category: 'navigation',
    description: 'Simple header with logo and menu',
    ctaSlots: ['header-cta'],
    properties: [
      { name: 'logoUrl', label: 'Logo', type: 'image' },
      { name: 'sticky', label: 'Sticky Header', type: 'boolean', defaultValue: true },
      { name: 'showSearch', label: 'Show Search', type: 'boolean', defaultValue: false },
    ],
    defaultProperties: {
      logoUrl: '',
      sticky: true,
      showSearch: false,
    },
  },

  // Product Grid
  {
    id: 'products-grid',
    name: 'Product Grid',
    category: 'products',
    description: 'Grid layout for product cards',
    ctaSlots: ['product-card-cta'],
    properties: [
      { name: 'productIds', label: 'Products', type: 'productRefs', required: true },
      { name: 'columns', label: 'Columns', type: 'number', min: 2, max: 4, defaultValue: 3 },
      { name: 'showRatings', label: 'Show Ratings', type: 'boolean', defaultValue: true },
      { name: 'showPrices', label: 'Show Prices', type: 'boolean', defaultValue: true },
    ],
    defaultProperties: {
      productIds: [],
      columns: 3,
      showRatings: true,
      showPrices: true,
    },
  },

  // Product Spotlight
  {
    id: 'products-spotlight',
    name: 'Product Spotlight',
    category: 'products',
    description: 'Featured product with large image and details',
    ctaSlots: ['spotlight-cta', 'spotlight-secondary'],
    properties: [
      { name: 'productId', label: 'Product', type: 'productRef', required: true },
      { name: 'layout', label: 'Layout', type: 'select', options: [
        { label: 'Image Left', value: 'left' },
        { label: 'Image Right', value: 'right' },
      ], defaultValue: 'left' },
      { name: 'showSpecs', label: 'Show Specifications', type: 'boolean', defaultValue: true },
      { name: 'ctaId', label: 'CTA Button', type: 'ctaRef' },
    ],
    defaultProperties: {
      productId: null,
      layout: 'left',
      showSpecs: true,
      ctaId: null,
    },
  },

  // Review Summary
  {
    id: 'reviews-summary',
    name: 'Review Summary',
    category: 'reviews',
    description: 'Overall score with pros, cons, and verdict',
    ctaSlots: ['review-cta'],
    properties: [
      { name: 'productId', label: 'Product', type: 'productRef', required: true },
      { name: 'showProscons', label: 'Show Pros/Cons', type: 'boolean', defaultValue: true },
      { name: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5, defaultValue: 4 },
      { name: 'verdict', label: 'Verdict', type: 'textarea' },
    ],
    defaultProperties: {
      productId: null,
      showProscons: true,
      rating: 4,
      verdict: '',
    },
  },

  // Content Text
  {
    id: 'content-text',
    name: 'Content - Text Block',
    category: 'content',
    description: 'Rich text content section',
    ctaSlots: [],
    properties: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'body', label: 'Body', type: 'textarea', required: true },
      { name: 'alignment', label: 'Alignment', type: 'select', options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ], defaultValue: 'left' },
    ],
    defaultProperties: {
      heading: '',
      body: '',
      alignment: 'left',
    },
  },

  // CTA Banner
  {
    id: 'cta-banner',
    name: 'CTA Banner',
    category: 'cta',
    description: 'Full-width call-to-action banner',
    ctaSlots: ['banner-cta'],
    properties: [
      { name: 'ctaId', label: 'CTA', type: 'ctaRef', required: true },
      { name: 'style', label: 'Style', type: 'select', options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Accent', value: 'accent' },
      ], defaultValue: 'primary' },
      { name: 'fullWidth', label: 'Full Width', type: 'boolean', defaultValue: true },
      { name: 'text', label: 'Banner Text', type: 'text' },
    ],
    defaultProperties: {
      ctaId: null,
      style: 'primary',
      fullWidth: true,
      text: '',
    },
  },

  // Trust Badges
  {
    id: 'content-trust',
    name: 'Trust Badges',
    category: 'content',
    description: 'Security and trust indicators',
    ctaSlots: [],
    properties: [
      { name: 'showSecurePayment', label: 'Secure Payment', type: 'boolean', defaultValue: true },
      { name: 'showMoneyBack', label: 'Money Back Guarantee', type: 'boolean', defaultValue: true },
      { name: 'showFreeShipping', label: 'Free Shipping', type: 'boolean', defaultValue: false },
      { name: 'showSupport', label: '24/7 Support', type: 'boolean', defaultValue: true },
      { name: 'layout', label: 'Layout', type: 'select', options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Grid', value: 'grid' },
      ], defaultValue: 'horizontal' },
    ],
    defaultProperties: {
      showSecurePayment: true,
      showMoneyBack: true,
      showFreeShipping: false,
      showSupport: true,
      layout: 'horizontal',
    },
  },

  // FAQ
  {
    id: 'content-faq',
    name: 'FAQ',
    category: 'content',
    description: 'Accordion-style FAQ section',
    ctaSlots: [],
    properties: [
      { name: 'heading', label: 'Section Heading', type: 'text', defaultValue: 'Frequently Asked Questions' },
      { name: 'expandable', label: 'Expandable Items', type: 'boolean', defaultValue: true },
      { name: 'items', label: 'FAQ Items (JSON)', type: 'textarea', placeholder: '[{"question": "...", "answer": "..."}]' },
    ],
    defaultProperties: {
      heading: 'Frequently Asked Questions',
      expandable: true,
      items: '[]',
    },
  },

  // Footer
  {
    id: 'footer-standard',
    name: 'Footer - Standard',
    category: 'footer',
    description: 'Multi-column footer with links',
    ctaSlots: ['footer-cta'],
    properties: [
      { name: 'copyright', label: 'Copyright Text', type: 'text', defaultValue: '© 2024 All rights reserved' },
      { name: 'showSocialLinks', label: 'Show Social Links', type: 'boolean', defaultValue: true },
      { name: 'columns', label: 'Columns', type: 'number', min: 2, max: 4, defaultValue: 3 },
    ],
    defaultProperties: {
      copyright: '© 2024 All rights reserved',
      showSocialLinks: true,
      columns: 3,
    },
  },

  // Features Grid
  {
    id: 'features-grid',
    name: 'Features Grid',
    category: 'content',
    description: 'Grid of feature cards with icons',
    ctaSlots: [],
    properties: [
      { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Why Choose Us?' },
      { name: 'subtitle', label: 'Subtitle', type: 'text', defaultValue: 'Discover the advantages of our products.' },
      { name: 'columns', label: 'Columns', type: 'number', min: 2, max: 4, defaultValue: 4 },
    ],
    defaultProperties: {
      title: 'Why Choose Us?',
      subtitle: 'Discover the advantages of our products.',
      columns: 4,
    },
  },

  // Comparison Table
  {
    id: 'comparison-table',
    name: 'Comparison Table',
    category: 'content',
    description: 'Product comparison table',
    ctaSlots: [],
    properties: [
      { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'Why We Stand Out' },
      { name: 'subtitle', label: 'Subtitle', type: 'text', defaultValue: 'See how we compare to the competition.' },
    ],
    defaultProperties: {
      title: 'Why We Stand Out',
      subtitle: 'See how we compare to the competition.',
    },
  },

  // Testimonials
  {
    id: 'testimonials',
    name: 'Testimonials',
    category: 'reviews',
    description: 'Customer testimonials section',
    ctaSlots: [],
    properties: [
      { name: 'title', label: 'Section Title', type: 'text', defaultValue: 'What Our Customers Say' },
      { name: 'subtitle', label: 'Subtitle', type: 'text', defaultValue: 'Real feedback from satisfied users.' },
    ],
    defaultProperties: {
      title: 'What Our Customers Say',
      subtitle: 'Real feedback from satisfied users.',
    },
  },
];

export function getBlockDefinition(blockType: string): BlockTypeDefinition | undefined {
  return blockRegistry.find((b) => b.id === blockType);
}

export function getBlocksByCategory(category: string): BlockTypeDefinition[] {
  return blockRegistry.filter((b) => b.category === category);
}
