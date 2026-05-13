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

/** Authenticated layout — animated mesh gradient background */
function AppShell({ children }) {
  return (
    <div className="app-shell relative flex min-h-screen flex-col overflow-x-hidden" style={{ background: 'rgb(var(--page))' }}>

      {/* ── Animated Mesh Gradient Background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
        <div className="mesh-blob mesh-blob-4" />
        <div className="mesh-blob mesh-blob-5" />
      </div>

      {/* ── Noise texture for depth ── */}
      <div className="mesh-noise pointer-events-none fixed inset-0 z-0" />

      {/* ── Bottom aurora glow ── */}
      <div className="mesh-aurora pointer-events-none fixed inset-x-0 bottom-0 z-0" />

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
