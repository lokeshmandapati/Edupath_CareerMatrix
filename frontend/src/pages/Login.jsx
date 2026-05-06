import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const highlights = [
  { icon: '📊', title: 'Your Career Blueprint', desc: 'AI-ranked career matches with full visual breakdown.' },
  { icon: '🗺️', title: 'Learning Roadmap', desc: 'Personalised step-by-step path from beginner to job-ready.' },
  { icon: '💬', title: 'Career AI Assistant', desc: 'Chat anytime for skills, resume, and exam guidance.' },
  { icon: '🔁', title: 'Track Your Progress', desc: 'Retake and compare assessments as you grow.' },
]

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/login', { identifier, password })
      login(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed'
      setError(typeof msg === 'string' ? msg : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: '#09090f', color: '#f1f5f9' }}>

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 90% -10%, rgba(139,92,246,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 10% 110%, rgba(99,102,241,0.15) 0%, transparent 60%)' }} />
        <div className="absolute -top-52 -right-40 h-[600px] w-[600px] rounded-full opacity-20 blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
        <div className="absolute -bottom-52 -left-40 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', animationDelay: '2s' }} />
      </div>

      {/* Left panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>🎯</div>
            <span className="text-base font-extrabold" style={{ color: '#f1f5f9' }}>CareerMatrix</span>
          </div>

          <div className="rounded-3xl border p-8 sm:p-10" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: '#f1f5f9' }}>Welcome back 👋</h1>
              <p className="mt-2 text-sm" style={{ color: '#64748b' }}>Sign in to access your career dashboard and insights.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }} role="alert">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              {/* Identifier */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Name or Email</label>
                <input
                  required value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  placeholder="Your name or email"
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <p className="mt-1.5 text-xs" style={{ color: '#475569' }}>Use the name or email you registered with.</p>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Your password"
                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm font-medium outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: '#6366f1' }}>
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </span>
                ) : '✨ Sign In to Dashboard'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: '#475569' }}>
              No account?{' '}
              <Link to="/signup" className="font-bold transition-colors hover:underline" style={{ color: '#818cf8' }}>Sign up</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right panel — highlights */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14">
        <Link to="/" className="flex items-center gap-3 self-end">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>🎯</div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: '#f1f5f9' }}>CareerMatrix</div>
            <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6366f1' }}>Career Path Prediction</div>
          </div>
        </Link>

        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight" style={{ letterSpacing: '-0.03em' }}>
              Your personalized{' '}
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                career intelligence
              </span>{' '}
              awaits.
            </h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: '#64748b' }}>
              Sign in to access your full dashboard — predictions, roadmaps, deadlines, and AI guidance all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {highlights.map((h) => (
              <div key={h.title} className="rounded-2xl border p-5" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: 'rgba(99,102,241,0.15)' }}>{h.icon}</div>
                <div className="mb-1 text-sm font-bold" style={{ color: '#f1f5f9' }}>{h.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#334155' }}>© 2025 CareerMatrix · Free for all students</p>
      </div>

    </div>
  )
}
