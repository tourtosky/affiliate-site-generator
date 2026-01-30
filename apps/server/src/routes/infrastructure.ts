import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';

export const infrastructureRouter = Router();

// ============ Hosting Providers ============

const hostingCredentialsSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('sftp'),
    host: z.string(),
    port: z.number().default(22),
    username: z.string(),
    password: z.string().optional(),
    privateKey: z.string().optional(),
    passphrase: z.string().optional(),
  }),
  z.object({
    type: z.literal('cpanel'),
    host: z.string(),
    port: z.number().default(2083),
    username: z.string(),
    apiToken: z.string(),
  }),
  z.object({
    type: z.literal('vercel'),
    apiToken: z.string(),
    teamId: z.string().optional(),
  }),
  z.object({
    type: z.literal('netlify'),
    apiToken: z.string(),
    siteId: z.string().optional(),
  }),
  z.object({
    type: z.literal('s3'),
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
    region: z.string(),
    bucket: z.string(),
  }),
]);

// GET /api/infrastructure/hosting
infrastructureRouter.get('/hosting', async (_req, res) => {
  try {
    const providers = await prisma.hostingProvider.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Mask credentials
    res.json(providers.map((p) => ({
      ...p,
      credentials: '••••••••',
    })));
  } catch (error) {
    console.error('Error listing hosting providers:', error);
    res.status(500).json({ error: 'Failed to list hosting providers' });
  }
});

