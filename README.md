# Affiliate Site Generator

A local web application that generates complete HTML websites for Amazon affiliate brands, packaged as downloadable ZIP files ready for hosting.

## Features

- **Project Management** - Create and manage multiple affiliate site projects
- **Product Management** - Add Amazon products by ASIN with custom titles and descriptions
- **CTA System** - Configure call-to-action buttons with affiliate links
- **AI Content Generation** - Generate content using OpenAI GPT-4 or Google Gemini
- **AI Image Generation** - Create images with DALL-E or Imagen
- **Template System** - Choose from multiple site templates
- **Multi-language Support** - Generate sites in multiple languages
- **ZIP Export** - Download complete static sites ready for hosting
- **Infrastructure Ready** - Prepared for future domain registration and deployment

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js for API
- SQLite with Prisma ORM
- Socket.io for real-time updates
- Bull for job queues (generation tasks)

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS + shadcn/ui
- React Query for API state
- React Router for navigation
- Zustand for global state

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm 9+

## Installation

```bash
# Clone or navigate to the project
cd affiliate-site-generator

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create database
npm run db:push
```

## Configuration

1. Copy the environment example file:
```bash
cp apps/server/.env.example apps/server/.env
```

2. Edit `apps/server/.env` and add your API keys:
```env
# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# API Keys (can also be configured via UI)
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-gemini-key-here
```

Or configure API keys through the Settings page in the UI.

## Running the Application

### Development Mode

```bash
# Start both frontend and backend with hot reload
npm run dev
```

This starts:
- Frontend at http://localhost:5173
- Backend at http://localhost:3001

### Individual Services

```bash
# Backend only
npm run dev:server

# Frontend only
npm run dev:web
```

### Production Build

```bash
# Build all packages
npm run build

# Start production server
npm run start
```

## Usage Guide

### 1. Create a Project

1. Click **"New Project"** from the Dashboard
2. Enter project details:
   - **Project Name**: Internal name (e.g., "Kitchen Gadgets Pro")
   - **Brand Name**: Display name on the site (e.g., "KitchenPro")
   - **Amazon Tracking ID**: Your Associates tag (e.g., "mytag-20")
   - **Marketplace**: Select your Amazon region
3. Choose a template and brand colors
4. Click **"Create Project"**

### 2. Add Products

1. Open your project and go to the **Products** tab
2. Click **"Add Product"**
3. Enter the Amazon ASIN (e.g., "B08XYZ1234")
4. Optionally add custom title and description
5. Products will be featured on your generated site

### 3. Configure CTAs

1. Go to the **CTAs** tab
2. Click **"Add CTA"**
3. Configure:
   - **Name**: Internal identifier (e.g., "hero-buy-button")
   - **Label**: Button text (e.g., "Buy Now on Amazon")
   - **Link Type**: Product, Search, Store, or Custom URL
   - **Style**: Primary, Secondary, Outline, etc.
   - **Placement**: Hero, Product Card, Sidebar, etc.
4. Add translations for multi-language sites

### 4. Generate Site

1. Click the **"Generate"** button
2. Wait for generation to complete (progress shown via Socket.io)
3. Once complete, click **"Download"** to get the ZIP file

### 5. Deploy (Manual)

1. Extract the ZIP file
2. Upload contents to your web hosting via FTP/SFTP
3. Configure your domain to point to the hosting

## Project Structure

```
affiliate-site-generator/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── pages/          # Route pages
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utilities
│   │   │   └── stores/         # Zustand stores
│   │   └── package.json
│   │
│   └── server/                 # Express backend
│       ├── src/
│       │   ├── routes/         # API endpoints
│       │   ├── services/       # Business logic
│       │   ├── jobs/           # Background jobs
│       │   └── prisma/         # Database schema
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared TypeScript types
│
├── data/
│   └── database.sqlite         # SQLite database
│
├── output/                     # Generated sites
│
└── package.json                # Root workspace config
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/clone` - Clone project

### Products
- `GET /api/projects/:id/products` - List products
- `POST /api/projects/:id/products` - Add product
- `PUT /api/projects/:id/products/:productId` - Update product
- `DELETE /api/projects/:id/products/:productId` - Remove product

### CTAs
- `GET /api/projects/:id/ctas` - List CTAs
- `POST /api/projects/:id/ctas` - Create CTA
- `PUT /api/projects/:id/ctas/:ctaId` - Update CTA
- `DELETE /api/projects/:id/ctas/:ctaId` - Delete CTA

### Generation
- `POST /api/projects/:id/generate` - Start generation
- `GET /api/projects/:id/generate/status` - Get status
- `GET /api/projects/:id/download/latest` - Download latest ZIP

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/test-api` - Test API key

## Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Issues
```bash
# Reset database
rm data/database.sqlite
npm run db:push
```

### Dependency Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Future Features (Roadmap)

- [ ] Full AI content generation with OpenAI/Gemini
- [ ] Image generation with DALL-E/Imagen
- [ ] Live preview in iframe
- [ ] Drag-and-drop block editor
- [ ] SFTP/cPanel deployment
- [ ] Domain registration integration
- [ ] Cloudflare CDN integration
- [ ] Analytics dashboard

## License

Private - All rights reserved
