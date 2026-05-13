import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import Loader from '../components/Loader'
import PageTransition from '../components/PageTransition'
import { ROADMAP_CAREER_KEY } from '../constants/storageKeys'
import { ENGINEERING_BRANCHES } from '../data/assessmentOptions'
import { getCommitment } from '../data/careerCommitment'
import { ADMISSION_EXAMS } from '../data/admissionData'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const ABOUT_TEXT =
  'CareerMatrix is an intelligent career path prediction system that helps students choose the most suitable career based on their academic performance, technical skills, interests, and project experience. It uses a structured evaluation algorithm to provide personalized, data-driven career recommendations aligned with industry trends.'

const ROADMAP_CARD_DESC =
  'Get a step-by-step learning path for your focus area: core skills, tools and technologies, hands-on project ideas, and a beginner-to-advanced timeline. We tailor the roadmap to your predicted or chosen career so you know what to study next.'

/** Prefer server result, else last prediction cached in the browser. */
function resolveCareerForRoadmap(latest) {
  if (latest?.topCareer) return latest.topCareer
  try {
    const raw = localStorage.getItem('careermatrix_last_prediction')
    if (raw) {
      const p = JSON.parse(raw)
      if (p?.topCareer) return p.topCareer
    }
  } catch {
    /* ignore */
  }
  return null
}