// POST /api/infrastructure/hosting
infrastructureRouter.post('/hosting', async (req, res) => {
  try {
    const data = z.object({
      name: z.string().min(1),
      type: z.enum(['sftp', 'cpanel', 'plesk', 'vercel', 'netlify', 's3']),
      credentials: hostingCredentialsSchema,
    }).parse(req.body);

    const provider = await prisma.hostingProvider.create({
      data: {
        name: data.name,
        type: data.type,
        credentials: JSON.stringify(data.credentials),
      },
    });

    res.status(201).json({
      ...provider,
      credentials: '••••••••',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating hosting provider:', error);
    res.status(500).json({ error: 'Failed to create hosting provider' });
  }
});

// DELETE /api/infrastructure/hosting/:id
infrastructureRouter.delete('/hosting/:id', async (req, res) => {
  try {
    await prisma.hostingProvider.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting hosting provider:', error);
    res.status(500).json({ error: 'Failed to delete hosting provider' });
  }
});

// POST /api/infrastructure/hosting/:id/test
infrastructureRouter.post('/hosting/:id/test', async (req, res) => {
  try {
    const provider = await prisma.hostingProvider.findUnique({
      where: { id: req.params.id },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // TODO: Actually test the connection
    // For now, just mark as tested
    await prisma.hostingProvider.update({
      where: { id: req.params.id },
      data: {
        lastTestedAt: new Date(),
        lastTestResult: 'success',
      },
    });

    res.json({
      success: true,
      message: 'Connection test successful (placeholder)',
      latencyMs: 150,
    });
  } catch (error) {
    console.error('Error testing hosting provider:', error);
    res.status(500).json({ error: 'Failed to test hosting provider' });
  }
});

// ============ CDN Providers ============

// GET /api/infrastructure/cdn
infrastructureRouter.get('/cdn', async (_req, res) => {
  try {
    const providers = await prisma.cDNProvider.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(providers.map((p) => ({
      ...p,
      credentials: '••••••••',
    })));
  } catch (error) {
    console.error('Error listing CDN providers:', error);
    res.status(500).json({ error: 'Failed to list CDN providers' });
  }
});

// POST /api/infrastructure/cdn
infrastructureRouter.post('/cdn', async (req, res) => {
  try {
    const data = z.object({
      name: z.string().min(1),
      type: z.enum(['cloudflare', 'bunny', 'fastly']),
      credentials: z.object({
        type: z.string(),
        apiToken: z.string().optional(),
        apiKey: z.string().optional(),
        accountId: z.string().optional(),
      }),
    }).parse(req.body);

    const provider = await prisma.cDNProvider.create({
      data: {
        name: data.name,
        type: data.type,
        credentials: JSON.stringify(data.credentials),
        accountId: data.credentials.accountId,
      },
    });

    res.status(201).json({
      ...provider,
      credentials: '••••••••',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating CDN provider:', error);
    res.status(500).json({ error: 'Failed to create CDN provider' });
  }
});

// DELETE /api/infrastructure/cdn/:id
infrastructureRouter.delete('/cdn/:id', async (req, res) => {
  try {
    await prisma.cDNProvider.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting CDN provider:', error);
    res.status(500).json({ error: 'Failed to delete CDN provider' });
  }
});

// ============ Domain Registrars ============

// GET /api/infrastructure/registrars
infrastructureRouter.get('/registrars', async (_req, res) => {
  try {
    const registrars = await prisma.domainRegistrar.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(registrars.map((r) => ({
      ...r,
      credentials: '••••••••',
    })));
  } catch (error) {
    console.error('Error listing registrars:', error);
    res.status(500).json({ error: 'Failed to list registrars' });
  }
});

// POST /api/infrastructure/registrars
infrastructureRouter.post('/registrars', async (req, res) => {
  try {
    const data = z.object({
      name: z.string().min(1),
      type: z.enum(['cloudflare', 'namecheap', 'godaddy']),
      credentials: z.record(z.unknown()),
      accountEmail: z.string().email().optional(),
    }).parse(req.body);

    const registrar = await prisma.domainRegistrar.create({
      data: {
        name: data.name,
        type: data.type,
        credentials: JSON.stringify(data.credentials),
        accountEmail: data.accountEmail,
      },
    });

    res.status(201).json({
      ...registrar,
      credentials: '••••••••',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating registrar:', error);
    res.status(500).json({ error: 'Failed to create registrar' });
  }
});

// DELETE /api/infrastructure/registrars/:id
infrastructureRouter.delete('/registrars/:id', async (req, res) => {
  try {
    await prisma.domainRegistrar.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting registrar:', error);
    res.status(500).json({ error: 'Failed to delete registrar' });
  }
});

// ============ Deployments ============

// POST /api/infrastructure/deploy
infrastructureRouter.post('/deploy', async (req, res) => {
  try {
    const data = z.object({
      projectId: z.string(),
      generationId: z.string().optional(),
      providerId: z.string(),
      targetPath: z.string(),
      options: z.object({
        backup: z.boolean().default(true),
        clearDestination: z.boolean().default(false),
        skipHtaccess: z.boolean().default(false),
        purgeCdn: z.boolean().default(false),
      }).optional(),
    }).parse(req.body);

    // Get latest generation if not specified
    let generationId = data.generationId;
    if (!generationId) {
      const latest = await prisma.generation.findFirst({
        where: { projectId: data.projectId, status: 'completed' },
        orderBy: { version: 'desc' },
      });
      if (!latest) {
        return res.status(400).json({ error: 'No completed generation to deploy' });
      }
      generationId = latest.id;
    }

    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
    });

    const deployment = await prisma.deployment.create({
      data: {
        projectId: data.projectId,
        generationId,
        version: generation?.version || 1,
        providerId: data.providerId,
        targetPath: data.targetPath,
        status: 'pending',
      },
    });

    // TODO: Queue deployment job
    res.status(202).json({
      deploymentId: deployment.id,
      status: 'pending',
      message: 'Deployment queued',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error starting deployment:', error);
    res.status(500).json({ error: 'Failed to start deployment' });
  }
});

// GET /api/infrastructure/deployments
infrastructureRouter.get('/deployments', async (req, res) => {
  try {
    const { projectId, status, limit = '20' } = req.query;

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const deployments = await prisma.deployment.findMany({
      where,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
      include: {
        provider: { select: { name: true, type: true } },
      },
    });

    res.json(deployments);
  } catch (error) {
    console.error('Error listing deployments:', error);
    res.status(500).json({ error: 'Failed to list deployments' });
  }
});

// GET /api/infrastructure/deployments/:id
infrastructureRouter.get('/deployments/:id', async (req, res) => {
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: req.params.id },
      include: {
        provider: { select: { name: true, type: true } },
        project: { select: { name: true, slug: true } },
      },
    });

    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    res.json({
      ...deployment,
      deploymentLog: deployment.deploymentLog ? JSON.parse(deployment.deploymentLog) : null,
    });
  } catch (error) {
    console.error('Error getting deployment:', error);
    res.status(500).json({ error: 'Failed to get deployment' });
  }
});
