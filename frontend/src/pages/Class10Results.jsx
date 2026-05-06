import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import Loader from '../components/Loader'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CLASS10_LAST_PREDICTION_KEY, ROADMAP_CONTEXT_LABEL_KEY, ROADMAP_CONTEXT_TYPE_KEY } from '../constants/storageKeys'

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa']

const CARD = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '2rem',
}

const getDefaultSubjects = (stream) => {
  if (stream?.includes('Science')) return ['Physics', 'Chemistry', 'Mathematics / Biology', 'English', 'Computer Science']
  if (stream?.includes('Commerce')) return ['Accountancy', 'Business Studies', 'Economics', 'Mathematics / Informatics', 'English']
  return ['History', 'Political Science', 'Geography', 'Economics / Psychology', 'English']
}

const getDefaultCareers = (stream) => {
  if (stream?.includes('Science')) return ['Engineering', 'Medicine', 'Data Science', 'Biotechnology', 'Research & Pure Sciences']
  if (stream?.includes('Commerce')) return ['Chartered Accountancy (CA)', 'Management (MBA)', 'Finance & Banking', 'Investment Analysis', 'Company Secretary']
  return ['Civil Services (IAS/IPS)', 'Law', 'Design & Architecture', 'Journalism / Media', 'Psychology & Counseling']
}

