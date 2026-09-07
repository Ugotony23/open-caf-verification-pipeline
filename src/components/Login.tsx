import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-amber-400 text-red-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={18} className="text-red-800" />
          <h1 className="text-sm font-semibold text-red-950">Open CAF</h1>
        </div>
        <p className="text-xs text-red-900/70 mb-4">Verification Pipeline</p>

        <div className="flex mb-4 rounded-md bg-black/10 p-1 text-xs">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
              mode === 'signin' ? 'bg-red-950 text-amber-300' : 'text-red-900/70 hover:text-red-950'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
              mode === 'signup' ? 'bg-red-950 text-amber-300' : 'text-red-900/70 hover:text-red-950'
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-red-950/20 bg-white/90 backdrop-blur p-5 space-y-3 shadow-lg">
          <div>
            <label className="block text-xs text-red-900/70 mb-1">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-white border border-red-950/20 px-3 py-2 text-sm text-red-950 focus:outline-none focus:border-red-600"
            />
          </div>
          <div>
            <label className="block text-xs text-red-900/70 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={mode === 'signup' ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-white border border-red-950/20 pl-3 pr-9 py-2 text-sm text-red-950 focus:outline-none focus:border-red-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-0 h-full px-2.5 flex items-center text-red-900/50 hover:text-red-900"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {mode === 'signup' && <p className="text-xs text-red-900/50 mt-1">At least 8 characters.</p>}
          </div>
          {error && <p className="text-sm text-red-700 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-red-950 hover:bg-red-900 disabled:opacity-50 text-amber-300 text-sm font-semibold px-4 py-2"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
