import { Router } from 'express';
import { z } from 'zod';
import { prisma, io } from '../index.js';
import path from 'path';
import fs from 'fs/promises';

export const generationRouter = Router();

// Generation options schema
const generateOptionsSchema = z.object({
  regenerateContent: z.boolean().default(false),
  regenerateImages: z.boolean().default(false),
  textProvider: z.enum(['openai', 'gemini']).optional(),
  imageProvider: z.enum(['dalle', 'imagen']).optional(),
});

// POST /api/projects/:id/generate - Start generation
generationRouter.post('/:id/generate', async (req, res) => {
  try {
    const options = generateOptionsSchema.parse(req.body);

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { products: true, ctas: true, domains: true },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get settings for API keys
    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });

    // Get next version number
    const lastGeneration = await prisma.generation.findFirst({
      where: { projectId: req.params.id },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (lastGeneration?.version ?? 0) + 1;

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        version: nextVersion,
        projectId: req.params.id,
        zipPath: '',
        settingsSnapshot: JSON.stringify({
          project,
          options,
          generatedAt: new Date().toISOString(),
        }),
        pagesGenerated: 0,
        imagesGenerated: 0,
        totalFiles: 0,
        status: 'pending',
        aiProvider: JSON.stringify({
          text: options.textProvider || settings?.defaultTextProvider || 'openai',
          images: options.imageProvider || settings?.defaultImageProvider || 'dalle',
        }),
      },
    });

    // TODO: Queue the generation job
    // For now, emit started event and return
    io.to(`project:${req.params.id}`).emit('generation:started', {
      generationId: generation.id,
      version: nextVersion,
    });

    // Simulate starting the generation (will be replaced with job queue)
    processGeneration(generation.id, project, options).catch(console.error);

    res.status(202).json({
      generationId: generation.id,
      version: nextVersion,
      status: 'pending',
      message: 'Generation started',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error starting generation:', error);
    res.status(500).json({ error: 'Failed to start generation' });
  }
});

// Background generation processor (placeholder - will be moved to job queue)
async function processGeneration(
  generationId: string,
  project: Awaited<ReturnType<typeof prisma.project.findUnique>> & { products: unknown[]; ctas: unknown[] },
  _options: z.infer<typeof generateOptionsSchema>
) {
  if (!project) return;

  try {
    // Update status to processing
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'processing' },
    });

    io.to(`project:${project.id}`).emit('generation:progress', {
      generationId,
      phase: 'starting',
      progress: 0,
      message: 'Initializing generation...',
    });

    // Create output directory
    const outputDir = path.join(process.cwd(), 'output', project.slug);
    await fs.mkdir(outputDir, { recursive: true });

    // Simulate generation steps
    const steps = [
      { phase: 'content', progress: 20, message: 'Generating content...' },
      { phase: 'images', progress: 50, message: 'Creating images...' },
      { phase: 'html', progress: 75, message: 'Building HTML pages...' },
      { phase: 'packaging', progress: 90, message: 'Creating ZIP archive...' },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      io.to(`project:${project.id}`).emit('generation:progress', {
        generationId,
        ...step,
      });
    }

    // For now, create a simple placeholder HTML
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.brandName}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 40px; }
    h1 { color: ${JSON.parse(project.brandColors).primary}; }
  </style>
</head>
<body>
  <h1>${project.brandName}</h1>
  <p>${project.brandDescription || 'Welcome to our site!'}</p>
  <p>Products: ${project.products.length}</p>
  <p>Generated: ${new Date().toISOString()}</p>
