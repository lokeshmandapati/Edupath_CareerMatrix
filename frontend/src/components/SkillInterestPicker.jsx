import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Searchable multi-select with category sections, checkbox grid, and tag chips.
 */
export default function SkillInterestPicker({
  categories,
  mode = 'skills',
  selected,
  onChange,
  placeholder = 'Search…',
  recommendedLabels = [],
}) {
  const [q, setQ] = useState('')

  const flat = useMemo(() => {
    const rows = []
    for (const cat of categories) {
      const items = mode === 'skills' ? cat.skills : cat.interests
      if (!items) continue
      for (const item of items) {
        rows.push({
          label: item.label,
          categoryId: cat.id,
          categoryLabel: cat.label,
          icon: cat.icon,
        })
      }
    }
    return rows
  }, [categories, mode])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return flat
    return flat.filter((r) => r.label.toLowerCase().includes(s) || r.categoryLabel.toLowerCase().includes(s))
  }, [flat, q])

  const grouped = useMemo(() => {
    const m = new Map()
    for (const row of filtered) {
      if (!m.has(row.categoryLabel)) m.set(row.categoryLabel, { icon: row.icon, items: [] })
      m.get(row.categoryLabel).items.push(row)
    }
    return m
  }, [filtered])

  const toggle = (label) => {
    if (selected.includes(label)) onChange(selected.filter((x) => x !== label))
    else onChange([...selected, label])
  }

  const remove = (label) => onChange(selected.filter((x) => x !== label))

  return (
    <div className="space-y-4">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-borderline bg-page/40 py-2.5 pl-10 pr-3 text-sm text-accent placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_rgba(var(--glow))]"
        />
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {selected.map((label) => (
              <motion.button
                key={label}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => remove(label)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-accent shadow-sm transition hover:shadow-[0_0_20px_rgba(var(--glow))]"
              >
                <span>{label}</span>
                <span className="text-primary group-hover:text-accent" aria-hidden>
                  ×
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-muted">
        {selected.length} selected · {flat.length} options
      </p>

      <div className="max-h-[min(55vh,420px)] space-y-5 overflow-y-auto rounded-xl border border-borderline bg-page/40 p-4">
        {Array.from(grouped.entries()).map(([catLabel, { icon, items }]) => (
          <div key={catLabel}>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary/90">
              <span aria-hidden>{icon}</span>
              {catLabel}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((row) => {
                const active = selected.includes(row.label)
                const recommended = recommendedLabels.includes(row.label)
                return (
                  <label
                    key={row.label}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      active
                        ? 'border-primary/40 bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
                        : recommended
                          ? 'border-primary/40 bg-surface ring-1 ring-primary/20 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(var(--glow))]'
                          : 'border-borderline bg-surface hover:border-primary/30 hover:bg-page/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggle(row.label)}
                      className="h-4 w-4 rounded border-borderline text-primary focus:ring-primary"
                    />
                    <span className={`${active ? 'text-white' : 'text-accent'}`}>{row.label}</span>
                    {recommended && !active && (
                      <span className="ml-auto shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Suggested
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>
        ))}
        {grouped.size === 0 && <p className="text-center text-sm text-muted">No matches.</p>}
      </div>
    </div>
  )
}
