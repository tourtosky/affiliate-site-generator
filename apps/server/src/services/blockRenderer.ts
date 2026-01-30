/**
 * Block Renderer - Generates HTML sections based on block layout
 * This allows the editor to control what sections appear and in what order
 */

import type { BlockInstance } from '@affiliate/shared';

interface RenderContext {
  brandName: string;
  brandDescription: string;
  primaryColor: string;
  primaryDark: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  hasLogo: boolean;
  hasFavicon: boolean;
  metaDescription: string;
  tagline: string;
  year: number;
  affiliateDisclosure: string;
  // Hero
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  // CTA
  mainCtaLabel: string;
  mainCtaUrl: string;
  // Features
  featuresTitle: string;
  featuresSubtitle: string;
  features: Array<{ icon: string; title: string; description: string }>;
  // Products
  productsTitle: string;
  productsSubtitle: string;
  products: Array<{
    title: string;
    description: string;
    imageUrl: string;
    affiliateUrl: string;
    rating: string;
    price: string;
    ctaLabel: string;
  }>;
  // Comparison
  comparisonTitle: string;
  comparisonSubtitle: string;
  comparisonProducts: Array<{ name: string }>;
  comparisonFeatures: Array<{ name: string; values: string[] }>;
  // Testimonials
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  testimonials: Array<{ text: string; name: string; title: string; initial: string }>;
  // CTA Section
  ctaSectionTitle: string;
  ctaSectionDescription: string;
}

// Map block types to their HTML render functions
const blockRenderers: Record<string, (ctx: RenderContext, props: Record<string, unknown>) => string> = {
  'nav-simple': renderNav,
  'hero-standard': renderHero,
  'features-grid': renderFeatures,
  'products-grid': renderProducts,
  'comparison-table': renderComparison,
  'testimonials': renderTestimonials,
  'cta-banner': renderCtaBanner,
  'footer-standard': renderFooter,
  // Legacy block types that map to sections
  'products-spotlight': renderProducts,
  'reviews-summary': renderTestimonials,
  'content-trust': () => '', // Skip for now
  'content-faq': () => '', // Skip for now
  'content-text': () => '', // Skip for now
};

function renderNav(ctx: RenderContext, _props: Record<string, unknown>): string {
  return `
  <!-- Header -->
  <header class="header">
    <div class="container header-inner">
      <a href="/" class="logo">${ctx.hasLogo ? `<img src="${ctx.logoUrl}" alt="${ctx.brandName}" class="logo-img">` : ctx.brandName}</a>
      <nav class="nav">
        <a href="#features">Features</a>
        <a href="#products">Products</a>
        <a href="#compare">Compare</a>
        <a href="#reviews">Reviews</a>
      </nav>
      <a href="${ctx.mainCtaUrl}" class="header-cta" target="_blank" rel="nofollow noopener">${ctx.mainCtaLabel}</a>
    </div>
  </header>`;
}

function renderHero(ctx: RenderContext, props: Record<string, unknown>): string {
  const badge = (props.badge as string) || ctx.heroBadge;
  const title = (props.title as string) || ctx.heroTitle;
  const subtitle = (props.subtitle as string) || ctx.heroDescription;

  return `
  <!-- Hero -->
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <span class="hero-badge">${badge}</span>
        <h1>${title}</h1>
        <p>${subtitle}</p>
        <div class="hero-buttons">
          <a href="${ctx.mainCtaUrl}" class="btn btn-primary" target="_blank" rel="nofollow noopener">
            ${ctx.mainCtaLabel}
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="#products" class="btn btn-outline">View Products</a>
        </div>
      </div>
    </div>
  </section>`;
}

function renderFeatures(ctx: RenderContext, props: Record<string, unknown>): string {
  const title = (props.title as string) || ctx.featuresTitle;
  const subtitle = (props.subtitle as string) || ctx.featuresSubtitle;

  const featuresHtml = ctx.features.map(f => `
        <div class="feature-card">
          <div class="feature-icon">${f.icon}</div>
          <h3>${f.title}</h3>
          <p>${f.description}</p>
        </div>`).join('');

  return `
  <!-- Features -->
  <section class="features" id="features">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <div class="features-grid">
        ${featuresHtml}
      </div>
    </div>
  </section>`;
}

