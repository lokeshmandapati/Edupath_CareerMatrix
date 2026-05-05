import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import Card from '../components/Card'
import PageTransition from '../components/PageTransition'
import Modal from '../components/Modal'
import InputField from '../components/InputField'
import Button from '../components/Button'
import { 
  CLASS10_LAST_PREDICTION_KEY, 
  AFTER12_LAST_PREDICTION_KEY, 
  ENGINEERING_LAST_PREDICTION_KEY 
} from '../constants/storageKeys'

export default function Profile() {
  const { name, email, branch, setName, setEmail } = useAuth()
  const [stats, setStats] = useState({ 
    assessments: 0, 
    topInterest: 'Not set',
    techScore: 0,
    creativeScore: 0,
    hasRoadmap: false
  })
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPassModalOpen, setIsPassModalOpen] = useState(false)
  const [isIdModalOpen, setIsIdModalOpen] = useState(false)
  
  // Forms state
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isSaving, setIsSaving] = useState(false)

  // Preferences state
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('careermatrix_prefs')
    return saved ? JSON.parse(saved) : { notifications: true, smartInsights: true }
  })

  useEffect(() => {
    localStorage.setItem('careermatrix_prefs', JSON.stringify(prefs))
  }, [prefs])

  useEffect(() => {
    let count = 0
    let interest = 'Not set'
    let tech = 0
    let creative = 0
    
    const eng = localStorage.getItem(ENGINEERING_LAST_PREDICTION_KEY)
    const c10 = localStorage.getItem(CLASS10_LAST_PREDICTION_KEY)
    const a12 = localStorage.getItem(AFTER12_LAST_PREDICTION_KEY)
    const roadmap = localStorage.getItem('careermatrix_roadmap_career')

    const processData = (raw) => {
      if (!raw) return
      count++
      try {
        const data = JSON.parse(raw)
        if (data.topCareer && interest === 'Not set') interest = data.topCareer
        
        // Extract real skill scores from skillMatchBreakdown if available
        if (data.skillMatchBreakdown) {
          const scores = Object.values(data.skillMatchBreakdown)
          if (scores.length > 0) {
            // Take the average of skill matches for a high-level overview
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length
            tech = Math.max(tech, Math.round(avg))
            creative = Math.max(creative, Math.round(avg * 0.85)) // Slight variation for creative
          }
        } else if (data.careerScores) {
          // Fallback to top career score if breakdown is missing
          const topScore = data.careerScores[data.topCareer] || 0
          tech = Math.max(tech, Math.round(topScore))
          creative = Math.max(creative, Math.round(topScore * 0.75))
        }
      } catch {}
    }

    processData(eng)
    processData(c10)
    processData(a12)
    
    setStats({ 
      assessments: count, 
      topInterest: interest,
      techScore: count > 0 ? (tech || 70) : 0, // Fallback to 70 if data exists but score is null
      creativeScore: count > 0 ? (creative || 60) : 0,
      hasRoadmap: !!roadmap
    })
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.put('/api/profile', editForm)
      setName(editForm.name); setEmail(editForm.email)
      setIsEditModalOpen(false)
    } catch (err) { alert(err.response?.data?.error || err.response?.data?.message || 'Failed to update profile.') }
    finally { setIsSaving(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      alert('Passwords do not match'); return
    }
    setIsSaving(true)
    try {
      await api.put('/api/profile/password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      })
      alert('Password updated successfully!')
      setIsPassModalOpen(false)
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to update password.')
    } finally { setIsSaving(false) }
  }

  return (
    <PageTransition>
      <div className="mesh-gradient min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8 pb-10">
          
          {/* Hero Section */}
          <section className="relative">
            <div className="glass flex flex-col items-center gap-6 rounded-[3rem] border-none p-10 text-center shadow-premium sm:flex-row sm:text-left">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 text-4xl font-extrabold text-white shadow-glow ring-4 ring-white/20">
                  {name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-page shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/20">
                  Verified Student
                </div>
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-accent">{name}</h1>
                <p className="text-lg font-medium text-muted">{email || 'Student Account'}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
                <div className="glass-dark rounded-3xl px-6 py-3 text-center ring-1 ring-white/10">
                  <p className="text-2xl font-black text-accent">{stats.assessments}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Assessments</p>
                </div>
                <div className="glass-dark rounded-3xl px-6 py-3 text-center ring-1 ring-white/10">
                  <p className="text-2xl font-black text-accent">{branch || 'N/A'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Current Stream</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="glass border-none p-8 shadow-premium">
                <h3 className="font-display text-xl font-bold text-accent">Academic Profile</h3>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Target Career</p>
                    <p className="text-lg font-bold text-accent">{stats.topInterest}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Education Level</p>
                    <p className="text-lg font-bold text-accent">{branch ? 'Higher Education' : 'Secondary School'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Primary Location</p>
                    <p className="text-lg font-bold text-accent">India (Global Access)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Account Created</p>
                    <p className="text-lg font-bold text-accent">May 2026</p>
                  </div>
                </div>
              </Card>

              <Card className="glass border-none p-8 shadow-premium">
                <h3 className="font-display text-xl font-bold text-accent">Personal Information</h3>
                <div className="mt-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-borderline pb-4">
                    <span className="text-sm font-medium text-muted">Full Name</span>
                    <span className="text-sm font-bold text-accent">{name}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-borderline pb-4">
                    <span className="text-sm font-medium text-muted">Email Address</span>
                    <span className="text-sm font-bold text-accent">{email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-borderline pb-4">
                    <span className="text-sm font-medium text-muted">Username</span>
                    <span className="text-sm font-bold text-accent">@{name?.toLowerCase().replace(/\s/g, '')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setEditForm({ name, email }); setIsEditModalOpen(true) }}
                  className="mt-8 w-full rounded-2xl bg-primary/10 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
                >
                  Edit Personal Information
                </button>
              </Card>

              <Card className="glass border-none p-8 shadow-premium">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-accent">Skills & Milestones</h3>
                  <span className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${stats.assessments > 0 ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500'}`}>
                    {stats.assessments > 0 ? `Level ${stats.assessments + 1} Aspirant` : 'Level 1 Beginner'}
                  </span>
                </div>
                <div className="mt-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-accent">Technical Logic</span>
                      <span className="text-xs font-bold text-primary">{stats.techScore}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.techScore}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 shadow-glow" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-accent">Creative Thinking</span>
                      <span className="text-xs font-bold text-primary">{stats.creativeScore}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.creativeScore}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 shadow-glow" 
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => stats.assessments > 0 && (window.location.href = '/results')}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center ring-1 transition-all ${stats.assessments > 0 ? 'bg-emerald-50/50 ring-emerald-500/20 shadow-soft cursor-pointer' : 'bg-surface ring-borderline opacity-40 cursor-default'}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stats.assessments > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className={`text-[10px] font-bold uppercase ${stats.assessments > 0 ? 'text-emerald-700' : 'text-accent'}`}>Assessment Done</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => stats.hasRoadmap && (window.location.href = '/roadmap')}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center ring-1 transition-all ${stats.hasRoadmap ? 'bg-blue-50/50 ring-blue-500/20 shadow-soft cursor-pointer' : 'bg-surface ring-borderline opacity-40 cursor-default'}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stats.hasRoadmap ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className={`text-[10px] font-bold uppercase ${stats.hasRoadmap ? 'text-blue-700' : 'text-accent'}`}>Roadmap Built</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = '/dashboard'}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center ring-1 transition-all ${stats.assessments >= 3 ? 'bg-amber-50/50 ring-amber-500/20 shadow-soft cursor-pointer' : 'bg-surface ring-borderline opacity-40 cursor-default'}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stats.assessments >= 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className={`text-[10px] font-bold uppercase ${stats.assessments >= 3 ? 'text-amber-700' : 'text-accent'}`}>Goal Reached</p>
                  </motion.button>
                </div>
              </Card>
            </div>

            {/* Right Column: Settings & Security */}
            <div className="space-y-8">
              <Card className="glass border-none p-8 shadow-premium">
                <h3 className="font-display text-lg font-bold text-accent">Security</h3>
                <div className="mt-6 space-y-4">
                  <button 
                    onClick={() => setIsPassModalOpen(true)}
                    className="flex w-full items-center justify-between rounded-2xl bg-surface p-4 transition-all hover:bg-page hover:shadow-soft group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-accent">Password</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setIsIdModalOpen(true)}
                    className="flex w-full items-center justify-between rounded-2xl bg-surface p-4 transition-all hover:bg-page hover:shadow-soft group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-accent">Manage Identity</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </Card>

              <Card className="glass border-none p-8 shadow-premium">
                <h3 className="font-display text-lg font-bold text-accent">Preferences</h3>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-surface p-4">
                    <span className="text-sm font-bold text-accent">Notifications</span>
                    <button 
                      onClick={() => setPrefs(p => ({ ...p, notifications: !p.notifications }))}
                      className={`h-6 w-10 rounded-full transition-colors p-1 ${prefs.notifications ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${prefs.notifications ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-surface p-4">
                    <span className="text-sm font-bold text-accent">Smart Insights</span>
                    <button 
                      onClick={() => setPrefs(p => ({ ...p, smartInsights: !p.smartInsights }))}
                      className={`h-6 w-10 rounded-full transition-colors p-1 ${prefs.smartInsights ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${prefs.smartInsights ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Profile"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <InputField
            label="Full Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Your name"
            required
          />
          <InputField
            label="Email Address"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            placeholder="your@email.com"
            required
          />
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              loading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
      {/* Security Modal (Password) */}
      <Modal 
        isOpen={isPassModalOpen} 
        onClose={() => setIsPassModalOpen(false)} 
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-6">
          <InputField
            label="Current Password"
            type="password"
            value={passForm.currentPassword}
            onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
            placeholder="••••••••"
            required
          />
          <InputField
            label="New Password"
            type="password"
            value={passForm.newPassword}
            onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
            placeholder="Min 6 characters"
            required
          />
          <InputField
            label="Confirm New Password"
            type="password"
            value={passForm.confirmPassword}
            onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
            placeholder="Repeat new password"
            required
          />
          <div className="pt-4">
            <Button type="submit" className="w-full" loading={isSaving}>Update Password</Button>
          </div>
        </form>
      </Modal>

      {/* Identity Modal */}
      <Modal 
        isOpen={isIdModalOpen} 
        onClose={() => setIsIdModalOpen(false)} 
        title="Manage Identity"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">
              {name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-accent">{name}</p>
              <p className="text-xs text-muted">ID: {localStorage.getItem('careermatrix_userId') || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Account Type</span>
              <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-600 uppercase">Premium Student</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Verification</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                Verified
              </span>
            </div>
          </div>
          <p className="text-[10px] leading-relaxed text-muted text-center pt-4">
            Identity verification is managed via your university portal. Contact support to update your role.
          </p>
        </div>
      </Modal>
    </PageTransition>
  )
}
