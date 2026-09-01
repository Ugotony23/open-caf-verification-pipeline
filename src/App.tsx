import { useState } from 'react';
import { Sidebar, type View } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EvidencePanel } from './components/EvidencePanel';
import { ReviewQueue } from './components/ReviewQueue';
import { FrameworkTree } from './components/FrameworkTree';

export default function App() {
  const [view, setView] = useState<View>('dashboard');

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar view={view} onChange={setView} />
      <main className="flex-1 p-8 max-w-5xl">
        {view === 'dashboard' && <Dashboard />}
        {view === 'evidence' && <EvidencePanel />}
        {view === 'review' && <ReviewQueue />}
        {view === 'framework' && <FrameworkTree />}
      </main>
    </div>
  );
}