function renderProducts(ctx: RenderContext, props: Record<string, unknown>): string {
  const title = (props.title as string) || ctx.productsTitle;
  const subtitle = (props.subtitle as string) || ctx.productsSubtitle;

  const productsHtml = ctx.products.map(p => `
        <div class="product-card">
          <div class="product-image">
            <img src="${p.imageUrl}" alt="${p.title}" loading="lazy">
          </div>
          <div class="product-content">
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <div class="product-meta">
              <span class="product-rating">★★★★★ ${p.rating}</span>
              <span class="product-price">${p.price}</span>
            </div>
            <a href="${p.affiliateUrl}" class="product-cta" target="_blank" rel="nofollow noopener sponsored">
              ${p.ctaLabel}
            </a>
          </div>
        </div>`).join('');

  return `
  <!-- Products -->
  <section class="products" id="products">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <div class="products-grid">
        ${productsHtml}
      </div>
    </div>
  </section>`;
}

function renderComparison(ctx: RenderContext, props: Record<string, unknown>): string {
  const title = (props.title as string) || ctx.comparisonTitle;
  const subtitle = (props.subtitle as string) || ctx.comparisonSubtitle;

  const headerCells = ctx.comparisonProducts.map(p => `<th>${p.name}</th>`).join('');
  const bodyRows = ctx.comparisonFeatures.map(f => `
          <tr>
            <td><strong>${f.name}</strong></td>
            ${f.values.map(v => `<td>${v}</td>`).join('')}
          </tr>`).join('');

  return `
  <!-- Comparison -->
  <section class="comparison" id="compare">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Feature</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </div>
  </section>`;
}

function renderTestimonials(ctx: RenderContext, props: Record<string, unknown>): string {
  const title = (props.title as string) || ctx.testimonialsTitle;
  const subtitle = (props.subtitle as string) || ctx.testimonialsSubtitle;

  const testimonialsHtml = ctx.testimonials.map(t => `
        <div class="testimonial-card">
          <p class="testimonial-text">"${t.text}"</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${t.initial}</div>
            <div>
              <div class="testimonial-name">${t.name}</div>
              <div class="testimonial-title">${t.title}</div>
            </div>
          </div>
        </div>`).join('');

  return `
  <!-- Testimonials -->
  <section class="testimonials" id="reviews">
    <div class="container">
      <div class="section-header">
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <div class="testimonials-grid">
        ${testimonialsHtml}
      </div>
    </div>
  </section>`;
}

function renderCtaBanner(ctx: RenderContext, props: Record<string, unknown>): string {
  const title = (props.title as string) || ctx.ctaSectionTitle;
  const subtitle = (props.subtitle as string) || ctx.ctaSectionDescription;

  return `
  <!-- CTA Section -->
  <section class="cta-section">
    <div class="container">
      <h2>${title}</h2>
      <p>${subtitle}</p>
      <a href="${ctx.mainCtaUrl}" class="btn" target="_blank" rel="nofollow noopener">
        ${ctx.mainCtaLabel}
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  </section>`;
}

function renderFooter(ctx: RenderContext, _props: Record<string, unknown>): string {
  return `
  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="logo">${ctx.hasLogo ? `<img src="${ctx.logoUrl}" alt="${ctx.brandName}" class="logo-img">` : ctx.brandName}</a>
          <p>${ctx.brandDescription}</p>
        </div>
        <div class="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#compare">Compare</a></li>
            <li><a href="#reviews">Reviews</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Affiliate Disclosure</a></li>
          </ul>
        </div>
      </div>

      <div class="affiliate-disclosure">
        <strong>Affiliate Disclosure:</strong> ${ctx.affiliateDisclosure}
      </div>

      <div class="footer-bottom">
        <p>&copy; ${ctx.year} ${ctx.brandName}. All rights reserved.</p>
        <p>As an Amazon Associate, we earn from qualifying purchases.</p>
      </div>
    </div>
  </footer>`;
}

/**
 * Render blocks in order based on pageLayouts
 */
export function renderBlocksToHtml(blocks: BlockInstance[], context: RenderContext): string {
  const sections: string[] = [];

  for (const block of blocks) {
    const renderer = blockRenderers[block.blockType];
    if (renderer) {
      const html = renderer(context, block.properties);
      if (html.trim()) {
        sections.push(html);
      }
    }
  }

  return sections.join('\n');
}

export type { RenderContext };
