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

const ALL_QUIZ_QUESTIONS = [
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
  {
    id: 'q13',
    prompt: 'How do you handle failure or rejection?',
    options: [
      { label: 'I learn from it and try again', points: 2 },
      { label: 'It takes time, but I recover', points: 1 },
      { label: 'I tend to give up or feel very demotivated', points: 0 },
    ],
  },
  {
    id: 'q14',
    prompt: 'Do you enjoy working in teams or prefer working alone?',
    options: [
      { label: 'I enjoy both equally', points: 2 },
      { label: 'I prefer working in teams', points: 1 },
      { label: 'I prefer working alone', points: 1 },
    ],
  },
  {
    id: 'q15',
    prompt: 'How much time can you dedicate daily to self-study or skill-building?',
    options: [
      { label: 'More than 3 hours', points: 2 },
      { label: '1–3 hours', points: 1 },
      { label: 'Less than 1 hour', points: 0 },
    ],
  },
  {
    id: 'q16',
    prompt: 'What motivates you most in your career?',
    options: [
      { label: 'High salary and financial security', points: 2 },
      { label: 'Passion and personal growth', points: 2 },
      { label: 'Social impact and helping others', points: 2 },
    ],
  },
  {
    id: 'q17',
    prompt: 'How do you react when given a complex project with unclear instructions?',
    options: [
      { label: 'I ask questions and plan before starting', points: 2 },
      { label: 'I start and figure it out along the way', points: 1 },
      { label: 'I wait for clearer instructions', points: 0 },
    ],
  },
  {
    id: 'q18',
    prompt: 'How often do you read or research on topics you are curious about?',
    options: [
      { label: 'Regularly — it\'s a habit', points: 2 },
      { label: 'Occasionally when I find something interesting', points: 1 },
      { label: 'Rarely', points: 0 },
    ],
  },
  {
    id: 'q19',
    prompt: 'How important is job security to you compared to salary?',
    options: [
      { label: 'Job security is more important', points: 1 },
      { label: 'Salary is more important', points: 1 },
      { label: 'Both matter equally', points: 2 },
    ],
  },
  {
    id: 'q20',
    prompt: 'How well do you manage your time when given freedom over your schedule?',
    options: [
      { label: 'Very well — I make and follow plans', points: 2 },
      { label: 'Okay — I manage but miss things sometimes', points: 1 },
      { label: 'Poorly — I often waste time', points: 0 },
    ],
  },
  {
    id: 'q21',
    prompt: 'Do you enjoy teaching or explaining things to others?',
    options: [
      { label: 'Yes, I enjoy it and am good at it', points: 2 },
      { label: 'Sometimes, depends on the topic', points: 1 },
      { label: 'Not really', points: 0 },
    ],
  },
  {
    id: 'q22',
    prompt: 'How do you approach a goal that seems too big?',
    options: [
      { label: 'Break it into small milestones', points: 2 },
      { label: 'Focus on the end result and push through', points: 1 },
      { label: 'Feel overwhelmed and delay starting', points: 0 },
    ],
  },
  {
    id: 'q23',
    prompt: 'How comfortable are you with public speaking or presenting?',
    options: [
      { label: 'Very comfortable', points: 2 },
      { label: 'Nervous but I manage', points: 1 },
      { label: 'I avoid it whenever possible', points: 0 },
    ],
  },
  {
    id: 'q24',
    prompt: 'If you discover you made a mistake in your work, what do you do?',
    options: [
      { label: 'Fix it immediately and understand why', points: 2 },
      { label: 'Fix it but move on quickly', points: 1 },
      { label: 'Hope no one notices', points: 0 },
    ],
  },
  {
    id: 'q25',
    prompt: 'How do you feel about learning new technical skills (coding, data, design tools)?',
    options: [
      { label: 'Excited — I enjoy picking up new tools', points: 2 },
      { label: 'Open to it if required', points: 1 },
      { label: 'Prefer not to unless necessary', points: 0 },
    ],
  },
  {
    id: 'q26',
    prompt: 'How would you describe your attitude toward feedback and criticism?',
    options: [
      { label: 'I welcome it as a way to improve', points: 2 },
      { label: 'I accept it but it takes me a while', points: 1 },
      { label: 'I find it hard to accept criticism', points: 0 },
    ],
  },
  {
    id: 'q27',
    prompt: 'How would you rate your ability to stay focused without external supervision?',
    options: [
      { label: 'High — I am self-driven', points: 2 },
      { label: 'Medium — I need reminders', points: 1 },
      { label: 'Low — I need constant supervision', points: 0 },
    ],
  },
  {
    id: 'q28',
    prompt: 'Which of these best describes your learning style?',
    options: [
      { label: 'Visual (videos, diagrams)', points: 2 },
      { label: 'Hands-on (practice, labs)', points: 2 },
      { label: 'Reading (books, articles)', points: 2 },
    ],
  },
  {
    id: 'q29',
    prompt: 'How do you typically spend your free time?',
    options: [
      { label: 'Building something, learning, or exploring ideas', points: 2 },
      { label: 'Social media, gaming, entertainment', points: 1 },
      { label: 'Mostly idle or undecided', points: 0 },
    ],
  },
  {
    id: 'q30',
    prompt: 'How prepared do you feel for your chosen career path right now?',
    options: [
      { label: 'Well prepared — I have a clear plan', points: 2 },
      { label: 'Somewhat prepared — still figuring things out', points: 1 },
      { label: 'Not prepared — I have no idea what to do', points: 0 },
    ],
  },
]

