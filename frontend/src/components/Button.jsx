/**
 * Sky primary + secondary actions — scale hover per design system.
 */
export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:pointer-events-none disabled:opacity-50'
  const variants = {
    primary:
      'bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow hover:brightness-110 hover:shadow-[0_0_26px_rgba(var(--glow))] active:scale-[0.99]',
    secondary:
      'border border-primary/60 bg-transparent text-primary shadow-sm hover:bg-primary hover:text-white hover:shadow-glow',
    ghost: 'text-muted hover:bg-surface hover:text-accent',
    danger: 'border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/15',
  }
  return (
    <button type={type} disabled={disabled} className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}
