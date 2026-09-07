import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import type { Objective } from '../types';

function PrincipleNode({ principle }: { principle: Objective['principles'][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-4">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 py-1 text-sm text-[#050505] hover:text-[#1877F2]">
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="font-medium">{principle.id}</span> {principle.name}
      </button>
      {open && (
        <div className="ml-5 border-l border-[#DDDFE2] pl-3 space-y-1 py-1">
          {principle.outcomes.map((o) => (
            <div key={o.id} className="text-xs text-[#65676B]">
              <span className="font-medium text-[#050505]">{o.id}</span> {o.name}
              {o.igps.map((igp) => (
                <p key={igp.id} className="text-[#8A8D91] pl-4 mt-0.5">
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

  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#050505]">CAF Framework</h2>
        <p className="text-sm text-[#65676B]">Objectives, principles and contributing outcomes.</p>
      </div>

      <div className="space-y-4">
        {framework.length === 0 && <p className="text-sm text-[#65676B]">No framework data seeded yet.</p>}
        {framework.map((o) => (
          <div key={o.id} className="rounded-lg border border-[#DDDFE2] bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#050505]">
              Objective {o.id}: {o.name}
            </h3>
            <p className="text-xs text-[#65676B] mt-1">{o.description}</p>
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
