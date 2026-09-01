import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../db.js';
import { assessEvidenceAgainstIgp } from '../lib/gemini.js';

export const apiRouter = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

// --- Framework -------------------------------------------------------------

apiRouter.get(
  '/framework',
  asyncHandler(async (_req, res) => {
    const objectives = await prisma.objective.findMany({
      orderBy: { id: 'asc' },
      include: {
        principles: {
          orderBy: { id: 'asc' },
          include: {
            outcomes: {
              orderBy: { id: 'asc' },
              include: { igps: true },
            },
          },
        },
      },
    });
    res.json(objectives);
  }),
);

// --- Evidence ----------------------------------------------------------------

apiRouter.get(
  '/evidence',
  asyncHandler(async (_req, res) => {
    const evidence = await prisma.evidence.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { mappings: true } } },
    });
    res.json(evidence);
  }),
);

apiRouter.post(
  '/evidence',
  asyncHandler(async (req, res) => {
    const { title, content, sourceType } = req.body ?? {};
    if (!title || !content) {
      res.status(400).json({ error: 'title and content are required.' });
      return;
    }
    const evidence = await prisma.evidence.create({
      data: { title, content, sourceType: sourceType ?? 'text' },
    });
    res.status(201).json(evidence);
  }),
);

apiRouter.delete(
  '/evidence/:id',
  asyncHandler(async (req, res) => {
    await prisma.mapping.deleteMany({ where: { evidenceId: req.params.id } });
    await prisma.evidence.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }),
);

// --- Analysis ----------------------------------------------------------------

apiRouter.post(
  '/evidence/:id/analyze',
  asyncHandler(async (req, res) => {
    const evidence = await prisma.evidence.findUnique({ where: { id: req.params.id } });
    if (!evidence) {
      res.status(404).json({ error: 'Evidence not found.' });
      return;
    }

    const { outcomeId } = req.body ?? {};
    if (!outcomeId) {
      res.status(400).json({ error: 'outcomeId is required.' });
      return;
    }

    const outcome = await prisma.outcome.findUnique({
      where: { id: outcomeId },
      include: { igps: true },
    });
    if (!outcome) {
      res.status(404).json({ error: 'Outcome not found.' });
      return;
    }

    const created = [];
    for (const igp of outcome.igps) {
      const assessment = await assessEvidenceAgainstIgp(evidence.content, igp.statement, outcome.name);
      const mapping = await prisma.mapping.create({
        data: {
          evidenceId: evidence.id,
          igpId: igp.id,
          status: assessment.status,
          confidence: assessment.confidence,
          aiReasoning: assessment.reasoning,
        },
      });
      await prisma.auditLog.create({
        data: {
          mappingId: mapping.id,
          action: 'CREATED',
          actor: 'gemini-ai',
          details: `Initial AI assessment: ${assessment.status} (confidence ${assessment.confidence.toFixed(2)})`,
        },
      });
      created.push(mapping);
    }

    res.status(201).json(created);
  }),
);

// --- Mappings / review queue ------------------------------------------------

apiRouter.get(
  '/mappings',
  asyncHandler(async (req, res) => {
    const { reviewStatus } = req.query;
    const mappings = await prisma.mapping.findMany({
      where: reviewStatus ? { reviewStatus: String(reviewStatus) } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        evidence: true,
        igp: {
          include: {
            outcome: {
              include: { principle: { include: { objective: true } } },
            },
          },
        },
      },
    });
    res.json(mappings);
  }),
);

apiRouter.post(
  '/mappings/:id/review',
  asyncHandler(async (req, res) => {
    const { decision, reviewerNotes } = req.body ?? {};
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      res.status(400).json({ error: 'decision must be APPROVED or REJECTED.' });
      return;
    }

    const mapping = await prisma.mapping.update({
      where: { id: req.params.id },
      data: { reviewStatus: decision, reviewerNotes: reviewerNotes ?? null },
    });

    await prisma.auditLog.create({
      data: {
        mappingId: mapping.id,
        action: decision,
        actor: 'reviewer',
        details: reviewerNotes ?? undefined,
      },
    });

    res.json(mapping);
  }),
);

apiRouter.get(
  '/mappings/:id/audit-log',
  asyncHandler(async (req, res) => {
    const logs = await prisma.auditLog.findMany({
      where: { mappingId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json(logs);
  }),
);

// --- Dashboard -----------------------------------------------------------

apiRouter.get(
  '/dashboard/stats',
  asyncHandler(async (_req, res) => {
    const [evidenceCount, mappingCount, pendingCount, byStatus] = await Promise.all([
      prisma.evidence.count(),
      prisma.mapping.count(),
      prisma.mapping.count({ where: { reviewStatus: 'PENDING' } }),
      prisma.mapping.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    res.json({
      evidenceCount,
      mappingCount,
      pendingCount,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.status })),
    });
  }),
);

// --- Errors ------------------------------------------------------------------

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: message });
}
