import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET all issues
router.get('/', async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new issue
router.post('/', async (req, res) => {
  const { title, category, location, date, status, priority, coordinates, image, logs } = req.body;
  try {
    const newIssue = await prisma.issue.create({
      data: {
        title,
        category,
        location,
        date,
        status: status || 'Open',
        priority: priority || 'Medium',
        lat: coordinates?.lat || null,
        lng: coordinates?.lng || null,
        image: image || null,
        logs: logs || [{ action: 'Issue created', timestamp: new Date().toISOString() }]
      }
    });
    res.status(201).json(newIssue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update status (with auto-log)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const existing = await prisma.issue.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Issue not found' });

    const newLog = {
      action: `Status changed from ${existing.status} to ${status}`,
      timestamp: new Date().toISOString()
    };
    const updated = await prisma.issue.update({
      where: { id },
      data: {
        status,
        logs: [...(existing.logs || []), newLog]
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE issue
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.issue.delete({ where: { id } });
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;