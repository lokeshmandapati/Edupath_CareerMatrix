import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import Button from '../components/Button'
import StepIndicator from '../components/StepIndicator'
import { api } from '../services/api'
import { CLASS10_LAST_PREDICTION_KEY } from '../constants/storageKeys'

const STEP_LABELS = ['Marks (Class 10)', 'Interests', 'Aptitude & style', 'Preferences']

const stepVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.2 } },
}

const INTERESTS = [
  'Technology',
  'Medicine',
  'Research',
  'Business',
  'Finance',
  'Law',
  'Design',
  'Writing',
  'Psychology',
  'Public Service',
  'Entrepreneurship',
  'Creative Arts',
  'Sports',
  'Teaching',
  'Environment',
  'Travel & geography',
  'Music',
  'Photography / filmmaking',
  'Social work',
  'Politics & current affairs',
  'Gaming',
  'Robotics',
  'Space',
  'Coding',
]

const APTITUDE_TAGS = [
  'Numbers & logic',
  'Problem solving',
  'Writing & expression',
  'Debate & persuasion',
  'People & empathy',
  'Creativity & visuals',
  'Analysis & cases',
  'Money & markets',
  'Memory & revision',
  'Speed & accuracy',
  'Curiosity & learning',
  'Leadership',
  'Teamwork',
  'Hands-on building',
  'Planning & discipline',
]

const LEARNING_STYLES = ['Practical / hands-on', 'Reading / theory', 'Mixed']

const SUBJECT_COMFORT = ['Math', 'Science', 'English', 'Social Studies']
const STUDY_HOURS = ['< 1 hour', '1–2 hours', '2–3 hours', '3+ hours']
const FAMILY_PRIORITY = ['No preference', 'Prefer Science', 'Prefer Commerce', 'Prefer Humanities']

function clampMark(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, n))
}

