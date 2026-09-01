import { LayoutDashboard, FileText, ClipboardCheck, Network } from 'lucide-react';

export type View = 'dashboard' | 'evidence' | 'review' | 'framework';

const items: { view: View; label: string; icon: typeof LayoutDashboard }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'evidence', label: 'Evidence', icon: FileText },
  { view: 'review', label: 'Review Queue', icon: ClipboardCheck },
  { view: 'framework', label: 'CAF Framework', icon: Network },
];

export function Sidebar({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-4 flex flex-col gap-1">
      <div className="px-2 py-3 mb-2">
        <h1 className="text-sm font-semibold text-slate-100 leading-tight">Open CAF</h1>
        <p className="text-xs text-slate-500">Verification Pipeline</p>
      </div>
      {items.map(({ view: v, label, icon: Icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
            view === v ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </aside>
  );
}
