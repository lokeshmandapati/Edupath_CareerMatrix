
import { Link } from 'react-router-dom'

const SIZES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

export function LogoMark({ className = '', size = 'md' }) {
  // Determine text size based on container size
  const emojiSize = 
    size === 'sm' ? 'text-base' :
    size === 'lg' ? 'text-2xl' :
    size === 'xl' ? 'text-3xl' :
    'text-xl'

  return (
    <div
      className={`flex items-center justify-center rounded-[28%] shadow-lg ring-2 ring-white/10 ${SIZES[size] ?? SIZES.md} ${className}`}
      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      role="img"
      aria-label="Logo"
    >
      <span className={emojiSize}>🎯</span>
    </div>
  )
}

/**
 * Wordmark + optional tagline — use in navbar and auth headers.
 */
export default function Logo({ to = '/login', size = 'md', className = '', showTagline = true }) {
  const inner = (
    <span className="inline-flex items-center gap-3">
      <LogoMark size={size} className="ring-2 ring-white/60 shadow-md transition group-hover:ring-primary/30" />
      <span className="flex flex-col items-start leading-tight">
        <span className="font-display text-xl font-extrabold tracking-tight text-accent sm:text-2xl">CareerMatrix</span>
        {showTagline && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500/80 sm:text-[11px]">Career Path Prediction</span>
        )}
      </span>
    </span>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={`group inline-flex outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
      >
        {inner}
      </Link>
    )
  }

  return inner
}
