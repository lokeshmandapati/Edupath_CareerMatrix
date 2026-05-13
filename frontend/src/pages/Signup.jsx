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
    <div className="relative flex min-h-screen overflow-hidden" style={{ color: '#f1f5f9' }}>

      {/* ── Rich Gradient Background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #16082b 25%, #0f0720 50%, #0a0518 75%, #09090f 100%)',
      }}>
        <div className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full opacity-40 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #7c3aed, #a855f7, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/3 h-[300px] w-[300px] rounded-full opacity-15 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #d97706, transparent 70%)' }} />
      </div>

      {/* ── Floating particles ── */}
      {[
        { top: '8%', left: '20%', size: 5, dur: 3 },
        { top: '25%', right: '30%', size: 6, dur: 4 },
        { bottom: '25%', left: '12%', size: 4, dur: 2.5 },
        { top: '65%', right: '18%', size: 5, dur: 3.5 },
        { bottom: '10%', left: '40%', size: 3, dur: 2.8 },
        { top: '40%', right: '45%', size: 4, dur: 3.2 },
      ].map((p, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: i * 0.4 }}
          className="pointer-events-none absolute rounded-full"
          style={{ ...p, width: p.size, height: p.size, background: '#a78bfa' }}
        />
      ))}

      {/* ── Left panel — perks with animations ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Link to="/" className="flex items-center gap-4 transition-transform hover:scale-105">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-lg ring-2 ring-white/10"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>🎯</div>
            <div>
              <div className="text-xl font-black tracking-tighter" style={{ color: '#f1f5f9' }}>CareerMatrix</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#818cf8' }}>Career Path Prediction</div>
            </div>
          </Link>
        </motion.div>

        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
              style={{ borderColor: 'rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}
            >
              <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: '#a78bfa' }} />
              Join 1000+ Students
            </motion.div>

            <h2 className="text-5xl font-black leading-tight sm:text-6xl" style={{ letterSpacing: '-0.04em' }}>
              Your career clarity{' '}
              <span style={{ background: 'linear-gradient(135deg, #c084fc, #818cf8, #e879f9)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                starts here.
              </span>
            </h2>
            <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed" style={{ color: '#94a3b8' }}>
              Create your profile once. Get AI-powered career predictions, personalised roadmaps, and a career counselor — all in one place.
            </p>
          </motion.div>

          <ul className="grid gap-4">
            {perks.map((p, i) => (
              <motion.li
                key={p.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-4 group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>{p.icon}</span>
                <span className="text-base font-semibold leading-relaxed" style={{ color: '#cbd5e1' }}>{p.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#334155' }}
        >
          © 2026 CareerMatrix · Built for Success
        </motion.p>
      </div>

      {/* ── Right panel — form with animations ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 flex items-center gap-4 lg:hidden"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-lg ring-2 ring-white/10"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>🎯</div>
            <span className="text-xl font-black tracking-tight" style={{ color: '#f1f5f9' }}>CareerMatrix</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="rounded-3xl border p-10 sm:p-12 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(30px)' }}
          >
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
              <h1 className="text-3xl font-black sm:text-4xl" style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}>Create account</h1>
              <p className="mt-3 text-base font-medium" style={{ color: '#94a3b8' }}>Join CareerMatrix and discover your best-fit career paths.</p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-5 rounded-2xl border px-5 py-3.5 text-sm font-semibold"
                style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }}
                role="alert"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <form onSubmit={submit} className="mt-8 space-y-5">
              {/* Name */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>Name *</label>
                <input
                  required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-2xl px-5 py-4 text-sm font-semibold outline-none transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.6)'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none' }}
                />
              </motion.div>

              {/* Email */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>Email <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl px-5 py-4 text-sm font-semibold outline-none transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.6)'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none' }}
                />
              </motion.div>

              {/* Password */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.4 }}>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required minLength={6}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-2xl px-5 py-4 pr-14 text-sm font-semibold outline-none transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.6)'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-widest transition-colors hover:text-white"
                    style={{ color: '#8b5cf6' }}>
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="w-full rounded-2xl py-4 text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account…
                  </span>
                ) : '🚀 Create Free Account'}
              </motion.button>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="mt-8 text-center text-sm font-medium" style={{ color: '#475569' }}
            >
              Already have an account?{' '}
              <Link to="/login" className="font-bold transition-colors hover:underline" style={{ color: '#a78bfa' }}>Sign in</Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
