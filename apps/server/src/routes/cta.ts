import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';

export const ctaRouter = Router();

const ctaStyleEnum = z.enum(['primary', 'secondary', 'outline', 'ghost', 'text', 'icon']);
const ctaSizeEnum = z.enum(['xs', 'sm', 'md', 'lg', 'xl']);
const ctaLinkTypeEnum = z.enum(['product', 'custom', 'collection', 'search', 'store', 'deal', 'external']);
const ctaPlacementEnum = z.enum([
  'hero', 'hero-secondary', 'product-card', 'product-page',
  'comparison-table', 'sidebar', 'sticky-bar', 'exit-popup',
  'inline-content', 'footer', 'navigation'
]);

const createCTASchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  linkType: ctaLinkTypeEnum.default('product'),
  productId: z.string().optional(),
  customUrl: z.string().url().optional(),
  amazonSearchQuery: z.string().optional(),
  amazonNode: z.string().optional(),
  style: ctaStyleEnum.default('primary'),
  size: ctaSizeEnum.default('md'),
  icon: z.string().optional(),
  placement: ctaPlacementEnum,
  blockId: z.string().optional(),
  translations: z.record(z.string()).default({}),
});

const updateCTASchema = createCTASchema.partial();

// GET /api/projects/:id/ctas - List project CTAs
ctaRouter.get('/:id/ctas', async (req, res) => {
  try {
    const { placement, blockId } = req.query;

    const where: Record<string, unknown> = { projectId: req.params.id };
    if (placement) where.placement = placement;
    if (blockId) where.blockId = blockId;

    const ctas = await prisma.cTA.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    res.json(ctas.map(cta => ({
      ...cta,
      translations: JSON.parse(cta.translations),
    })));
  } catch (error) {
    console.error('Error listing CTAs:', error);
    res.status(500).json({ error: 'Failed to list CTAs' });
  }
});

// POST /api/projects/:id/ctas - Create CTA
ctaRouter.post('/:id/ctas', async (req, res) => {
  try {
    const data = createCTASchema.parse(req.body);

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const cta = await prisma.cTA.create({
      data: {
        ...data,
        translations: JSON.stringify(data.translations),
        projectId: req.params.id,
      },
    });

    res.status(201).json({
      ...cta,
      translations: JSON.parse(cta.translations),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating CTA:', error);
    res.status(500).json({ error: 'Failed to create CTA' });
  }
});

// PUT /api/projects/:id/ctas/:ctaId - Update CTA
ctaRouter.put('/:id/ctas/:ctaId', async (req, res) => {
  try {
    const data = updateCTASchema.parse(req.body);

    const existing = await prisma.cTA.findFirst({
      where: { id: req.params.ctaId, projectId: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'CTA not found' });
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.translations) {
      updateData.translations = JSON.stringify(data.translations);
    }

    const cta = await prisma.cTA.update({
      where: { id: req.params.ctaId },
      data: updateData,
    });

    res.json({
      ...cta,
      translations: JSON.parse(cta.translations),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating CTA:', error);
    res.status(500).json({ error: 'Failed to update CTA' });
  }
});

// DELETE /api/projects/:id/ctas/:ctaId - Delete CTA
ctaRouter.delete('/:id/ctas/:ctaId', async (req, res) => {
  try {
    const existing = await prisma.cTA.findFirst({
      where: { id: req.params.ctaId, projectId: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'CTA not found' });
    }

    await prisma.cTA.delete({ where: { id: req.params.ctaId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting CTA:', error);
    res.status(500).json({ error: 'Failed to delete CTA' });
  }
});

// POST /api/projects/:id/ctas/bulk - Bulk create/update CTAs
ctaRouter.post('/:id/ctas/bulk', async (req, res) => {
  try {
    const { ctas } = z.object({
      ctas: z.array(createCTASchema.extend({ id: z.string().optional() })),
    }).parse(req.body);

    const results = await prisma.$transaction(
      ctas.map((cta) => {
        const data = {
          ...cta,
          translations: JSON.stringify(cta.translations || {}),
          projectId: req.params.id,
        };

        if (cta.id) {
          return prisma.cTA.update({
            where: { id: cta.id },
            data,
          });
        }
        return prisma.cTA.create({ data });
      })
    );

    res.json(results.map(cta => ({
      ...cta,
      translations: JSON.parse(cta.translations),
    })));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error bulk updating CTAs:', error);
    res.status(500).json({ error: 'Failed to bulk update CTAs' });
  }
});

// ============ CTA Templates ============

// GET /api/cta-templates
ctaRouter.get('/cta-templates', async (_req, res) => {
  try {
    const templates = await prisma.cTATemplate.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    res.json(templates);
  } catch (error) {
    console.error('Error listing CTA templates:', error);
    res.status(500).json({ error: 'Failed to list CTA templates' });
  }
});

// POST /api/cta-templates
ctaRouter.post('/cta-templates', async (req, res) => {
  try {
    const data = z.object({
      name: z.string().min(1),
      label: z.string().min(1),
      style: ctaStyleEnum.default('primary'),
      size: ctaSizeEnum.default('md'),
      icon: z.string().optional(),
      placement: ctaPlacementEnum,
      isDefault: z.boolean().default(false),
    }).parse(req.body);

    const template = await prisma.cTATemplate.create({ data });
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating CTA template:', error);
    res.status(500).json({ error: 'Failed to create CTA template' });
  }
});

// DELETE /api/cta-templates/:id
ctaRouter.delete('/cta-templates/:templateId', async (req, res) => {
  try {
    await prisma.cTATemplate.delete({ where: { id: req.params.templateId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting CTA template:', error);
    res.status(500).json({ error: 'Failed to delete CTA template' });
  }
});