// Questions are picked and shuffled in the component's useEffect

const STREAMS = [
  { id: 'SCIENCE_PCM', label: 'Science — PCM', icon: '🔬', desc: 'Physics, Chemistry, Maths' },
  { id: 'SCIENCE_PCB', label: 'Science — PCB', icon: '🧬', desc: 'Physics, Chemistry, Biology' },
  { id: 'SCIENCE_PCMB', label: 'Science — PCMB', icon: '⚗️', desc: 'Physics, Chemistry, Maths & Biology' },
  { id: 'COMMERCE', label: 'Commerce', icon: '📊', desc: 'Accountancy, Business Studies, Economics' },
  { id: 'COMMERCE_MATHS', label: 'Commerce with Maths', icon: '📈', desc: 'Commerce + Mathematics' },
  { id: 'ARTS', label: 'Arts / Humanities', icon: '🎨', desc: 'History, Geography, Political Science' },
  { id: 'VOCATIONAL', label: 'Vocational / Diploma', icon: '🛠️', desc: 'ITI, Polytechnic, Skill-based courses' },
  { id: 'AGRICULTURE', label: 'Agriculture', icon: '🌾', desc: 'Agricultural Sciences & rural studies' },
  { id: 'FINE_ARTS', label: 'Fine Arts / Design', icon: '🖌️', desc: 'Visual arts, performing arts, design' },
  { id: 'HOME_SCIENCE', label: 'Home Science', icon: '🏡', desc: 'Nutrition, Child Development, Textiles' },
  { id: 'CUSTOM', label: 'Custom / Other', icon: '✏️', desc: 'Type your own stream or field' },
]

const INTERESTS = [
  'Engineering', 'Medicine', 'Research', 'Computer Science', 'Design',
  'Business', 'Finance', 'Law', 'Psychology', 'Media',
  'Government Exams', 'Entrepreneurship', 'Architecture', 'Defence',
  'Sports & fitness', 'Teaching', 'Environment / sustainability',
  'Art / music', 'Content creation', 'Data & analytics', 'Cybersecurity',
  'Hospitality & tourism', 'International studies',
]

