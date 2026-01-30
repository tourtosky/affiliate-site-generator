# Block Editor & Drag-Drop System Design

## Overview

Visual block editor for building affiliate site pages through drag-and-drop. Users arrange blocks on a canvas and edit properties via a sidebar panel.

## Architecture

Three-column layout:
- **Left**: Block palette (draggable block types)
- **Center**: Canvas (drop zone with block instances)
- **Right**: Properties panel (form for selected block)

Page switcher in header to edit different pages (homepage, about, etc.).

## Data Model

### Project.pageLayouts (JSON field)

```json
{
  "homepage": {
    "blocks": [
      {
        "instanceId": "uuid-1",
        "blockType": "hero-standard",
        "order": 0,
        "properties": {
          "title": "Best Kitchen Gadgets 2024",
          "subtitle": "Expert reviews...",
          "backgroundImage": "/uploads/hero.jpg",
          "ctaId": "cta-uuid-123"
        }
      }
    ]
  }
}
```

### Block Type Registry (TypeScript)

Each block type defines:
- id, name, category, description
- defaultProperties
- propertySchema (for form generation)

## Core Blocks (Initial Set)

| Block | Type ID | Key Properties |
|-------|---------|----------------|
| Hero | `hero-standard` | title, subtitle, backgroundImage, ctaId, alignment |
| Navigation | `nav-simple` | logo, menuItems[], sticky |
| Product Grid | `products-grid` | productIds[], columns, showRatings, showPrices |
| Product Spotlight | `products-spotlight` | productId, layout, showSpecs |
| Review Summary | `reviews-summary` | productId, showProscons, rating |
| Content Text | `content-text` | heading, body, alignment |
| CTA Banner | `cta-banner` | ctaId, style, fullWidth |
| Trust Badges | `content-trust` | badges[], layout |
| FAQ | `content-faq` | items[], expandable |
| Footer | `footer-standard` | columns[], copyright, socialLinks[] |

## Property Types

- `text` - Single line input
- `textarea` - Multi-line text
- `image` - File picker
- `select` - Dropdown
- `number` - Numeric with min/max
- `boolean` - Toggle
- `productRef` - Single product picker
- `productRefs` - Multi-select products (drag to reorder)
- `ctaRef` - CTA picker

## Frontend Structure

```
src/
├── pages/
│   └── BlockEditor.tsx
├── components/editor/
│   ├── EditorLayout.tsx
│   ├── BlockPalette.tsx
│   ├── EditorCanvas.tsx
│   ├── PropertiesPanel.tsx
│   ├── PageSwitcher.tsx
│   ├── CanvasBlock.tsx
│   └── blocks/
│       ├── HeroBlock.tsx
│       ├── ProductGridBlock.tsx
│       └── ... (one per block type)
├── stores/
│   └── editorStore.ts
```

## Editor State (Zustand)

```typescript
{
  currentPage: string,
  blocks: BlockInstance[],
  selectedBlockId: string | null,
  isDirty: boolean,

  addBlock, removeBlock, reorderBlocks,
  selectBlock, updateBlockProperties,
  setCurrentPage, saveLayout
}
```

## API Endpoints

- `GET /api/projects/:id/layout` - Get page layouts
- `PUT /api/projects/:id/layout` - Save page layouts
- `GET /api/blocks` - Get block type definitions with schemas

## Tech Stack

- dnd-kit (already installed) for drag-and-drop
- Zustand for editor state
- React Query for API calls
- Existing shadcn/ui components for forms
