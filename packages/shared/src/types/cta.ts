export type CTALinkType =
  | 'product'
  | 'custom'
  | 'collection'
  | 'search'
  | 'store'
  | 'deal'
  | 'external';

export type CTAStyle = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text' | 'icon';
export type CTASize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type CTAPlacement =
  | 'hero'
  | 'hero-secondary'
  | 'product-card'
  | 'product-page'
  | 'comparison-table'
  | 'sidebar'
  | 'sticky-bar'
  | 'exit-popup'
  | 'inline-content'
  | 'footer'
  | 'navigation';

export interface CTA {
  id: string;
  name: string;
  label: string;

  linkType: CTALinkType;

  // Link targets (depending on linkType)
  productId?: string;
  customUrl?: string;
  amazonSearchQuery?: string;
  amazonNode?: string;

  // Styling
  style: CTAStyle;
  size: CTASize;
  icon?: string;

  // Placement
  placement: CTAPlacement;
  blockId?: string;

  // Multilingual
  translations: Record<string, string>;

  isActive: boolean;

  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CTATemplate {
  id: string;
  name: string;
  label: string;
  style: CTAStyle;
  size: CTASize;
  icon?: string;
  placement: CTAPlacement;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Generated affiliate link output
export interface GeneratedLink {
  url: string;
  rel: string;
  target: string;
  dataAttributes: Record<string, string>;
}

// API types
export interface CreateCTAInput {
  name: string;
  label: string;
  linkType: CTALinkType;
  productId?: string;
  customUrl?: string;
  amazonSearchQuery?: string;
  amazonNode?: string;
  style?: CTAStyle;
  size?: CTASize;
  icon?: string;
  placement: CTAPlacement;
  blockId?: string;
  translations?: Record<string, string>;
}

export interface UpdateCTAInput {
  name?: string;
  label?: string;
  linkType?: CTALinkType;
  productId?: string;
  customUrl?: string;
  amazonSearchQuery?: string;
  amazonNode?: string;
  style?: CTAStyle;
  size?: CTASize;
  icon?: string;
  placement?: CTAPlacement;
  blockId?: string;
  translations?: Record<string, string>;
  isActive?: boolean;
}

export interface CreateCTATemplateInput {
  name: string;
  label: string;
  style?: CTAStyle;
  size?: CTASize;
  icon?: string;
  placement: CTAPlacement;
  isDefault?: boolean;
}
