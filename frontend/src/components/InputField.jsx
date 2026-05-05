/**
 * Inputs sit on white/surface with borderline borders.
 */
export default function InputField({
  label,
  id,
  type = 'text',
  icon,
  className = '',
  inputClassName = '',
  ...inputProps
}) {
  const inputId = id || label?.replace(/\s+/g, '-').toLowerCase()
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-accent/90">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full rounded-xl border border-borderline bg-surface py-3 text-accent shadow-sm transition-all duration-300 ease-in-out placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_rgba(var(--glow))] ${
            icon ? 'pl-11 pr-3' : 'px-4'
          } ${inputClassName}`}
          {...inputProps}
        />
      </div>
    </div>
  )
}
