export default function Loader({ label = 'Loading…', fullPage = false }) {
  const inner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-borderline border-t-primary"
        role="status"
        aria-label={label}
      />
      {label && <p className="text-sm font-medium text-slate-500">{label}</p>}
    </div>
  )
  if (fullPage) {
    return <div className="flex min-h-[40vh] items-center justify-center">{inner}</div>
  }
  return inner
}
