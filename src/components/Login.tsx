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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-red-900 to-amber-900 text-amber-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={18} className="text-amber-400" />
          <h1 className="text-sm font-semibold text-amber-50">Open CAF</h1>
        </div>
        <p className="text-xs text-amber-200/60 mb-6">Verification Pipeline — sign in to continue</p>

        <form onSubmit={handleSubmit} className="rounded-lg border border-amber-900/50 bg-red-950/60 backdrop-blur p-5 space-y-3">
          <div>
            <label className="block text-xs text-amber-200/60 mb-1">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-black/30 border border-amber-900/50 px-3 py-2 text-sm text-amber-50 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs text-amber-200/60 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-black/30 border border-amber-900/50 px-3 py-2 text-sm text-amber-50 focus:outline-none focus:border-amber-500"
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-red-950 text-sm font-semibold px-4 py-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