export default function Dashboard() {
  const { userId, name, branch } = useAuth()
  const [latest, setLatest] = useState(null)
  const [upcomingExams, setUpcomingExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError('')
      try {
        const [{ data: resultsData }, { data: examsData }] = await Promise.all([
          api.get(`/api/results/${userId}`),
          api.get('/api/toolkit/upcoming-exams')
        ])
        if (!cancelled) {
          setLatest(resultsData)
          setUpcomingExams(examsData)
        }
      } catch (e) {
        if (!cancelled) {
          setLatest(null)
          if (e.response?.status !== 404) {
            setError('Could not load dashboard data.')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const roadmapCareer = resolveCareerForRoadmap(latest)

  const branchMeta = ENGINEERING_BRANCHES.find((b) => b.id === (latest?.branchCode || branch || '').toUpperCase())

  // Use AI results if available, else fallback to static
  const activeExams = upcomingExams.length > 0 ? upcomingExams : ADMISSION_EXAMS.slice(0, 3)

  return (
    <PageTransition>
      <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">

        {/* ── Animated Background Glows (AppShell provides base + particles) ── */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[100px]"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.30), transparent 70%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-1/3 right-1/4 h-[350px] w-[350px] rounded-full blur-[80px]"
            style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.15), transparent 70%)' }}
          />
        </div>

        {/* ── Floating Particles ── */}
        {[
          { top: '5%', left: '10%', size: 4, dur: 3 },
          { top: '15%', right: '20%', size: 5, dur: 4 },
          { bottom: '20%', left: '5%', size: 3, dur: 2.5 },
          { top: '50%', right: '8%', size: 6, dur: 3.5 },
          { bottom: '10%', right: '30%', size: 4, dur: 2.8 },
          { top: '70%', left: '25%', size: 3, dur: 3.2 },
        ].map((p, i) => (
          <motion.div
            key={`particle-${i}`}
            animate={{ opacity: [0.15, 0.5, 0.15], y: [0, -8, 0] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: i * 0.5 }}
            className="pointer-events-none absolute rounded-full"
            style={{ ...p, width: p.size, height: p.size, background: 'rgba(139,92,246,0.6)' }}
          />
        ))}

        <div className="mx-auto w-full space-y-12 pb-10">
          {/* Header Section */}
          <header className="relative space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase ring-1 ring-primary/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Guidance
            </motion.div>
            
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-accent sm:text-6xl lg:text-7xl">
              Elevate Your <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Career Path</span>
            </h1>
            <p className="max-w-2xl text-lg font-medium text-muted sm:text-xl">
              Join thousands of students using data-driven insights to navigate their professional journey.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="glass flex items-center gap-3 rounded-2xl px-5 py-3 shadow-premium">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Active User</p>
                  <p className="text-sm font-bold text-accent">{name}</p>
                </div>
              </div>

              {(branchMeta || latest?.branchLabel || branch) && (
                <div className="glass flex items-center gap-3 rounded-2xl px-5 py-3 shadow-premium">
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-xl">
                    {branchMeta?.icon ?? '📚'}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Specialization</p>
                    <p className="text-sm font-bold text-accent">
                       {latest?.branchLabel || branchMeta?.label || (branch ? String(branch).toUpperCase() : '')}
                    </p>
                  </div>
                  <Link
                    to="/career-form"
                    className="ml-2 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20"
                  >
                    Edit
                  </Link>
                </div>
              )}
            </div>
          </header>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-red-500/10 bg-red-500/5 px-6 py-4 text-sm font-semibold text-red-500 backdrop-blur-md"
            >
              {error}
            </motion.div>
          )}

          {/* About Section - Premium Glass */}
          <Card className="glass overflow-hidden border-none p-0 shadow-premium transition-transform hover:scale-[1.005]">
            <div className="flex flex-col gap-8 p-8 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl"></div>
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <h2 className="font-display text-2xl font-bold text-accent">Intelligent Insights</h2>
                <p className="text-base leading-relaxed text-muted sm:text-lg">{ABOUT_TEXT}</p>
              </div>
            </div>
          </Card>

        <div>
          <h2 className="mb-8 font-display text-2xl font-bold text-accent">Personalized Toolkit</h2>
          <motion.div variants={container} initial="hidden" animate="show" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div variants={item}>
              <Card className="glass group overflow-hidden border-none p-0 shadow-premium h-full">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 shadow-sm ring-1 ring-red-500/20">
                      <span className="text-2xl" aria-hidden>🔔</span>
                    </div>
                    <Link to="/calendar" className="text-xs font-bold text-primary hover:underline">View All</Link>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-accent">Upcoming Deadlines</h3>
                  
                  <div className="mt-6 space-y-4">
                    {activeExams.map(exam => {
                      const diff = +new Date(exam.date) - +new Date()
                      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                      const color = days < 7 ? 'bg-red-500' : days < 15 ? 'bg-amber-500' : 'bg-emerald-500'
                      
                      return (
                        <div key={exam.id || exam.name} className="flex items-center justify-between rounded-2xl bg-black/5 p-4 ring-1 ring-black/5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-accent">{exam.name}</p>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{exam.category}</p>
                          </div>
                          <div className="flex flex-col items-end shrink-0 ml-2">
                            <span className={`rounded-lg px-2 py-1 text-[10px] font-black text-white ${color}`}>
                              {days > 0 ? `${days}d left` : 'Deadline Today'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Link to="/career-form" className="group block h-full">
                <Card className="glass hover-lift h-full border-none p-8 shadow-premium">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm ring-1 ring-primary/20 transition-all group-hover:bg-primary group-hover:text-white">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-accent">Career Prediction</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Run the multi-step assessment — we analyze academics, skills, and projects.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3">
                    Begin Assessment
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link to="/results" className="group block h-full">
                <Card className="glass hover-lift h-full border-none p-8 shadow-premium">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 shadow-sm ring-1 ring-indigo-500/20 transition-all group-hover:bg-indigo-500 group-hover:text-white">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-accent">View Insights</h3>

                  {loading ? (
                    <div className="mt-4">
                      <Loader label="Syncing..." />
                    </div>
                  ) : latest ? (
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-2xl font-black text-primary">{latest.topCareer}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted">{new Date(latest.createdAt).toLocaleDateString()}</p>
                      </div>

                      {/* NEW: Duration & Difficulty Mini-Badge */}
                      {(() => {
                        const commitment = getCommitment(latest.topCareer)
                        const difficultyColor = 
                          commitment.level === 1 ? 'text-emerald-500 bg-emerald-500/10' :
                          commitment.level === 2 ? 'text-amber-500 bg-amber-500/10' :
                          'text-red-500 bg-red-500/10'
                        
                        return (
                          <div className="flex flex-wrap gap-2">
                             <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/5 px-2 py-1 text-[10px] font-bold text-primary ring-1 ring-primary/20">
                              ⏳ {commitment.duration}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold ring-1 ring-black/5 ${difficultyColor}`}>
                              📊 {commitment.difficulty}
                            </span>
                          </div>
                        )
                      })()}

                      <span className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3">
                        Full Breakdown
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      No prediction yet. Complete an assessment to see your ranked matches.
                    </p>
                  )}
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link to="/roadmap" className="group block h-full">
                <Card className="glass hover-lift h-full border-none p-8 shadow-premium">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 shadow-sm ring-1 ring-violet-500/20 transition-all group-hover:bg-violet-500 group-hover:text-white">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-accent">Skill Roadmap</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{ROADMAP_CARD_DESC.slice(0, 80)}...</p>
                  {!loading && roadmapCareer && (
                    <p className="mt-4 rounded-xl bg-primary/5 px-3 py-2 text-[11px] font-bold text-primary ring-1 ring-primary/20">
                      Focus: {roadmapCareer}
                    </p>
                  )}
                   <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3">
                    Explore Path
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link to="/assessment/class10" className="group block h-full">
                <Card className="glass hover-lift h-full border-none p-8 shadow-premium">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 shadow-sm ring-1 ring-amber-500/20 transition-all group-hover:bg-amber-500 group-hover:text-white">
                    <span className="text-3xl" aria-hidden>🎯</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-accent">Class 10 Assessment</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Help 10th students pick the right stream: Science, Commerce, or Humanities.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3">
                    Open Stream Guide
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link to="/assessment/after12" className="group block h-full">
                <Card className="glass hover-lift h-full border-none p-8 shadow-premium">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/20 transition-all group-hover:bg-emerald-500 group-hover:text-white">
                    <span className="text-3xl" aria-hidden>🧭</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-accent">After 12th Path</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Choose career directions after Class 12 based on stream and interests.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3">
                    Explore Degrees
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link to="/calendar" className="group block h-full">
                <Card className="glass hover-lift h-full border-none p-8 shadow-premium">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 shadow-sm ring-1 ring-amber-500/20 transition-all group-hover:bg-amber-500 group-hover:text-white">
                    <span className="text-3xl" aria-hidden>📅</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-accent">Admission Calendar</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Track entrance exam dates, counselling deadlines, and set smart reminders.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3">
                    View Calendar
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link to="/resources" className="group block h-full">
                <Card className="glass hover-lift h-full border-none p-8 shadow-premium">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/20 transition-all group-hover:bg-emerald-500 group-hover:text-white">
                    <span className="text-3xl" aria-hidden>📚</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-accent">Learning Resources</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Access curated YouTube channels, free university courses, and skill practice sites.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3">
                    Open Hub
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Card>
              </Link>
            </motion.div>
            <motion.div variants={item}>
              <Link to="/toolkit/skill-gap" className="group block h-full">
                <Card className="glass hover-lift h-full border-none p-8 shadow-premium">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 shadow-sm ring-1 ring-indigo-500/20 transition-all group-hover:bg-indigo-500 group-hover:text-white">
                    <span className="text-3xl" aria-hidden>🔬</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-accent">Skill Gap Analysis</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Compare your skills against any role like 'AI Engineer' and see what's missing.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3">
                    Analyze Now
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Card>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  </PageTransition>
  )
}
