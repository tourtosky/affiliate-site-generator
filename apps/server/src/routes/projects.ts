import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { generateSlug } from '../lib/utils.js';

export const projectsRouter = Router();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  brandName: z.string().min(1).max(100),
  brandDescription: z.string().optional(),
  amazonTrackingId: z.string().min(1).max(50),
  amazonMarketplace: z.string().default('amazon.com'),
  brandColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
  template: z.string().default('modern'),
  languages: z.array(z.string()).default(['en']),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  brandName: z.string().min(1).max(100).optional(),
  brandDescription: z.string().optional(),
  amazonTrackingId: z.string().min(1).max(50).optional(),
  amazonMarketplace: z.string().optional(),
  brandColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
  template: z.string().optional(),
  selectedBlocks: z.array(z.string()).optional(),
  selectedPages: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  defaultLanguage: z.string().optional(),
  assetsConfig: z.object({
    generateLogo: z.boolean().optional(),
    logoStyle: z.string().optional(),
    logoText: z.string().optional(),
    generateFavicon: z.boolean().optional(),
    generateOgImage: z.boolean().optional(),
  }).optional(),
  htaccessConfig: z.object({
    enableGzip: z.boolean().optional(),
    enableCaching: z.boolean().optional(),
    forceHttps: z.boolean().optional(),
    wwwRedirect: z.enum(['to-www', 'to-non-www', 'none']).optional(),
    customRules: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

// GET /api/projects - List all projects
projectsRouter.get('/', async (req, res) => {
  try {
    const { status, search, limit = '50', offset = '0' } = req.query;

    const where: Record<string, unknown> = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { brandName: { contains: search } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { products: true, domains: true, generations: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    // Parse JSON fields
    const parsed = projects.map((p) => ({
      ...p,
      brandColors: JSON.parse(p.brandColors),
      selectedBlocks: JSON.parse(p.selectedBlocks),
      selectedPages: JSON.parse(p.selectedPages),
      languages: JSON.parse(p.languages),
      assetsConfig: JSON.parse(p.assetsConfig),
      htaccessConfig: JSON.parse(p.htaccessConfig),
      tags: p.tags ? JSON.parse(p.tags) : null,
    }));

    res.json({ projects: parsed, total });
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// GET /api/projects/:id - Get project details
projectsRouter.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        domains: true,
        products: { orderBy: { sortOrder: 'asc' } },
        ctas: true,
        generations: { orderBy: { version: 'desc' }, take: 10 },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Parse JSON fields
    const parsed = {
      ...project,
      brandColors: JSON.parse(project.brandColors),
      selectedBlocks: JSON.parse(project.selectedBlocks),
      selectedPages: JSON.parse(project.selectedPages),
      languages: JSON.parse(project.languages),
      assetsConfig: JSON.parse(project.assetsConfig),
      htaccessConfig: JSON.parse(project.htaccessConfig),
      tags: project.tags ? JSON.parse(project.tags) : null,
      ctas: project.ctas.map((cta) => ({
        ...cta,
        translations: JSON.parse(cta.translations),
      })),
    };

    res.json(parsed);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// POST /api/projects - Create new project
projectsRouter.post('/', async (req, res) => {
  try {
    const data = createProjectSchema.parse(req.body);

    const slug = generateSlug(data.name);

    // Check if slug exists
    const existing = await prisma.project.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const project = await prisma.project.create({
      data: {
        name: data.name,
        slug: finalSlug,
        brandName: data.brandName,
        brandDescription: data.brandDescription,
        amazonTrackingId: data.amazonTrackingId,
        amazonMarketplace: data.amazonMarketplace,
        brandColors: JSON.stringify({
          primary: data.brandColors?.primary || '#2563eb',
          secondary: data.brandColors?.secondary || '#1e40af',
          accent: data.brandColors?.accent || '#f59e0b',
        }),
        template: data.template,
        languages: JSON.stringify(data.languages),
      },
    });

    res.status(201).json({
      ...project,
      brandColors: JSON.parse(project.brandColors),
      selectedBlocks: JSON.parse(project.selectedBlocks),
      selectedPages: JSON.parse(project.selectedPages),
      languages: JSON.parse(project.languages),
      assetsConfig: JSON.parse(project.assetsConfig),
      htaccessConfig: JSON.parse(project.htaccessConfig),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project
projectsRouter.put('/:id', async (req, res) => {
  try {
    const data = updateProjectSchema.parse(req.body);

    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.brandName !== undefined) updateData.brandName = data.brandName;
    if (data.brandDescription !== undefined) updateData.brandDescription = data.brandDescription;
    if (data.amazonTrackingId !== undefined) updateData.amazonTrackingId = data.amazonTrackingId;
    if (data.amazonMarketplace !== undefined) updateData.amazonMarketplace = data.amazonMarketplace;
    if (data.template !== undefined) updateData.template = data.template;
    if (data.defaultLanguage !== undefined) updateData.defaultLanguage = data.defaultLanguage;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;

    // Handle JSON fields - merge with existing
    if (data.brandColors) {
      const existingColors = JSON.parse(existing.brandColors);
      updateData.brandColors = JSON.stringify({ ...existingColors, ...data.brandColors });
    }
    if (data.selectedBlocks) {
      updateData.selectedBlocks = JSON.stringify(data.selectedBlocks);
    }
    if (data.selectedPages) {
      updateData.selectedPages = JSON.stringify(data.selectedPages);
    }
    if (data.languages) {
      updateData.languages = JSON.stringify(data.languages);
    }
    if (data.assetsConfig) {
      const existingAssets = JSON.parse(existing.assetsConfig);
      updateData.assetsConfig = JSON.stringify({ ...existingAssets, ...data.assetsConfig });
    }
    if (data.htaccessConfig) {
      const existingHtaccess = JSON.parse(existing.htaccessConfig);
      updateData.htaccessConfig = JSON.stringify({ ...existingHtaccess, ...data.htaccessConfig });
    }
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({
      ...project,
      brandColors: JSON.parse(project.brandColors),
      selectedBlocks: JSON.parse(project.selectedBlocks),
      selectedPages: JSON.parse(project.selectedPages),
      languages: JSON.parse(project.languages),
      assetsConfig: JSON.parse(project.assetsConfig),
      htaccessConfig: JSON.parse(project.htaccessConfig),
      tags: project.tags ? JSON.parse(project.tags) : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
projectsRouter.delete('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/projects/:id/clone - Clone project
projectsRouter.post('/:id/clone', async (req, res) => {
  try {
    const original = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { products: true, ctas: true },
    });

    if (!original) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const newName = `${original.name} (Copy)`;
    const slug = generateSlug(newName);
    const finalSlug = `${slug}-${Date.now()}`;

    const cloned = await prisma.project.create({
      data: {
        name: newName,
        slug: finalSlug,
        status: 'draft',
        brandName: original.brandName,
        brandDescription: original.brandDescription,
        amazonTrackingId: original.amazonTrackingId,
        amazonMarketplace: original.amazonMarketplace,
        brandColors: original.brandColors,
        template: original.template,
        selectedBlocks: original.selectedBlocks,
        selectedPages: original.selectedPages,
        languages: original.languages,
        defaultLanguage: original.defaultLanguage,
        assetsConfig: original.assetsConfig,
        htaccessConfig: original.htaccessConfig,
        notes: original.notes,
        tags: original.tags,
        products: {
          create: original.products.map((p) => ({
            asin: p.asin,
            title: p.title,
            customTitle: p.customTitle,
            customDescription: p.customDescription,
            imageUrl: p.imageUrl,
            generateImage: p.generateImage,
            sortOrder: p.sortOrder,
          })),
        },
        ctas: {
          create: original.ctas.map((c) => ({
            name: c.name,
            label: c.label,
            linkType: c.linkType,
            productId: c.productId,
            customUrl: c.customUrl,
            amazonSearchQuery: c.amazonSearchQuery,
            amazonNode: c.amazonNode,
            style: c.style,
            size: c.size,
            icon: c.icon,
            placement: c.placement,
            blockId: c.blockId,
            translations: c.translations,
            isActive: c.isActive,
          })),
        },
      },
    });

    res.status(201).json({
      ...cloned,
      brandColors: JSON.parse(cloned.brandColors),
      selectedBlocks: JSON.parse(cloned.selectedBlocks),
      selectedPages: JSON.parse(cloned.selectedPages),
      languages: JSON.parse(cloned.languages),
      assetsConfig: JSON.parse(cloned.assetsConfig),
      htaccessConfig: JSON.parse(cloned.htaccessConfig),
    });
  } catch (error) {
    console.error('Error cloning project:', error);
    res.status(500).json({ error: 'Failed to clone project' });
  }
});

// POST /api/projects/:id/archive - Archive project
projectsRouter.post('/:id/archive', async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { status: 'archived' },
    });

    res.json({
      ...project,
      brandColors: JSON.parse(project.brandColors),
      selectedBlocks: JSON.parse(project.selectedBlocks),
      selectedPages: JSON.parse(project.selectedPages),
      languages: JSON.parse(project.languages),
      assetsConfig: JSON.parse(project.assetsConfig),
      htaccessConfig: JSON.parse(project.htaccessConfig),
    });
  } catch (error) {
    console.error('Error archiving project:', error);
    res.status(500).json({ error: 'Failed to archive project' });
  }
});
