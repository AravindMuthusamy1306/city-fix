import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { uploadImage } from '../utils/cloudinary.js';

const router = Router();
const prisma = new PrismaClient();

// GET all issues – citizens see only their own, admins see all
router.get('/', verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
  try {
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: req.user.role === 'admin' ? { user: { select: { name: true, email: true } } } : undefined,
      }),
      prisma.issue.count({ where }),
    ]);
    res.json({
      data: issues,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new issue – with Cloudinary image upload
router.post('/', verifyToken, async (req, res) => {
  const { title, category, location, date, priority, coordinates, image } = req.body;
  try {
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage(image);
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image upload to Cloudinary failed' });
      }
    }

    const newIssue = await prisma.issue.create({
      data: {
        title,
        category,
        location,
        date,
        status: 'Open',
        priority: priority || 'Medium',
        lat: coordinates?.lat || null,
        lng: coordinates?.lng || null,
        image: imageUrl,
        logs: [{ action: 'Issue created', timestamp: new Date().toISOString() }],
        userId: req.user.id,
      },
    });
    res.status(201).json(newIssue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update status – owner or admin only, with auto-log
router.patch('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const existing = await prisma.issue.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Issue not found' });

    if (existing.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this issue' });
    }

    const newLog = {
      action: `Status changed from ${existing.status} to ${status}`,
      timestamp: new Date().toISOString(),
    };
    const updated = await prisma.issue.update({
      where: { id },
      data: {
        status,
        logs: [...(existing.logs || []), newLog],
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE issue – owner or admin only
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this issue' });
    }

    await prisma.issue.delete({ where: { id } });
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin only: get all users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin only: change user role
router.patch('/users/:userId/role', verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!['citizen', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;