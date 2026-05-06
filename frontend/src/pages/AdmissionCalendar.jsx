import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ADMISSION_EXAMS } from '../data/admissionData'
import { INDIAN_STATES } from '../data/indianStates'
import { api } from '../services/api'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import Button from '../components/Button'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date()
    let timeLeft = {}

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    return timeLeft
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearTimeout(timer)
  })

  if (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes) {
    return <span className="text-red-500 font-bold">Exam Day!</span>
  }

  return (
    <div className="flex gap-4">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="glass flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-black text-primary ring-1 ring-primary/20">
            {value}
          </div>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted">{unit}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdmissionCalendar() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [reminders, setReminders] = useState({})
  const [trackedExams, setTrackedExams] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterState, setFilterState] = useState('All India')
  const [stateInput, setStateInput] = useState('All India')
  const [viewTrackedOnly, setViewTrackedOnly] = useState(false)

  // Pre-defined categories for better UI initial state
  const UI_CATEGORIES = ['All', 'Engineering', 'Medical', 'Management', 'Design', 'Law', 'Architecture', 'University']

  const fetchExams = async (stateVal, catVal) => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/toolkit/upcoming-exams', {
        params: { state: stateVal, category: catVal }
      })
      
      if (data && data.length > 0) {
        setExams(data)
      } else {
        const fallback = ADMISSION_EXAMS.filter(exam => {
          const stateMatch = stateVal === 'All India' || exam.state === stateVal || exam.state === 'All India'
          const catMatch = catVal === 'All' || exam.category === catVal
          return stateMatch && catMatch
        })
        setExams(fallback)
      }
    } catch (e) {
      console.error("Fetch error:", e)
      const fallback = ADMISSION_EXAMS.filter(exam => {
        const stateMatch = stateVal === 'All India' || exam.state === stateVal || exam.state === 'All India'
        const catMatch = catVal === 'All' || exam.category === catVal
        return stateMatch && catMatch
      })
      setExams(fallback)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams(filterState, filterCategory)
  }, [filterCategory, filterState])

  const handleSearch = () => {
    setFilterState(stateInput)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleReminder = (examId) => {
    setReminders(prev => ({
      ...prev,
      [examId]: !prev[examId]
    }))
    if (!reminders[examId]) {
      setSelectedExam(exams.find(e => e.id === examId))
      setShowModal(true)
    }
  }

  const toggleTrack = (examId) => {
    setTrackedExams(prev => 
      prev.includes(examId) ? prev.filter(id => id !== examId) : [...prev, examId]
    )
  }

  const states = ['All', 'All India', ...INDIAN_STATES]

  const filteredExams = exams.filter(exam => {
    const matchTracked = !viewTrackedOnly || trackedExams.includes(exam.id)
    // Only show exams that are today or in the future
    const examDate = new Date(exam.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return matchTracked && examDate >= today
  })

  return (
    <PageTransition>
      <div className="mesh-gradient min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
               <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-600 uppercase ring-1 ring-amber-500/20"
              >
                📅 Admission Tracker
              </motion.div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
                Admission <span className="text-primary">Calendar</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium text-muted">
                Filter by career path, track specific exams, and never miss a deadline.
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setViewTrackedOnly(!viewTrackedOnly)}
                className={`rounded-2xl px-6 py-3 text-sm font-bold transition-all ${viewTrackedOnly ? 'bg-primary text-white shadow-lg' : 'glass-dark text-accent hover:bg-primary/5'}`}
              >
                ⭐ {viewTrackedOnly ? 'Showing Tracked' : 'My Deadlines'}
              </button>
            </div>
          </header>

          {/* Field of Interest Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-accent">Select Your Field of Interest</h2>
                <p className="text-sm text-muted">Choose a field to see related entrance exams</p>
              </div>
              <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-bold text-primary ring-1 ring-primary/20">
                {UI_CATEGORIES.length - 1} Fields Available
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {UI_CATEGORIES.map(cat => {
                const icon = 
                  cat === 'Engineering' ? '🛠️' :
                  cat === 'Medical' ? '🏥' :
                  cat === 'Management' ? '📊' :
                  cat === 'Design' ? '🎨' :
                  cat === 'Law' ? '⚖️' :
                  cat === 'Architecture' ? '🏛️' :
                  cat === 'University' ? '🎓' : '🌍'
                
                const isActive = filterCategory === cat
                
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`group flex flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/25 ring-2 ring-primary ring-offset-2' : 'glass hover:bg-white hover:shadow-md border border-black/5'}`}
                  >
                    <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-accent'}`}>{cat === 'All' ? 'All Fields' : cat}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Region Filter */}
          <div className="glass-dark rounded-3xl p-8 ring-1 ring-black/5">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Region Selection</label>
                <p className="text-sm font-bold text-accent">Filter by your Home State</p>
              </div>
              <div className="flex flex-col gap-4 w-full md:max-w-xl">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      list="indian-states"
                      value={stateInput}
                      onChange={(e) => setStateInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your state (e.g. Maharashtra)"
                      className="w-full rounded-2xl border border-black/5 bg-white/80 px-6 py-4 text-sm font-bold text-accent shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    <datalist id="indian-states">
                      <option value="All India" />
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary/40">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-black text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>SEARCH</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
                <p className="px-2 text-[10px] font-bold text-muted italic">
                  Tip: Press Enter or click Search to find state-specific and national exams using AI.
                </p>
              </div>
            </div>
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-black/5 rounded-3xl">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-sm font-bold text-primary animate-pulse">AI is discovering upcoming exams for you...</p>
              </div>
            ) : filteredExams.length > 0 ? (
              filteredExams.map((exam) => (
                <motion.div key={exam.id || exam.name} variants={item}>
                <Card className="glass group overflow-hidden border-none p-0 shadow-premium transition-all hover:shadow-2xl">
                  <div className="flex flex-col gap-6 p-6 lg:flex-row">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="rounded-lg bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary ring-1 ring-primary/20">
                            {exam.category}
                          </span>
                          <span className="rounded-lg bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-600 ring-1 ring-violet-500/20">
                            {exam.state}
                          </span>
                        </div>
                        <button 
                          onClick={() => toggleTrack(exam.id)}
                          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${trackedExams.includes(exam.id) ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-black/5 text-muted hover:bg-amber-500/10 hover:text-amber-500'}`}
                        >
                          ⭐
                        </button>
                      </div>
                      
                      <div>
                        <h3 className="font-display text-2xl font-bold text-accent">{exam.name}</h3>
                        <p className="mt-1 text-sm text-muted">{exam.description}</p>
                      </div>

                      {/* Important Dates Grid */}
                      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-black/5 p-4 sm:grid-cols-4">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted">Application</p>
                          <p className="text-xs font-bold text-accent">{new Date(exam.applicationStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted">Last Date</p>
                          <p className="text-xs font-bold text-red-500">{new Date(exam.lastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted">Exam Date</p>
                          <p className="text-xs font-bold text-primary">{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted">Counselling</p>
                          <p className="text-xs font-bold text-emerald-500">{new Date(exam.counsellingStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <Button
                          variant={reminders[exam.id] ? 'secondary' : 'primary'}
                          className="px-6 py-2.5 text-sm font-bold"
                          onClick={() => toggleReminder(exam.id)}
                        >
                          {reminders[exam.id] ? '✅ Reminder Set' : '🔔 Remind Me'}
                        </Button>
                        <button 
                          onClick={() => setSelectedExam(selectedExam?.id === exam.id ? null : exam)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-white/50 px-6 py-2.5 text-sm font-bold text-accent shadow-sm ring-1 ring-black/5 hover:bg-white transition-all"
                        >
                          {selectedExam?.id === exam.id ? 'Hide Details' : 'How to Apply'}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-3xl bg-black/5 p-6 lg:min-w-[300px]">
                       {(() => {
                         const diff = +new Date(exam.date) - +new Date()
                         const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                         const color = days < 7 ? 'text-red-500' : days < 15 ? 'text-amber-500' : 'text-emerald-500'
                         return (
                           <>
                             <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted text-center">Countdown to Exam</p>
                             <div className="flex items-baseline gap-1">
                               <span className={`text-5xl font-black ${color}`}>{days}</span>
                               <span className="text-sm font-bold text-muted">Days Left</span>
                             </div>
                           </>
                         )
                       })()}
                    </div>
                  </div>

                  {/* Detail Panel */}
                  <AnimatePresence>
                    {selectedExam?.id === exam.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-black/5 bg-black/[0.02]"
                      >
                        <div className="grid gap-8 p-8 md:grid-cols-2">
                          <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-display text-lg font-bold text-accent">
                              <span className="text-xl">🎯</span> Target Audience
                            </h4>
                            <p className="text-sm leading-relaxed text-muted">{exam.targetAudience}</p>
                            
                            <div className="pt-4">
                              <a 
                                href={exam.registrationLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 font-bold text-primary hover:underline"
                              >
                                Visit Official Website
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-display text-lg font-bold text-accent">
                              <span className="text-xl">🧾</span> How to Apply
                            </h4>
                            <div className="space-y-3">
                              {exam.steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
                                    {i + 1}
                                  </span>
                                  <span className="text-sm font-medium text-muted">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))
          ) : null}
        </motion.div>

          {filteredExams.length === 0 && (
            <div className="rounded-3xl bg-black/5 py-20 text-center">
              <span className="text-4xl">{viewTrackedOnly && trackedExams.length === 0 ? '⭐' : '🔍'}</span>
              <h3 className="mt-4 font-display text-xl font-bold text-accent">
                {viewTrackedOnly && trackedExams.length === 0 ? 'Your tracked list is empty' : 'No exams found for this selection'}
              </h3>
              <p className="max-w-md mx-auto mt-2 text-muted leading-relaxed">
                {viewTrackedOnly && trackedExams.length === 0 
                  ? 'Click the star icon ⭐ on any exam card to save it to your personal deadlines list for quick access!'
                  : 'Try selecting "All India" in the state filter to see national level exams like JEE, NEET, and CLAT that are open to students from every state!'}
              </p>
              {viewTrackedOnly && trackedExams.length === 0 && (
                <Button 
                  className="mt-8 font-bold" 
                  onClick={() => setViewTrackedOnly(false)}
                >
                  Show All Exams
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-accent/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass relative w-full max-w-md overflow-hidden rounded-3xl p-8 shadow-2xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                📱
              </div>
              <h2 className="font-display text-2xl font-bold text-accent">Activate Smart Alerts</h2>
              <p className="mt-2 text-muted">
                We will send you notifications for <strong>{selectedExam?.name}</strong> via WhatsApp and SMS:
              </p>
              
              <ul className="mt-6 space-y-3">
                {['7 days before', '3 days before', '1 day before'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-bold text-accent">
                    <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-4">
                <Button className="w-full py-4 font-bold" onClick={() => setShowModal(false)}>
                  Confirm Subscription
                </Button>
                <button 
                  className="w-full text-sm font-bold text-muted hover:text-accent"
                  onClick={() => setShowModal(false)}
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
