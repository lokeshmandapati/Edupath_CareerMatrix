import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import Button from '../components/Button'
import { api } from '../services/api'
import Loader from '../components/Loader'

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS']
const BRANCHES = ['CSE', 'ECE', 'Mechanical', 'Civil', 'AI/DS', 'IT']
const STATES = [
  'All States',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
  'Puducherry'
]

const QUALIFYING_CUTOFFS = [
  { category: 'General', percentile: 93.10 },
  { category: 'OBC-NCL', percentile: 79.43 },
  { category: 'EWS', percentile: 80.38 },
  { category: 'SC', percentile: 61.15 },
  { category: 'ST', percentile: 47.90 },
]

export default function JEECollegePredictor() {
  const [percentile, setPercentile] = useState('')
  const [category, setCategory] = useState('General')
  const [branch, setBranch] = useState('CSE')
  const [state, setState] = useState('All States')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [rankInfo, setRankInfo] = useState(null)
  const [error, setError] = useState('')

  const handlePredict = async () => {
    if (!percentile || isNaN(percentile) || percentile < 0 || percentile > 100) {
      setError('Please enter a valid percentile (0-100).')
      return
    }
    setError('')
    setLoading(true)
    try {
      const [predRes, rankRes] = await Promise.all([
        api.post('/api/toolkit/predict-jee-colleges', {
          percentile: Number(percentile),
          category,
          preferredState: state === 'All States' ? '' : state,
          preferredBranch: branch
        }),
        api.get('/api/toolkit/rank-from-percentile', { params: { percentile: Number(percentile) } })
      ])
      setResults(predRes.data)
      setRankInfo(rankRes.data)
    } catch (err) {
      setError('Failed to fetch predictions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getChanceColor = (chance) => {
    switch (chance) {
      case 'Safe': return 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/20'
      case 'Moderate': return 'text-amber-500 bg-amber-500/10 ring-amber-500/20'
      case 'Dream': return 'text-rose-500 bg-rose-500/10 ring-rose-500/20'
      default: return 'text-slate-500 bg-slate-500/10 ring-slate-500/20'
    }
  }

  return (
    <PageTransition>
      <div className="space-y-10 pb-16">
        {/* Header Section */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase ring-1 ring-primary/20"
          >
            Personalized Toolkit
          </motion.div>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
            JEE <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">College Predictor</span>
          </h1>
          <p className="mt-3 text-lg font-medium text-muted max-w-2xl">
            Identify realistic engineering colleges based on your JEE Main percentile and reservation category using historical admission trends.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Side: Input Form */}
          <div className="lg:col-span-1">
            <Card className="glass sticky top-24 border-none p-6 shadow-premium ring-1 ring-white/5">
              <h2 className="font-display text-xl font-bold text-accent mb-6">Your Details</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">JEE Main Percentile</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 95.5"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base font-medium text-accent focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={percentile}
                    onChange={(e) => setPercentile(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    className="w-full rounded-xl border border-white/10 bg-[#1a1f3d] px-4 py-3 text-base font-medium text-accent focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Preferred Branch</label>
                  <select 
                    className="w-full rounded-xl border border-white/10 bg-[#1a1f3d] px-4 py-3 text-base font-medium text-accent focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Preferred State</label>
                  <select 
                    className="w-full rounded-xl border border-white/10 bg-[#1a1f3d] px-4 py-3 text-base font-medium text-accent focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {error && <p className="text-sm font-bold text-rose-500">{error}</p>}

                <Button 
                  onClick={handlePredict} 
                  className="w-full py-4 bg-gradient-to-r from-primary to-violet-600 shadow-lg shadow-primary/25"
                  disabled={loading}
                >
                  {loading ? 'Analyzing Trends...' : 'Predict Colleges'}
                </Button>
              </div>

              {/* Qualifying Cutoffs Info */}
              <div className="mt-8 pt-8 border-t border-white/5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">2025 Expected Qualifying Cutoffs</h3>
                <div className="space-y-2">
                  {QUALIFYING_CUTOFFS.map(item => (
                    <div key={item.category} className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">{item.category}</span>
                      <span className="text-accent font-bold">{item.percentile}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[10px] text-slate-500 italic">
                  *Based on recent NTA trends. Actual cutoffs may vary.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Side: Results */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader label="Comparing with historical data..." />
                </div>
              ) : results.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Rank Insights Card */}
                  {rankInfo && (
                    <Card className="bg-primary/5 border-primary/20 p-6 shadow-glow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-widest">Expected AIR Rank</p>
                          <h3 className="text-3xl font-black text-accent mt-1">~{rankInfo.expectedRank.toLocaleString()}</h3>
                        </div>
                        <div className="text-sm text-slate-400 max-w-xs">
                          {rankInfo.note} Based on {rankInfo.percentile} percentile.
                        </div>
                      </div>
                    </Card>
                  )}

                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-accent">Predicted Colleges</h2>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{results.length} Matches Found</span>
                  </div>

                  <div className="grid gap-4">
                    {results.map((col, idx) => (
                      <motion.div
                        key={col.name + col.branch}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass-dark group relative overflow-hidden rounded-3xl p-6 ring-1 ring-white/5 hover:ring-primary/30 transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-accent group-hover:text-primary transition-colors">{col.name}</h3>
                              <span className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest ring-1 ${getChanceColor(col.chance)}`}>
                                {col.chance}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                {col.branch}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-500/40" />
                                {col.state}
                              </span>
                              <span className="flex items-center gap-1.5 text-accent font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
                                Cutoff: {col.cutoff}%
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-right">
                            <div className="text-left md:text-right">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Placement</p>
                              <p className="text-sm font-bold text-accent">{col.placement}</p>
                            </div>
                            <div className="text-left md:text-right">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Approx Fees</p>
                              <p className="text-sm font-bold text-accent">{col.fees}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex gap-4">
                             <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                🏠 Hostel: <span className="text-accent">{col.hostel}</span>
                             </div>
                          </div>
                          <a 
                            href={col.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            Official Website
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-xs text-center text-slate-500 italic mt-8">
                    *Admission predictions are based on historical trends and approximate cutoffs. Please verify with official college websites.
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center text-4xl mb-6">🎯</div>
                  <h3 className="text-xl font-bold text-accent">Ready to Predict?</h3>
                  <p className="text-slate-400 mt-2 max-w-sm">
                    Enter your JEE Main percentile and preferred branch to see matching colleges and admission chances.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
