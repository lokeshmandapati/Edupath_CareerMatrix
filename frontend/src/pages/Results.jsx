import { useMemo, useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getCareerDescription } from '../data/careerDescriptions'
import Card from '../components/Card'
import Loader from '../components/Loader'
import PageTransition from '../components/PageTransition'
import { ROADMAP_CAREER_KEY } from '../constants/storageKeys'
import { generateReportPDF } from '../services/reportService'
import { getCommitment } from '../data/careerCommitment'

const CHART_COLORS = ['#38BDF8', '#38BDF8', '#0EA5E9', '#7DD3FC', '#BAE6FD']

/** Align API history payload with prediction response shape */
function normalizeFromHistory(data) {
  const scores = data.careerScores || {}
  const rankedCareers = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([career, scorePercent], i) => ({
      career,
      scorePercent: Number(scorePercent),
      rank: i + 1,
    }))
  return {
    topCareer: data.topCareer,
    careerScores: scores,
    explanation: data.explanation,
    rankedCareers,
    confidencePercent: data.confidencePercent ?? null,
    skillMatchBreakdown: data.skillMatchBreakdown || null,
    interestMatchBreakdown: data.interestMatchBreakdown || null,
    branchCode: data.branchCode ?? null,
    branchLabel: data.branchLabel ?? null,
    whyBranchFit: data.whyBranchFit ?? null,
    crossBranchSuggestions: data.crossBranchSuggestions ?? [],
    rawSkills: data.rawSkills ?? null,
    rawInterests: data.rawInterests ?? null,
  }
}

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { userId } = useAuth()
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setFetchError('')
      if (state?.topCareer) {
        setPrediction(state)
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get(`/api/results/${userId}`)
        if (!cancelled) {
          if (data.assessmentType === 'CLASS10') {
            navigate('/assessment/class10/results', { state: data, replace: true })
            return
          }
          if (data.assessmentType === 'AFTER12') {
            navigate('/assessment/after12/results', { state: data, replace: true })
            return
          }
          setPrediction(normalizeFromHistory(data))
        }
      } catch (e) {
        if (!cancelled) {
          // Fallback to local storage if API fails
          try {
            const raw = localStorage.getItem('careermatrix_last_prediction')
            if (raw) {
              setPrediction(JSON.parse(raw))
              setLoading(false)
              return
            }
          } catch {
            /* ignore */
          }
          
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
      name: name.length > 18 ? `${name.slice(0, 16)}…` : name,
      fullName: name,
      score: Number(score),
    }))
  }, [prediction])

  if (loading) {
    return (
      <PageTransition>
        <Loader fullPage label="Loading your career insights…" />
      </PageTransition>
    )
  }

  if (!prediction) {
    return (
      <PageTransition>
        <Card className="mx-auto max-w-lg border-dashed border-primary/30 bg-page/80 text-center shadow-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="mt-6 font-display text-xl font-semibold text-accent">No results yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Complete the career assessment to see your personalized CFPA scores and recommendations.
          </p>
          {fetchError && <p className="mt-3 text-sm text-red-600">{fetchError}</p>}
          <Link
            to="/career-form"
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
      <div className="mesh-gradient relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">

        {/* ── Animated Background Glows ── */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[100px]"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)' }}
          />
        </div>

        {/* ── Floating Particles ── */}
        {[
          { top: '8%', left: '12%', size: 4, dur: 3 },
          { top: '18%', right: '18%', size: 5, dur: 4 },
          { bottom: '22%', left: '8%', size: 3, dur: 2.5 },
          { top: '60%', right: '12%', size: 6, dur: 3.5 },
        ].map((p, i) => (
          <motion.div
            key={`particle-${i}`}
            animate={{ opacity: [0.15, 0.5, 0.15], y: [0, -8, 0] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: i * 0.5 }}
            className="pointer-events-none absolute rounded-full"
            style={{ ...p, width: p.size, height: p.size, background: 'rgba(139,92,246,0.6)' }}
          />
        ))}

        <div id="report-content" className="mx-auto max-w-7xl space-y-10 pb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase ring-1 ring-primary/20"
              >
                Analysis Complete
              </motion.div>
              <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl lg:text-6xl">
                Your <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Career Blueprint</span>
              </h1>
              <p className="mt-3 text-lg font-medium text-muted">
                Based on our CFPA engine, here is your high-precision career alignment profile.
              </p>
            </div>
            
            <button
              onClick={() => generateReportPDF('report-content', `CareerMatrix-Report-${prediction.topCareer}.pdf`)}
              className="glass-dark flex items-center gap-2 rounded-2xl border border-primary/20 px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/10 active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>

          {fetchError && (
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-accent">{fetchError}</div>
          )}

          {/* Connect Overview of Interest */}
          {/* Connect Overview of Interest */}
          <div className="grid gap-6 md:grid-cols-2">
            {(prediction.interestMatchBreakdown || prediction.rawInterests) && (
              <Card className="glass border-none p-6 shadow-premium ring-1 ring-primary/10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                    🎨
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-accent">Passion Overview</h3>
                    <p className="text-xs font-medium text-muted">Your core interests that drive these career matches.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(prediction.rawInterests || Object.keys(prediction.interestMatchBreakdown)).slice(0, 8).map((interest) => (
                    <span key={interest} className="rounded-full bg-violet-500/5 px-4 py-1.5 text-xs font-bold text-violet-600 ring-1 ring-violet-500/20">
                      {interest}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {prediction.rawSkills && (
              <Card className="glass border-none p-6 shadow-premium ring-1 ring-primary/10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-accent">Skill Inventory</h3>
                    <p className="text-xs font-medium text-muted">Technical strengths identified from your profile.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {prediction.rawSkills.slice(0, 8).map((skill) => (
                    <span key={skill} className="rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary ring-1 ring-primary/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* ... Rest of the existing grid content ... */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="glass relative h-full border-none p-8 shadow-premium overflow-hidden">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl"></div>
              
              {prediction.branchLabel && (
                <div className="relative mb-6 flex items-center gap-3 rounded-2xl bg-primary/5 px-4 py-3 ring-1 ring-primary/20">
                  <span className="text-2xl" aria-hidden>📚</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Academic Track</p>
                    <p className="text-sm font-bold text-accent">{prediction.branchLabel}</p>
                  </div>
                </div>
              )}

              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Primary Match</p>
              <h2 className="mt-4 font-display text-4xl font-extrabold text-accent">{prediction.topCareer}</h2>
              
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-6xl font-black text-primary tracking-tighter">
                  {prediction.careerScores?.[prediction.topCareer]?.toFixed?.(0) ?? '—'}%
                </span>
                <span className="text-sm font-bold text-muted uppercase tracking-wider">Alignment</span>
              </div>

              {prediction.confidencePercent != null && (
                <div className="mt-8 rounded-2xl bg-violet-500/5 p-5 ring-1 ring-violet-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">System Confidence</p>
                  <p className="mt-2 font-display text-3xl font-black text-accent">
                    {Number(prediction.confidencePercent).toFixed(0)}%
                  </p>
                  <p className="mt-2 text-xs font-medium leading-relaxed text-muted">
                    Data coverage based on your profile inputs.
                  </p>
                </div>
              )}

              {prediction.whyBranchFit && (
                <div className="mt-8 space-y-2">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Strategic Alignment</p>
                   <p className="text-sm font-medium leading-relaxed text-accent">{prediction.whyBranchFit}</p>
                </div>
              )}

              <div className="mt-8 border-t border-borderline pt-8 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Analysis Summary</p>
                <p className="text-sm font-medium leading-relaxed text-muted">{prediction.explanation}</p>
              </div>

              {/* NEW SECTION: Course Details */}
              <div className="mt-8 border-t border-borderline pt-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Course Commitment</p>
                {(() => {
                  const commitment = getCommitment(prediction.topCareer)
                  const difficultyColor = 
                    commitment.level === 1 ? 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/20' :
                    commitment.level === 2 ? 'text-amber-500 bg-amber-500/10 ring-amber-500/20' :
                    'text-red-500 bg-red-500/10 ring-red-500/20'
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-xl">⏳</div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Duration</p>
                          <p className="text-sm font-bold text-accent">{commitment.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-xl">📊</div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Difficulty</p>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ring-1 ${difficultyColor}`}>
                              {commitment.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="rounded-xl bg-black/[0.02] p-3 text-[11px] font-medium italic text-muted ring-1 ring-black/5">
                        "{commitment.description}"
                      </p>
                    </div>
                  )
                })()}
              </div>
            </Card>
          </motion.div>

          <div className="lg:col-span-3">
            <Card className="glass h-full border-none p-8 shadow-premium">
              <h3 className="font-display text-xl font-bold text-accent">Distribution Map</h3>
              <div className="mt-4 h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--chart-grid))" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgb(var(--chart-tick))', fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={132} tick={{ fill: 'rgb(var(--chart-tick))', fontSize: 10 }} />
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
        </div>

        {prediction.crossBranchSuggestions && prediction.crossBranchSuggestions.length > 0 && (
          <Card className="border-dashed border-primary/35 bg-primary/5 shadow-md">
            <h3 className="font-display text-lg font-semibold text-accent">Cross-branch opportunities</h3>
            <p className="mt-1 text-sm text-slate-600">
              Strong signals in your skills suggest these adjacent roles are also worth exploring — common in industry when profiles blend domains.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {prediction.crossBranchSuggestions.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-primary/30 bg-surface px-4 py-1.5 text-sm font-medium text-accent shadow-sm"
                >
                  {c}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {(prediction.skillMatchBreakdown || prediction.interestMatchBreakdown) && (
          <div className="grid gap-8 lg:grid-cols-2">
            {prediction.skillMatchBreakdown && (
              <Card className="glass border-none p-8 shadow-premium">
                <h3 className="font-display text-xl font-bold text-accent">Skill Alignment</h3>
                <p className="mt-2 text-sm font-medium text-muted">Distribution of your technical strengths.</p>
                <div className="mt-8 space-y-6">
                  {Object.entries(prediction.skillMatchBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([career, pct]) => (
                      <div key={career} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                          <span className="text-accent">{career}</span>
                          <span className="text-primary">{Number(pct).toFixed(0)}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-primary/10 ring-1 ring-primary/20">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Number(pct))}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 shadow-sm shadow-primary/20"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            )}
            {prediction.interestMatchBreakdown && (
              <Card className="glass border-none p-8 shadow-premium">
                <h3 className="font-display text-xl font-bold text-accent">Interest Alignment</h3>
                <p className="mt-2 text-sm font-medium text-muted">Alignment of your professional passions.</p>
                <div className="mt-8 space-y-6">
                  {Object.entries(prediction.interestMatchBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([career, pct]) => (
                      <div key={career} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                          <span className="text-accent">{career}</span>
                          <span className="text-violet-500">{Number(pct).toFixed(0)}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-violet-500/10 ring-1 ring-violet-500/20">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Number(pct))}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-sm shadow-violet-500/20"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            )}
          </div>
        )}

        <Card className="glass border-none p-8 shadow-premium">
          <h3 className="font-display text-2xl font-bold text-accent text-center mb-8">Comprehensive Domain Rankings</h3>
          <div className="grid gap-6">
            {prediction.rankedCareers?.map((row) => (
              <motion.div
                key={row.career}
                whileHover={{ scale: 1.01 }}
                className="glass-dark group flex flex-col gap-5 rounded-3xl p-6 transition-all hover:bg-primary/[0.02]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary ring-1 ring-primary/20">
                      {row.rank}
                    </span>
                    <div>
                      <p className="text-lg font-bold text-accent group-hover:text-primary transition-colors">{row.career}</p>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-muted">{getCareerDescription(row.career)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-primary tracking-tighter">{row.scorePercent.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-primary/5 ring-1 ring-primary/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, row.scorePercent)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-primary shadow-lg shadow-primary/20"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Personalized Toolkit Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#0f1129] p-8 sm:p-12 ring-1 ring-white/10"
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold tracking-widest text-primary uppercase ring-1 ring-primary/20">
                New Feature
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold text-accent sm:text-4xl">
                Personalized <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Toolkit</span>
              </h2>
              <p className="mt-4 text-lg font-medium text-slate-400">
                Unlock specialized tools like the JEE College Predictor and Rank Analyzer to refine your engineering admission strategy.
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  College Prediction
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Rank vs Percentile
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  Category Insights
                </div>
              </div>
            </div>

            <Link
              to="/toolkit/jee-predictor"
              className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-violet-600 px-10 py-5 text-lg font-black text-white shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/40 active:scale-95"
            >
              Open JEE Predictor
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.section>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          <button
            type="button"
            onClick={() => {
              try {
                if (prediction?.topCareer) {
                  localStorage.setItem(ROADMAP_CAREER_KEY, prediction.topCareer)
                }
              } catch {
                /* ignore */
              }
              navigate('/roadmap')
            }}
            className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-violet-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <svg className="h-5 w-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Unlock My Roadmap
          </button>
          
          <Link
            to="/career-form"
            className="glass-dark inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-accent shadow-premium transition-all hover:scale-105 hover:bg-primary/5"
          >
            Retake Assessment
          </Link>
          
          <Link
            to="/dashboard"
            className="glass-dark inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-accent shadow-premium transition-all hover:scale-105 hover:bg-primary/5"
          >
            Dashboard
          </Link>
        </div>
      </div>
     </div>
    </PageTransition>
  )
}
