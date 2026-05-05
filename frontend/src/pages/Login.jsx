import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/InputField'
import Button from '../components/Button'
import Logo, { LogoMark } from '../components/Logo'

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
)

const PROJECT_DESCRIPTION =
  'CareerMatrix is a full-stack career intelligence application that translates your academics, technical skills, interests, and project experience into ranked career recommendations. The CareerFit Prediction Algorithm normalizes scores across five domains—software engineering, data science, cybersecurity, full stack development, and cloud computing—and explains each match in plain language. After you authenticate, you unlock your dashboard, detailed results with visual breakdowns, AI-generated roadmaps, and a floating career assistant for skills, technologies, and résumés. Secure sign-in protects your results so you can revisit anytime, retake the assessment as you grow, compare outcomes, and plan your next steps with confidence while keeping your history private.'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/login', { identifier, password })
      login(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed'
      setError(typeof msg === 'string' ? msg : 'Invalid credentials')
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
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center"
        >
          <section
            className="flex flex-col justify-center space-y-6"
            aria-labelledby="login-project-heading"
          >
            <div className="flex items-start gap-4">
              <LogoMark size="xl" className="shrink-0 drop-shadow-sm" />
              <div className="min-w-0 pt-1">
                <h2 id="login-project-heading" className="font-display text-xl font-semibold text-accent sm:text-2xl">
                  About CareerMatrix
                </h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary/90">Platform overview</p>
              </div>
            </div>
            <div className="rounded-2xl border border-borderline bg-gradient-to-br from-surface to-page p-6 shadow-sm sm:p-8">
              <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">{PROJECT_DESCRIPTION}</p>
            </div>
          </section>

          <div className="rounded-2xl border border-borderline bg-surface p-8 shadow-lg transition-all duration-300 sm:p-10">
            <h1 className="font-display text-2xl font-bold tracking-tight text-accent sm:text-3xl">Welcome Back</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Login to explore your personalized career insights</p>

            {error && (
              <div
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-8 space-y-5">
              <InputField
                label="Name or Email"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Your name or email"
                icon={<UserIcon />}
              />
              <p className="-mt-2 text-xs text-slate-500">Use the name or email you registered with.</p>

              <InputField
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<LockIcon />}
              />

              <Button type="submit" disabled={loading} className="!mt-2 w-full !py-3.5">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              No account?{' '}
              <Link to="/signup" className="font-semibold text-primary transition-all duration-300 hover:text-primary/80 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
