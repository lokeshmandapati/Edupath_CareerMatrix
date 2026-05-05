import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import Button from '../components/Button'
import StepIndicator from '../components/StepIndicator'
import { api } from '../services/api'
import { AFTER12_LAST_PREDICTION_KEY } from '../constants/storageKeys'

const STEP_LABELS = ['Quick quiz', 'Stream & academics', 'Interests', 'Aptitude & preference', 'Constraints']

const stepVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.2 } },
}

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    prompt: 'When you start something new, how do you prefer to learn?',
    options: [
      { label: 'By watching/reading a complete overview first', points: 2 },
      { label: 'By trying small examples and experimenting', points: 1 },
      { label: 'I usually wait for someone to guide me step-by-step', points: 0 },
    ],
  },
  {
    id: 'q2',
    prompt: 'How comfortable are you with problem-solving under time pressure?',
    options: [
      { label: 'Comfortable — I can stay calm and work logically', points: 2 },
      { label: 'Sometimes okay, sometimes I get stuck', points: 1 },
      { label: 'Not comfortable — I panic quickly', points: 0 },
    ],
  },
  {
    id: 'q3',
    prompt: 'How often do you finish tasks you start (studies/projects)?',
    options: [
      { label: 'Most of the time', points: 2 },
      { label: 'About half the time', points: 1 },
      { label: 'Rarely', points: 0 },
    ],
  },
  {
    id: 'q4',
    prompt: 'Which sounds most like you?',
    options: [
      { label: 'I like structured plans and clear steps', points: 2 },
      { label: 'I can work with structure or flexibility', points: 1 },
      { label: 'I prefer no structure; I decide on the go', points: 0 },
    ],
  },
  {
    id: 'q5',
    prompt: 'How strong is your communication (explaining ideas to others)?',
    options: [
      { label: 'Strong — I can explain clearly', points: 2 },
      { label: 'Average — I can explain with some effort', points: 1 },
      { label: 'Weak — I struggle to explain', points: 0 },
    ],
  },
  {
    id: 'q6',
    prompt: 'When a topic is difficult, what do you do?',
    options: [
      { label: 'Break it into parts and keep trying', points: 2 },
      { label: 'Try for a while, then move on', points: 1 },
      { label: 'Avoid it / postpone it', points: 0 },
    ],
  },
  {
    id: 'q7',
    prompt: 'How do you feel about competitive exams (JEE/NEET/CUET/etc.)?',
    options: [
      { label: 'Ready to prepare seriously', points: 2 },
      { label: 'Not sure yet, but open to it', points: 1 },
      { label: 'I want to avoid them if possible', points: 0 },
    ],
  },
  {
    id: 'q8',
    prompt: 'How comfortable are you using technology/tools (apps, spreadsheets, AI tools)?',
    options: [
      { label: 'Very comfortable', points: 2 },
      { label: 'Somewhat comfortable', points: 1 },
      { label: 'Not comfortable', points: 0 },
    ],
  },
  {
    id: 'q9',
    prompt: 'If you had to choose one, what do you enjoy more?',
    options: [
      { label: 'Solving logical/number-based questions', points: 2 },
      { label: 'Creative work (design/writing/ideas)', points: 2 },
      { label: 'Helping/working with people', points: 2 },
    ],
  },
  {
    id: 'q10',
    prompt: 'How consistent can you be for 6–12 months of learning?',
    options: [
      { label: 'Very consistent', points: 2 },
      { label: 'Somewhat consistent', points: 1 },
      { label: 'Not consistent', points: 0 },
    ],
  },
  {
    id: 'q11',
    prompt: 'How comfortable are you with taking decisions (career choices) yourself?',
    options: [
      { label: 'Comfortable — I can decide with research', points: 2 },
      { label: 'Somewhat — I need a little support', points: 1 },
      { label: 'Not comfortable — I need someone else to decide', points: 0 },
    ],
  },
  {
    id: 'q12',
    prompt: 'How confident are you about your fundamentals (math/english/science basics)?',
    options: [
      { label: 'Confident', points: 2 },
      { label: 'Average', points: 1 },
      { label: 'Not confident', points: 0 },
    ],
  },
]

