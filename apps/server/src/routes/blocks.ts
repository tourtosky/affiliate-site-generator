import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { blockRegistry, getBlockDefinition } from '../data/blockRegistry.js';
import { generateDefaultLayouts } from '../data/templateDefaults.js';

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
    select: { pageLayouts: true, selectedPages: true, template: true },
  });

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const selectedPages = JSON.parse(project.selectedPages || '[]') as string[];
  let pageLayouts = JSON.parse(project.pageLayouts || '{}');

  // Auto-populate with template defaults if pageLayouts is empty
  if (Object.keys(pageLayouts).length === 0 && selectedPages.length > 0) {
    pageLayouts = generateDefaultLayouts(project.template, selectedPages);
  }

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
