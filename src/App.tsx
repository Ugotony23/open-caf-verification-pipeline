import { useEffect, useState } from 'react';
import { Sidebar, type View } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EvidencePanel } from './components/EvidencePanel';
import { ReviewQueue } from './components/ReviewQueue';
import { FrameworkTree } from './components/FrameworkTree';
import { Login } from './components/Login';
import { api } from './lib/api';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  async function handleLogin(email: string, password: string) {
    const loggedInUser = await api.login(email, password);
    setUser(loggedInUser);
  }

  async function handleLogout() {
    await api.logout();
    setUser(null);
  }

  if (checkingSession) {
    return <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-amber-900" />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-red-950 via-red-900 to-amber-900 text-amber-50">
      <Sidebar view={view} onChange={setView} user={user} onLogout={handleLogout} />
      <main className="flex-1 p-8 max-w-5xl">
        {view === 'dashboard' && <Dashboard />}
        {view === 'evidence' && <EvidencePanel />}
        {view === 'review' && <ReviewQueue />}
        {view === 'framework' && <FrameworkTree />}
      </main>
    </div>
  );
}
