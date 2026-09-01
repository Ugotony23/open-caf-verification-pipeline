import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import type { Objective } from '../types';

function PrincipleNode({ principle }: { principle: Objective['principles'][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-4">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 py-1 text-sm text-slate-300 hover:text-slate-100">
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="font-medium">{principle.id}</span> {principle.name}
      </button>
      {open && (
        <div className="ml-5 border-l border-slate-800 pl-3 space-y-1 py-1">
          {principle.outcomes.map((o) => (
            <div key={o.id} className="text-xs text-slate-400">
              <span className="font-medium text-slate-300">{o.id}</span> {o.name}
              {o.igps.map((igp) => (
                <p key={igp.id} className="text-slate-600 pl-4 mt-0.5">
                  · {igp.statement}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FrameworkTree() {
  const [framework, setFramework] = useState<Objective[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getFramework().then(setFramework).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-rose-400">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">CAF Framework</h2>
        <p className="text-sm text-slate-500">Objectives, principles and contributing outcomes.</p>
      </div>

      <div className="space-y-4">
        {framework.length === 0 && <p className="text-sm text-slate-500">No framework data seeded yet.</p>}
        {framework.map((o) => (
          <div key={o.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm font-semibold text-slate-100">
              Objective {o.id}: {o.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{o.description}</p>
            <div className="mt-2">
              {o.principles.map((p) => (
                <PrincipleNode key={p.id} principle={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
