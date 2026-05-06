import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { postRoadmap } from '../services/aiApi'
import { ROADMAP_CAREER_KEY, ROADMAP_CONTEXT_LABEL_KEY, ROADMAP_CONTEXT_TYPE_KEY } from '../constants/storageKeys'
import RoadmapCard from '../components/RoadmapCard'
import Loader from '../components/Loader'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import { STREAM_BRANCHES } from '../data/assessmentOptions'

const ALL_BRANCHES = Object.values(STREAM_BRANCHES).flat()
const DEFAULT_CAREER = 'Software Engineer'
const DEFAULT_TYPE = 'ENGINEERING'
const DEFAULT_CLASS10_TARGET = 'Science'
const DEFAULT_AFTER12_TARGET = 'Engineering (B.Tech)'

function readStoredCareer() {
  try {
    const v = localStorage.getItem(ROADMAP_CAREER_KEY)
    return v && v.trim() ? v.trim() : null
  } catch {
    return null
  }
}

function readStoredContextType() {
  try {
    const t = localStorage.getItem(ROADMAP_CONTEXT_TYPE_KEY)
    return t && t.trim() ? t.trim() : null
  } catch {
    return null
  }
}

function readStoredContextLabel() {
  try {
    const v = localStorage.getItem(ROADMAP_CONTEXT_LABEL_KEY)
    return v && v.trim() ? v.trim() : null
  } catch {
    return null
  }
}

function readStoredBranch() {
  try {
    return localStorage.getItem('careermatrix_branch') || ''
  } catch {
    return ''
  }
}

