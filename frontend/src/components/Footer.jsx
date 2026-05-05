import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-borderline bg-surface/90 py-8 shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} CareerMatrix — Career Path Prediction</p>
        <div className="flex gap-6 text-sm text-slate-500">
          <Link to="/dashboard" className="transition-all duration-300 hover:text-primary">
            Dashboard
          </Link>
          <Link to="/career-form" className="transition-all duration-300 hover:text-primary">
            Assessment
          </Link>
        </div>
      </div>
    </footer>
  )
}
