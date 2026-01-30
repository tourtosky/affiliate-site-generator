// Block instance stored in pageLayouts
export interface BlockInstance {
  instanceId: string;
  blockType: string;
  order: number;
  properties: Record<string, unknown>;
}

// Page layout structure
export interface PageLayout {
  blocks: BlockInstance[];
}

// Full pageLayouts structure
export interface PageLayouts {
  [pageName: string]: PageLayout;
}

// Property field types for the properties panel
export type PropertyFieldType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'select'
  | 'number'
  | 'boolean'
  | 'productRef'
  | 'productRefs'
  | 'ctaRef';

// Property field definition
export interface PropertyField {
  name: string;
  label: string;
  type: PropertyFieldType;
  required?: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[]; // For select type
  min?: number; // For number type
  max?: number; // For number type
  placeholder?: string;
}

// Block type definition (registry entry)
export interface BlockTypeDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  ctaSlots: string[];
  properties: PropertyField[];
  defaultProperties: Record<string, unknown>;
}

// Block categories
export type BlockCategory =
  | 'hero'
  | 'products'
  | 'reviews'
  | 'content'
  | 'cta'
  | 'navigation'
  | 'footer';
