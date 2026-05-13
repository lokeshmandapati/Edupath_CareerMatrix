import { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CareerForm from './pages/CareerForm'
import Results from './pages/Results'
import Profile from './pages/Profile'
import RoadmapPage from './pages/RoadmapPage'
import Class10Dashboard from './pages/Class10Dashboard'
import Class10Form from './pages/Class10Form'
import Class10Results from './pages/Class10Results'
import After12Dashboard from './pages/After12Dashboard'
import After12Form from './pages/After12Form'
import After12Results from './pages/After12Results'
import AdmissionCalendar from './pages/AdmissionCalendar'
import LearningResources from './pages/LearningResources'
import LandingPage from './pages/LandingPage'
import JEECollegePredictor from './pages/JEECollegePredictor'
import SkillGapAnalysis from './pages/SkillGapAnalysis'
import Chatbot from './components/Chatbot'

function HomeRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

/** Animated floating particles — memoized so they don't regenerate on every render */
function useParticles(count = 40) {
  return useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      dur: Math.random() * 10 + 8,
      delay: Math.random() * -15,
      opacity: Math.random() * 0.5 + 0.2,
      hue: [260, 280, 320, 220, 200][Math.floor(Math.random() * 5)],
    })),
  [count])
}

/** Authenticated layout — pure black animated background */
function AppShell({ children }) {
  const particles = useParticles(40)

  return (
    <div className="app-shell relative flex min-h-screen flex-col overflow-x-hidden" style={{ background: '#000000' }}>

      {/* ── Subtle grid overlay ── */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* ── Pulsing gradient orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top-left indigo orb */}
        <div className="appshell-orb appshell-orb-1" />
        {/* Bottom-right violet orb */}
        <div className="appshell-orb appshell-orb-2" />
        {/* Center-right pink orb */}
        <div className="appshell-orb appshell-orb-3" />
        {/* Top-right cyan accent orb */}
        <div className="appshell-orb appshell-orb-4" />
      </div>

      {/* ── Animated floating particles ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="appshell-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              background: `hsl(${p.hue}, 80%, 65%)`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── Scanline sweep — subtle animated light beam ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="appshell-scanline" />
      </div>

      <Navbar />
      <main className="relative z-10 mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <AppShell>
              <AdmissionCalendar />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <AppShell>
              <LearningResources />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-form"
        element={
          <ProtectedRoute>
            <AppShell>
              <CareerForm />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <AppShell>
              <Results />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppShell>
              <Profile />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <AppShell>
              <RoadmapPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment/class10"
        element={
          <ProtectedRoute>
            <AppShell>
              <Class10Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment/class10/form"
        element={
          <ProtectedRoute>
            <AppShell>
              <Class10Form />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment/class10/results"
        element={
          <ProtectedRoute>
            <AppShell>
              <Class10Results />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment/after12"
        element={
          <ProtectedRoute>
            <AppShell>
              <After12Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment/after12/form"
        element={
          <ProtectedRoute>
            <AppShell>
              <After12Form />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment/after12/results"
        element={
          <ProtectedRoute>
            <AppShell>
              <After12Results />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/toolkit/jee-predictor"
        element={
          <ProtectedRoute>
            <AppShell>
              <JEECollegePredictor />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/toolkit/skill-gap"
        element={
          <ProtectedRoute>
            <AppShell>
              <SkillGapAnalysis />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
    <Chatbot />
    </>
  )
}
