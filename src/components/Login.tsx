import { useState } from 'react';
import { Lock } from 'lucide-react';

export function Login({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={18} className="text-indigo-500" />
          <h1 className="text-sm font-semibold text-slate-100">Open CAF</h1>
        </div>
        <p className="text-xs text-slate-500 mb-6">Verification Pipeline — sign in to continue</p>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
