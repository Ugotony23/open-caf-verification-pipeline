import { useState } from 'react';
import { Eye, EyeOff, MailCheck } from 'lucide-react';

type Mode = 'signin' | 'signup';

function useVerifiedBanner(): 'verified' | 'failed' | null {
  const params = new URLSearchParams(window.location.search);
  const verified = params.get('verified');
  if (verified === '1') return 'verified';
  if (verified === '0') return 'failed';
  return null;
}

export function Login({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<string>;
}) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredMessage, setRegisteredMessage] = useState<string | null>(null);
  const verifiedBanner = useVerifiedBanner();

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setRegisteredMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const message = await onRegister(email, password);
        setRegisteredMessage(message);
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
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-[#1877F2]">Open CAF</h1>
        </div>
        <p className="text-sm text-[#65676B] mb-5">Verification Pipeline</p>

        {verifiedBanner === 'verified' && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
            Email verified — you can sign in now.
          </div>
        )}
        {verifiedBanner === 'failed' && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
            That verification link is invalid or expired.
          </div>
        )}

        {registeredMessage ? (
          <div className="rounded-lg border border-[#DDDFE2] bg-white p-6 shadow-sm text-center">
            <MailCheck className="mx-auto mb-3 text-[#1877F2]" size={28} />
            <p className="text-sm text-[#050505] font-medium mb-1">Check your email</p>
            <p className="text-sm text-[#65676B]">{registeredMessage}</p>
            <button
              onClick={() => switchMode('signin')}
              className="mt-4 text-sm font-medium text-[#1877F2] hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <div className="flex mb-4 rounded-md bg-[#E4E6EB] p-1 text-xs">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
                  mode === 'signin' ? 'bg-white text-[#1877F2] shadow-sm' : 'text-[#65676B] hover:text-[#050505]'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
                  mode === 'signup' ? 'bg-white text-[#1877F2] shadow-sm' : 'text-[#65676B] hover:text-[#050505]'
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="rounded-lg border border-[#DDDFE2] bg-white p-5 space-y-3 shadow-sm">
              <div>
                <label className="block text-xs text-[#65676B] mb-1">Email</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md bg-white border border-[#CED0D4] px-3 py-2 text-sm text-[#050505] focus:outline-none focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#65676B] mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={mode === 'signup' ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md bg-white border border-[#CED0D4] pl-3 pr-9 py-2 text-sm text-[#050505] focus:outline-none focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-0 top-0 h-full px-2.5 flex items-center text-[#65676B] hover:text-[#050505]"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {mode === 'signup' && <p className="text-xs text-[#65676B] mt-1">At least 8 characters.</p>}
              </div>
              {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2"
              >
                {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
