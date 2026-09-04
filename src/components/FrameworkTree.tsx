import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import type { Objective } from '../types';

function PrincipleNode({ principle }: { principle: Objective['principles'][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-4">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 py-1 text-sm text-amber-100/80 hover:text-amber-50">
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="font-medium">{principle.id}</span> {principle.name}
      </button>
      {open && (
        <div className="ml-5 border-l border-amber-900/40 pl-3 space-y-1 py-1">
          {principle.outcomes.map((o) => (
            <div key={o.id} className="text-xs text-amber-200/60">
              <span className="font-medium text-amber-100">{o.id}</span> {o.name}
              {o.igps.map((igp) => (
                <p key={igp.id} className="text-amber-200/40 pl-4 mt-0.5">
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

  if (error) return <p className="text-sm text-red-300">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-amber-50">CAF Framework</h2>
        <p className="text-sm text-amber-200/60">Objectives, principles and contributing outcomes.</p>
      </div>

      <div className="space-y-4">
        {framework.length === 0 && <p className="text-sm text-amber-200/60">No framework data seeded yet.</p>}
        {framework.map((o) => (
          <div key={o.id} className="rounded-lg border border-amber-900/40 bg-zinc-900/80 p-4">
            <h3 className="text-sm font-semibold text-amber-50">
              Objective {o.id}: {o.name}
            </h3>
            <p className="text-xs text-amber-200/60 mt-1">{o.description}</p>
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
