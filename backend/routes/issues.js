import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET issues – citizens see only their own, admins see all
router.get('/', verifyToken, async (req, res) => {
  try {
    let issues;
    if (req.user.role === 'admin') {
      issues = await prisma.issue.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      });
    } else {
      issues = await prisma.issue.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
    }
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST – citizen only (auto-assign userId)
router.post('/', verifyToken, async (req, res) => {
  const { title, category, location, date, priority, coordinates, image } = req.body;
  try {
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
        image: image || null,
        logs: [{ action: 'Issue created', timestamp: new Date().toISOString() }],
        userId: req.user.id
      }
    });
    res.status(201).json(newIssue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update status – only issue owner or admin
router.patch('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this issue' });
    }

    const newLog = {
      action: `Status changed from ${issue.status} to ${status}`,
      timestamp: new Date().toISOString()
    };
    const updated = await prisma.issue.update({
      where: { id },
      data: {
        status,
        logs: [...(issue.logs || []), newLog]
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE – citizen can delete own; admin can delete any
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
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });
  res.json(users);
});

// Admin only: change user role
router.patch('/users/:userId/role', verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!['citizen', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, name: true, role: true }
  });
  res.json(updated);
});

export default router;