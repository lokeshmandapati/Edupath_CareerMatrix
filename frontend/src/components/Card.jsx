/**
 * Futuristic dark card — subtle border + glow hover.
 */
export default function Card({ children, className = '', hover = false, padding = 'p-6' }) {
  return (
    <div
      className={`rounded-2xl border border-borderline bg-surface shadow-card transition-all duration-300 ease-in-out ${padding} ${
        hover ? 'hover:scale-[1.02] hover:shadow-glow hover:border-primary/40' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
