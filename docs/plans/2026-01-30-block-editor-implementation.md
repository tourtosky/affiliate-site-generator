# Block Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a visual drag-drop block editor for arranging and configuring page blocks.

**Architecture:** Three-column editor (palette | canvas | properties) using dnd-kit for drag-drop, Zustand for state, React Query for persistence. Blocks are stored as JSON in Project.pageLayouts field.

**Tech Stack:** React, dnd-kit, Zustand, Prisma, Express, TypeScript

---

## Task 1: Add pageLayouts Field to Database

**Files:**
- Modify: `apps/server/prisma/schema.prisma:14-63`

**Step 1: Add the field to Project model**

In `schema.prisma`, add after line 32 (after `selectedPages`):

```prisma
  // Page layouts for block editor (JSON)
  pageLayouts      String   @default("{}")
```

**Step 2: Run migration**

```bash
cd apps/server && npx prisma migrate dev --name add_page_layouts
```

Expected: Migration created and applied successfully.

**Step 3: Commit**

```bash
git add apps/server/prisma/
git commit -m "feat(db): add pageLayouts field to Project model"
```

---

## Task 2: Create Block Type Definitions in Shared Package

**Files:**
- Create: `packages/shared/src/types/blocks.ts`
- Modify: `packages/shared/src/types/index.ts`

**Step 1: Create block type definitions**

Create `packages/shared/src/types/blocks.ts`:

```typescript
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
```

**Step 2: Export from index**

Add to `packages/shared/src/types/index.ts`:

```typescript
export * from './blocks';
```

**Step 3: Commit**

```bash
git add packages/shared/
git commit -m "feat(shared): add block type definitions"
```

---

## Task 3: Create Block Type Registry on Server

**Files:**
- Create: `apps/server/src/data/blockRegistry.ts`

**Step 1: Create the registry with 10 core blocks**

Create `apps/server/src/data/blockRegistry.ts`:

```typescript
import type { BlockTypeDefinition } from '@affiliate-site-generator/shared';

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
];

export function getBlockDefinition(blockType: string): BlockTypeDefinition | undefined {
  return blockRegistry.find((b) => b.id === blockType);
}

export function getBlocksByCategory(category: string): BlockTypeDefinition[] {
  return blockRegistry.filter((b) => b.category === category);
}
```

**Step 2: Commit**

```bash
git add apps/server/src/data/
git commit -m "feat(server): add block type registry with 10 core blocks"
```

---

## Task 4: Create Block API Endpoints

**Files:**
- Create: `apps/server/src/routes/blocks.ts`
- Modify: `apps/server/src/index.ts:8-16` (add import)
- Modify: `apps/server/src/index.ts:45-54` (add route)

**Step 1: Create blocks router**

Create `apps/server/src/routes/blocks.ts`:

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { blockRegistry, getBlockDefinition } from '../data/blockRegistry.js';

export const blocksRouter = Router();

// GET /api/blocks - List all block definitions
blocksRouter.get('/', (_req, res) => {
  res.json(blockRegistry);
});

// GET /api/blocks/:id - Get single block definition
blocksRouter.get('/:id', (req, res) => {
  const block = getBlockDefinition(req.params.id);
  if (!block) {
    return res.status(404).json({ error: 'Block not found' });
  }
  res.json(block);
});

// GET /api/projects/:projectId/layout - Get project page layouts
blocksRouter.get('/projects/:projectId/layout', async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.projectId },
    select: { pageLayouts: true, selectedPages: true },
  });

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const pageLayouts = JSON.parse(project.pageLayouts || '{}');
  const selectedPages = JSON.parse(project.selectedPages || '[]');

  res.json({ pageLayouts, selectedPages });
});

// PUT /api/projects/:projectId/layout - Save project page layouts
const saveLayoutSchema = z.object({
  pageLayouts: z.record(z.object({
    blocks: z.array(z.object({
      instanceId: z.string(),
      blockType: z.string(),
      order: z.number(),
      properties: z.record(z.unknown()),
    })),
  })),
});

