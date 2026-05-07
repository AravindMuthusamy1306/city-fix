import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    // Basic counts
    const totalIssues = await prisma.issue.count();
    const openIssues = await prisma.issue.count({ where: { status: 'Open' } });
    const inProgressIssues = await prisma.issue.count({ where: { status: 'In Progress' } });
    const pendingIssues = await prisma.issue.count({ where: { status: 'Pending' } });
    const closedIssues = await prisma.issue.count({ where: { status: 'Closed' } });

    // Issues by category
    const categoryGroup = await prisma.issue.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    const issuesByCategory = categoryGroup.map(item => ({
      category: item.category,
      count: item._count.category,
    }));

    // 7‑day trend (fetch issues manually)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentIssues = await prisma.issue.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });
    const trendMap = new Map();
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendMap.set(dateStr, 0);
    }
    for (const issue of recentIssues) {
      const dateStr = issue.createdAt.toISOString().split('T')[0];
      if (trendMap.has(dateStr)) {
        trendMap.set(dateStr, trendMap.get(dateStr) + 1);
      }
    }
    const issuesLast7Days = Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Average resolution time
    const closedIssuesWithLogs = await prisma.issue.findMany({
      where: { status: 'Closed' },
      select: { logs: true, createdAt: true },
    });
    let totalDays = 0;
    let resolvedCount = 0;
    for (const issue of closedIssuesWithLogs) {
      const closedLog = issue.logs?.find(log => 
        log.action?.includes('Closed') || log.action?.includes('closed')
      );
      if (closedLog) {
        const closedAt = new Date(closedLog.timestamp);
        const created = new Date(issue.createdAt);
        const days = (closedAt - created) / (1000 * 60 * 60 * 24);
        totalDays += days;
        resolvedCount++;
      }
    }
    const avgResolutionDays = resolvedCount > 0 ? (totalDays / resolvedCount).toFixed(1) : 0;

    res.json({
      totalIssues,
      openIssues,
      inProgressIssues,
      pendingIssues,
      closedIssues,
      avgResolutionDays,
      issuesByCategory,
      issuesLast7Days,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;