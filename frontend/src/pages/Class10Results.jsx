import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import Loader from '../components/Loader'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CLASS10_LAST_PREDICTION_KEY, ROADMAP_CONTEXT_LABEL_KEY, ROADMAP_CONTEXT_TYPE_KEY } from '../constants/storageKeys'

const CHART_COLORS = ['#38BDF8', '#0EA5E9', '#7DD3FC']

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
    .map(([career, scorePercent], i) => ({
      career: career || 'Unknown',
      scorePercent: Number(scorePercent) || 0,
      rank: i + 1,
    }))
  return {
    topCareer: data.topCareer || (rankedCareers[0]?.career) || 'Science',
    careerScores: scores,
    explanation: data.explanation || 'Based on your profile, this stream offers the best alignment with your strengths.',
    rankedCareers,
    confidencePercent: data.confidencePercent ?? 85,
    recommendedSubjects: data.recommendedSubjects || [],
    examPaths: data.examPaths || [],
    nextSteps: data.nextSteps || [],
  }
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
        setPrediction(normalizeFromHistory(state))
        setLoading(false)
        return
      }
      try {
        const raw = localStorage.getItem(CLASS10_LAST_PREDICTION_KEY)
        if (raw) {
          setPrediction(normalizeFromHistory(JSON.parse(raw)))
          setLoading(false)
          return
        }
      } catch {
        /* ignore */
      }

      try {
        const { data } = await api.get(`/api/results/${userId}`, { params: { type: 'CLASS10' } })
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

  const chartData = useMemo(() => {
    if (!prediction?.careerScores) return []
    return Object.entries(prediction.careerScores).map(([name, score]) => ({
      name,
      score: Number(score),
    }))
  }, [prediction])

  if (loading) {
    return (
      <PageTransition>
        <Loader fullPage label="Loading your stream insights…" />
      </PageTransition>
    )
  }

  if (!prediction) {
    return (
      <PageTransition>
        <Card className="mx-auto max-w-lg border-dashed border-primary/30 bg-page/80 text-center shadow-md">
          <h2 className="font-display text-xl font-semibold text-accent">No Class 10 results yet</h2>
          <p className="mt-2 text-sm text-slate-600">Complete the assessment to get a suggested stream.</p>
          {fetchError && <p className="mt-3 text-sm text-red-600">{fetchError}</p>}
          <Link
            to="/assessment/class10/form"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-110 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
              Your best-fit stream
            </h1>
            <p className="mt-3 text-lg font-medium text-muted">
              Based on your marks and interest signals.
            </p>
          </div>

        {fetchError && (
          <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-accent">{fetchError}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2 border-primary/20 bg-white shadow-lg p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Top recommendation</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold text-accent">{prediction.topCareer}</h2>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-6xl font-black text-primary tracking-tighter">
                {prediction.careerScores?.[prediction.topCareer]?.toFixed?.(1) ?? '—'}%
              </span>
              <span className="text-sm font-bold text-muted uppercase">match</span>
            </div>
            <div className="mt-8 border-t border-borderline pt-6">
              <h3 className="font-display text-sm font-bold text-accent uppercase tracking-wider">Explanation</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{prediction.explanation}</p>
            </div>
          </Card>

          <Card className="lg:col-span-3 shadow-lg p-8 bg-white">
            <h3 className="font-display text-lg font-bold text-accent">Stream score breakdown</h3>
            <div className="mt-8 h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--chart-grid))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgb(var(--chart-tick))', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fill: 'rgb(var(--chart-tick))', fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Score']}
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

        {/* Guidance Sections */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="bg-white border-none p-8 shadow-lg">
            <h3 className="font-display text-lg font-bold text-accent">Recommended subjects</h3>
            <div className="mt-6 flex flex-col gap-3">
              {(prediction.recommendedSubjects?.length > 0 ? prediction.recommendedSubjects : getDefaultSubjects(prediction.topCareer)).map((s) => (
                <div key={s} className="rounded-xl border border-borderline bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                  {s}
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white border-none p-8 shadow-lg">
            <h3 className="font-display text-lg font-bold text-accent">Exam path (high level)</h3>
            <div className="mt-6 space-y-4">
              {(prediction.examPaths?.length > 0 ? prediction.examPaths : [
                'No fixed entrance at Class 10 — focus on basics + explore career videos/books',
                'Talk to seniors/teachers and compare +2 subject combinations'
              ]).map((s) => (
                <div key={s} className="rounded-2xl border border-borderline bg-white p-4 text-sm font-medium leading-relaxed text-slate-600 shadow-sm">
                  {s}
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white border-none p-8 shadow-lg">
            <h3 className="font-display text-lg font-bold text-accent">Next steps</h3>
            <div className="mt-6 space-y-4">
              {(prediction.nextSteps?.length > 0 ? prediction.nextSteps : [
                'Pick a stream that you can study consistently for 2 years (not only based on trends)',
                'Choose optional subjects (e.g. Math/CS) that keep more doors open',
                'Create a simple weekly plan: 60% strengths + 40% weak areas'
              ]).map((s) => (
                <div key={s} className="rounded-2xl border border-borderline bg-white p-4 text-sm font-medium leading-relaxed text-slate-600 shadow-sm">
                  {s}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            to={`/roadmap?type=CLASS10&career=${encodeURIComponent(prediction?.topCareer || 'Science')}`}
            onClick={() => {
              try {
                if (prediction?.topCareer) {
                  localStorage.setItem(ROADMAP_CONTEXT_TYPE_KEY, 'CLASS10')
                  localStorage.setItem(ROADMAP_CONTEXT_LABEL_KEY, prediction.topCareer)
                }
              } catch {
                /* ignore */
              }
            }}
            className="inline-flex items-center justify-center rounded-xl bg-[#0EA5E9] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:brightness-110"
          >
            Generate roadmap
          </Link>
          <Link
            to="/assessment/class10/form"
            className="inline-flex items-center justify-center rounded-xl bg-[#0EA5E9] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:brightness-110"
          >
            Retake assessment
          </Link>
          <Link
            to="/assessment/class10"
            className="inline-flex items-center justify-center rounded-xl border border-borderline bg-white px-6 py-3 text-sm font-bold text-accent shadow-sm transition-all hover:scale-105 hover:bg-page"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
     </div>
    </PageTransition>
  )
}