const STREAMS = [
  { id: 'SCIENCE', label: 'Science (PCM/PCB)' },
  { id: 'COMMERCE', label: 'Commerce' },
  { id: 'ARTS', label: 'Arts / Humanities' },
]

const INTERESTS = [
  'Engineering',
  'Medicine',
  'Research',
  'Computer Science',
  'Design',
  'Business',
  'Finance',
  'Law',
  'Psychology',
  'Media',
  'Government Exams',
  'Entrepreneurship',
  'Architecture',
  'Defence',
  'Sports & fitness',
  'Teaching',
  'Environment / sustainability',
  'Art / music',
  'Content creation',
  'Data & analytics',
  'Cybersecurity',
  'Hospitality & tourism',
  'International studies',
]

const APTITUDE_TAGS = [
  'Numbers & logic',
  'Communication',
  'People & empathy',
  'Biology / health',
  'Creativity & visuals',
  'Problem solving',
  'Leadership',
  'Research mindset',
  'Writing & expression',
  'Attention to detail',
  'Presentation & persuasion',
  'Hands-on building',
  'Discipline & consistency',
  'Teamwork',
]

const WORK_PREFERENCES = ['Stable / government', 'Startup / fast-paced', 'Research / academics', 'Not sure yet']

const BUDGETS = ['Low', 'Medium', 'High', 'Not sure']
const LOCATIONS = ['Same city', 'Same state', 'Anywhere in India', 'Not sure']
const EXAM_READINESS = ['Not started', 'Basic started', 'Regular preparation', 'Already giving mocks']

const CITY_OPTIONS = ['Delhi', 'Mumbai', 'Bengaluru', 'Chandigarh', 'Not sure']
const STATE_OPTIONS = ['Delhi', 'Maharashtra', 'Karnataka', 'Punjab', 'Not sure']
const CATEGORY_OPTIONS = [
  { id: 'GENERAL', label: 'General' },
  { id: 'OBC', label: 'OBC' },
  { id: 'SCST', label: 'SC / ST' },
]

function clampPct(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, n))
}

function computeQuiz(answers) {
  const total = QUIZ_QUESTIONS.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.points)), 0)
  const score = QUIZ_QUESTIONS.reduce((sum, q) => sum + (Number(answers?.[q.id]) || 0), 0)
  const percent = total > 0 ? Math.round((score / total) * 100) : 0
  const band = percent >= 75 ? 'Strong fit' : percent >= 50 ? 'Moderate fit' : 'Needs improvement'
  return { score, total, percent, band }
}

