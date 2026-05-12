import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const perks = [
  { icon: '🎯', text: 'AI-ranked career predictions based on your exact profile' },
  { icon: '🗺️', text: 'Personalised week-by-week learning roadmaps' },
  { icon: '✨', text: 'Custom stream support — fashion, aviation, culinary & more' },
  { icon: '💬', text: 'AI career counselor available 24/7' },
  { icon: '📊', text: 'Visual charts showing your skill & interest alignment' },
  { icon: '🔁', text: 'Retake anytime as you grow — your history stays saved' },
]

export default function Signup() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const payload = { name, password }
      const em = email.trim()
      if (em) payload.email = em
      const { data } = await api.post('/api/register', payload)
      login(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed'
      setError(typeof msg === 'string' ? msg : 'Could not register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: '#09090f', color: '#f1f5f9' }}>

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 10% -10%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(139,92,246,0.15) 0%, transparent 60%)' }} />
        <div className="absolute -top-52 -left-40 h-[600px] w-[600px] rounded-full opacity-20 blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-52 -right-40 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', animationDelay: '2s' }} />
      </div>

      {/* Left panel — perks */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16">
        <Link to="/" className="flex items-center gap-4 transition-transform hover:scale-105">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-lg ring-2 ring-white/10" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>🎯</div>
          <div>
            <div className="text-xl font-black tracking-tighter" style={{ color: '#f1f5f9' }}>CareerMatrix</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#818cf8' }}>Career Path Prediction</div>
          </div>
        </Link>

        <div className="space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-8" style={{ borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
              <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: '#818cf8' }} />
              Join 1000+ Students
            </div>
            <h2 className="text-5xl font-black leading-tight sm:text-6xl" style={{ letterSpacing: '-0.04em' }}>
              Your career clarity{' '}
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                starts here.
              </span>
            </h2>
            <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed" style={{ color: '#94a3b8' }}>
              Create your profile once. Get AI-powered career predictions, personalised roadmaps, and a career counselor — all in one place.
            </p>
          </div>

          <ul className="grid gap-4">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-4 group">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-transform group-hover:scale-110" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>{p.icon}</span>
                <span className="text-base font-semibold leading-relaxed" style={{ color: '#cbd5e1' }}>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs" style={{ color: '#334155' }}>© 2025 CareerMatrix · Free for all students</p>
      </div>

      {/* Right panel — form */}
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

          <div className="rounded-3xl border p-10 sm:p-12 shadow-2xl" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(30px)' }}>
            <h1 className="text-3xl font-black sm:text-4xl" style={{ color: '#f1f5f9' }}>Create account</h1>
            <p className="mt-3 text-base font-medium" style={{ color: '#64748b' }}>Join CareerMatrix and discover your best-fit career paths.</p>

            {error && (
              <div className="mt-5 rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }} role="alert">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-8 space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>Name *</label>
                <input
                  required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-2xl px-5 py-4 text-sm font-semibold outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>Email <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl px-5 py-4 text-sm font-semibold outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required minLength={6}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-2xl px-5 py-4 pr-14 text-sm font-semibold outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-widest transition-colors hover:text-white" style={{ color: '#6366f1' }}>
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
                    Creating account…
                  </span>
                ) : '🚀 Create Free Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: '#475569' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold transition-colors hover:underline" style={{ color: '#818cf8' }}>Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
