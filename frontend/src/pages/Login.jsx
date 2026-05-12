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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

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
    <div className="relative flex min-h-screen overflow-hidden" style={{ color: '#f1f5f9' }}>

      {/* ── Rich Gradient Background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #16082b 25%, #0f0720 50%, #0a0518 75%, #09090f 100%)',
      }}>
        <div className="absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full opacity-35 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #7c3aed, #a855f7, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute top-1/3 left-1/4 h-[300px] w-[300px] rounded-full opacity-15 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #d97706, transparent 70%)' }} />
      </div>

      {/* ── Floating particles ── */}
      {[
        { top: '10%', left: '15%', size: 4, dur: 3 },
        { top: '20%', right: '25%', size: 6, dur: 4 },
        { bottom: '30%', left: '10%', size: 5, dur: 2.5 },
        { top: '60%', right: '15%', size: 3, dur: 3.5 },
        { bottom: '15%', right: '40%', size: 5, dur: 2.8 },
      ].map((p, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: i * 0.4 }}
          className="pointer-events-none absolute rounded-full"
          style={{ ...p, width: p.size, height: p.size, background: '#a78bfa' }}
        />
      ))}

      {/* ── Left panel — Login form ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
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
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-black sm:text-4xl" style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}>Welcome back 👋</h1>
              <p className="mt-3 text-base font-medium" style={{ color: '#94a3b8' }}>Sign in to access your career dashboard and insights.</p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 rounded-2xl border px-5 py-3.5 text-sm font-semibold"
                style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }}
                role="alert"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <form onSubmit={submit} className="space-y-6">
              {/* Identifier */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>Name or Email</label>
                <input
                  required value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  placeholder="Your name or email"
                  className="w-full rounded-2xl px-5 py-4 text-sm font-semibold outline-none transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.6)'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none' }}
                />
                <p className="mt-2 text-xs font-medium" style={{ color: '#475569' }}>Use the name or email you registered with.</p>
              </motion.div>

              {/* Password */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Your password"
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
                transition={{ delay: 0.8, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="w-full rounded-2xl py-4 text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </span>
                ) : '✨ Sign In to Dashboard'}
              </motion.button>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-8 text-center text-sm font-medium" style={{ color: '#475569' }}
            >
              No account?{' '}
              <Link to="/signup" className="font-bold transition-colors hover:underline" style={{ color: '#a78bfa' }}>Sign up</Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right panel — highlights with animations ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Link to="/" className="flex items-center gap-4 self-end transition-transform hover:scale-105">
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
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <h2 className="text-5xl font-black leading-tight" style={{ letterSpacing: '-0.04em' }}>
              Your personalized{' '}
              <span style={{ background: 'linear-gradient(135deg, #c084fc, #818cf8, #e879f9)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                career intelligence
              </span>{' '}
              awaits.
            </h2>
            <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed" style={{ color: '#94a3b8' }}>
              Sign in to access your full dashboard — predictions, roadmaps, deadlines, and AI guidance all in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-5">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group rounded-2xl border p-6 transition-all duration-300"
                style={{ borderColor: 'rgba(139,92,246,0.1)', background: 'rgba(139,92,246,0.03)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.background = 'rgba(139,92,246,0.07)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,92,246,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.1)'; e.currentTarget.style.background = 'rgba(139,92,246,0.03)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>{h.icon}</div>
                <div className="mb-1.5 text-base font-bold" style={{ color: '#f1f5f9' }}>{h.title}</div>
                <div className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{h.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#334155' }}
        >
          © 2025 CareerMatrix · Built for Success
        </motion.p>
      </div>

    </div>
  )
}
