import { useState } from 'react';
import { Lock } from 'lucide-react';

type Mode = 'signin' | 'signup';

export function Login({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        await onRegister(email, password);
      } else {
        await onLogin(email, password);
      }
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
        <p className="text-xs text-amber-200/60 mb-4">Verification Pipeline</p>

        <div className="flex mb-4 rounded-md bg-black/20 p-1 text-xs">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
              mode === 'signin' ? 'bg-amber-500 text-red-950' : 'text-amber-200/70 hover:text-amber-50'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
              mode === 'signup' ? 'bg-amber-500 text-red-950' : 'text-amber-200/70 hover:text-amber-50'
            }`}
          >
            Create account
          </button>
        </div>

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
              minLength={mode === 'signup' ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-black/30 border border-amber-900/50 px-3 py-2 text-sm text-amber-50 focus:outline-none focus:border-amber-500"
            />
            {mode === 'signup' && <p className="text-xs text-amber-200/40 mt-1">At least 8 characters.</p>}
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-red-950 text-sm font-semibold px-4 py-2"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
