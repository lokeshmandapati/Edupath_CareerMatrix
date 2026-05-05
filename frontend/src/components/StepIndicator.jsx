export default function StepIndicator({ current, total, labels }) {
  const pct = total <= 1 ? 100 : ((current - 1) / (total - 1)) * 100
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex flex-1 flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ease-in-out ${
                step < current
                  ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                  : step === current
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-[0_0_24px_rgba(var(--glow))] ring-2 ring-primary/40'
                    : 'bg-surface text-muted ring-1 ring-borderline'
              }`}
            >
              {step < current ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span
              className={`mt-2 hidden text-center text-xs font-medium transition-colors duration-300 sm:block ${
                step === current ? 'text-primary' : 'text-muted'
              }`}
            >
              {labels[step - 1]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface ring-1 ring-borderline">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