function normalizeFromHistory(data) {
  if (!data) return null
  const scores = data.careerScores || {}
  const rankedCareers = Object.entries(scores)
    .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))
    .map(([career, scorePercent], i) => ({ career: career || 'Unknown', scorePercent: Number(scorePercent) || 0, rank: i + 1 }))
  return {
    topCareer: data.topCareer || rankedCareers[0]?.career || 'Science',
    careerScores: scores,
    explanation: data.explanation || 'Based on your profile, this stream offers the best alignment with your strengths.',
    rankedCareers,
    confidencePercent: data.confidencePercent ?? 85,
    recommendedSubjects: data.recommendedSubjects || [],
    examPaths: data.examPaths || [],
    nextSteps: data.nextSteps || [],
    assessmentInputs: data.assessmentInputs || null,
  }
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function Class10Results() {
  const { state } = useLocation()
  const { userId } = useAuth()
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setFetchError('')
      if (state?.topCareer || (state && Object.keys(state).length > 0)) {
        setPrediction(normalizeFromHistory(state)); setLoading(false); return
      }
      try {
        const raw = localStorage.getItem(CLASS10_LAST_PREDICTION_KEY)
        if (raw) { setPrediction(normalizeFromHistory(JSON.parse(raw))); setLoading(false); return }
      } catch { /* ignore */ }
      try {
        const { data } = await api.get(`/api/results/${userId}`, { params: { type: 'CLASS10' } })
        if (!cancelled) setPrediction(normalizeFromHistory(data))
      } catch (e) {
        if (!cancelled) {
          setPrediction(null)
          if (e.response?.status !== 404) setFetchError('Could not load results.')
        }
      } finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [state, userId])

  const chartData = useMemo(() => {
    if (!prediction?.careerScores) return []
    return Object.entries(prediction.careerScores).map(([name, score]) => ({ name, score: Number(score) }))
  }, [prediction])

  if (loading) return <PageTransition><Loader fullPage label="Loading your stream insights…" /></PageTransition>

  if (!prediction) return (
    <PageTransition>
      <div className="mx-auto max-w-lg text-center py-20">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" style={{ background: 'rgba(99,102,241,0.15)' }}>📊</div>
        <h2 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>No Class 10 results yet</h2>
        <p className="mt-2 text-sm" style={{ color: '#64748b' }}>Complete the assessment to get your stream suggestion.</p>
        {fetchError && <p className="mt-3 text-sm text-red-400">{fetchError}</p>}
        <Link to="/assessment/class10/form" className="mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          Start Assessment
        </Link>
      </div>
    </PageTransition>
  )

  const topScore = prediction.careerScores?.[prediction.topCareer]

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-8 pb-12">

        {/* ── Header ── */}
        <motion.div variants={sectionVariants} initial="hidden" animate="show">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4"
            style={{ borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#818cf8' }} />
            Stream Analysis Complete
          </div>
          <h1 className="text-4xl font-extrabold sm:text-5xl" style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}>
            Your best-fit{' '}
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              stream
            </span>
          </h1>
          <p className="mt-3 text-lg" style={{ color: '#64748b' }}>Based on your marks and interest signals.</p>
        </motion.div>

        {fetchError && (
          <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>{fetchError}</div>
        )}

        {/* ── Personal Input Context ── */}
        {prediction.assessmentInputs && (
          <motion.div variants={sectionVariants} initial="hidden" animate="show" transition={{ delay: 0.05 }}
            className="grid gap-6 md:grid-cols-2">
            <div style={CARD}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#6366f1' }}>Subject Performance</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Math</span>
                  <span className="text-xl font-black text-accent">{prediction.assessmentInputs.math}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Science</span>
                  <span className="text-xl font-black text-accent">{prediction.assessmentInputs.science}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase">English</span>
                  <span className="text-xl font-black text-accent">{prediction.assessmentInputs.english}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Social</span>
                  <span className="text-xl font-black text-accent">{prediction.assessmentInputs.social}%</span>
                </div>
              </div>
            </div>
            <div style={CARD}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#ec4899' }}>Personal Signals</p>
              <div className="flex flex-wrap gap-2">
                {prediction.assessmentInputs.interests?.slice(0, 4).map(it => (
                  <span key={it} className="rounded-lg px-3 py-1 text-xs font-bold ring-1" style={{ color: '#ec4899', background: 'rgba(236,72,153,0.1)', borderColor: 'rgba(236,72,153,0.2)' }}>
                    {it}
                  </span>
                ))}
                {prediction.assessmentInputs.aptitudeTags?.slice(0, 4).map(it => (
                  <span key={it} className="rounded-lg px-3 py-1 text-xs font-bold ring-1" style={{ color: '#22d3ee', background: 'rgba(34,211,238,0.1)', borderColor: 'rgba(34,211,238,0.2)' }}>
                    {it}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Top Recommendation + Chart ── */}
        <motion.div variants={sectionVariants} initial="hidden" animate="show" transition={{ delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-5">

          {/* Left — Top Pick */}
          <div className="lg:col-span-2 relative overflow-hidden" style={CARD}>
            <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl" style={{ background: 'rgba(99,102,241,0.2)' }} />
            <p className="relative text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6366f1' }}>Top Recommendation</p>
            <h2 className="relative mt-4 text-4xl font-extrabold" style={{ color: '#f1f5f9' }}>{prediction.topCareer}</h2>
            <div className="relative mt-6 flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter" style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {topScore?.toFixed?.(1) ?? '—'}%
              </span>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>match</span>
            </div>

            <div className="relative mt-8 border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#818cf8' }}>Explanation</p>
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{prediction.explanation}</p>
            </div>
          </div>

          {/* Right — Chart */}
          <div className="lg:col-span-3" style={CARD}>
            <h3 className="text-lg font-bold mb-6" style={{ color: '#f1f5f9' }}>Stream score breakdown</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Score']}
                    contentStyle={{ borderRadius: '12px', background: 'rgba(22,26,50,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                  />
                  <Bar dataKey="score" radius={[0, 8, 8, 0]} maxBarSize={32}>
                    {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* ── Guidance Cards ── */}
        <motion.div variants={sectionVariants} initial="hidden" animate="show" transition={{ delay: 0.2 }}
          className="grid gap-6 lg:grid-cols-3">

          {/* Subjects */}
          <div style={CARD}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: 'rgba(99,102,241,0.15)' }}>📚</div>
            <h3 className="text-base font-bold mb-5" style={{ color: '#f1f5f9' }}>Recommended subjects</h3>
            <div className="flex flex-col gap-2">
              {(prediction.recommendedSubjects?.length > 0 ? prediction.recommendedSubjects : getDefaultSubjects(prediction.topCareer)).map((s) => (
                <div key={s} className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#c4b5fd' }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Exam Path */}
          <div style={CARD}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: 'rgba(139,92,246,0.15)' }}>🗺️</div>
            <h3 className="text-base font-bold mb-5" style={{ color: '#f1f5f9' }}>Exam path</h3>
            <div className="space-y-3">
              {(prediction.examPaths?.length > 0 ? prediction.examPaths : [
                'No fixed entrance at Class 10 — focus on basics + explore career videos/books',
                'Talk to seniors/teachers and compare +2 subject combinations'
              ]).map((s) => (
                <div key={s} className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', color: '#c4b5fd' }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div style={CARD}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: 'rgba(236,72,153,0.15)' }}>✅</div>
            <h3 className="text-base font-bold mb-5" style={{ color: '#f1f5f9' }}>Next steps</h3>
            <div className="space-y-3">
              {(prediction.nextSteps?.length > 0 ? prediction.nextSteps : [
                'Pick a stream you can study consistently for 2 years (not only based on trends)',
                'Choose optional subjects (e.g. Math/CS) that keep more doors open',
                'Create a simple weekly plan: 60% strengths + 40% weak areas'
              ]).map((s) => (
                <div key={s} className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)', color: '#f9a8d4' }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div variants={sectionVariants} initial="hidden" animate="show" transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4 pt-2">
          <Link
            to={`/roadmap?type=CLASS10&career=${encodeURIComponent(prediction?.topCareer || 'Science')}`}
            onClick={() => {
              try {
                if (prediction?.topCareer) {
                  localStorage.setItem(ROADMAP_CONTEXT_TYPE_KEY, 'CLASS10')
                  localStorage.setItem(ROADMAP_CONTEXT_LABEL_KEY, prediction.topCareer)
                }
              } catch { /* ignore */ }
            }}
            className="group inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}
          >
            🗺️ Generate Roadmap
          </Link>
          <Link to="/assessment/class10/form"
            className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
          >
            🔁 Retake Assessment
          </Link>
          <Link to="/assessment/class10"
            className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
          >
            ← Back
          </Link>
        </motion.div>

      </div>
    </PageTransition>
  )
}
