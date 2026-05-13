import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { THEME_KEY } from '../constants/storageKeys'
import Button from './Button'
import Logo from './Logo'

export default function Navbar() {
  const { isAuthenticated, name, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [theme, setTheme] = useState(() => (localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'))
  const themeLabel = useMemo(() => (theme === 'dark' ? 'Dark' : 'Light'), [theme])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: 'rgba(var(--page), 0.88)',
        borderBottom: '1px solid rgba(var(--borderline))',
        boxShadow: '0 1px 40px rgba(var(--primary), 0.06), 0 1px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-10">
        
        <div className="flex flex-1 justify-start">
          <Logo to={isAuthenticated ? '/dashboard' : '/login'} size="lg" className="transition-transform duration-300 ease-out hover:scale-[1.02]" />
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <div className="flex items-center justify-center">
          {isAuthenticated && (
            <nav className="hidden items-center gap-3 md:flex lg:gap-6">
              {[
                { label: 'Dashboard', path: '/dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
                { label: 'Assessment', path: '/career-form', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
                { label: 'Class 10', path: '/assessment/class10', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg> },
                { label: 'After 12th', path: '/assessment/after12', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
                { label: 'Results', path: '/results', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
              ].map(({ label, path, icon }) => {
                const isActive = location.pathname === path || location.pathname.startsWith(path + '/')
                return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-[13px] font-bold transition-all duration-300 active:scale-95`}
                  style={isActive
                    ? { background: 'rgba(99,102,241,0.2)', color: '#818cf8', boxShadow: '0 0 0 1px rgba(99,102,241,0.3)' }
                    : { color: '#94a3b8' }
                  }
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#818cf8' } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}
                >
                  <span className={`shrink-0 ${isActive ? 'opacity-100' : 'opacity-60'}`}>{icon}</span>
                  <span>{label}</span>
                </Link>
                )
              })}
            </nav>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: '#818cf8' }} viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>

          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link 
                to="/profile"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 text-sm font-extrabold text-white shadow-premium ring-2 ring-white/30 transition-all duration-300 hover:scale-110 hover:shadow-glow overflow-hidden"
                title={`Profile: ${name}`}
              >
                <span className="relative z-10">{name?.charAt(0).toUpperCase() || 'U'}</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-tr from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
              </Link>
              <button 
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all sm:flex"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.8)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
              >
                <span>Logout</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
