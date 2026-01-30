import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../index.js';

export const uploadsRouter = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, _file, cb) => {
    const projectId = req.params.id as string;
    const uploadDir = path.join(process.cwd(), 'uploads', projectId);
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Keep original extension, use type as filename
    const ext = path.extname(file.originalname);
    const type = file.fieldname; // 'logo' or 'favicon'
    cb(null, `${type}${ext}`);
  },
});

// File filter - only images
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPEG, GIF, WebP, SVG, and ICO are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// POST /api/projects/:id/upload/logo - Upload logo
uploadsRouter.post('/:id/upload/logo', upload.single('logo'), async (req, res) => {
  try {
    const projectId = req.params.id as string;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update project with logo path
    const logoUrl = `/api/projects/${projectId}/assets/logo${path.extname(req.file.originalname)}`;

    await prisma.project.update({
      where: { id: projectId },
      data: { logoUrl },
    });

    res.json({
      message: 'Logo uploaded successfully',
      logoUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// POST /api/projects/:id/upload/favicon - Upload favicon
uploadsRouter.post('/:id/upload/favicon', upload.single('favicon'), async (req, res) => {
  try {
    const projectId = req.params.id as string;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update project with favicon path
    const faviconUrl = `/api/projects/${projectId}/assets/favicon${path.extname(req.file.originalname)}`;

    await prisma.project.update({
      where: { id: projectId },
      data: { faviconUrl },
    });

    res.json({
      message: 'Favicon uploaded successfully',
      faviconUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Error uploading favicon:', error);
    res.status(500).json({ error: 'Failed to upload favicon' });
  }
});

// GET /api/projects/:id/assets/:filename - Serve uploaded assets
uploadsRouter.get('/:id/assets/:filename', async (req, res) => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', req.params.id);
    const files = await fs.readdir(uploadDir).catch(() => []);

    // Find file that starts with the requested filename (without extension)
    const baseName = path.parse(req.params.filename).name;
    const matchingFile = files.find(f => f.startsWith(baseName));

    if (!matchingFile) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const filePath = path.join(uploadDir, matchingFile);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving asset:', error);
    res.status(500).json({ error: 'Failed to serve asset' });
  }
});

// DELETE /api/projects/:id/upload/logo - Delete logo
uploadsRouter.delete('/:id/upload/logo', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete logo file
    const uploadDir = path.join(process.cwd(), 'uploads', req.params.id);
    const files = await fs.readdir(uploadDir).catch(() => []);
    const logoFile = files.find(f => f.startsWith('logo'));

    if (logoFile) {
      await fs.unlink(path.join(uploadDir, logoFile)).catch(() => {});
    }

    await prisma.project.update({
      where: { id: req.params.id },
      data: { logoUrl: null },
    });

    res.json({ message: 'Logo deleted' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: 'Failed to delete logo' });
  }
});

// DELETE /api/projects/:id/upload/favicon - Delete favicon
uploadsRouter.delete('/:id/upload/favicon', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const uploadDir = path.join(process.cwd(), 'uploads', req.params.id);
    const files = await fs.readdir(uploadDir).catch(() => []);
    const faviconFile = files.find(f => f.startsWith('favicon'));

    if (faviconFile) {
      await fs.unlink(path.join(uploadDir, faviconFile)).catch(() => {});
    }

    await prisma.project.update({
      where: { id: req.params.id },
      data: { faviconUrl: null },
    });

    res.json({ message: 'Favicon deleted' });
  } catch (error) {
    console.error('Error deleting favicon:', error);
    res.status(500).json({ error: 'Failed to delete favicon' });
  }
});