export default function Class10Form() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [math, setMath] = useState('75')
  const [science, setScience] = useState('75')
  const [english, setEnglish] = useState('75')
  const [social, setSocial] = useState('75')
  const [interests, setInterests] = useState([])
  const [customInterest, setCustomInterest] = useState('')
  const [aptitudeTags, setAptitudeTags] = useState([])
  const [customAptitude, setCustomAptitude] = useState('')
  const [learningStyle, setLearningStyle] = useState('Mixed')
  const [subjectComfort, setSubjectComfort] = useState([])
  const [studyHours, setStudyHours] = useState('1–2 hours')
  const [familyPriority, setFamilyPriority] = useState('No preference')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const totalSteps = 4

  const next = () => {
    setError('')
    if (step === 1) {
      const m = clampMark(math)
      const s = clampMark(science)
      const e = clampMark(english)
      const so = clampMark(social)
      if ([m, s, e, so].some((x) => x <= 0)) {
        setError('Please enter marks for all subjects (0–100).')
        return
      }
    }
    if (step === 2 && interests.length === 0) {
      setError('Select at least one interest.')
      return
    }
    if (step === 3 && aptitudeTags.length === 0) {
      setError('Select at least one aptitude tag.')
      return
    }
    if (step === 4 && subjectComfort.length === 0) {
      setError('Select at least one subject you feel comfortable with.')
      return
    }
    setStep((v) => Math.min(totalSteps, v + 1))
  }

  const back = () => setStep((v) => Math.max(1, v - 1))

  const toggleInterest = (label) => {
    setInterests((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
  }

  const toggleAptitude = (label) => {
    setAptitudeTags((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
  }

  const toggleComfort = (label) => {
    setSubjectComfort((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
  }

  const marksSummary = useMemo(() => {
    return {
      math: clampMark(math),
      science: clampMark(science),
      english: clampMark(english),
      social: clampMark(social),
    }
  }, [math, science, english, social])

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/predict-class10-stream', {
        math: marksSummary.math,
        science: marksSummary.science,
        english: marksSummary.english,
        social: marksSummary.social,
        interests,
        aptitudeTags,
        learningStyle,
        subjectComfort,
        studyHours,
        familyPriority,
      })
      const merged = {
        ...data,
        assessmentInputs: {
          math: marksSummary.math,
          science: marksSummary.science,
          english: marksSummary.english,
          social: marksSummary.social,
          interests,
          aptitudeTags,
          learningStyle,
          subjectComfort,
          studyHours,
          familyPriority,
        },
      }
      try {
        localStorage.setItem(CLASS10_LAST_PREDICTION_KEY, JSON.stringify(merged))
        // Save for roadmap
        localStorage.setItem('careermatrix_last_interests', JSON.stringify(interests))
        localStorage.setItem('careermatrix_last_skills', JSON.stringify(aptitudeTags))
      } catch {
        /* ignore */
      }
      navigate('/assessment/class10/results', { state: merged, replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Prediction failed'
      setError(typeof msg === 'string' ? msg : 'Something went wrong')
    } finally {
      setLoading(false)
    }
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
          { top: '8%', left: '10%', size: 4, dur: 3 },
          { top: '22%', right: '18%', size: 5, dur: 4 },
          { bottom: '20%', left: '6%', size: 3, dur: 2.5 },
          { top: '60%', right: '10%', size: 6, dur: 3.5 },
        ].map((p, i) => (
          <motion.div
            key={`particle-${i}`}
            animate={{ opacity: [0.15, 0.5, 0.15], y: [0, -8, 0] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: i * 0.5 }}
            className="pointer-events-none absolute rounded-full"
            style={{ ...p, width: p.size, height: p.size, background: 'rgba(139,92,246,0.6)' }}
          />
        ))}

        <div className="mx-auto max-w-4xl space-y-8">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase ring-1 ring-primary/20"
            >
              Stream Selection
            </motion.div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
              Class 10 <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Assessment</span>
            </h1>
            <p className="mt-3 text-lg font-medium text-muted">
              Discover the academic stream that best aligns with your potential and interests.
            </p>
          </div>

          <Card className="glass overflow-hidden border-none p-0 shadow-premium">
            <div className="bg-primary/5 p-1">
              <StepIndicator current={step} total={totalSteps} labels={STEP_LABELS} />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-8 mt-6 rounded-2xl border border-red-500/10 bg-red-500/5 px-6 py-4 text-sm font-bold text-red-500 backdrop-blur-md" 
                role="alert"
              >
                {error}
              </motion.div>
            )}

            <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.section
                  key="s1"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ['Math', math, setMath],
                      ['Science', science, setScience],
                      ['English', english, setEnglish],
                      ['Social Studies', social, setSocial],
                    ].map(([label, val, setter]) => (
                      <label key={label} className="block">
                        <span className="text-sm font-medium text-slate-700">{label} marks (0–100)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="mt-2 w-full rounded-xl border border-borderline bg-surface px-4 py-3 text-base font-medium text-accent shadow-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                          value={val}
                          onChange={(e) => setter(e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="rounded-xl border border-borderline bg-page/60 px-4 py-3 text-sm text-slate-600">
                    Tip: If you only know percentage, enter the same number in all fields (e.g. 82).
                  </div>
                </motion.section>
              )}

              {step === 2 && (
                <motion.section key="s2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <h2 className="font-display text-lg font-semibold text-accent">Interests</h2>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {INTERESTS.map((it) => {
                      const active = interests.includes(it)
                      return (
                        <button
                          key={it}
                          type="button"
                          onClick={() => toggleInterest(it)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                            active
                              ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                              : 'border-borderline bg-surface text-accent hover:border-primary/30 hover:bg-page/20'
                          }`}
                        >
                          {it}
                        </button>
                      )
                    })}
                    {interests.filter(i => !INTERESTS.includes(i)).map((it) => (
                      <button
                        key={it}
                        type="button"
                        onClick={() => toggleInterest(it)}
                        className="rounded-full border border-pink-500/40 bg-gradient-to-br from-pink-500 to-rose-500 px-4 py-2 text-sm font-medium text-white shadow-glow transition-all"
                      >
                        ✏️ {it} ×
                      </button>
                    ))}
                  </div>

                  {/* Custom interest input */}
                  <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: 'rgba(236,72,153,0.2)', background: 'rgba(236,72,153,0.05)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#ec4899' }}>✏️ Add your own career interest</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Psychology, Animation, Space Science…"
                        className="flex-1 rounded-xl border border-borderline bg-surface px-4 py-2.5 text-sm font-medium text-accent transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        value={customInterest}
                        onChange={(e) => setCustomInterest(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = customInterest.trim()
                            if (val && !interests.includes(val)) {
                              setInterests(prev => [...prev, val])
                            }
                            setCustomInterest('')
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customInterest.trim()
                          if (val && !interests.includes(val)) {
                            setInterests(prev => [...prev, val])
                          }
                          setCustomInterest('')
                        }}
                        className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #ec4899, #d946ef)' }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </motion.section>
              )}

              {step === 3 && (
                <motion.section key="s3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Aptitude signals</h2>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {APTITUDE_TAGS.map((t) => {
                        const active = aptitudeTags.includes(t)
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleAptitude(t)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                              active
                              ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                              : 'border-borderline bg-surface text-accent hover:border-primary/30 hover:bg-page/20'
                            }`}
                          >
                            {t}
                          </button>
                        )
                      })}
                      {aptitudeTags.filter(t => !APTITUDE_TAGS.includes(t)).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleAptitude(t)}
                          className="rounded-full border border-cyan-500/40 bg-gradient-to-br from-cyan-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-glow transition-all"
                        >
                          ⚡ {t} ×
                        </button>
                      ))}
                    </div>

                  {/* Custom aptitude input */}
                  <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: 'rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.05)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#22d3ee' }}>⚡ Add your own skill or aptitude</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Critical Thinking, Observation, Punctuality…"
                        className="flex-1 rounded-xl border border-borderline bg-surface px-4 py-2.5 text-sm font-medium text-accent transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        value={customAptitude}
                        onChange={(e) => setCustomAptitude(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = customAptitude.trim()
                            if (val && !aptitudeTags.includes(val)) {
                              setAptitudeTags(prev => [...prev, val])
                            }
                            setCustomAptitude('')
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customAptitude.trim()
                          if (val && !aptitudeTags.includes(val)) {
                            setAptitudeTags(prev => [...prev, val])
                          }
                          setCustomAptitude('')
                        }}
                        className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Learning style</h2>
                    <p className="mt-1 text-sm text-slate-600">How do you learn best?</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {LEARNING_STYLES.map((s) => {
                        const active = learningStyle === s
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setLearningStyle(s)}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                              active ? 'border-primary bg-page text-accent shadow-sm ring-1 ring-primary/20' : 'border-borderline bg-surface text-slate-700 hover:bg-page/80'
                            }`}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.section>
              )}

              {step === 4 && (
                <motion.section key="s4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Subjects you feel comfortable with</h2>
                    <p className="mt-1 text-sm text-slate-600">Pick what you can study consistently (choose multiple).</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {SUBJECT_COMFORT.map((t) => {
                        const active = subjectComfort.includes(t)
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleComfort(t)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                              active
                                ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                : 'border-borderline bg-surface text-accent hover:border-primary/30 hover:bg-page/20'
                            }`}
                          >
                            {t}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Daily study time</h2>
                    <p className="mt-1 text-sm text-slate-600">How much time can you realistically study most days?</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {STUDY_HOURS.map((h) => {
                        const active = studyHours === h
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setStudyHours(h)}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                              active ? 'border-primary bg-page text-accent shadow-sm ring-1 ring-primary/20' : 'border-borderline bg-surface text-slate-700 hover:bg-page/80'
                            }`}
                          >
                            {h}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Family preference (optional)</h2>
                    <p className="mt-1 text-sm text-slate-600">We’ll consider it lightly (your fit matters most).</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {FAMILY_PRIORITY.map((p) => {
                        const active = familyPriority === p
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setFamilyPriority(p)}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                              active ? 'border-primary bg-page text-accent shadow-sm ring-1 ring-primary/20' : 'border-borderline bg-surface text-slate-700 hover:bg-page/80'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
            </div>

            <div className="flex flex-wrap justify-between gap-4 border-t border-borderline bg-primary/5 p-8">
              <Button 
                variant="secondary" 
                type="button" 
                onClick={back} 
                disabled={step === 1}
                className="glass-dark border-none font-bold shadow-sm"
              >
                Previous
              </Button>
              {step < totalSteps ? (
                <Button 
                  type="button" 
                  onClick={next}
                  className="bg-gradient-to-r from-primary to-violet-600 font-bold shadow-lg shadow-primary/25"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={submit} 
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-violet-600 font-bold shadow-lg shadow-primary/25"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Analyzing...
                    </span>
                  ) : (
                    'Finalize Stream'
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}

