import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

/* ── Data ── */
const features = [
  { icon: '🎯', title: 'Career Fit Prediction', desc: 'AI-powered assessment weighing your skills, academics, interests, and projects to rank your best career matches.' },
  { icon: '🤖', title: 'AI Career Blueprint', desc: 'Get a week-by-week personalized roadmap with tools, projects, and milestones tailored to your exact field.' },
  { icon: '📚', title: 'Class 10 & 12 Guidance', desc: 'Stream suggestions for Class 10 and career direction for after Class 12 based on your marks and interests.' },
  { icon: '✨', title: 'Custom Stream AI', desc: 'Pursuing fashion, aviation, or culinary arts? Enter any custom field and get AI-generated skills and career paths.' },
  { icon: '🗓️', title: 'Admission Calendar', desc: 'Never miss a deadline. Track JEE, NEET, CUET, and state exam dates filtered by stream and region.' },
  { icon: '💬', title: 'AI Career Counselor', desc: 'Chat with your personal career assistant anytime — get skill tips, resume advice, and exam strategies.' },
]

const steps = [
  { num: '01', title: 'Create Your Profile', desc: 'Sign up and tell us your academic stream, skills, and interests.' },
  { num: '02', title: 'Take the Assessment', desc: 'Complete the smart multi-step quiz — takes just 3 minutes.' },
  { num: '03', title: 'Get Your Blueprint', desc: 'Receive AI-ranked career matches and a personalized roadmap.' },
]

const trustLogos = [
  { name: 'JEE Mains', icon: '🏛️' },
  { name: 'NEET', icon: '🩺' },
  { name: 'CUET', icon: '📖' },
  { name: 'State Boards', icon: '🎓' },
  { name: 'AI Powered', icon: '🤖' },
]

const orbitIcons = ['🎯', '🤖', '📊', '🗺️', '💡', '🏆']

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

/* ── Orbit Component ── */
function OrbitVisual() {
  return (
    <div className="relative h-[480px] w-[480px] sm:h-[540px] sm:w-[540px]">
      {/* Outer glow behind orbit */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full opacity-30 blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)' }} />

      {/* Rings — brighter, more visible */}
      {[240, 180, 120].map((r, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: r * 2,
            height: r * 2,
            transform: 'translate(-50%, -50%)',
            border: `${i === 0 ? 1.5 : 1}px solid rgba(139, 92, 246, ${0.25 - i * 0.06})`,
            boxShadow: i === 0 ? '0 0 30px rgba(139,92,246,0.08)' : 'none',
          }}
        />
      ))}

      {/* Center Stat — bold and prominent */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6, ease: 'backOut' }}
        >
          <div className="text-6xl font-black text-white sm:text-7xl" style={{ letterSpacing: '-0.05em' }}>10+</div>
          <div className="mt-2 text-sm font-bold uppercase tracking-[0.25em] text-violet-300/80">Career Paths</div>
        </motion.div>
      </div>

      {/* Floating icons on orbit — larger, glassmorphism style */}
      {orbitIcons.map((icon, i) => {
        const angle = (i / orbitIcons.length) * 360 - 90
        const isOuter = i % 2 === 0
        const radius = isOuter ? 220 : 165
        const x = Math.cos((angle * Math.PI) / 180) * radius
        const y = Math.sin((angle * Math.PI) / 180) * radius
        const size = isOuter ? 'h-16 w-16 text-2xl' : 'h-12 w-12 text-lg'
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.12, duration: 0.5, ease: 'backOut' }}
            className="absolute left-1/2 top-1/2 z-20"
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              className={`flex ${size} items-center justify-center rounded-2xl shadow-xl ring-1 ring-white/15`}
              style={{
                background: 'linear-gradient(145deg, rgba(30, 15, 60, 0.9), rgba(20, 10, 45, 0.95))',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(139,92,246,0.15)',
              }}
            >
              {icon}
            </motion.div>
          </motion.div>
        )
      })}

      {/* Floating tag — cursor-like */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute bottom-16 left-6 z-20"
      >
        <div className="flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold shadow-xl"
          style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-white/80" />
          AI Powered
        </div>
      </motion.div>

      {/* Small decorative dot particles */}
      {[
        { top: '15%', right: '10%', size: 6, delay: 0 },
        { top: '75%', right: '20%', size: 4, delay: 1 },
        { top: '25%', left: '15%', size: 5, delay: 0.5 },
        { bottom: '20%', right: '35%', size: 3, delay: 1.5 },
      ].map((dot, i) => (
        <motion.div
          key={`dot-${i}`}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: dot.delay }}
          className="absolute z-10 rounded-full"
          style={{
            ...dot,
            width: dot.size,
            height: dot.size,
            background: '#a78bfa',
          }}
        />
      ))}
    </div>
  )

}

