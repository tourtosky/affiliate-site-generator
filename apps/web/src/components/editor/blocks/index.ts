import type { ComponentType } from 'react';
import { HeroBlock } from './HeroBlock';
import { NavBlock } from './NavBlock';
import { ProductGridBlock } from './ProductGridBlock';
import { ProductSpotlightBlock } from './ProductSpotlightBlock';
import { ReviewSummaryBlock } from './ReviewSummaryBlock';
import { ContentTextBlock } from './ContentTextBlock';
import { CtaBannerBlock } from './CtaBannerBlock';
import { TrustBadgesBlock } from './TrustBadgesBlock';
import { FaqBlock } from './FaqBlock';
import { FooterBlock } from './FooterBlock';
import { FeaturesBlock } from './FeaturesBlock';
import { ComparisonBlock } from './ComparisonBlock';
import { TestimonialsBlock } from './TestimonialsBlock';

export interface BlockComponentProps {
  properties: Record<string, unknown>;
}

export const blockComponents: Record<string, ComponentType<BlockComponentProps>> = {
  'hero-standard': HeroBlock,
  'nav-simple': NavBlock,
  'products-grid': ProductGridBlock,
  'products-spotlight': ProductSpotlightBlock,
  'reviews-summary': ReviewSummaryBlock,
  'content-text': ContentTextBlock,
  'cta-banner': CtaBannerBlock,
  'content-trust': TrustBadgesBlock,
  'content-faq': FaqBlock,
  'footer-standard': FooterBlock,
  'features-grid': FeaturesBlock,
  'comparison-table': ComparisonBlock,
  'testimonials': TestimonialsBlock,
};

export function getBlockComponent(blockType: string): ComponentType<BlockComponentProps> | null {
  return blockComponents[blockType] || null;
}
