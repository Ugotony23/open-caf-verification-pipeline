import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { DashboardStats } from '../types';
import { ComplianceBadge } from './StatusBadge';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-300 text-sm">{error}</p>;
  if (!stats) return <p className="text-amber-200/60 text-sm">Loading...</p>;

  const cards = [
    { label: 'Evidence Items', value: stats.evidenceCount },
    { label: 'Total Mappings', value: stats.mappingCount },
    { label: 'Pending Review', value: stats.pendingCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-amber-50">Dashboard</h2>
        <p className="text-sm text-amber-200/60">Compliance mapping overview.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-amber-900/40 bg-zinc-900/80 p-4">
            <p className="text-2xl font-semibold text-amber-400">{c.value}</p>
            <p className="text-xs text-amber-200/60 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-amber-900/40 bg-zinc-900/80 p-4">
        <h3 className="text-sm font-medium text-amber-100 mb-3">IGP Status Breakdown</h3>
        {stats.byStatus.length === 0 ? (
          <p className="text-sm text-amber-200/60">No mappings yet. Upload evidence and run an analysis.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {stats.byStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-2">
                <ComplianceBadge status={s.status} />
                <span className="text-sm text-amber-200/70">{s.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