/* ── Page ── */
export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ color: '#f1f5f9' }}>

      {/* ── Gradient Background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #16082b 25%, #0f0720 50%, #0a0518 75%, #09090f 100%)',
      }}>
        {/* Warm purple/amber glow — left side */}
        <div className="absolute -top-32 -left-32 h-[700px] w-[700px] rounded-full opacity-40 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #7c3aed, #a855f7, transparent 70%)' }} />
        <div className="absolute top-20 left-20 h-[400px] w-[400px] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #d97706, #f59e0b, transparent 70%)' }} />
        {/* Subtle purple glow — right side */}
        <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #6d28d9, transparent 70%)' }} />
      </div>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl" style={{ background: 'rgba(10, 5, 24, 0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="mx-auto flex w-full items-center justify-between px-8 py-4 sm:px-16 lg:px-24">
          <Link to="/" className="flex items-center gap-4 transition-transform hover:scale-105">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-lg ring-2 ring-white/10"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>🎯</div>
            <span className="text-xl font-black tracking-tight sm:text-2xl" style={{ color: '#f1f5f9' }}>CareerMatrix</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {['Features', 'How It Works'].map(label => (
              <a key={label} href={`#${label.toLowerCase().replace(/\s/g, '-')}`}
                className="text-sm font-semibold transition-colors hover:text-violet-300"
                style={{ color: '#94a3b8' }}
              >{label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden text-sm font-bold transition-colors hover:text-white sm:block" style={{ color: '#94a3b8' }}>
              Log In
            </Link>
            <Link to="/signup" className="rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}>
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative mx-auto flex w-full flex-col items-center gap-12 px-8 pt-16 pb-10 sm:px-16 lg:flex-row lg:items-center lg:gap-8 lg:px-24 lg:pt-24 lg:pb-20">
        {/* Left — Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1 space-y-8 text-left lg:max-w-[55%]"
        >
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ borderColor: 'rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: '#a78bfa' }} />
            AI-Powered Career Guidance
          </div>

          <h1 className="text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl" style={{ letterSpacing: '-0.04em' }}>
            Discover Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #c084fc, #818cf8, #e879f9)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Best Career
            </span>
            {' '}— Now Just One Click Away!
          </h1>

          <p className="max-w-lg text-lg font-medium leading-relaxed" style={{ color: '#a1a1b5' }}>
            CareerMatrix analyses your academics, skills, and interests to predict your best career paths and build a personalised roadmap — in under 3 minutes.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/signup" className="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-bold text-white shadow-2xl transition-all hover:scale-105"
              style={{ background: '#0f0720', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 0 30px rgba(139,92,246,0.2)' }}>
              Start Assessment
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/login" className="text-sm font-bold transition-colors hover:text-white" style={{ color: '#94a3b8' }}>
              Already have an account? →
            </Link>
          </div>
        </motion.div>

        {/* Right — Orbital Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative hidden flex-1 items-center justify-center lg:flex"
        >
          <OrbitVisual />
        </motion.div>
      </section>

      {/* ── Trust Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mx-auto w-full px-8 pb-16 sm:px-16 lg:px-24"
      >
        <div className="flex flex-wrap items-center justify-center gap-10 rounded-2xl border px-8 py-5 sm:justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          {trustLogos.map(t => (
            <div key={t.name} className="flex items-center gap-2 opacity-50 transition-opacity hover:opacity-100">
              <span className="text-lg">{t.icon}</span>
              <span className="text-sm font-bold tracking-wide" style={{ color: '#94a3b8' }}>{t.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Stats Band ── */}
      <section className="mx-auto w-full px-8 pb-20 sm:px-16 lg:px-24">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: '10+', label: 'Career Paths' },
            { value: 'AI', label: 'Powered Engine' },
            { value: '3', label: 'Assessment Tracks' },
            { value: '100%', label: 'Personalized' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-2xl border p-6 text-center transition-all hover:-translate-y-1"
              style={{ borderColor: 'rgba(139,92,246,0.12)', background: 'rgba(139,92,246,0.04)' }}>
              <div className="text-3xl font-black sm:text-4xl" style={{ background: 'linear-gradient(135deg, #c084fc, #818cf8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto w-full px-8 pb-24 sm:px-16 lg:px-24">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl" style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}>
              Everything you need to{' '}
              <span style={{ background: 'linear-gradient(135deg, #c084fc, #818cf8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>plan your future</span>
            </h2>
            <p className="mt-4 text-lg font-medium" style={{ color: '#64748b' }}>A complete platform built specifically for Indian students.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <motion.div key={f.title} variants={item}
                className="group rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                style={{ borderColor: 'rgba(139,92,246,0.1)', background: 'rgba(139,92,246,0.03)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.background = 'rgba(139,92,246,0.07)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.1)'; e.currentTarget.style.background = 'rgba(139,92,246,0.03)' }}
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-md ring-1 ring-white/5"
                  style={{ background: 'rgba(139,92,246,0.15)' }}>{f.icon}</div>
                <h3 className="mb-2 text-lg font-bold" style={{ color: '#f1f5f9' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="mx-auto w-full px-8 pb-24 sm:px-16 lg:px-24">
        <div className="overflow-hidden rounded-3xl border p-10 sm:p-16" style={{ borderColor: 'rgba(139,92,246,0.1)', background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(99,102,241,0.03))' }}>
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl" style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}>How it works</h2>
            <p className="mt-4 text-lg font-medium" style={{ color: '#64748b' }}>From sign-up to your career blueprint in 3 simple steps.</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-3xl font-black"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.15))', border: '1px solid rgba(139,92,246,0.25)', color: '#c084fc' }}>
                  {s.num}
                </div>
                <h3 className="mb-3 text-lg font-bold" style={{ color: '#f1f5f9' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto w-full px-8 pb-24 sm:px-16 lg:px-24">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-14 text-center sm:p-20"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15), rgba(236,72,153,0.08))', border: '1px solid rgba(139,92,246,0.2)' }}>
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.35)' }} />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl" style={{ background: 'rgba(99,102,241,0.3)' }} />
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl" style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}>Start your career journey today</h2>
            <p className="mx-auto mt-5 max-w-lg text-lg font-medium" style={{ color: '#a1a1b5' }}>
              Free, instant access. No credit card required. Get your personalised career blueprint in minutes.
            </p>
            <Link to="/signup" className="mt-10 inline-flex items-center gap-3 rounded-full px-10 py-4 text-base font-bold text-white shadow-2xl transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 40px rgba(139,92,246,0.5)' }}>
              🚀 Get Started — It's Free
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-8 py-10 text-center sm:px-16 lg:px-24" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="mx-auto w-full">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm" style={{ color: '#475569' }}>
            <span>© 2026</span>
            <span className="font-bold" style={{ color: '#8b5cf6' }}>CareerMatrix</span>
            <span>·</span>
            <span>Built for Indian Students</span>
            <span>·</span>
            <span>AI-Powered Career Guidance</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
