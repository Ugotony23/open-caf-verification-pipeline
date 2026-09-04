import { LayoutDashboard, FileText, ClipboardCheck, Network, LogOut } from 'lucide-react';

export type View = 'dashboard' | 'evidence' | 'review' | 'framework';

const items: { view: View; label: string; icon: typeof LayoutDashboard }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'evidence', label: 'Evidence', icon: FileText },
  { view: 'review', label: 'Review Queue', icon: ClipboardCheck },
  { view: 'framework', label: 'CAF Framework', icon: Network },
];

export function Sidebar({
  view,
  onChange,
  user,
  onLogout,
}: {
  view: View;
  onChange: (v: View) => void;
  user: { email: string };
  onLogout: () => void;
}) {
  return (
    <aside className="w-64 shrink-0 border-r border-amber-900/50 bg-red-950/70 backdrop-blur p-4 flex flex-col gap-1">
      <div className="px-2 py-3 mb-2">
        <h1 className="text-sm font-semibold text-amber-50 leading-tight">Open CAF</h1>
        <p className="text-xs text-amber-200/60">Verification Pipeline</p>
      </div>
      {items.map(({ view: v, label, icon: Icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
            view === v
              ? 'bg-amber-500 text-red-950 font-medium'
              : 'text-amber-100/70 hover:bg-red-900/60 hover:text-amber-50'
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}

      <div className="mt-auto pt-3 border-t border-amber-900/50">
        <p className="px-2 text-xs text-amber-200/60 truncate mb-1">{user.email}</p>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left text-amber-100/70 hover:bg-red-900/60 hover:text-amber-50"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