export default function RoadmapPage() {
  const [searchParams] = useSearchParams()
  const paramCareer = searchParams.get('career')
  const paramBranch = searchParams.get('branch')
  const paramType = searchParams.get('type')

  const initialType = useMemo(() => {
    const fromUrl = paramType?.trim()
    if (fromUrl) return fromUrl.toUpperCase()
    return (readStoredContextType() || DEFAULT_TYPE).toUpperCase()
  }, [paramType])

  const initialCareer = useMemo(() => {
    const fromUrl = paramCareer?.trim()
    if (fromUrl) return fromUrl
    const fromContext = readStoredContextLabel()
    if (fromContext) return fromContext
    // If user opens a non-engineering roadmap without a stored context label,
    // default to a sensible target so we don't accidentally generate engineering roadmaps.
    if (initialType === 'CLASS10') return DEFAULT_CLASS10_TARGET
    if (initialType === 'AFTER12') return DEFAULT_AFTER12_TARGET
    
    const storedCareer = readStoredCareer()
    if (storedCareer) return storedCareer
    
    // Fallback to the stored branch label if possible
    const storedBranchId = readStoredBranch()
    const branchName = ALL_BRANCHES.find(b => b.id === storedBranchId)?.label || storedBranchId
    return branchName || DEFAULT_CAREER
  }, [paramCareer, initialType])

  const initialBranch = useMemo(() => {
    if (paramBranch?.trim()) return paramBranch.trim()
    return readStoredBranch() || 'CSE'
  }, [paramBranch])

  const [assessmentType, setAssessmentType] = useState(initialType)
  const [career, setCareer] = useState(initialCareer)
  const [branchCode, setBranchCode] = useState(initialBranch)
  const [inputCareer, setInputCareer] = useState(initialCareer)
  const [inputBranch, setInputBranch] = useState(initialBranch)
  const [roadmap, setRoadmap] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const branchLabel = useMemo(
    () => ALL_BRANCHES.find((b) => b.id === branchCode)?.label || branchCode,
    [branchCode],
  )

  const fetchRoadmap = useCallback(async (type, label, branch) => {
    setLoading(true)
    setError('')
    try {
      const normalizedType = (type || DEFAULT_TYPE).toUpperCase()
      
      let skills = []
      let interests = []
      try {
        const storedSkills = localStorage.getItem('careermatrix_last_skills')
        if (storedSkills) skills = JSON.parse(storedSkills)
        const storedInterests = localStorage.getItem('careermatrix_last_interests')
        if (storedInterests) interests = JSON.parse(storedInterests)
      } catch {
        /* ignore */
      }

      const data = await postRoadmap({
        career: label,
        branch: branch || 'OTHER',
        type: normalizedType,
        skills,
        interests,
      })
      const steps = Array.isArray(data?.roadmap) ? data.roadmap : []
      setRoadmap(steps)
      setCareer(label)
      setBranchCode(normalizedType === 'ENGINEERING' ? branch || 'OTHER' : 'OTHER')
      setAssessmentType(normalizedType)
      try {
        localStorage.setItem(ROADMAP_CONTEXT_TYPE_KEY, normalizedType)
        localStorage.setItem(ROADMAP_CONTEXT_LABEL_KEY, label)
        if (normalizedType === 'ENGINEERING') {
          localStorage.setItem(ROADMAP_CAREER_KEY, label)
        }
      } catch {
        /* ignore */
      }
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Failed to load roadmap.'
      setError(typeof msg === 'string' ? msg : 'Request failed.')
      setRoadmap([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only auto-fetch if we have a specific career from URL or context, 
    // NOT if it's just a default fallback.
    const hasCareer = paramCareer || readStoredContextLabel() || readStoredCareer()
    if (hasCareer) {
      fetchRoadmap(initialType, initialCareer, initialBranch)
    } else {
      setLoading(false)
      setRoadmap([])
    }
  }, [initialType, initialCareer, initialBranch, fetchRoadmap, paramCareer])

  useEffect(() => {
    setInputCareer(career)
  }, [career])

  const progress = !loading && roadmap.length > 0 ? 100 : loading ? 12 : 0

  const onRegenerate = (e) => {
    e.preventDefault()
    // Fallback to the branch label if no specific career is entered
    const name = inputCareer.trim() || branchLabel
    const br = inputBranch.trim() || 'OTHER'
    fetchRoadmap(assessmentType, name, br)
  }

  return (
    <PageTransition>
      <div className="mesh-gradient min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8 pb-10">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase ring-1 ring-primary/20"
            >
              Precision Roadmap
            </motion.div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
              Success <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Blueprint</span>
            </h1>
            <p className="mt-3 text-lg font-medium text-muted">
              A detailed, step-by-step technical and professional journey tailored to your goals.
            </p>
          </div>

        <Card className="border-primary/20 shadow-lg">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="roadmap-type" className="text-xs font-semibold uppercase tracking-wider text-primary">
                Roadmap type
              </label>
              <select
                id="roadmap-type"
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-borderline bg-page px-3 py-2 text-sm text-accent focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ENGINEERING">Engineering</option>
                <option value="CLASS10">Class 10 (Stream)</option>
                <option value="AFTER12">After 12th (Career)</option>
              </select>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Stream / Branch</span>
              <p className="mt-1 font-display text-xl font-bold text-accent">{branchLabel}</p>
            </div>
          </div>

          <form onSubmit={onRegenerate} className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 flex-1 sm:max-w-md">
              <label htmlFor="roadmap-career-input" className="text-xs font-medium text-slate-600">
                {assessmentType === 'CLASS10' ? 'Stream' : assessmentType === 'AFTER12' ? 'Career direction' : 'Career title'}
              </label>
              <input
                id="roadmap-career-input"
                type="text"
                value={inputCareer}
                onChange={(e) => setInputCareer(e.target.value)}
                placeholder={assessmentType === 'CLASS10' ? 'e.g. Science / Commerce / Humanities' : 'e.g. Mechanical Design Engineer'}
                className="mt-1 w-full rounded-xl border border-borderline bg-page px-3 py-2 text-sm text-accent placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="min-w-0 sm:w-64">
              <label htmlFor="roadmap-branch" className="text-xs font-medium text-slate-600">
                Your current branch
              </label>
              <select
                id="roadmap-branch"
                value={inputBranch}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputBranch(val);
                  // Auto-detect roadmap type if it's currently Engineering but user picks Arts/Med/etc
                  if (assessmentType === 'ENGINEERING') {
                    if (STREAM_BRANCHES.MEDICAL.find(b => b.id === val)) setAssessmentType('AFTER12');
                    if (STREAM_BRANCHES.ARTS.find(b => b.id === val)) setAssessmentType('AFTER12');
                    if (STREAM_BRANCHES.COMMERCE.find(b => b.id === val)) setAssessmentType('AFTER12');
                  }
                }}
                className="mt-1 w-full rounded-xl border border-borderline bg-page px-3 py-2 text-sm text-accent focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {ALL_BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Generating…' : 'Generate roadmap'}
            </button>
          </form>

          <div className="mt-6">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Progress snapshot</span>
              <span>
                {roadmap.length} step{roadmap.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-page ring-1 ring-borderline">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loading ? 8 : progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Roadmaps adapt to your branch; regenerate to refresh.</p>
          </div>
        </Card>

        {!loading && !error && roadmap.length === 0 && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-page/40 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">🚀</div>
            <h3 className="mt-4 text-xl font-bold text-accent">Ready to build your roadmap?</h3>
            <p className="mt-2 max-w-md text-slate-600">
              Enter your target career and click the generate button to receive a personalized Success Blueprint tailored to your background.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        {!loading && !error && roadmap.length > 0 && (
          <div className="relative space-y-8">
            {roadmap.map((item, index) => (
              <RoadmapCard
                key={`${item.step}-${index}`}
                step={item.step}
                details={item.details}
                tools={item.tools}
                projects={item.projects}
                resources={item.resources}
                index={index}
                total={roadmap.length}
              />
            ))}
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/60 backdrop-blur-sm">
            <Loader label="Architecting your personalized roadmap…" />
          </div>
        )}
      </div>
    </div>
  </PageTransition>
  )
}
