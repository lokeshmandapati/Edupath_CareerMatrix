import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import Button from '../components/Button'
import Loader from '../components/Loader'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function SkillGapAnalysis() {
  const { userId } = useAuth()
  const [targetCareer, setTargetCareer] = useState('')
  const [currentSkills, setCurrentSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await api.get(`/api/results/${userId}`)
        if (data && data.assessmentInputs?.aptitudeTags) {
          setCurrentSkills(data.assessmentInputs.aptitudeTags)
        } else {
          // Fallback to local storage if profile not on server
          const stored = localStorage.getItem('careermatrix_last_skills')
          if (stored) setCurrentSkills(JSON.parse(stored))
        }
      } catch (err) {
        console.warn('Failed to load skills for gap analysis', err)
      } finally {
        setFetchingProfile(false)
      }
    }
    loadProfile()
  }, [userId])

  const analyze = async () => {
    if (!targetCareer.trim()) {
      setError('Please enter a target career (e.g. AI Engineer)')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/toolkit/skill-gap', {
        targetCareer,
        currentSkills
      })
      setResult(data)
    } catch (err) {
      setError('Analysis failed. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="mesh-gradient min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-4">
             <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-indigo-400 uppercase ring-1 ring-indigo-500/20"
            >
              Toolkit Feature
            </motion.div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
              AI Skill <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Gap Analysis</span>
            </h1>
            <p className="text-lg font-medium text-muted">
              Compare your current skills against industry requirements and get a personalized learning priority list.
            </p>
          </header>

          <Card className="glass border-none p-8 shadow-premium">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-accent uppercase tracking-wider mb-2">Target Career Role</label>
                <input 
                  type="text"
                  placeholder="e.g. AI Engineer, Product Manager, Data Scientist..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-accent outline-none transition-all focus:ring-2 focus:ring-primary/50"
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-accent uppercase tracking-wider mb-3">Your Current Skills</label>
                {fetchingProfile ? (
                  <div className="animate-pulse h-10 w-full bg-white/5 rounded-xl" />
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {currentSkills.length > 0 ? (
                        currentSkills.map(s => (
                          <span key={s} className="group relative flex items-center gap-2 rounded-lg bg-primary/10 pl-3 pr-2 py-1.5 text-xs font-bold text-primary ring-1 ring-primary/20 transition-all hover:bg-primary/20">
                            {s}
                            <button 
                              onClick={() => setCurrentSkills(prev => prev.filter(x => x !== s))}
                              className="flex h-4 w-4 items-center justify-center rounded-md bg-primary/20 text-[10px] font-black text-primary hover:bg-red-500 hover:text-white"
                              title="Remove skill"
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted italic">No skills listed yet. Add some below!</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add a skill (e.g. Python, Figma, React)"
                        className="flex-1 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-accent outline-none transition-all focus:border-primary/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim()
                            if (val && !currentSkills.includes(val)) {
                              setCurrentSkills(prev => [...prev, val])
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                      <Button 
                        variant="secondary"
                        className="px-4 py-2 text-xs"
                        onClick={(e) => {
                          const input = e.currentTarget.previousSibling
                          const val = input.value.trim()
                          if (val && !currentSkills.includes(val)) {
                            setCurrentSkills(prev => [...prev, val])
                            input.value = ''
                          }
                        }}
                      >
                        + Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {error && <p className="text-sm font-bold text-red-500 bg-red-500/10 p-3 rounded-xl ring-1 ring-red-500/20">{error}</p>}

              <Button 
                onClick={analyze} 
                disabled={loading} 
                className="w-full py-4 text-base shadow-glow"
              >
                {loading ? 'Analyzing Gap...' : '🔍 Generate Skill Gap Report'}
              </Button>
            </div>
          </Card>

          <AnimatePresence>
            {result && (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                <div className="rounded-3xl bg-indigo-500/5 p-6 ring-1 ring-indigo-500/20">
                  <h3 className="text-lg font-bold text-indigo-400 mb-2">Overall Advice</h3>
                  <p className="text-sm leading-relaxed text-accent">{result.overallAdvice}</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {result.missingSkills.sort((a, b) => a.learningOrder - b.learningOrder).map((item) => (
                    <motion.div key={item.skill} variants={item}>
                      <Card className="glass h-full border-none p-6 shadow-premium hover:scale-[1.02] transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-black text-indigo-400 ring-1 ring-indigo-500/20">
                            #{item.learningOrder}
                          </span>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                            item.importance === 'High' ? 'bg-red-500/10 text-red-400' : 
                            item.importance === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {item.importance} Priority
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-accent mb-3">{item.skill}</h4>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Difficulty</p>
                            <p className="text-sm font-bold text-accent">{item.difficulty}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Est. Time</p>
                            <p className="text-sm font-bold text-accent">⏳ {item.estimatedTime}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