function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function After12Form() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizIndex, setQuizIndex] = useState(0)
  const [shuffledQuiz, setShuffledQuiz] = useState([])

  useEffect(() => {
    const shuffled = QUIZ_QUESTIONS.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }))
    setShuffledQuiz(shuffleArray(shuffled))
  }, [])
  const [stream, setStream] = useState('SCIENCE')
  const [percentage, setPercentage] = useState('80')
  const [interests, setInterests] = useState([])
  const [aptitudeTags, setAptitudeTags] = useState([])
  const [workPreference, setWorkPreference] = useState('Not sure yet')
  const [budget, setBudget] = useState('Not sure')
  const [locationFlexibility, setLocationFlexibility] = useState('Not sure')
  const [preferredCity, setPreferredCity] = useState('Not sure')
  const [preferredState, setPreferredState] = useState('Not sure')
  const [category, setCategory] = useState('GENERAL')
  const [examReadiness, setExamReadiness] = useState('Not started')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const totalSteps = 5

  const back = () => setStep((v) => Math.max(1, v - 1))
  const next = () => {
    setError('')
    if (step === 1) {
      const current = shuffledQuiz[quizIndex]
      if (current && quizAnswers?.[current.id] == null) {
        setError('Please select one option to continue.')
        return
      }
      if (quizIndex < QUIZ_QUESTIONS.length - 1) {
        setQuizIndex((v) => v + 1)
        return
      }
    }
    if (step === 2) {
      if (!stream) {
        setError('Select your stream.')
        return
      }
      if (clampPct(percentage) <= 0) {
        setError('Enter your Class 12 percentage (0–100).')
        return
      }
    }
    if (step === 3 && interests.length === 0) {
      setError('Select at least one interest.')
      return
    }
    if (step === 4 && aptitudeTags.length === 0) {
      setError('Select at least one aptitude tag.')
      return
    }
    setStep((v) => Math.min(totalSteps, v + 1))
  }

  const toggleInterest = (label) => {
    setInterests((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
  }

  const toggleAptitude = (label) => {
    setAptitudeTags((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
  }

  const payload = useMemo(() => {
    const quiz = computeQuiz(quizAnswers)
    return {
      quiz,
      stream,
      percentage: clampPct(percentage),
      interests,
      aptitudeTags,
      workPreference,
      budget,
      locationFlexibility,
      preferredCity: preferredCity === 'Not sure' ? '' : preferredCity,
      preferredState: preferredState === 'Not sure' ? '' : preferredState,
      category,
      examReadiness,
    }
  }, [quizAnswers, stream, percentage, interests, aptitudeTags, workPreference, budget, locationFlexibility, preferredCity, preferredState, category, examReadiness])

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/predict-after12-career', payload)
      const merged = {
        ...data,
        quiz: payload.quiz,
        assessmentInputs: {
          locationFlexibility,
          preferredCity: payload.preferredCity,
          preferredState: payload.preferredState,
          category: payload.category,
        },
      }
      try {
        localStorage.setItem(AFTER12_LAST_PREDICTION_KEY, JSON.stringify(merged))
      } catch {
        /* ignore */
      }
      navigate('/assessment/after12/results', { state: merged, replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Prediction failed'
      setError(typeof msg === 'string' ? msg : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="mesh-gradient min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase ring-1 ring-primary/20"
            >
              Higher Education Path
            </motion.div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
              Post-12th <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Assessment</span>
            </h1>
            <p className="mt-3 text-lg font-medium text-muted">
              Discover degrees and career directions that match your academic background and professional goals.
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
                <motion.section key="quiz" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Quick quiz (12 questions)</h2>
                    <p className="mt-1 text-sm text-slate-600">This decides your assessment result level (strong / moderate / needs improvement).</p>
                  </div>

                  {(() => {
                    const q = shuffledQuiz[quizIndex]
                    if (!q) return null
                    return (
                      <div className="rounded-2xl border border-borderline bg-surface p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-accent">
                            Question {quizIndex + 1} of {shuffledQuiz.length}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setError('')
                              setQuizAnswers({})
                              setQuizIndex(0)
                              const reshuffled = QUIZ_QUESTIONS.map((q) => ({
                                ...q,
                                options: shuffleArray(q.options),
                              }))
                              setShuffledQuiz(shuffleArray(reshuffled))
                            }}
                            className="text-xs font-semibold text-slate-600 underline-offset-4 hover:underline"
                          >
                            Reset quiz
                          </button>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-accent">{q.prompt}</p>

                        <div className="mt-4 grid gap-2">
                          {q.options.map((opt) => {
                            const active = Number(quizAnswers?.[q.id]) === opt.points
                            return (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => {
                                  setError('')
                                  setQuizAnswers((prev) => ({ ...prev, [q.id]: opt.points }))
                                }}
                                className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all duration-300 ${
                                  active
                                    ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                    : 'border-borderline bg-surface text-accent hover:border-primary/30 hover:bg-page/20'
                                }`}
                              >
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={() => {
                              setError('')
                              setQuizIndex((v) => Math.max(0, v - 1))
                            }}
                            disabled={quizIndex === 0}
                          >
                            Previous question
                          </Button>
                          <Button type="button" onClick={next}>
                            {quizIndex < QUIZ_QUESTIONS.length - 1 ? 'Next question' : 'Finish quiz'}
                          </Button>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="rounded-2xl border border-primary/20 bg-page/70 px-4 py-3">
                    {(() => {
                      const q = computeQuiz(quizAnswers)
                      return (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="font-semibold text-accent">
                            Current score: {q.score}/{q.total} ({q.percent}%)
                          </span>
                          <span className="text-slate-600">
                            Result level: <span className="font-semibold text-accent">{q.band}</span>
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                </motion.section>
              )}

              {step === 2 && (
                <motion.section key="a1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Select your stream</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {STREAMS.map((s) => {
                        const active = stream === s.id
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setStream(s.id)}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-300 ${
                              active
                                ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                : 'border-borderline bg-surface text-accent hover:border-primary/30 hover:bg-page/20'
                            }`}
                          >
                            {s.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Class 12 percentage (0–100)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="mt-2 w-full rounded-xl border border-borderline bg-surface px-4 py-3 text-base font-medium text-accent shadow-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                    />
                  </label>
                </motion.section>
              )}

              {step === 3 && (
                <motion.section key="a2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <h2 className="font-display text-lg font-semibold text-accent">Interests</h2>
                  <p className="mt-1 text-sm text-slate-600">Pick what you feel excited to build a career in.</p>

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
                  </div>
                </motion.section>
              )}

              {step === 4 && (
                <motion.section key="a3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Aptitude signals</h2>
                    <p className="mt-1 text-sm text-slate-600">Pick what fits you best (choose multiple).</p>
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
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Work preference</h2>
                    <p className="mt-1 text-sm text-slate-600">Which environment sounds better right now?</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {WORK_PREFERENCES.map((p) => {
                        const active = workPreference === p
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setWorkPreference(p)}
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

              {step === 5 && (
                <motion.section key="a4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Budget</h2>
                    <p className="mt-1 text-sm text-slate-600">This helps shortlist realistic college paths.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {BUDGETS.map((b) => {
                        const active = budget === b
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBudget(b)}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                              active ? 'border-primary bg-page text-accent shadow-sm ring-1 ring-primary/20' : 'border-borderline bg-surface text-slate-700 hover:bg-page/80'
                            }`}
                          >
                            {b}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Location flexibility</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {LOCATIONS.map((l) => {
                        const active = locationFlexibility === l
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setLocationFlexibility(l)}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                              active ? 'border-primary bg-page text-accent shadow-sm ring-1 ring-primary/20' : 'border-borderline bg-surface text-slate-700 hover:bg-page/80'
                            }`}
                          >
                            {l}
                          </button>
                        )
                      })}
                    </div>

                    {locationFlexibility === 'Same city' && (
                      <label className="mt-5 block">
                        <span className="text-sm font-medium text-slate-700">Choose your city</span>
                        <select
                          className="mt-2 w-full rounded-xl border border-borderline bg-surface px-4 py-3 text-sm font-medium text-accent shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                          value={preferredCity}
                          onChange={(e) => setPreferredCity(e.target.value)}
                        >
                          {CITY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    {locationFlexibility === 'Same state' && (
                      <label className="mt-5 block">
                        <span className="text-sm font-medium text-slate-700">Choose your state</span>
                        <select
                          className="mt-2 w-full rounded-xl border border-borderline bg-surface px-4 py-3 text-sm font-medium text-accent shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                          value={preferredState}
                          onChange={(e) => setPreferredState(e.target.value)}
                        >
                          {STATE_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Exam readiness</h2>
                    <p className="mt-1 text-sm text-slate-600">How prepared are you right now?</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {EXAM_READINESS.map((r) => {
                        const active = examReadiness === r
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setExamReadiness(r)}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                              active ? 'border-primary bg-page text-accent shadow-sm ring-1 ring-primary/20' : 'border-borderline bg-surface text-slate-700 hover:bg-page/80'
                            }`}
                          >
                            {r}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Category</h2>
                    <p className="mt-1 text-sm text-slate-600">Used to show category-wise college cutoffs.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map((c) => {
                        const active = category === c.id
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCategory(c.id)}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                              active ? 'border-primary bg-page text-accent shadow-sm ring-1 ring-primary/20' : 'border-borderline bg-surface text-slate-700 hover:bg-page/80'
                            }`}
                          >
                            {c.label}
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
                disabled={step === 1 && quizIndex === 0}
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
                    'Finalize Path'
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