const STREAM_RECOMMENDATIONS = {
  SCIENCE_PCM: {
    interests: ['Engineering', 'Computer Science', 'Research', 'Data & analytics', 'Cybersecurity', 'Defence', 'Architecture'],
    aptitude: ['Numbers & logic', 'Problem solving', 'Hands-on building', 'Research mindset', 'Attention to detail']
  },
  SCIENCE_PCB: {
    interests: ['Medicine', 'Research', 'Psychology', 'Environment / sustainability', 'Teaching'],
    aptitude: ['Biology / health', 'Research mindset', 'People & empathy', 'Attention to detail', 'Discipline & consistency']
  },
  SCIENCE_PCMB: {
    interests: ['Engineering', 'Medicine', 'Research', 'Computer Science', 'Data & analytics'],
    aptitude: ['Numbers & logic', 'Biology / health', 'Problem solving', 'Research mindset', 'Attention to detail']
  },
  COMMERCE: {
    interests: ['Business', 'Finance', 'Entrepreneurship', 'Data & analytics', 'Law', 'Hospitality & tourism'],
    aptitude: ['Numbers & logic', 'Communication', 'Leadership', 'Presentation & persuasion', 'Attention to detail']
  },
  COMMERCE_MATHS: {
    interests: ['Finance', 'Data & analytics', 'Business', 'Entrepreneurship', 'Research'],
    aptitude: ['Numbers & logic', 'Problem solving', 'Attention to detail', 'Leadership', 'Communication']
  },
  ARTS: {
    interests: ['Law', 'Psychology', 'Media', 'Teaching', 'International studies', 'Art / music', 'Content creation'],
    aptitude: ['Communication', 'Writing & expression', 'Creativity & visuals', 'Presentation & persuasion', 'People & empathy']
  },
  AGRICULTURE: {
    interests: ['Environment / sustainability', 'Research', 'Business', 'Teaching', 'Government Exams', 'Engineering'],
    aptitude: ['Hands-on building', 'Problem solving', 'Biology / health', 'Research mindset', 'Discipline & consistency']
  },
  FINE_ARTS: {
    interests: ['Design', 'Art / music', 'Content creation', 'Architecture', 'Media'],
    aptitude: ['Creativity & visuals', 'Hands-on building', 'Writing & expression', 'Communication', 'Attention to detail']
  },
  HOME_SCIENCE: {
    interests: ['Psychology', 'Teaching', 'Hospitality & tourism', 'Art / music', 'Design'],
    aptitude: ['People & empathy', 'Creativity & visuals', 'Teamwork', 'Communication', 'Writing & expression']
  },
  VOCATIONAL: {
    interests: ['Engineering', 'Design', 'Hospitality & tourism', 'Cybersecurity', 'Content creation'],
    aptitude: ['Hands-on building', 'Problem solving', 'Communication', 'Teamwork', 'Discipline & consistency']
  }
}

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

const BUDGET_OPTIONS = [
  { id: 'Low', label: 'Low', icon: '📉', desc: 'Govt / Budget Private' },
  { id: 'Medium', label: 'Medium', icon: '📊', desc: 'Standard Universities' },
  { id: 'High', label: 'High', icon: '💎', desc: 'Premium Institutions' },
  { id: 'Not sure', label: 'Not sure', icon: '❓', desc: 'Decide later' },
]

const LOCATION_OPTIONS = [
  { id: 'Same city', label: 'Same city', icon: '🏠', desc: 'Stay close to home' },
  { id: 'Same state', label: 'Same state', icon: '🗺️', desc: 'Within your region' },
  { id: 'Anywhere in India', label: 'Anywhere in India', icon: '🇮🇳', desc: 'Best college anywhere' },
  { id: 'Not sure', label: 'Not sure', icon: '🌍', desc: 'No preference' },
]

const READINESS_OPTIONS = [
  { id: 'Not started', label: 'Not started', icon: '🌱', desc: 'Just exploring' },
  { id: 'Basic started', label: 'Basic started', icon: '🌿', desc: 'Learning fundamentals' },
  { id: 'Regular preparation', label: 'Regular preparation', icon: '🌳', desc: 'Active study/coaching' },
  { id: 'Already giving mocks', label: 'Already giving mocks', icon: '🏆', desc: 'Ready for the exam' },
]

const CATEGORY_OPTIONS = [
  { id: 'GENERAL', label: 'General', icon: '👤' },
  { id: 'OBC', label: 'OBC', icon: '👥' },
  { id: 'SCST', label: 'SC / ST', icon: '👥' },
]

function clampPct(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, n))
}