blocksRouter.put('/projects/:projectId/layout', async (req, res) => {
  const { projectId } = req.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const data = saveLayoutSchema.parse(req.body);

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      pageLayouts: JSON.stringify(data.pageLayouts),
    },
  });

  res.json({
    pageLayouts: JSON.parse(updated.pageLayouts || '{}'),
  });
});
```

**Step 2: Add import to index.ts**

Add after line 16 in `apps/server/src/index.ts`:

```typescript
import { blocksRouter } from './routes/blocks.js';
```

**Step 3: Add route to index.ts**

Add after line 54 in `apps/server/src/index.ts`:

```typescript
app.use('/api/blocks', blocksRouter);
app.use('/api', blocksRouter);
```

**Step 4: Commit**

```bash
git add apps/server/src/
git commit -m "feat(api): add block registry and layout endpoints"
```

---

## Task 5: Create Zustand Editor Store

**Files:**
- Create: `apps/web/src/stores/editorStore.ts`

**Step 1: Create the store**

Create `apps/web/src/stores/editorStore.ts`:

```typescript
import { create } from 'zustand';
import type { BlockInstance, PageLayouts } from '@affiliate-site-generator/shared';

interface EditorState {
  // Data
  projectId: string | null;
  currentPage: string;
  pageLayouts: PageLayouts;
  availablePages: string[];

  // Selection
  selectedBlockId: string | null;

  // Status
  isDirty: boolean;
  isSaving: boolean;

  // Actions - Initialization
  initEditor: (projectId: string, pageLayouts: PageLayouts, availablePages: string[]) => void;
  resetEditor: () => void;

  // Actions - Page
  setCurrentPage: (page: string) => void;

  // Actions - Blocks
  addBlock: (blockType: string, properties: Record<string, unknown>) => void;
  removeBlock: (instanceId: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  updateBlockProperties: (instanceId: string, properties: Record<string, unknown>) => void;

  // Actions - Selection
  selectBlock: (instanceId: string | null) => void;

  // Actions - Persistence
  markSaved: () => void;
  setSaving: (saving: boolean) => void;

  // Getters
  getCurrentPageBlocks: () => BlockInstance[];
  getSelectedBlock: () => BlockInstance | null;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  projectId: null,
  currentPage: 'home',
  pageLayouts: {},
  availablePages: ['home'],
  selectedBlockId: null,
  isDirty: false,
  isSaving: false,

  // Initialize editor with project data
  initEditor: (projectId, pageLayouts, availablePages) => {
    set({
      projectId,
      pageLayouts,
      availablePages,
      currentPage: availablePages[0] || 'home',
      selectedBlockId: null,
      isDirty: false,
      isSaving: false,
    });
  },

  // Reset editor state
  resetEditor: () => {
    set({
      projectId: null,
      currentPage: 'home',
      pageLayouts: {},
      availablePages: ['home'],
      selectedBlockId: null,
      isDirty: false,
      isSaving: false,
    });
  },

  // Switch current page
  setCurrentPage: (page) => {
    set({ currentPage: page, selectedBlockId: null });
  },

  // Add a new block to current page
  addBlock: (blockType, properties) => {
    const { currentPage, pageLayouts } = get();
    const currentBlocks = pageLayouts[currentPage]?.blocks || [];

    const newBlock: BlockInstance = {
      instanceId: crypto.randomUUID(),
      blockType,
      order: currentBlocks.length,
      properties,
    };

    set({
      pageLayouts: {
        ...pageLayouts,
        [currentPage]: {
          blocks: [...currentBlocks, newBlock],
        },
      },
      isDirty: true,
      selectedBlockId: newBlock.instanceId,
    });
  },

  // Remove block from current page
  removeBlock: (instanceId) => {
    const { currentPage, pageLayouts, selectedBlockId } = get();
    const currentBlocks = pageLayouts[currentPage]?.blocks || [];

    const newBlocks = currentBlocks
      .filter((b) => b.instanceId !== instanceId)
      .map((b, i) => ({ ...b, order: i }));

    set({
      pageLayouts: {
        ...pageLayouts,
        [currentPage]: { blocks: newBlocks },
      },
      isDirty: true,
      selectedBlockId: selectedBlockId === instanceId ? null : selectedBlockId,
    });
  },

  // Reorder blocks via drag-drop
  reorderBlocks: (fromIndex, toIndex) => {
    const { currentPage, pageLayouts } = get();
    const currentBlocks = [...(pageLayouts[currentPage]?.blocks || [])];

    const [moved] = currentBlocks.splice(fromIndex, 1);
    currentBlocks.splice(toIndex, 0, moved);

    const reorderedBlocks = currentBlocks.map((b, i) => ({ ...b, order: i }));

    set({
      pageLayouts: {
        ...pageLayouts,
        [currentPage]: { blocks: reorderedBlocks },
      },
      isDirty: true,
    });
  },

  // Update block properties
  updateBlockProperties: (instanceId, properties) => {
    const { currentPage, pageLayouts } = get();
    const currentBlocks = pageLayouts[currentPage]?.blocks || [];

    const newBlocks = currentBlocks.map((b) =>
      b.instanceId === instanceId
        ? { ...b, properties: { ...b.properties, ...properties } }
        : b
    );

    set({
      pageLayouts: {
        ...pageLayouts,
        [currentPage]: { blocks: newBlocks },
      },
      isDirty: true,
    });
  },

  // Select a block
  selectBlock: (instanceId) => {
    set({ selectedBlockId: instanceId });
  },

  // Mark as saved
  markSaved: () => {
    set({ isDirty: false });
  },

  // Set saving status
  setSaving: (saving) => {
    set({ isSaving: saving });
  },

  // Get blocks for current page
  getCurrentPageBlocks: () => {
    const { currentPage, pageLayouts } = get();
    return pageLayouts[currentPage]?.blocks || [];
  },

  // Get selected block
  getSelectedBlock: () => {
    const { selectedBlockId, currentPage, pageLayouts } = get();
    if (!selectedBlockId) return null;
    const blocks = pageLayouts[currentPage]?.blocks || [];
    return blocks.find((b) => b.instanceId === selectedBlockId) || null;
  },
}));
```

**Step 2: Commit**

```bash
git add apps/web/src/stores/
git commit -m "feat(web): add Zustand editor store"
```

---

## Task 6: Create Block Preview Components

**Files:**
- Create: `apps/web/src/components/editor/blocks/HeroBlock.tsx`
- Create: `apps/web/src/components/editor/blocks/NavBlock.tsx`
- Create: `apps/web/src/components/editor/blocks/ProductGridBlock.tsx`
- Create: `apps/web/src/components/editor/blocks/ProductSpotlightBlock.tsx`
- Create: `apps/web/src/components/editor/blocks/ReviewSummaryBlock.tsx`
- Create: `apps/web/src/components/editor/blocks/ContentTextBlock.tsx`
- Create: `apps/web/src/components/editor/blocks/CtaBannerBlock.tsx`
- Create: `apps/web/src/components/editor/blocks/TrustBadgesBlock.tsx`
- Create: `apps/web/src/components/editor/blocks/FaqBlock.tsx`
- Create: `apps/web/src/components/editor/blocks/FooterBlock.tsx`
- Create: `apps/web/src/components/editor/blocks/index.ts`

**Step 1: Create HeroBlock**

Create `apps/web/src/components/editor/blocks/HeroBlock.tsx`:

```tsx
import { Image } from 'lucide-react';

