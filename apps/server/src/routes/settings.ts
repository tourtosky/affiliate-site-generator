import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';

export const settingsRouter = Router();

const updateSettingsSchema = z.object({
  openaiApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  defaultTextProvider: z.enum(['openai', 'gemini']).optional(),
  defaultImageProvider: z.enum(['dalle', 'imagen']).optional(),
  defaultProjectSettings: z.object({
    template: z.string().optional(),
    languages: z.array(z.string()).optional(),
    defaultLanguage: z.string().optional(),
    brandColors: z.object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
    }).optional(),
    htaccessConfig: z.object({
      enableGzip: z.boolean().optional(),
      enableCaching: z.boolean().optional(),
      forceHttps: z.boolean().optional(),
      wwwRedirect: z.enum(['to-www', 'to-non-www', 'none']).optional(),
    }).optional(),
  }).optional(),
  outputDirectory: z.string().optional(),
  keepVersions: z.number().min(1).max(100).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

// GET /api/settings - Get all settings
settingsRouter.get('/', async (_req, res) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 'global' } });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'global' },
      });
    }

    // Mask API keys
    res.json({
      ...settings,
      openaiApiKey: settings.openaiApiKey ? '••••••••' + settings.openaiApiKey.slice(-4) : null,
      geminiApiKey: settings.geminiApiKey ? '••••••••' + settings.geminiApiKey.slice(-4) : null,
      defaultProjectSettings: settings.defaultProjectSettings
        ? JSON.parse(settings.defaultProjectSettings)
        : null,
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// PUT /api/settings - Update settings
settingsRouter.put('/', async (req, res) => {
  try {
    const data = updateSettingsSchema.parse(req.body);

    const updateData: Record<string, unknown> = {};

    // Only update API keys if they're not masked
    if (data.openaiApiKey && !data.openaiApiKey.startsWith('••••')) {
      updateData.openaiApiKey = data.openaiApiKey;
    }
    if (data.geminiApiKey && !data.geminiApiKey.startsWith('••••')) {
      updateData.geminiApiKey = data.geminiApiKey;
    }

    if (data.defaultTextProvider) updateData.defaultTextProvider = data.defaultTextProvider;
    if (data.defaultImageProvider) updateData.defaultImageProvider = data.defaultImageProvider;
    if (data.outputDirectory) updateData.outputDirectory = data.outputDirectory;
    if (data.keepVersions) updateData.keepVersions = data.keepVersions;
    if (data.theme) updateData.theme = data.theme;

    if (data.defaultProjectSettings) {
      const existing = await prisma.settings.findUnique({ where: { id: 'global' } });
      const existingDefaults = existing?.defaultProjectSettings
        ? JSON.parse(existing.defaultProjectSettings)
        : {};
      updateData.defaultProjectSettings = JSON.stringify({
        ...existingDefaults,
        ...data.defaultProjectSettings,
      });
    }

    const settings = await prisma.settings.upsert({
      where: { id: 'global' },
      update: updateData,
      create: {
        id: 'global',
        ...updateData,
      },
    });

    res.json({
      ...settings,
      openaiApiKey: settings.openaiApiKey ? '••••••••' + settings.openaiApiKey.slice(-4) : null,
      geminiApiKey: settings.geminiApiKey ? '••••••••' + settings.geminiApiKey.slice(-4) : null,
      defaultProjectSettings: settings.defaultProjectSettings
        ? JSON.parse(settings.defaultProjectSettings)
        : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST /api/settings/test-api - Test API key validity
settingsRouter.post('/test-api', async (req, res) => {
  try {
    const { provider, apiKey } = z.object({
      provider: z.enum(['openai', 'gemini']),
      apiKey: z.string().min(1),
    }).parse(req.body);

    // Use actual key or get from settings if masked
    let keyToTest = apiKey;
    if (apiKey.startsWith('••••')) {
      const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
      keyToTest = provider === 'openai' ? settings?.openaiApiKey : settings?.geminiApiKey;
      if (!keyToTest) {
        return res.status(400).json({ valid: false, message: 'No API key stored' });
      }
    }

    if (provider === 'openai') {
      // Test OpenAI key
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${keyToTest}` },
      });

      if (response.ok) {
        res.json({ valid: true, message: 'OpenAI API key is valid', provider: 'openai' });
      } else {
        const error = await response.json();
        res.json({ valid: false, message: error.error?.message || 'Invalid API key', provider: 'openai' });
      }
    } else {
      // Test Gemini key
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${keyToTest}`
      );

      if (response.ok) {
        res.json({ valid: true, message: 'Gemini API key is valid', provider: 'gemini' });
      } else {
        const error = await response.json();
        res.json({ valid: false, message: error.error?.message || 'Invalid API key', provider: 'gemini' });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error testing API key:', error);
    res.status(500).json({ valid: false, message: 'Failed to test API key' });
  }
});