function computeQuiz(answers, questions) {
  if (!questions || questions.length === 0) return { score: 0, total: 0, percent: 0, band: 'N/A' }
  const total = questions.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.points)), 0)
  const score = questions.reduce((sum, q) => {
    const selectedLabel = answers?.[q.id]
    const option = q.options.find(o => o.label === selectedLabel)
    return sum + (option ? option.points : 0)
  }, 0)
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
    const fetchDynamicQuestions = async () => {
      try {
        const { data } = await api.get('/api/assessment/questions?type=AFTER12')
        if (data && Array.isArray(data) && data.length > 0) {
          const processed = data.map(q => ({
            ...q,
            options: shuffleArray(q.options || [])
          }))
          setShuffledQuiz(processed)
        } else {
          throw new Error('Empty questions data')
        }
      } catch (err) {
        console.warn('Using static quiz fallback:', err.message)
        // Pick 12 random questions from the full 30-question bank
        const shuffledAll = shuffleArray([...ALL_QUIZ_QUESTIONS])
        const picked12 = shuffledAll.slice(0, 12).map((q) => ({
          ...q,
          options: shuffleArray(q.options),
        }))
        setShuffledQuiz(picked12)
      }
    }
    fetchDynamicQuestions()
  }, [])
  const [stream, setStream] = useState('SCIENCE_PCM')
  const [customStream, setCustomStream] = useState('')
  const [customInterest, setCustomInterest] = useState('')
  const [customAptitude, setCustomAptitude] = useState('')
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
      if (quizIndex < shuffledQuiz.length - 1) {
        setQuizIndex((v) => v + 1)
        return
      }
    }
    if (step === 2) {
      if (!stream) {
        setError('Select your stream.')
        return
      }
      if (stream === 'CUSTOM' && !customStream.trim()) {
        setError('Please describe your custom stream.')
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

  const recInterests = STREAM_RECOMMENDATIONS[stream]?.interests || []
  const recAptitude = STREAM_RECOMMENDATIONS[stream]?.aptitude || []

  const payload = useMemo(() => {
    const quiz = computeQuiz(quizAnswers, shuffledQuiz)
    return {
      quiz,
      stream: stream === 'CUSTOM' ? customStream : stream,
      customStream,
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
  }, [quizAnswers, stream, customStream, percentage, interests, aptitudeTags, workPreference, budget, locationFlexibility, preferredCity, preferredState, category, examReadiness])

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/predict-after12-career', payload)
      const merged = {
        ...data,
        quiz: payload.quiz,
        assessmentInputs: {
          ...payload,
          locationFlexibility,
        },
      }
      try {
        localStorage.setItem(AFTER12_LAST_PREDICTION_KEY, JSON.stringify(merged))
        // Save for roadmap
        localStorage.setItem('careermatrix_last_interests', JSON.stringify(interests))
        localStorage.setItem('careermatrix_last_skills', JSON.stringify(aptitudeTags))
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
                                const reshuffledAll = shuffleArray([...ALL_QUIZ_QUESTIONS])
                                const newPicked12 = reshuffledAll.slice(0, 12).map((q) => ({
                                  ...q,
                                  options: shuffleArray(q.options),
                                }))
                                setShuffledQuiz(newPicked12)
                              }}
                              className="text-xs font-semibold text-slate-600 underline-offset-4 hover:underline"
                            >
                              Reset quiz
                            </button>
                          </div>

                          <p className="mt-3 text-sm font-semibold text-accent">{q.prompt}</p>

                          <div className="mt-4 grid gap-2">
                            {q.options.map((opt) => {
                              const active = quizAnswers?.[q.id] === opt.label
                              return (
                                <button
                                  key={opt.label}
                                  type="button"
                                  onClick={() => {
                                    setError('')
                                    setQuizAnswers((prev) => ({ ...prev, [q.id]: opt.label }))
                                  }}
                                  className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all duration-300 ${active
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
                              {quizIndex < shuffledQuiz.length - 1 ? 'Next question' : 'Finish quiz'}
                            </Button>
                          </div>
                        </div>
                      )
                    })()}

                    <div className="rounded-2xl border border-primary/20 bg-page/70 px-4 py-3">
                      {(() => {
                        const q = computeQuiz(quizAnswers, shuffledQuiz)
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
                      <p className="mt-1 text-xs" style={{ color: '#64748b' }}>Choose the stream you studied in Class 12.</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {STREAMS.map((s) => {
                          const active = stream === s.id
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setStream(s.id)}
                              className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-300 ${active
                                ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                : 'border-borderline bg-surface text-accent hover:border-primary/30 hover:bg-page/20'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{s.icon}</span>
                                <div>
                                  <div className="font-bold text-sm">{s.label}</div>
                                  <div className={`text-[11px] mt-0.5 ${active ? 'text-white/70' : 'text-muted'}`}>{s.desc}</div>
                                </div>
                              </div>
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

                    {/* Custom stream input */}
                    {stream === 'CUSTOM' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 rounded-2xl border p-4"
                        style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)' }}
                      >
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#818cf8' }}>✏️ Describe your stream / field *</p>
                        <input
                          type="text"
                          placeholder="e.g. Fashion Design, Aviation, Culinary Arts, Animation, Hotel Management…"
                          className="w-full rounded-xl border border-borderline bg-surface px-4 py-3 text-sm font-medium text-accent transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                          value={customStream}
                          onChange={(e) => setCustomStream(e.target.value)}
                        />
                        <p className="mt-2 text-xs" style={{ color: '#64748b' }}>AI will generate personalised career paths and skill roadmaps for your exact field.</p>
                      </motion.div>
                    )}
                  </motion.section>
                )}

              {step === 3 && (
                <motion.section key="a2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <h2 className="font-display text-lg font-semibold text-accent">Interests</h2>
                  <p className="mt-1 text-sm text-slate-600">Pick what you feel excited to build a career in.</p>

                  {recInterests.length > 0 && (
                    <div className="mt-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-xs">✨</span>
                        Recommended for your stream
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recInterests.map((it) => {
                          const active = interests.includes(it)
                          return (
                            <button
                              key={it}
                              type="button"
                              onClick={() => toggleInterest(it)}
                              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                active
                                  ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                  : 'border-primary/20 bg-primary/5 text-accent hover:border-primary/40 hover:bg-primary/10'
                              }`}
                            >
                              {it}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    {recInterests.length > 0 && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">All Interests</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.filter(it => !recInterests.includes(it)).map((it) => {
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
                  </div>

                  {/* Custom interest input */}
                  <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#818cf8' }}>✏️ Add your own career interest</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Fashion Design, Animation, Journalism, Pilot…"
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
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                      >
                        + Add
                      </button>
                    </div>
                    <p className="mt-2 text-xs" style={{ color: '#475569' }}>Press Enter or click Add. Your custom interests appear as pink tags above.</p>
                  </div>
                </motion.section>
              )}

              {step === 4 && (
                <motion.section key="a3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Aptitude signals</h2>
                    <p className="mt-1 text-sm text-slate-600">Pick what fits you best (choose multiple).</p>

                    {recAptitude.length > 0 && (
                      <div className="mt-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-xs">⚡</span>
                          Recommended for your stream
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recAptitude.map((t) => {
                            const active = aptitudeTags.includes(t)
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => toggleAptitude(t)}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                  active
                                    ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                    : 'border-primary/20 bg-primary/5 text-accent hover:border-primary/40 hover:bg-primary/10'
                                }`}
                              >
                                {t}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      {recAptitude.length > 0 && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">All Aptitudes</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {APTITUDE_TAGS.filter(t => !recAptitude.includes(t)).map((t) => {
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
                    </div>
                  </div>

                  {/* Custom aptitude input */}
                  <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: 'rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.05)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#22d3ee' }}>⚡ Add your own skill or aptitude</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Video Editing, Event Planning, Public Speaking…"
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
                    <p className="mt-2 text-xs" style={{ color: '#475569' }}>Press Enter or click Add. Custom skills appear as cyan tags above.</p>
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
                  <motion.section key="a4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-lg">💰</span>
                        <div>
                          <h2 className="font-display text-lg font-semibold text-accent">Financial Budget</h2>
                          <p className="text-xs text-slate-500">Helps us shortlist colleges within your reachable fee range.</p>
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {BUDGET_OPTIONS.map((b) => {
                          const active = budget === b.id
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setBudget(b.id)}
                              className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 ${active
                                ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                : 'border-borderline bg-surface text-accent hover:border-primary/30 hover:bg-page/20'
                                }`}
                            >
                              <span className="text-2xl">{b.icon}</span>
                              <div className="space-y-0.5">
                                <div className="text-sm font-bold">{b.label}</div>
                                <div className={`text-[10px] ${active ? 'text-white/70' : 'text-muted'}`}>{b.desc}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-lg">📍</span>
                        <div>
                          <h2 className="font-display text-lg font-semibold text-accent">Location Preference</h2>
                          <p className="text-xs text-slate-500">Where would you prefer to spend the next 3-4 years?</p>
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {LOCATION_OPTIONS.map((l) => {
                          const active = locationFlexibility === l.id
                          return (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => setLocationFlexibility(l.id)}
                              className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 ${active
                                ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                : 'border-borderline bg-surface text-accent hover:border-primary/30 hover:bg-page/20'
                                }`}
                            >
                              <span className="text-2xl">{l.icon}</span>
                              <div className="space-y-0.5">
                                <div className="text-sm font-bold">{l.label}</div>
                                <div className={`text-[10px] ${active ? 'text-white/70' : 'text-muted'}`}>{l.desc}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {locationFlexibility === 'Same city' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">Target City</span>
                            <input
                              type="text"
                              placeholder="Enter your city (e.g. Mumbai, Bengaluru)..."
                              className="mt-2 w-full rounded-xl border border-borderline bg-surface px-4 py-3 text-sm font-medium text-accent shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                              value={preferredCity}
                              onChange={(e) => setPreferredCity(e.target.value)}
                            />
                          </label>
                        </motion.div>
                      )}

                      {locationFlexibility === 'Same state' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">Target State</span>
                            <input
                              type="text"
                              placeholder="Enter your state (e.g. Karnataka, Delhi)..."
                              className="mt-2 w-full rounded-xl border border-borderline bg-surface px-4 py-3 text-sm font-medium text-accent shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                              value={preferredState}
                              onChange={(e) => setPreferredState(e.target.value)}
                            />
                          </label>
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-lg">📚</span>
                        <div>
                          <h2 className="font-display text-lg font-semibold text-accent">Entrance Exam Readiness</h2>
                          <p className="text-xs text-slate-500">Your current preparation level for competitive exams.</p>
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {READINESS_OPTIONS.map((r) => {
                          const active = examReadiness === r.id
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setExamReadiness(r.id)}
                              className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 ${active
                                ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                : 'border-borderline bg-surface text-accent hover:border-primary/30 hover:bg-page/20'
                                }`}
                            >
                              <span className="text-2xl">{r.icon}</span>
                              <div className="space-y-0.5">
                                <div className="text-sm font-bold">{r.label}</div>
                                <div className={`text-[10px] ${active ? 'text-white/70' : 'text-muted'}`}>{r.desc}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-lg">👤</span>
                        <div>
                          <h2 className="font-display text-lg font-semibold text-accent">Reservation Category</h2>
                          <p className="text-xs text-slate-500">Ensures accurate mapping to government college seat cutoffs.</p>
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        {CATEGORY_OPTIONS.map((c) => {
                          const active = category === c.id
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setCategory(c.id)}
                              className={`group relative flex items-center justify-center gap-3 rounded-2xl border p-4 text-center transition-all duration-300 ${active
                                ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                : 'border-borderline bg-surface text-accent hover:border-primary/30 hover:bg-page/20'
                                }`}
                            >
                              <span className="text-xl">{c.icon}</span>
                              <div className="text-sm font-bold">{c.label}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.section>
                )}
    </AnimatePresence>
            </div >

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
          </Card >
        </div >
      </div >
    </PageTransition >
  )
}

