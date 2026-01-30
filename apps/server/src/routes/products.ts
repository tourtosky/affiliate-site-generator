import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';

export const productsRouter = Router();

const createProductSchema = z.object({
  asin: z.string().min(1).max(20),
  title: z.string().optional(),
  customTitle: z.string().optional(),
  customDescription: z.string().optional(),
  imageUrl: z.string().url().optional(),
  generateImage: z.boolean().default(true),
});

const updateProductSchema = z.object({
  title: z.string().optional(),
  customTitle: z.string().optional().nullable(),
  customDescription: z.string().optional().nullable(),
  imageUrl: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  generateImage: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

// GET /api/projects/:id/products - List project products
productsRouter.get('/:id/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { projectId: req.params.id },
      orderBy: { sortOrder: 'asc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ error: 'Failed to list products' });
  }
});

// POST /api/projects/:id/products - Add product
productsRouter.post('/:id/products', async (req, res) => {
  try {
    const data = createProductSchema.parse(req.body);

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if ASIN already exists in project
    const existing = await prisma.product.findUnique({
      where: { projectId_asin: { projectId: req.params.id, asin: data.asin } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Product with this ASIN already exists in project' });
    }

    // Get max sort order
    const maxOrder = await prisma.product.aggregate({
      where: { projectId: req.params.id },
      _max: { sortOrder: true },
    });

    const product = await prisma.product.create({
      data: {
        ...data,
        projectId: req.params.id,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/projects/:id/products/:productId - Update product
productsRouter.put('/:id/products/:productId', async (req, res) => {
  try {
    const data = updateProductSchema.parse(req.body);

    const existing = await prisma.product.findFirst({
      where: { id: req.params.productId, projectId: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = await prisma.product.update({
      where: { id: req.params.productId },
      data,
    });

    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/projects/:id/products/:productId - Remove product
productsRouter.delete('/:id/products/:productId', async (req, res) => {
  try {
    const existing = await prisma.product.findFirst({
      where: { id: req.params.productId, projectId: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({ where: { id: req.params.productId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// POST /api/projects/:id/products/reorder - Reorder products
productsRouter.post('/:id/products/reorder', async (req, res) => {
  try {
    const { productIds } = z.object({
      productIds: z.array(z.string()),
    }).parse(req.body);

    // Update sort order for each product
    await prisma.$transaction(
      productIds.map((id, index) =>
        prisma.product.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    const products = await prisma.product.findMany({
      where: { projectId: req.params.id },
      orderBy: { sortOrder: 'asc' },
    });

    res.json(products);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error reordering products:', error);
    res.status(500).json({ error: 'Failed to reorder products' });
  }
});
