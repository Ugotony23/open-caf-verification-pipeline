import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { api } from '../lib/api';
import type { Mapping } from '../types';
import { ComplianceBadge, ReviewBadge } from './StatusBadge';

export function ReviewQueue() {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | ''>('PENDING');
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  function refresh() {
    api.listMappings(filter || undefined).then(setMappings).catch((e) => setError(e.message));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function decide(id: string, decision: 'APPROVED' | 'REJECTED') {
    try {
      await api.reviewMapping(id, decision, notes[id]);
      refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-50">Review Queue</h2>
          <p className="text-sm text-amber-200/60">Inspect AI evidence mappings and approve or reject them.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-md bg-black/30 border border-amber-900/40 px-2 py-1.5 text-xs text-amber-100"
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <div className="space-y-4">
        {mappings.length === 0 && <p className="text-sm text-amber-200/60">Nothing in this queue.</p>}
        {mappings.map((m) => (
          <div key={m.id} className="rounded-lg border border-amber-900/40 bg-zinc-900/80 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-amber-200/60">
                  {m.igp.outcome.principle.objective.id} &gt; {m.igp.outcome.principle.id} {m.igp.outcome.principle.name} &gt;{' '}
                  {m.igp.outcome.id} {m.igp.outcome.name}
                </p>
                <p className="text-sm text-amber-100 mt-1">{m.igp.statement}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ComplianceBadge status={m.status} />
                <ReviewBadge status={m.reviewStatus} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md bg-black/30 border border-amber-900/40 p-3">
                <p className="text-xs font-medium text-amber-200/60 mb-1">Evidence: {m.evidence.title}</p>
                <p className="text-xs text-amber-100/70 whitespace-pre-wrap line-clamp-4">{m.evidence.content}</p>
              </div>
              <div className="rounded-md bg-black/30 border border-amber-900/40 p-3">
                <p className="text-xs font-medium text-amber-200/60 mb-1">
                  AI Reasoning · confidence {(m.confidence * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-amber-100/70 whitespace-pre-wrap">{m.aiReasoning}</p>
              </div>
            </div>

            {m.reviewStatus === 'PENDING' ? (
              <div className="flex items-center gap-2">
                <input
                  value={notes[m.id] ?? ''}
                  onChange={(e) => setNotes((s) => ({ ...s, [m.id]: e.target.value }))}
                  placeholder="Reviewer notes (optional)"
                  className="flex-1 rounded-md bg-black/30 border border-amber-900/40 px-2 py-1.5 text-xs text-amber-100 placeholder:text-amber-200/30"
                />
                <button
                  onClick={() => decide(m.id, 'APPROVED')}
                  className="flex items-center gap-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium px-3 py-1.5"
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  onClick={() => decide(m.id, 'REJECTED')}
                  className="flex items-center gap-1 rounded-md bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium px-3 py-1.5"
                >
                  <X size={14} /> Reject
                </button>
              </div>
            ) : m.reviewerNotes ? (
              <p className="text-xs text-amber-200/60">Reviewer notes: {m.reviewerNotes}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
