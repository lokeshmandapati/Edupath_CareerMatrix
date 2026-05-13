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
  const [dynamicOptions, setDynamicOptions] = useState(null)

  const skillCategories = useMemo(() => {
    if (dynamicOptions?.skills && dynamicOptions.skills.length > 0) {
      return [{
        id: 'ai-skills',
        label: 'AI-Generated Field Skills',
        icon: '✨',
        skills: dynamicOptions.skills.map(s => ({ label: s }))
      }]
    }
    return getSkillCategoriesForBranch(selectedBranch)
  }, [selectedBranch, dynamicOptions])

  const interestCategories = useMemo(() => {
    if (dynamicOptions?.interests && dynamicOptions.interests.length > 0) {
      return [{
        id: 'ai-interests',
        label: 'AI-Generated Interests',
        icon: '✨',
        interests: dynamicOptions.interests.map(i => ({ label: i }))
      }]
    }
    return getInterestCategoriesForBranch(selectedBranch)
  }, [selectedBranch, dynamicOptions])

  const recSkills = useMemo(() => {
    if (dynamicOptions?.skills && dynamicOptions.skills.length > 0) return dynamicOptions.skills;
    return getRecommendedSkillLabels(selectedBranch)
  }, [selectedBranch, dynamicOptions])

  const recInterests = useMemo(() => {
    if (dynamicOptions?.interests && dynamicOptions.interests.length > 0) return dynamicOptions.interests;
    return getRecommendedInterestLabels(selectedBranch)
  }, [selectedBranch, dynamicOptions])

  const totalSteps = 4

  const next = async () => {
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
      
      // Fetch dynamic options for ANY selected branch to provide AI-integrated skills/interests
      if (selectedBranch && !dynamicOptions) {
        setLoading(true)
        try {
          const { data } = await api.get(`/api/options/dynamic?stream=${encodeURIComponent(selectedBranch)}`)
          setDynamicOptions(data)
        } catch (err) {
          console.error("Failed to fetch dynamic options:", err)
          setDynamicOptions({ skills: [], interests: [] })
        } finally {
          setLoading(false)
        }
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
      <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">

        <div className="mx-auto max-w-4xl space-y-8">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 px-5 py-2 text-xs font-bold tracking-widest text-primary uppercase shadow-inner"
            >
              Step {step} of {totalSteps}
            </motion.div>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-accent sm:text-6xl">
              Career <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 bg-clip-text text-transparent">Assessment</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-muted max-w-2xl">
              Discover your ideal path through a data-driven analysis of your skills, interests, and academic background.
            </p>
          </div>

          <Card className="glass overflow-hidden border-none p-0 shadow-premium backdrop-blur-xl">
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

            <div className="p-8 min-h-[400px]">
              <AnimatePresence>
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
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {STREAMS.map((s) => (
                          <motion.button
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={s.id}
                            onClick={() => setSelectedStream(s.id)}
                            className="group relative overflow-hidden flex flex-col items-center gap-5 rounded-3xl border border-borderline/50 bg-surface/50 p-8 text-center backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-surface hover:shadow-premium"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 text-5xl text-primary shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                              {s.icon}
                            </span>
                            <span className="relative font-display text-lg font-bold text-accent">{s.label}</span>
                          </motion.button>
                        ))}
                      </div>
                      
                      <div className="mt-8 border-t border-borderline/50 pt-6">
                        <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-primary/80">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>
                            ✨
                          </span>
                          Custom Stream
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type your own stream (e.g. Aviation, Culinary Arts)..."
                            className="flex-1 rounded-xl border border-borderline bg-surface/50 px-4 py-3.5 text-sm font-medium text-accent placeholder:text-muted backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                e.preventDefault()
                                const customStr = e.target.value.trim()
                                setSelectedStream('CUSTOM')
                                setSelectedBranch(customStr)
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling
                              if (input.value.trim()) {
                                const customStr = input.value.trim()
                                setSelectedStream('CUSTOM')
                                setSelectedBranch(customStr)
                              }
                            }}
                            className="shrink-0 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-glow-primary transition-all hover:scale-105 active:scale-95"
                          >
                            Continue
                          </button>
                        </div>
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
                      <div className="grid gap-4 sm:grid-cols-2">
                        {(STREAM_BRANCHES[selectedStream] || []).map((b) => {
                          const active = selectedBranch === b.id
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setSelectedBranch(b.id)}
                              className={`group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                                active
                                  ? 'border-transparent bg-gradient-to-r from-primary to-violet-600 text-white shadow-glow-primary scale-[1.02]'
                                  : 'border-borderline/50 bg-surface/50 hover:border-primary/40 hover:bg-surface hover:shadow-md'
                              }`}
                            >
                              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-inner transition-colors ${
                                active ? 'bg-white/20' : 'bg-primary/5 group-hover:bg-primary/10'
                              }`} aria-hidden>
                                {b.icon}
                              </span>
                              <span className="min-w-0">
                                <span className={`block font-bold ${active ? 'text-white' : 'text-accent'}`}>{b.label}</span>
                                <span className={`text-[11px] font-semibold uppercase tracking-wider ${active ? 'text-white/80' : 'text-muted'}`}>{b.short}</span>
                              </span>
                              {active && (
                                <motion.div layoutId="branchGlow" className="absolute inset-0 rounded-2xl bg-white/20 blur-md -z-10" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div>
                    <h2 className="font-display text-xl font-bold text-accent">Academic Details</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      Enter CGPA (0–10) or percentage — the server normalizes your input.
                    </p>
                    <label className="mt-5 block group">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary/80 transition-colors group-focus-within:text-primary">CGPA / Percentage</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="mt-2 w-full max-w-sm rounded-2xl border border-borderline bg-surface/50 px-5 py-4 text-xl font-bold text-accent shadow-sm backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
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
                  key="step4"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6"
                >
                  <h2 className="font-display text-xl font-bold text-accent">Projects & Preferences</h2>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary/80">Project Experience</span>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {PROJECT_LEVELS.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setProjectExperience(lvl)}
                          className={`relative overflow-hidden rounded-full border px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                            projectExperience === lvl
                              ? 'border-transparent bg-gradient-to-r from-primary to-violet-600 text-white shadow-glow-primary scale-105'
                              : 'border-borderline/80 bg-surface text-accent hover:border-primary/50 hover:bg-surface hover:-translate-y-0.5 hover:shadow-md'
                          }`}
                        >
                          <span className="relative z-10">{lvl}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/80 transition-colors focus-within:text-primary">Certifications (Optional)</label>
                    <textarea
                      className="mt-2 w-full rounded-2xl border border-borderline bg-surface/50 px-5 py-4 text-sm font-medium text-accent shadow-sm backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
                      rows={2}
                      placeholder="e.g. AWS Cloud Practitioner"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/80 transition-colors focus-within:text-primary">Preferred Work Type (Optional)</label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-borderline bg-surface/50 px-5 py-4 text-sm font-medium text-accent shadow-sm backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
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
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-violet-600 font-bold shadow-lg shadow-primary/25 disabled:opacity-70"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Loading...
                    </span>
                  ) : (
                    'Continue'
                  )}
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