</body>
</html>`;

    const htmlPath = path.join(outputDir, 'index.html');
    await fs.writeFile(htmlPath, indexHtml);

    // Create a simple ZIP (placeholder)
    const generation = await prisma.generation.findUnique({ where: { id: generationId } });
    const zipPath = path.join(outputDir, `v${generation?.version || 1}.zip`);

    // For now just write a marker file - real ZIP creation will use archiver
    await fs.writeFile(zipPath, 'ZIP_PLACEHOLDER');

    // Update generation record
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'completed',
        zipPath,
        zipSize: 0,
        pagesGenerated: 1,
        imagesGenerated: 0,
        totalFiles: 2,
        generationTimeMs: 4000,
      },
    });

    // Update project
    await prisma.project.update({
      where: { id: project.id },
      data: {
        lastGeneratedAt: new Date(),
        generationCount: { increment: 1 },
      },
    });

    io.to(`project:${project.id}`).emit('generation:completed', {
      generationId,
      version: generation?.version,
      zipPath,
    });
  } catch (error) {
    console.error('Generation error:', error);

    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'failed',
        errorLog: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    io.to(`project:${project.id}`).emit('generation:failed', {
      generationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// GET /api/projects/:id/generate/status - Get generation status (for polling fallback)
generationRouter.get('/:id/generate/status', async (req, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: { projectId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!generation) {
      return res.status(404).json({ error: 'No generation found' });
    }

    res.json({
      id: generation.id,
      version: generation.version,
      status: generation.status,
      progress: generation.status === 'completed' ? 100 : generation.status === 'failed' ? 0 : 50,
    });
  } catch (error) {
    console.error('Error getting generation status:', error);
    res.status(500).json({ error: 'Failed to get generation status' });
  }
});

// POST /api/projects/:id/generate/cancel - Cancel generation
generationRouter.post('/:id/generate/cancel', async (req, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: {
        projectId: req.params.id,
        status: { in: ['pending', 'processing'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!generation) {
      return res.status(404).json({ error: 'No active generation to cancel' });
    }

    // TODO: Actually cancel the job
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: 'failed', errorLog: 'Cancelled by user' },
    });

    io.to(`project:${req.params.id}`).emit('generation:cancelled', {
      generationId: generation.id,
    });

    res.json({ message: 'Generation cancelled' });
  } catch (error) {
    console.error('Error cancelling generation:', error);
    res.status(500).json({ error: 'Failed to cancel generation' });
  }
});

// GET /api/projects/:id/history - Get generation history
generationRouter.get('/:id/history', async (req, res) => {
  try {
    const generations = await prisma.generation.findMany({
      where: { projectId: req.params.id },
      orderBy: { version: 'desc' },
      take: 20,
    });

    res.json(generations.map(g => ({
      ...g,
      aiProvider: JSON.parse(g.aiProvider),
      generationLog: g.generationLog ? JSON.parse(g.generationLog) : null,
    })));
  } catch (error) {
    console.error('Error getting generation history:', error);
    res.status(500).json({ error: 'Failed to get generation history' });
  }
});

// GET /api/projects/:id/history/:version - Get specific version details
generationRouter.get('/:id/history/:version', async (req, res) => {
  try {
    const generation = await prisma.generation.findUnique({
      where: {
        projectId_version: {
          projectId: req.params.id,
          version: parseInt(req.params.version),
        },
      },
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    res.json({
      ...generation,
      aiProvider: JSON.parse(generation.aiProvider),
      settingsSnapshot: JSON.parse(generation.settingsSnapshot),
      generationLog: generation.generationLog ? JSON.parse(generation.generationLog) : null,
    });
  } catch (error) {
    console.error('Error getting generation:', error);
    res.status(500).json({ error: 'Failed to get generation' });
  }
});

// GET /api/projects/:id/download/latest - Download latest ZIP
generationRouter.get('/:id/download/latest', async (req, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: { projectId: req.params.id, status: 'completed' },
      orderBy: { version: 'desc' },
    });

    if (!generation || !generation.zipPath) {
      return res.status(404).json({ error: 'No completed generation found' });
    }

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    const filename = `${project?.slug || 'site'}-v${generation.version}.zip`;

    res.download(generation.zipPath, filename);
  } catch (error) {
    console.error('Error downloading:', error);
    res.status(500).json({ error: 'Failed to download' });
  }
});

// GET /api/projects/:id/download/:version - Download specific version
generationRouter.get('/:id/download/:version', async (req, res) => {
  try {
    const generation = await prisma.generation.findUnique({
      where: {
        projectId_version: {
          projectId: req.params.id,
          version: parseInt(req.params.version),
        },
      },
    });

    if (!generation || !generation.zipPath) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    const filename = `${project?.slug || 'site'}-v${generation.version}.zip`;

    res.download(generation.zipPath, filename);
  } catch (error) {
    console.error('Error downloading:', error);
    res.status(500).json({ error: 'Failed to download' });
  }
});
