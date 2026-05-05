import { useId } from 'react'
import { Link } from 'react-router-dom'

const SIZES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

/**
 * Minimal mark: upward path with start/end nodes — suggests career progression (sky palette).
 */
export function LogoMark({ className = '', size = 'md' }) {
  const raw = useId().replace(/:/g, '')
  const gradId = `cm-logo-grad-${raw}`

  return (
    <svg
      className={`${SIZES[size] ?? SIZES.md} ${className}`}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="10" y1="42" x2="42" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${gradId})`} />
      <path
        d="M14 34C18 28 22 26 26 22L32 14"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="34" r="3.5" fill="white" />
      <circle cx="32" cy="14" r="3.5" fill="white" />
    </svg>
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
        <span className="font-display text-lg font-bold tracking-tight text-accent sm:text-xl">CareerMatrix</span>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 sm:text-xs">Career Path Prediction</span>
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
