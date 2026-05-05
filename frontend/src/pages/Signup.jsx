import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/InputField'
import Button from '../components/Button'
import Logo, { LogoMark } from '../components/Logo'

const PROJECT_DESCRIPTION =
  'Choosing a career should feel informed, not random. CareerMatrix helps you register a free account, capture your academic and professional profile, and complete a guided assessment that weighs grades, skills, interests, certifications, and project experience against today’s most in-demand technology paths. When you join, your workspace stores predictions, charts, and roadmaps you can revisit, while the chat assistant answers questions about tools, courses, and résumés. Create an account to iterate on your inputs after new coursework or internships, compare prediction runs side by side, and build a single, trusted story for where you are headed next with clarity and purpose.'

export default function Signup() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const payload = { name, password }
      const em = email.trim()
      if (em) payload.email = em
      const { data } = await api.post('/api/register', payload)
      login(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed'
      setError(typeof msg === 'string' ? msg : 'Could not register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="border-b border-borderline bg-surface px-4 py-4 shadow-sm sm:px-8">
        <Logo to="/login" size="md" />
      </header>

      <div className="flex flex-1 items-center px-4 py-10 sm:px-6 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center"
        >
          <section className="flex flex-col justify-center space-y-6" aria-labelledby="signup-project-heading">
            <div className="flex items-start gap-4">
              <LogoMark size="xl" className="shrink-0 drop-shadow-sm" />
              <div className="min-w-0 pt-1">
                <h2 id="signup-project-heading" className="font-display text-xl font-semibold text-accent sm:text-2xl">
                  Why join CareerMatrix?
                </h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary/90">Create your profile</p>
              </div>
            </div>
            <div className="rounded-2xl border border-borderline bg-gradient-to-br from-surface to-page p-6 shadow-sm sm:p-8">
              <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">{PROJECT_DESCRIPTION}</p>
            </div>
          </section>

          <div className="rounded-2xl border border-borderline bg-surface p-8 shadow-lg sm:p-10">
            <h1 className="font-display text-2xl font-bold text-accent sm:text-3xl">Create account</h1>
            <p className="mt-2 text-sm text-slate-600">Join CareerMatrix and discover your best-fit career paths.</p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-8 space-y-5">
              <InputField label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
              <InputField
                label="Email (optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <div>
                <InputField
                  label="Password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-1.5 text-xs text-slate-500">At least 6 characters</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full !py-3.5">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating…
                  </span>
                ) : (
                  'Sign up'
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
