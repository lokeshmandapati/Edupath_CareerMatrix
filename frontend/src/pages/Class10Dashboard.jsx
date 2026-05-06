import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'

const features = [
  {
    icon: '🏆',
    title: 'Stream Ranking',
    desc: 'Get Science, Commerce & Humanities ranked by your profile match percentage.',
    color: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/30',
    glow: 'shadow-violet-500/10',
  },
  {
    icon: '🧠',
    title: 'Smart Analysis',
    desc: 'Our AI weighs your marks, strengths & interests to find your perfect fit.',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/10',
  },
  {
    icon: '🔁',
    title: 'Retake Anytime',
    desc: 'Changed your mind? Retake the assessment whenever you like — no limits.',
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
  },
]

const stats = [
  { value: '3', label: 'Stream Options' },
  { value: '2min', label: 'Takes Only' },
  { value: '95%', label: 'Accuracy Rate' },
]

export default function Class10Dashboard() {
  return (
    <PageTransition>
      <div className="relative min-h-[80vh] overflow-hidden">

        {/* Animated background blobs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px] animate-pulse" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 space-y-12">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center space-y-4 pt-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Class 10 Stream Assessment
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-accent sm:text-5xl lg:text-6xl">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-600 bg-clip-text text-transparent">
                Ideal Stream
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted leading-relaxed">
              Answer a quick profile check using your marks and interests — get a personalized stream recommendation with match percentages.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center gap-6 flex-wrap"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center px-6 py-3 rounded-2xl border border-borderline bg-surface/60 backdrop-blur-sm shadow-sm">
                <div className="text-2xl font-extrabold text-primary">{s.value}</div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} p-6 shadow-lg ${f.glow} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl shadow-inner backdrop-blur-sm">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-accent">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-violet-500/5 to-surface shadow-2xl shadow-primary/10"
          >
            {/* Inner decoration */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center gap-6 px-8 py-12 text-center sm:flex-row sm:text-left sm:gap-10">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-4xl shadow-lg shadow-primary/30">
                🎯
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-extrabold text-accent">Ready to find your path?</h2>
                <p className="text-sm text-muted leading-relaxed max-w-md">
                  Takes only ~2 minutes. Get a ranked recommendation of Science, Commerce, or Humanities with a detailed explanation of why it suits you.
                </p>
              </div>
              <Link
                to="/assessment/class10/form"
                className="group shrink-0 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-violet-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
              >
                Begin Assessment
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  )
}
