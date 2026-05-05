import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'
import StepIndicator from '../components/StepIndicator'
import Button from '../components/Button'
import Card from '../components/Card'
import PageTransition from '../components/PageTransition'
import SkillInterestPicker from '../components/SkillInterestPicker'
import {
  STREAMS,
  STREAM_BRANCHES,
  getSkillCategoriesForBranch,
  getInterestCategoriesForBranch,
  getRecommendedSkillLabels,
  getRecommendedInterestLabels,
} from '../data/assessmentOptions'

const PROJECT_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const STEP_LABELS = ['Academic Stream', 'Skills', 'Interests', 'Projects']

const stepVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.2 } },
}

export default function CareerForm() {
  const navigate = useNavigate()
  const { setBranch: setProfileBranch } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedStream, setSelectedStream] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState('')
  const [cgpa, setCgpa] = useState('8.0')
  const [technicalSkills, setTechnicalSkills] = useState([])
  const [interests, setInterests] = useState([])
  const [projectExperience, setProjectExperience] = useState('Intermediate')
  const [certifications, setCertifications] = useState('')
  const [preferredWorkType, setPreferredWorkType] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const skillCategories = useMemo(() => getSkillCategoriesForBranch(selectedBranch), [selectedBranch])
  const interestCategories = useMemo(() => getInterestCategoriesForBranch(selectedBranch), [selectedBranch])
  const recSkills = useMemo(() => getRecommendedSkillLabels(selectedBranch), [selectedBranch])
  const recInterests = useMemo(() => getRecommendedInterestLabels(selectedBranch), [selectedBranch])

  const totalSteps = 4

  const next = () => {
    setError('')
    if (step === 1) {
      if (!selectedStream) {
        setError('Please select your academic stream first')
        return
      }
      if (!selectedBranch) {
        setError('Please select your specific branch/specialization')
        return
      }
    }
    if (step === 2 && technicalSkills.length === 0) {
      setError('Select at least one skill related to your field')
      return
    }
    if (step === 3 && interests.length === 0) {
      setError('Select at least one interest')
      return
    }
    setStep((s) => Math.min(s + 1, totalSteps))
  }

  const back = () => {
    if (step === 1 && selectedStream) {
       setSelectedStream(null)
       setSelectedBranch('')
       return
    }
    setStep((s) => Math.max(s - 1, 1))
  }

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/predict-career', {
        branch: String(selectedBranch).toUpperCase(),
        stream: selectedStream,
        cgpa: parseFloat(cgpa) || 0,
        technicalSkills,
        interests,
        projectExperience,
        certifications: certifications.trim() || null,
        preferredWorkType: preferredWorkType.trim() || null,
      })
      localStorage.setItem('careermatrix_last_prediction', JSON.stringify(data))
      try {
        localStorage.setItem('careermatrix_last_skills', JSON.stringify(technicalSkills))
        localStorage.setItem('careermatrix_last_interests', JSON.stringify(interests))
        if (data.branchCode) {
          localStorage.setItem('careermatrix_branch', data.branchCode)
          setProfileBranch(data.branchCode)
        }
        if (data.branchLabel) localStorage.setItem('careermatrix_branch_label', data.branchLabel)
      } catch {
        /* ignore */
      }
      navigate('/results', { state: data, replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Prediction failed'
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
              Step {step} of {totalSteps}
            </motion.div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
              Career <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Assessment</span>
            </h1>
            <p className="mt-3 text-lg font-medium text-muted">
              Discover your ideal path through data-driven analysis of your skills and interests.
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
                  key="1"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-8"
                >
                  {!selectedStream ? (
                    <div className="space-y-6">
                      <div>
                        <h2 className="font-display text-xl font-bold text-accent">What is your academic stream?</h2>
                        <p className="mt-1 text-sm text-slate-600">Select your broad field of study to get personalized branch options.</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {STREAMS.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedStream(s.id)}
                            className="group flex flex-col items-center gap-4 rounded-3xl border border-borderline bg-surface p-6 text-center transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                          >
                            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-4xl transition-transform group-hover:scale-110">
                              {s.icon}
                            </span>
                            <span className="font-display font-bold text-accent">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="font-display text-xl font-bold text-accent">Select your branch</h2>
                          <p className="mt-1 text-sm text-slate-600">Choose your specific specialization in {STREAMS.find(s => s.id === selectedStream)?.label}.</p>
                        </div>
                        <button 
                          onClick={() => { setSelectedStream(null); setSelectedBranch(''); }}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Change Stream
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(STREAM_BRANCHES[selectedStream] || []).map((b) => {
                          const active = selectedBranch === b.id
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setSelectedBranch(b.id)}
                              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                                active
                                  ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                                  : 'border-borderline bg-surface hover:border-primary/30 hover:bg-page/20'
                              }`}
                            >
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-page text-2xl shadow-inner ring-1 ring-borderline" aria-hidden>
                                {b.icon}
                              </span>
                              <span className="min-w-0">
                                <span className={`block font-semibold ${active ? 'text-white' : 'text-accent'}`}>{b.label}</span>
                                <span className={`text-xs ${active ? 'text-white/85' : 'text-muted'}`}>{b.short}</span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div>
                    <h2 className="font-display text-lg font-semibold text-accent">Academic details</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Enter CGPA (0–10) or percentage — the server normalizes your input.
                    </p>
                    <label className="mt-3 block">
                      <span className="text-sm font-medium text-slate-700">CGPA / Percentage</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="mt-2 w-full rounded-xl border border-borderline bg-surface px-4 py-3.5 text-lg font-medium text-accent shadow-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                      />
                    </label>
                  </div>
                </motion.section>
              )}

              {step === 2 && (
                <motion.section key="2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <h2 className="font-display text-lg font-semibold text-accent">Technical skills</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Branch-relevant skills appear first — suggestions are highlighted for your stream.
                  </p>
                  <div className="mt-5">
                    <SkillInterestPicker
                      mode="skills"
                      categories={skillCategories}
                      selected={technicalSkills}
                      onChange={setTechnicalSkills}
                      placeholder="Search skills (e.g. Python, AWS, Embedded)…"
                      recommendedLabels={recSkills}
                    />
                  </div>
                </motion.section>
              )}

              {step === 3 && (
                <motion.section key="3" variants={stepVariants} initial="initial" animate="animate" exit="exit">
                  <h2 className="font-display text-lg font-semibold text-accent">Interests</h2>
                  <p className="mt-1 text-sm text-slate-600">What excites you professionally? Pick all that apply.</p>
                  <div className="mt-5">
                    <SkillInterestPicker
                      mode="interests"
                      categories={interestCategories}
                      selected={interests}
                      onChange={setInterests}
                      placeholder="Search interests (e.g. AI, IoT, design)…"
                      recommendedLabels={recInterests}
                    />
                  </div>
                </motion.section>
              )}

              {step === 4 && (
                <motion.section
                  key="4"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-5"
                >
                  <h2 className="font-display text-lg font-semibold text-accent">Projects & preferences</h2>
                  <div>
                    <span className="text-sm font-medium text-slate-700">Project experience</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {PROJECT_LEVELS.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setProjectExperience(lvl)}
                          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out ${
                            projectExperience === lvl
                              ? 'border-primary bg-page text-accent shadow-md ring-1 ring-primary/20'
                              : 'border-borderline text-slate-700 hover:bg-page/80'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Certifications (optional)</label>
                    <textarea
                      className="mt-2 w-full rounded-xl border border-borderline bg-surface px-4 py-3 text-sm text-accent shadow-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                      rows={2}
                      placeholder="e.g. AWS Cloud Practitioner"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Preferred work type (optional)</label>
                    <input
                      className="mt-2 w-full rounded-xl border border-borderline bg-surface px-4 py-3 text-sm text-accent shadow-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                      placeholder="Remote, startup, enterprise…"
                      value={preferredWorkType}
                      onChange={(e) => setPreferredWorkType(e.target.value)}
                    />
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
                    'Finalize Results'
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
