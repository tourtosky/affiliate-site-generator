import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';

export const domainsRouter = Router();

const createDomainSchema = z.object({
  domain: z.string().min(1).max(255),
  isPrimary: z.boolean().default(false),
});

const updateDomainSchema = z.object({
  domain: z.string().min(1).max(255).optional(),
  isPrimary: z.boolean().optional(),
});

// GET /api/projects/:id/domains - List project domains
domainsRouter.get('/:id/domains', async (req, res) => {
  try {
    const domains = await prisma.domain.findMany({
      where: { projectId: req.params.id },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    res.json(domains);
  } catch (error) {
    console.error('Error listing domains:', error);
    res.status(500).json({ error: 'Failed to list domains' });
  }
});

// POST /api/projects/:id/domains - Add domain
domainsRouter.post('/:id/domains', async (req, res) => {
  try {
    const data = createDomainSchema.parse(req.body);

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if domain already exists in project
    const existing = await prisma.domain.findFirst({
      where: { projectId: req.params.id, domain: data.domain },
    });
    if (existing) {
      return res.status(409).json({ error: 'Domain already exists in project' });
    }

    // If this is set as primary, unset other primary domains
    if (data.isPrimary) {
      await prisma.domain.updateMany({
        where: { projectId: req.params.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const domain = await prisma.domain.create({
      data: {
        ...data,
        projectId: req.params.id,
      },
    });

    res.status(201).json(domain);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating domain:', error);
    res.status(500).json({ error: 'Failed to create domain' });
  }
});

// PUT /api/projects/:id/domains/:domainId - Update domain
domainsRouter.put('/:id/domains/:domainId', async (req, res) => {
  try {
    const data = updateDomainSchema.parse(req.body);

    const existing = await prisma.domain.findFirst({
      where: { id: req.params.domainId, projectId: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // If setting as primary, unset other primary domains
    if (data.isPrimary) {
      await prisma.domain.updateMany({
        where: { projectId: req.params.id, isPrimary: true, id: { not: req.params.domainId } },
        data: { isPrimary: false },
      });
    }

    const domain = await prisma.domain.update({
      where: { id: req.params.domainId },
      data,
    });

    res.json(domain);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating domain:', error);
    res.status(500).json({ error: 'Failed to update domain' });
  }
});

// DELETE /api/projects/:id/domains/:domainId - Remove domain
domainsRouter.delete('/:id/domains/:domainId', async (req, res) => {
  try {
    const existing = await prisma.domain.findFirst({
      where: { id: req.params.domainId, projectId: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    await prisma.domain.delete({ where: { id: req.params.domainId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(500).json({ error: 'Failed to delete domain' });
  }
});

// POST /api/projects/:id/domains/:domainId/set-primary - Set domain as primary
domainsRouter.post('/:id/domains/:domainId/set-primary', async (req, res) => {
  try {
    const existing = await prisma.domain.findFirst({
      where: { id: req.params.domainId, projectId: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // Unset all other primary domains
    await prisma.domain.updateMany({
      where: { projectId: req.params.id, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set this domain as primary
    const domain = await prisma.domain.update({
      where: { id: req.params.domainId },
      data: { isPrimary: true },
    });

    res.json(domain);
  } catch (error) {
    console.error('Error setting primary domain:', error);
    res.status(500).json({ error: 'Failed to set primary domain' });
  }
});