interface HeroBlockProps {
  properties: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export function HeroBlock({ properties }: HeroBlockProps) {
  const { title, subtitle, alignment = 'center' } = properties;

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg text-${alignment}`}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">{title || 'Hero Title'}</h2>
        <p className="text-blue-100">{subtitle || 'Hero subtitle text goes here'}</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded">
          <Image className="h-4 w-4" />
          <span className="text-sm">CTA Button</span>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create NavBlock**

Create `apps/web/src/components/editor/blocks/NavBlock.tsx`:

```tsx
import { Menu, Search } from 'lucide-react';

interface NavBlockProps {
  properties: {
    logoUrl?: string;
    sticky?: boolean;
    showSearch?: boolean;
  };
}

export function NavBlock({ properties }: NavBlockProps) {
  const { showSearch } = properties;

  return (
    <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
          Logo
        </div>
        <nav className="flex gap-4 text-sm text-gray-600">
          <span>Home</span>
          <span>Products</span>
          <span>About</span>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {showSearch && <Search className="h-4 w-4 text-gray-400" />}
        <Menu className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}
```

**Step 3: Create ProductGridBlock**

Create `apps/web/src/components/editor/blocks/ProductGridBlock.tsx`:

```tsx
import { Star, Package } from 'lucide-react';

interface ProductGridBlockProps {
  properties: {
    productIds?: string[];
    columns?: number;
    showRatings?: boolean;
    showPrices?: boolean;
  };
}

export function ProductGridBlock({ properties }: ProductGridBlockProps) {
  const { productIds = [], columns = 3, showRatings, showPrices } = properties;
  const displayCount = productIds.length || 3;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: Math.min(displayCount, 6) }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border">
            <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
            <div className="text-sm font-medium truncate">Product {i + 1}</div>
            {showRatings && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-500">4.5</span>
              </div>
            )}
            {showPrices && (
              <div className="text-sm font-bold text-green-600 mt-1">$99.99</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Create ProductSpotlightBlock**

Create `apps/web/src/components/editor/blocks/ProductSpotlightBlock.tsx`:

```tsx
import { Package } from 'lucide-react';

interface ProductSpotlightBlockProps {
  properties: {
    productId?: string;
    layout?: 'left' | 'right';
    showSpecs?: boolean;
  };
}

export function ProductSpotlightBlock({ properties }: ProductSpotlightBlockProps) {
  const { layout = 'left', showSpecs } = properties;

  const imageSection = (
    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
      <Package className="h-16 w-16 text-gray-300" />
    </div>
  );

  const contentSection = (
    <div className="space-y-3">
      <h3 className="text-xl font-bold">Featured Product</h3>
      <p className="text-gray-600 text-sm">Product description goes here with detailed information about features and benefits.</p>
      {showSpecs && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Specification 1</div>
          <div>• Specification 2</div>
          <div>• Specification 3</div>
        </div>
      )}
      <div className="bg-blue-600 text-white px-4 py-2 rounded text-sm inline-block">
        View Product
      </div>
    </div>
  );

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className={`grid grid-cols-2 gap-6 ${layout === 'right' ? 'direction-rtl' : ''}`}>
        {layout === 'left' ? (
          <>
            {imageSection}
            {contentSection}
          </>
        ) : (
          <>
            {contentSection}
            {imageSection}
          </>
        )}
      </div>
    </div>
  );
}
```

**Step 5: Create ReviewSummaryBlock**

Create `apps/web/src/components/editor/blocks/ReviewSummaryBlock.tsx`:

```tsx
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ReviewSummaryBlockProps {
  properties: {
    productId?: string;
    showProscons?: boolean;
    rating?: number;
    verdict?: string;
  };
}

export function ReviewSummaryBlock({ properties }: ReviewSummaryBlockProps) {
  const { showProscons, rating = 4, verdict } = properties;

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl font-bold">{rating}</div>
        <div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500">Overall Rating</div>
        </div>
      </div>

      {showProscons && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded p-3">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
              <ThumbsUp className="h-4 w-4" /> Pros
            </div>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Pro point 1</li>
              <li>• Pro point 2</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded p-3">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
              <ThumbsDown className="h-4 w-4" /> Cons
            </div>
            <ul className="text-sm text-red-600 space-y-1">
              <li>• Con point 1</li>
              <li>• Con point 2</li>
            </ul>
          </div>
        </div>
      )}

      {verdict && (
        <div className="bg-gray-50 rounded p-3">
          <div className="font-medium mb-1">Verdict</div>
          <p className="text-sm text-gray-600">{verdict}</p>
        </div>
      )}
    </div>
  );
}
```

**Step 6: Create ContentTextBlock**

Create `apps/web/src/components/editor/blocks/ContentTextBlock.tsx`:

```tsx
interface ContentTextBlockProps {
  properties: {
    heading?: string;
    body?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export function ContentTextBlock({ properties }: ContentTextBlockProps) {
  const { heading, body, alignment = 'left' } = properties;

  return (
    <div className={`bg-white border rounded-lg p-6 text-${alignment}`}>
      {heading && <h3 className="text-xl font-bold mb-3">{heading}</h3>}
      <p className="text-gray-600">
        {body || 'Content text goes here. Add your paragraph content using the properties panel.'}
      </p>
    </div>
  );
}
```

**Step 7: Create CtaBannerBlock**

Create `apps/web/src/components/editor/blocks/CtaBannerBlock.tsx`:

```tsx
import { MousePointer } from 'lucide-react';

interface CtaBannerBlockProps {
  properties: {
    ctaId?: string;
    style?: 'primary' | 'secondary' | 'accent';
    fullWidth?: boolean;
    text?: string;
  };
}

export function CtaBannerBlock({ properties }: CtaBannerBlockProps) {
  const { style = 'primary', text } = properties;

  const bgColors = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-800',
    accent: 'bg-orange-500',
  };

  return (
    <div className={`${bgColors[style]} text-white p-6 rounded-lg text-center`}>
      <p className="mb-3">{text || 'Special offer! Get 20% off today!'}</p>
      <button className="bg-white text-gray-900 px-6 py-2 rounded font-medium inline-flex items-center gap-2">
        <MousePointer className="h-4 w-4" />
        Shop Now
      </button>
    </div>
  );
}
```

**Step 8: Create TrustBadgesBlock**

Create `apps/web/src/components/editor/blocks/TrustBadgesBlock.tsx`:

```tsx
import { Shield, RefreshCw, Truck, Headphones } from 'lucide-react';

interface TrustBadgesBlockProps {
  properties: {
    showSecurePayment?: boolean;
    showMoneyBack?: boolean;
    showFreeShipping?: boolean;
    showSupport?: boolean;
    layout?: 'horizontal' | 'grid';
  };
}

export function TrustBadgesBlock({ properties }: TrustBadgesBlockProps) {
  const {
    showSecurePayment = true,
    showMoneyBack = true,
    showFreeShipping = false,
    showSupport = true,
    layout = 'horizontal',
  } = properties;

  const badges = [
    { show: showSecurePayment, icon: Shield, label: 'Secure Payment' },
    { show: showMoneyBack, icon: RefreshCw, label: 'Money Back' },
    { show: showFreeShipping, icon: Truck, label: 'Free Shipping' },
    { show: showSupport, icon: Headphones, label: '24/7 Support' },
  ].filter((b) => b.show);

  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      <div
        className={layout === 'horizontal' ? 'flex justify-center gap-8' : 'grid grid-cols-2 gap-4'}
      >
        {badges.map((badge, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center">
            <badge.icon className="h-8 w-8 text-green-600" />
            <span className="text-sm font-medium">{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 9: Create FaqBlock**

Create `apps/web/src/components/editor/blocks/FaqBlock.tsx`:

```tsx
import { ChevronDown } from 'lucide-react';

interface FaqBlockProps {
  properties: {
    heading?: string;
    expandable?: boolean;
    items?: string;
  };
}

export function FaqBlock({ properties }: FaqBlockProps) {
  const { heading = 'FAQ', items } = properties;

  let faqItems: { question: string; answer: string }[] = [];
  try {
    faqItems = JSON.parse(items || '[]');
  } catch {
    faqItems = [];
  }

  if (faqItems.length === 0) {
    faqItems = [
      { question: 'What is your return policy?', answer: 'We offer a 30-day return policy.' },
      { question: 'How long does shipping take?', answer: 'Shipping typically takes 3-5 business days.' },
    ];
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">{heading}</h3>
      <div className="space-y-2">
        {faqItems.map((item, i) => (
          <div key={i} className="border rounded">
            <div className="flex items-center justify-between p-3 bg-gray-50">
              <span className="font-medium text-sm">{item.question}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
            <div className="p-3 text-sm text-gray-600">{item.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 10: Create FooterBlock**

Create `apps/web/src/components/editor/blocks/FooterBlock.tsx`:

```tsx
import { Facebook, Twitter, Instagram } from 'lucide-react';

interface FooterBlockProps {
  properties: {
    copyright?: string;
    showSocialLinks?: boolean;
    columns?: number;
  };
}

export function FooterBlock({ properties }: FooterBlockProps) {
  const { copyright = '© 2024 All rights reserved', showSocialLinks = true, columns = 3 } = properties;

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6">
      <div className={`grid gap-8 mb-6`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i}>
            <h4 className="font-medium mb-2">Column {i + 1}</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>Link 1</li>
              <li>Link 2</li>
              <li>Link 3</li>
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-700 pt-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">{copyright}</span>
        {showSocialLinks && (
          <div className="flex gap-3">
            <Facebook className="h-5 w-5 text-gray-400" />
            <Twitter className="h-5 w-5 text-gray-400" />
            <Instagram className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 11: Create block registry index**

Create `apps/web/src/components/editor/blocks/index.ts`:

```typescript
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
};

export function getBlockComponent(blockType: string): ComponentType<BlockComponentProps> | null {
  return blockComponents[blockType] || null;
}
```

**Step 12: Commit**

```bash
git add apps/web/src/components/editor/blocks/
git commit -m "feat(web): add 10 core block preview components"
```

---

## Task 7: Create Editor UI Components

**Files:**
- Create: `apps/web/src/components/editor/BlockPalette.tsx`
- Create: `apps/web/src/components/editor/EditorCanvas.tsx`
- Create: `apps/web/src/components/editor/CanvasBlock.tsx`
- Create: `apps/web/src/components/editor/PropertiesPanel.tsx`
- Create: `apps/web/src/components/editor/PageSwitcher.tsx`
- Create: `apps/web/src/components/editor/EditorLayout.tsx`

**Step 1: Create BlockPalette**

Create `apps/web/src/components/editor/BlockPalette.tsx`:

```tsx
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { BlockTypeDefinition } from '@affiliate-site-generator/shared';
import {
  Image, Navigation, Grid3X3, Star, FileText,
  MousePointer, Shield, HelpCircle, Columns
} from 'lucide-react';

interface BlockPaletteProps {
  blocks: BlockTypeDefinition[];
}

const categoryIcons: Record<string, typeof Image> = {
  hero: Image,
  navigation: Navigation,
  products: Grid3X3,
  reviews: Star,
  content: FileText,
  cta: MousePointer,
  footer: Columns,
};

function DraggableBlock({ block }: { block: BlockTypeDefinition }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${block.id}`,
    data: { type: 'palette-block', blockType: block.id, defaultProperties: block.defaultProperties },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = categoryIcons[block.category] || FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-2 bg-white border rounded cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-colors"
    >
      <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm truncate">{block.name}</span>
    </div>
  );
}

export function BlockPalette({ blocks }: BlockPaletteProps) {
  const categories = [...new Set(blocks.map((b) => b.category))];

  return (
    <div className="w-56 border-r bg-gray-50 p-4 overflow-y-auto">
      <h3 className="font-semibold text-sm text-gray-700 mb-3">Blocks</h3>
      {categories.map((category) => (
        <div key={category} className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">{category}</h4>
          <div className="space-y-1">
            {blocks
              .filter((b) => b.category === category)
              .map((block) => (
                <DraggableBlock key={block.id} block={block} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Create CanvasBlock**

Create `apps/web/src/components/editor/CanvasBlock.tsx`:

```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { BlockInstance } from '@affiliate-site-generator/shared';
import { getBlockComponent } from './blocks';

interface CanvasBlockProps {
  block: BlockInstance;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function CanvasBlock({ block, isSelected, onSelect, onDelete }: CanvasBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.instanceId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const BlockComponent = getBlockComponent(block.blockType);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`relative group rounded-lg transition-all ${
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2'
          : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
      }`}
    >
      {/* Drag handle and actions */}
      <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 bg-white border rounded shadow-sm cursor-grab hover:bg-gray-50"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 bg-white border rounded shadow-sm hover:bg-red-50 hover:border-red-200"
        >
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {/* Block content */}
      {BlockComponent ? (
        <BlockComponent properties={block.properties} />
      ) : (
        <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
          Unknown block: {block.blockType}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Create EditorCanvas**

Create `apps/web/src/components/editor/EditorCanvas.tsx`:

```tsx
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { BlockInstance } from '@affiliate-site-generator/shared';
import { CanvasBlock } from './CanvasBlock';

interface EditorCanvasProps {
  blocks: BlockInstance[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
}

export function EditorCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
}: EditorCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSelectBlock(null)}
      className={`flex-1 p-8 overflow-y-auto bg-gray-100 ${
        isOver ? 'bg-blue-50' : ''
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {blocks.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Plus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Drag blocks here to start building</p>
          </div>
        ) : (
          <SortableContext
            items={blocks.map((b) => b.instanceId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 pl-10">
              {blocks.map((block) => (
                <CanvasBlock
                  key={block.instanceId}
                  block={block}
                  isSelected={selectedBlockId === block.instanceId}
                  onSelect={() => onSelectBlock(block.instanceId)}
                  onDelete={() => onDeleteBlock(block.instanceId)}
                />
              ))}
            </div>
          </SortableContext>
        )}

        {/* Drop indicator at bottom */}
        {blocks.length > 0 && (
          <div
            className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isOver ? 'border-blue-400 bg-blue-50' : 'border-transparent'
            }`}
          >
            {isOver && <span className="text-blue-500 text-sm">Drop here to add</span>}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 4: Create PropertiesPanel**

Create `apps/web/src/components/editor/PropertiesPanel.tsx`:

```tsx
import type { BlockInstance, BlockTypeDefinition, PropertyField } from '@affiliate-site-generator/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PropertiesPanelProps {
  block: BlockInstance | null;
  blockDefinition: BlockTypeDefinition | null;
  onUpdateProperties: (properties: Record<string, unknown>) => void;
}

function PropertyFieldInput({
  field,
  value,
  onChange,
}: {
  field: PropertyField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case 'text':
      return (
        <Input
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={(value as number) ?? field.defaultValue ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          min={field.min}
          max={field.max}
        />
      );

    case 'boolean':
      return (
        <Switch
          checked={(value as boolean) ?? false}
          onCheckedChange={onChange}
        />
      );

    case 'select':
      return (
        <Select value={(value as string) || ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'image':
      return (
        <Input
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or path"
        />
      );

    case 'productRef':
    case 'ctaRef':
      return (
        <Input
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${field.type === 'productRef' ? 'Product' : 'CTA'} ID`}
        />
      );

    case 'productRefs':
      return (
        <Textarea
          value={Array.isArray(value) ? (value as string[]).join('\n') : ''}
          onChange={(e) => onChange(e.target.value.split('\n').filter(Boolean))}
          placeholder="One product ID per line"
          rows={3}
        />
      );

    default:
      return (
        <Input
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function PropertiesPanel({
  block,
  blockDefinition,
  onUpdateProperties,
}: PropertiesPanelProps) {
  if (!block || !blockDefinition) {
    return (
      <div className="w-72 border-l bg-white p-4">
        <p className="text-gray-500 text-sm">Select a block to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="w-72 border-l bg-white p-4 overflow-y-auto">
      <h3 className="font-semibold text-sm mb-1">{blockDefinition.name}</h3>
      <p className="text-xs text-gray-500 mb-4">{blockDefinition.description}</p>

      <div className="space-y-4">
        {blockDefinition.properties.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <Label className="text-xs">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <PropertyFieldInput
              field={field}
              value={block.properties[field.name]}
              onChange={(newValue) =>
                onUpdateProperties({ [field.name]: newValue })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 5: Create PageSwitcher**

Create `apps/web/src/components/editor/PageSwitcher.tsx`:

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PageSwitcherProps {
  currentPage: string;
  availablePages: string[];
  onChange: (page: string) => void;
}

export function PageSwitcher({ currentPage, availablePages, onChange }: PageSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Page:</span>
      <Select value={currentPage} onValueChange={onChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availablePages.map((page) => (
            <SelectItem key={page} value={page}>
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

**Step 6: Create EditorLayout**

Create `apps/web/src/components/editor/EditorLayout.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEditorStore } from '@/stores/editorStore';
import type { BlockTypeDefinition, PageLayouts } from '@affiliate-site-generator/shared';
import { BlockPalette } from './BlockPalette';
import { EditorCanvas } from './EditorCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { PageSwitcher } from './PageSwitcher';
import { getBlockComponent } from './blocks';

interface LayoutResponse {
  pageLayouts: PageLayouts;
  selectedPages: string[];
}

export function EditorLayout() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const {
    currentPage,
    pageLayouts,
    availablePages,
    selectedBlockId,
    isDirty,
    isSaving,
    initEditor,
    setCurrentPage,
    addBlock,
    removeBlock,
    reorderBlocks,
    updateBlockProperties,
    selectBlock,
    markSaved,
    setSaving,
    getCurrentPageBlocks,
    getSelectedBlock,
  } = useEditorStore();

  // Fetch block definitions
  const { data: blockDefinitions = [] } = useQuery<BlockTypeDefinition[]>({
    queryKey: ['blocks'],
    queryFn: () => api.get('/blocks'),
  });

  // Fetch project layout
  const { data: layoutData, isLoading } = useQuery<LayoutResponse>({
    queryKey: ['project-layout', projectId],
    queryFn: () => api.get(`/projects/${projectId}/layout`),
    enabled: !!projectId,
  });

  // Initialize editor when data loads
  useEffect(() => {
    if (layoutData && projectId) {
      initEditor(projectId, layoutData.pageLayouts, layoutData.selectedPages);
    }
  }, [layoutData, projectId, initEditor]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (layouts: PageLayouts) =>
      api.put(`/projects/${projectId}/layout`, { pageLayouts: layouts }),
    onMutate: () => setSaving(true),
    onSuccess: () => {
      markSaved();
      queryClient.invalidateQueries({ queryKey: ['project-layout', projectId] });
      toast({ title: 'Saved', description: 'Layout saved successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save layout', variant: 'destructive' });
    },
    onSettled: () => setSaving(false),
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;

    if (!over) return;

    // Dropping from palette to canvas
    if (String(active.id).startsWith('palette-') && over.id === 'canvas') {
      const { blockType, defaultProperties } = active.data.current as {
        blockType: string;
        defaultProperties: Record<string, unknown>;
      };
      addBlock(blockType, defaultProperties);
      return;
    }

    // Reordering within canvas
    if (!String(active.id).startsWith('palette-') && active.id !== over.id) {
      const blocks = getCurrentPageBlocks();
      const oldIndex = blocks.findIndex((b) => b.instanceId === active.id);
      const newIndex = blocks.findIndex((b) => b.instanceId === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(oldIndex, newIndex);
      }
    }
  };

  const selectedBlock = getSelectedBlock();
  const selectedBlockDef = selectedBlock
    ? blockDefinitions.find((b) => b.id === selectedBlock.blockType)
    : null;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Render drag overlay
  const renderDragOverlay = () => {
    if (!activeDragId) return null;

    if (activeDragId.startsWith('palette-')) {
      const blockType = activeDragId.replace('palette-', '');
      const def = blockDefinitions.find((b) => b.id === blockType);
      return (
        <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-lg opacity-80">
          {def?.name || blockType}
        </div>
      );
    }

    const block = getCurrentPageBlocks().find((b) => b.instanceId === activeDragId);
    if (block) {
      const BlockComponent = getBlockComponent(block.blockType);
      return (
        <div className="opacity-80 shadow-lg max-w-md">
          {BlockComponent && <BlockComponent properties={block.properties} />}
        </div>
      );
    }

    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="h-14 border-b bg-white flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <PageSwitcher
              currentPage={currentPage}
              availablePages={availablePages}
              onChange={setCurrentPage}
            />
          </div>
          <div className="flex items-center gap-2">
            {isDirty && <span className="text-sm text-orange-500">Unsaved changes</span>}
            <Button
              size="sm"
              onClick={() => saveMutation.mutate(pageLayouts)}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </header>

        {/* Main editor area */}
        <div className="flex-1 flex overflow-hidden">
          <BlockPalette blocks={blockDefinitions} />
          <EditorCanvas
            blocks={getCurrentPageBlocks()}
            selectedBlockId={selectedBlockId}
            onSelectBlock={selectBlock}
            onDeleteBlock={removeBlock}
          />
          <PropertiesPanel
            block={selectedBlock}
            blockDefinition={selectedBlockDef ?? null}
            onUpdateProperties={(props) =>
              selectedBlockId && updateBlockProperties(selectedBlockId, props)
            }
          />
        </div>
      </div>

      <DragOverlay>{renderDragOverlay()}</DragOverlay>
    </DndContext>
  );
}
```

**Step 7: Commit**

```bash
git add apps/web/src/components/editor/
git commit -m "feat(web): add editor UI components with drag-drop"
```

---

## Task 8: Create BlockEditor Page and Add Route

**Files:**
- Create: `apps/web/src/pages/BlockEditor.tsx`
- Modify: `apps/web/src/App.tsx`

**Step 1: Create BlockEditor page**

Create `apps/web/src/pages/BlockEditor.tsx`:

```tsx
import { EditorLayout } from '@/components/editor/EditorLayout';

export function BlockEditor() {
  return <EditorLayout />;
}
```

**Step 2: Add route to App.tsx**

Modify `apps/web/src/App.tsx`:

Add import at top:
```tsx
import { BlockEditor } from '@/pages/BlockEditor';
```

Add route after line 21 (after `projects/:id/*`):
```tsx
          <Route path="projects/:id/editor" element={<BlockEditor />} />
```

**Step 3: Commit**

```bash
git add apps/web/src/pages/BlockEditor.tsx apps/web/src/App.tsx
git commit -m "feat(web): add BlockEditor page and route"
```

---

## Task 9: Add Editor Link to ProjectDetail

**Files:**
- Modify: `apps/web/src/pages/ProjectDetail.tsx`

**Step 1: Add editor button to ProjectDetail**

Find the header section with action buttons and add an "Edit Layout" button that links to `/projects/${id}/editor`.

Add import:
```tsx
import { Pencil } from 'lucide-react';
```

Add button near other action buttons in the header:
```tsx
<Button variant="outline" onClick={() => navigate(`/projects/${id}/editor`)}>
  <Pencil className="h-4 w-4 mr-2" />
  Edit Layout
</Button>
```

**Step 2: Commit**

```bash
git add apps/web/src/pages/ProjectDetail.tsx
git commit -m "feat(web): add Edit Layout button to ProjectDetail"
```

---

## Task 10: Test End-to-End

**Step 1: Start dev servers**

```bash
npm run dev
```

**Step 2: Test the block editor**

1. Open http://localhost:5173
2. Navigate to a project
3. Click "Edit Layout" button
4. Verify:
   - Block palette shows 10 blocks organized by category
   - Drag a block from palette to canvas
   - Block appears on canvas with preview
   - Click block to select it
   - Properties panel shows editable fields
   - Change a property and verify preview updates
   - Reorder blocks via drag handle
   - Delete a block
   - Switch pages via dropdown
   - Click Save and verify "Saved" toast appears
   - Refresh page and verify layout persists

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete block editor MVP with drag-drop and properties panel"
```

---

## Summary

This implementation provides:

1. **Database**: `pageLayouts` JSON field on Project model
2. **Types**: Shared block type definitions
3. **Backend**: Block registry with 10 core blocks, layout API endpoints
4. **Frontend**:
   - Zustand store for editor state
   - 10 block preview components
   - Three-column editor layout
   - Drag-drop via dnd-kit
   - Properties panel with multiple field types
   - Page switcher for multi-page editing
5. **Integration**: Edit Layout button in ProjectDetail

Total: 10 tasks, ~25 files created/modified
