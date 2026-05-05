import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import Loader from '../components/Loader'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { AFTER12_LAST_PREDICTION_KEY, ROADMAP_CONTEXT_LABEL_KEY, ROADMAP_CONTEXT_TYPE_KEY } from '../constants/storageKeys'

const CHART_COLORS = ['#38BDF8', '#0EA5E9', '#7DD3FC', '#BAE6FD', '#60A5FA']

function normalizeFromHistory(data) {
  if (!data) return null
  const scores = data.careerScores || {}
  const rankedCareers = Object.entries(scores)
    .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))
    .map(([career, scorePercent], i) => ({
      career: career || 'Unknown',
      scorePercent: Number(scorePercent) || 0,
      rank: i + 1,
    }))
  return {
    topCareer: data.topCareer || (rankedCareers[0]?.career) || 'Engineering (B.Tech)',
    careerScores: scores,
    explanation: data.explanation || 'Based on your profile, this field offers the best alignment with your professional interests.',
    rankedCareers,
    confidencePercent: data.confidencePercent ?? 85,
    recommendedSubjects: data.recommendedSubjects || [],
    examPaths: data.examPaths || [],
    nextSteps: data.nextSteps || [],
    quiz: data.quiz || null,
  }
}

export default function After12Results() {
  const { state } = useLocation()
  const { userId } = useAuth()
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [colleges, setColleges] = useState([])
  const [collegeLoading, setCollegeLoading] = useState(false)
  const [collegeError, setCollegeError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setFetchError('')
      if (state?.topCareer || (state && Object.keys(state).length > 0)) {
        setPrediction(normalizeFromHistory(state))
        setLoading(false)
        return
      }
      try {
        const raw = localStorage.getItem(AFTER12_LAST_PREDICTION_KEY)
        if (raw) {
          setPrediction(normalizeFromHistory(JSON.parse(raw)))
          setLoading(false)
          return
        }
      } catch {
        /* ignore */
      }

      try {
        const { data } = await api.get(`/api/results/${userId}`, { params: { type: 'AFTER12' } })
        if (!cancelled) setPrediction(normalizeFromHistory(data))
      } catch (e) {
        if (!cancelled) {
          setPrediction(null)
          if (e.response?.status !== 404) {
            setFetchError('Could not load results. Check your connection and try again.')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [state, userId])

  useEffect(() => {
    let cancelled = false
    async function loadColleges() {
      setColleges([])
      setCollegeError('')
      if (!prediction?.topCareer) return
      setCollegeLoading(true)
      try {
        const locationFlexibility = prediction?.assessmentInputs?.locationFlexibility || ''
        const city = prediction?.assessmentInputs?.preferredCity || ''
        const state = prediction?.assessmentInputs?.preferredState || ''
        const category = prediction?.assessmentInputs?.category || 'GENERAL'

        const params = { course: prediction.topCareer }
        if (locationFlexibility === 'Same city' && city) params.city = city
        if (locationFlexibility === 'Same state' && state) params.state = state
        if (category) params.category = category

        const { data } = await api.get('/api/colleges/after12', { params })
        if (!cancelled) setColleges(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) {
          setColleges([])
          const msg = e.response?.data?.error || e.response?.data?.message || e.message || 'Could not load colleges'
          setCollegeError(typeof msg === 'string' ? msg : 'Could not load colleges')
        }
      } finally {
        if (!cancelled) setCollegeLoading(false)
      }
    }
    loadColleges()
    return () => {
      cancelled = true
    }
  }, [prediction?.topCareer])

  const chartData = useMemo(() => {
    if (!prediction?.careerScores) return []
    return Object.entries(prediction.careerScores).map(([name, score]) => ({
      name: name.length > 24 ? `${name.slice(0, 22)}…` : name,
      fullName: name,
      score: Number(score),
    }))
  }, [prediction])

  if (loading) {
    return (
      <PageTransition>
        <Loader fullPage label="Loading your career directions…" />
      </PageTransition>
    )
  }

  if (!prediction) {
    return (
      <PageTransition>
        <Card className="mx-auto max-w-lg border-dashed border-primary/30 bg-page/80 text-center shadow-md">
          <h2 className="font-display text-xl font-semibold text-accent">No After 12th results yet</h2>
          <p className="mt-2 text-sm text-slate-600">Complete the assessment to get career direction suggestions.</p>
          {fetchError && <p className="mt-3 text-sm text-red-600">{fetchError}</p>}
          <Link
            to="/assessment/after12/form"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-110 hover:shadow-[0_0_26px_rgba(var(--glow))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            Start assessment
          </Link>
        </Card>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="mesh-gradient min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10 pb-10">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase ring-1 ring-primary/20"
            >
              Career Mapping Successful
            </motion.div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl lg:text-6xl">
              Your <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Professional Future</span>
            </h1>
            <p className="mt-3 text-lg font-medium text-muted">
              Explore your ideal career directions and college matches with high-precision insights.
            </p>
          </div>

        {fetchError && (
          <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-accent">{fetchError}</div>
        )}

        {prediction?.quiz && (
          <Card className="border-primary/20 bg-gradient-to-br from-surface via-page/50 to-surface shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Assessment result (quiz-based)</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-page px-4 py-2 text-sm font-semibold text-accent ring-1 ring-borderline">
                {prediction.quiz.band}
              </span>
              <span className="text-sm text-slate-600">
                Score: <span className="font-semibold text-accent">{prediction.quiz.score}</span>/{prediction.quiz.total} ({prediction.quiz.percent}%)
              </span>
            </div>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-surface via-page/50 to-surface shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Top recommendation</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-accent sm:text-3xl">{prediction.topCareer}</h2>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary sm:text-5xl">
                {prediction.careerScores?.[prediction.topCareer]?.toFixed?.(1) ?? '—'}%
              </span>
              <span className="text-sm font-medium text-slate-500">match</span>
            </div>
            <div className="mt-8 border-t border-borderline pt-6">
              <h3 className="font-display text-sm font-semibold text-accent">Explanation</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{prediction.explanation}</p>
            </div>
          </Card>

          <Card className="lg:col-span-3 shadow-lg">
            <h3 className="font-display text-lg font-semibold text-accent">Score breakdown</h3>
            <div className="mt-4 h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--chart-grid))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgb(var(--chart-tick))', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={170} tick={{ fill: 'rgb(var(--chart-tick))', fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Score']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                    contentStyle={{
                      borderRadius: '12px',
                      backgroundColor: 'rgb(var(--tooltip-bg))',
                      border: '1px solid rgba(var(--borderline))',
                      boxShadow: 'var(--shadow-soft)',
                      color: 'rgb(var(--accent))',
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 8, 8, 0]} maxBarSize={32}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="shadow-lg">
          <h3 className="font-display text-lg font-semibold text-accent">Top colleges for {prediction.topCareer}</h3>
          <p className="mt-1 text-sm text-slate-600">Here are 10 popular options to explore. Verify current admissions + eligibility on official sites.</p>
          {collegeError ? <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-accent">{collegeError}</div> : null}
          {collegeLoading ? (
            <div className="mt-5 text-sm text-slate-600">Loading colleges…</div>
          ) : colleges.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {colleges.map((c) => (
                <li key={`${c.rank}-${c.name}`} className="rounded-2xl bg-page/60 px-4 py-3 ring-1 ring-borderline">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-accent">
                        #{c.rank} {c.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">{c.location}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-700">
                        Approx cutoff ({prediction?.assessmentInputs?.category === 'OBC' ? 'OBC' : prediction?.assessmentInputs?.category === 'SCST' ? 'SC / ST' : 'General'}):{' '}
                        <span className="font-bold text-accent">{c.cutoff || 'Varies'}</span>
                      </p>
                    </div>
                    {c.website ? (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-xl border border-borderline bg-surface px-3 py-1.5 text-xs font-semibold text-accent shadow-sm transition-all duration-300 hover:scale-105 hover:border-primary/40 hover:bg-page"
                      >
                        Website
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 text-sm text-slate-600">No college list found for this course yet.</div>
          )}
        </Card>

        {(prediction.recommendedSubjects?.length > 0 || prediction.examPaths?.length > 0 || prediction.nextSteps?.length > 0) && (
          <div className="grid gap-6 lg:grid-cols-3">
            {prediction.recommendedSubjects?.length > 0 && (
              <Card className="shadow-lg">
                <h3 className="font-display text-lg font-semibold text-accent">Recommended focus subjects</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {prediction.recommendedSubjects.map((s) => (
                    <li key={s} className="rounded-xl bg-page/60 px-4 py-3 ring-1 ring-borderline">
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {prediction.examPaths?.length > 0 && (
              <Card className="shadow-lg">
                <h3 className="font-display text-lg font-semibold text-accent">Entrance exams / paths</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {prediction.examPaths.map((s) => (
                    <li key={s} className="rounded-xl bg-page/60 px-4 py-3 ring-1 ring-borderline">
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {prediction.nextSteps?.length > 0 && (
              <Card className="shadow-lg">
                <h3 className="font-display text-lg font-semibold text-accent">Next steps</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {prediction.nextSteps.map((s) => (
                    <li key={s} className="rounded-xl bg-page/60 px-4 py-3 ring-1 ring-borderline">
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/roadmap?type=AFTER12&career=${encodeURIComponent(prediction?.topCareer || 'Engineering (B.Tech)')}`}
            onClick={() => {
              try {
                if (prediction?.topCareer) {
                  localStorage.setItem(ROADMAP_CONTEXT_TYPE_KEY, 'AFTER12')
                  localStorage.setItem(ROADMAP_CONTEXT_LABEL_KEY, prediction.topCareer)
                }
              } catch {
                /* ignore */
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-110 hover:shadow-[0_0_26px_rgba(var(--glow))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            Generate roadmap
          </Link>
          <Link
            to="/assessment/after12/form"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-110 hover:shadow-[0_0_26px_rgba(var(--glow))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            Retake assessment
          </Link>
          <Link
            to="/assessment/after12"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-borderline bg-surface px-5 py-2.5 text-sm font-semibold text-accent shadow-sm transition-all duration-300 ease-in-out hover:scale-105 hover:border-primary/50 hover:bg-page hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
     </div>
    </PageTransition>
  )
}

