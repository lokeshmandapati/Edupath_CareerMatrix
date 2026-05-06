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
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>🎯</div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: '#f1f5f9' }}>CareerMatrix</div>
            <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6366f1' }}>Career Path Prediction</div>
          </div>
        </Link>

        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6" style={{ borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#818cf8' }} />
              Join 1000+ Students
            </div>
            <h2 className="text-4xl font-extrabold leading-tight" style={{ letterSpacing: '-0.03em' }}>
              Your career clarity{' '}
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                starts here.
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: '#64748b' }}>
              Create your profile once. Get AI-powered career predictions, personalised roadmaps, and a career counselor — all in one place.
            </p>
          </div>

          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm" style={{ background: 'rgba(99,102,241,0.15)' }}>{p.icon}</span>
                <span className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{p.text}</span>
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

          <div className="rounded-3xl border p-8 sm:p-10" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: '#f1f5f9' }}>Create account</h1>
            <p className="mt-2 text-sm" style={{ color: '#64748b' }}>Join CareerMatrix and discover your best-fit career paths.</p>

            {error && (
              <div className="mt-5 rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }} role="alert">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-8 space-y-5">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Name *</label>
                <input
                  required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Email <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required minLength={6}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
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
