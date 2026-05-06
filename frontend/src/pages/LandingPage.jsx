import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const features = [
  { icon: '🎯', title: 'Career Fit Prediction', desc: 'AI-powered assessment weighing your skills, academics, interests, and projects to rank your best career matches.', color: 'from-violet-500/20 to-primary/10', border: 'border-violet-500/20' },
  { icon: '🤖', title: 'AI Career Blueprint', desc: 'Get a week-by-week personalized roadmap with tools, projects, and milestones tailored to your exact field.', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20' },
  { icon: '📚', title: 'Class 10 & 12 Guidance', desc: 'Stream suggestions for Class 10 and career direction for after Class 12 based on your marks and interests.', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20' },
  { icon: '✨', title: 'Custom Stream AI', desc: 'Pursuing fashion, aviation, or culinary arts? Enter any custom field and get AI-generated skills and career paths.', color: 'from-pink-500/20 to-rose-500/10', border: 'border-pink-500/20' },
  { icon: '🗓️', title: 'Admission Calendar', desc: 'Never miss a deadline. Track JEE, NEET, CUET, and state exam dates filtered by stream and region.', color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/20' },
  { icon: '💬', title: 'AI Career Counselor', desc: 'Chat with your personal career assistant anytime — get skill tips, resume advice, and exam strategies.', color: 'from-indigo-500/20 to-purple-500/10', border: 'border-indigo-500/20' },
]

const stats = [
  { value: '10+', label: 'Career Paths' },
  { value: 'AI', label: 'Powered Engine' },
  { value: '3', label: 'Assessment Tracks' },
  { value: '100%', label: 'Personalized' },
]

const steps = [
  { num: '01', title: 'Create Your Profile', desc: 'Sign up and tell us your academic stream, skills, and interests.' },
  { num: '02', title: 'Take the Assessment', desc: 'Complete the smart multi-step quiz — takes just 3 minutes.' },
  { num: '03', title: 'Get Your Blueprint', desc: 'Receive AI-ranked career matches and a personalized roadmap.' },
]

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#09090f', color: '#f1f5f9' }}>

      {/* ── Animated Background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div style={{ background: 'radial-gradient(ellipse 80% 60% at 10% -10%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(139,92,246,0.15) 0%, transparent 60%)', position: 'absolute', inset: 0 }} />
        <div className="absolute -top-52 -left-40 h-[700px] w-[700px] rounded-full opacity-20 blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-52 -right-40 h-[600px] w-[600px] rounded-full opacity-15 blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', animationDelay: '2s' }} />
      </div>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'rgba(9,9,15,0.8)', borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>🎯</div>
            <div>
              <div className="text-sm font-extrabold tracking-tight" style={{ color: '#f1f5f9' }}>CareerMatrix</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6366f1' }}>Career Path Prediction</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/signup" className="rounded-xl px-4 py-2 text-sm font-bold transition-all hover:bg-white/5" style={{ color: '#94a3b8' }}>
              Sign Up
            </Link>
            <Link to="/signup" className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#818cf8' }} />
            AI-Powered Career Guidance for Students
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl" style={{ letterSpacing: '-0.03em' }}>
            Discover Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ideal Career
            </span>
            <br />with AI Precision
          </h1>

          <p className="mx-auto max-w-xl text-lg leading-relaxed" style={{ color: '#64748b' }}>
            CareerMatrix analyses your academics, skills, and interests to predict your best career paths and build a personalised roadmap — in under 3 minutes.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link to="/signup" className="group inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-2xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 40px rgba(99,102,241,0.45)' }}>
              Start Free Assessment
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl border px-8 py-4 text-base font-bold transition-all hover:bg-white/5" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>
              Already have an account? Sign In
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-wrap justify-center gap-6"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border px-8 py-4 text-center backdrop-blur-sm" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-3xl font-extrabold" style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: '#f1f5f9' }}>Everything you need to plan your future</h2>
            <p className="mt-3 text-base" style={{ color: '#64748b' }}>A complete platform built specifically for Indian students.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <motion.div key={f.title} variants={item} className={`group rounded-2xl border bg-gradient-to-br ${f.color} ${f.border} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>{f.icon}</div>
                <h3 className="mb-2 font-bold" style={{ color: '#f1f5f9' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border p-10 sm:p-14" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: '#f1f5f9' }}>How it works</h2>
            <p className="mt-3 text-base" style={{ color: '#64748b' }}>From sign-up to your career blueprint in 3 simple steps.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-extrabold" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>{s.num}</div>
                <h3 className="mb-2 font-bold" style={{ color: '#f1f5f9' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative overflow-hidden rounded-3xl p-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15), rgba(236,72,153,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}>
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl" style={{ background: 'rgba(99,102,241,0.3)' }} />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.3)' }} />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: '#f1f5f9' }}>Start your career journey today</h2>
            <p className="mx-auto mt-4 max-w-md text-base" style={{ color: '#94a3b8' }}>Free, instant access. No credit card required. Get your personalised career blueprint in minutes.</p>
            <Link to="/signup" className="mt-8 inline-flex items-center gap-3 rounded-2xl px-10 py-4 text-base font-bold text-white shadow-2xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}>
              🚀 Get Started — It's Free
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-6 py-8 text-center text-sm" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#475569' }}>
        © 2025 <span style={{ color: '#6366f1', fontWeight: 700 }}>CareerMatrix</span> · Built for Indian Students · AI-Powered Career Guidance
      </footer>
    </div>
  )
}
