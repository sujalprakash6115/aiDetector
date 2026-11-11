import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { login } from '../auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, #0a1628 0%, #0f2744 30%, #1e3a8a 60%, #1d4ed8 100%)',
        }}
      />
      {/* Decorative orbs */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #93c5fd 0%, transparent 60%)' }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center relative mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
                boxShadow: '0 12px 40px -8px rgba(59, 130, 246, 0.55)',
              }}
            >
              <span className="relative z-10 tracking-tight">AI</span>
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 100%)',
                }}
              />
            </div>
            <div
              className="absolute -inset-1 rounded-2xl opacity-40 blur-md -z-10"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-blue-200/90 mt-1.5 text-sm">Sign in to DetectAI Platform</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-7 space-y-5 relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.97)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Subtle top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)',
            }}
          />

          {error && (
            <div className="px-3.5 py-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-2.5 animate-slide-up">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white placeholder:text-slate-400 transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white placeholder:text-slate-400 transition-all pr-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 mt-1 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 14px -3px rgba(37, 99, 235, 0.5)',
            }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            />
            <span className="relative z-10 flex items-center gap-2.5">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Sign In
                </>
              )}
            </span>
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" /> Secure
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-blue-500" /> AI-powered
            </span>
          </div>
        </form>

        <p className="text-center text-sm text-blue-200/90 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-white hover:underline underline-offset-2 transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
