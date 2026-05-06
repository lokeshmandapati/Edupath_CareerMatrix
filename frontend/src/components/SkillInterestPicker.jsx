import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && q.trim()) {
      e.preventDefault()
      const customLabel = q.trim()
      if (!selected.includes(customLabel)) {
        onChange([...selected, customLabel])
      }
      setQ('')
    }
  }

  const exactMatchExists = flat.some((r) => r.label.toLowerCase() === q.trim().toLowerCase())

  return (
    <div className="space-y-5">
      <div className="relative group">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary" aria-hidden>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-borderline bg-surface/50 py-3.5 pl-11 pr-4 text-sm font-medium text-accent placeholder:text-muted backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-sm hover:shadow-md"
        />
        {q.trim() && !exactMatchExists && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={() => handleKeyDown({ key: 'Enter', preventDefault: () => {} })}
              className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
            >
              Add "{q.trim()}" ↵
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            <AnimatePresence>
              {selected.map((label) => (
                <motion.button
                  key={label}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => remove(label)}
                  className="group relative overflow-hidden inline-flex items-center gap-2 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-1.5 text-xs font-bold text-primary shadow-sm transition-all hover:border-primary hover:shadow-glow-primary"
                >
                  <span className="relative z-10">{label}</span>
                  <span className="relative z-10 text-primary/70 group-hover:text-primary" aria-hidden>
                    ×
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
        <span>{selected.length} selected</span>
        <span>{flat.length} options</span>
      </div>

      <div className="max-h-[min(55vh,450px)] space-y-6 overflow-y-auto rounded-2xl border border-borderline/50 bg-surface/30 p-5 backdrop-blur-md shadow-inner">
        {Array.from(grouped.entries()).map(([catLabel, { icon, items }]) => (
          <div key={catLabel} className="animate-fade-in">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-primary/80">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>{icon}</span>
              {catLabel}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {items.map((row) => {
                const active = selected.includes(row.label)
                const recommended = recommendedLabels.includes(row.label)
                return (
                  <button
                    key={row.label}
                    type="button"
                    onClick={() => toggle(row.label)}
                    className={`relative overflow-hidden flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                      active
                        ? 'border-transparent bg-gradient-to-r from-primary to-violet-600 text-white shadow-glow-primary scale-105'
                        : recommended
                          ? 'border-primary/40 bg-primary/5 text-primary hover:border-primary/80 hover:bg-primary/10 hover:shadow-glow hover:-translate-y-0.5'
                          : 'border-borderline bg-surface text-accent hover:border-primary/40 hover:bg-surface hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <span className="relative z-10">{row.label}</span>
                    {recommended && !active && (
                      <span className="relative z-10 shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        ✨ Top
                      </span>
                    )}
                    {active && (
                      <motion.div 
                        layoutId="activeGlow" 
                        className="absolute inset-0 bg-white/20 blur-md"
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {grouped.size === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-muted">No predefined matches.</p>
            {q.trim() && (
              <button
                type="button"
                onClick={() => handleKeyDown({ key: 'Enter', preventDefault: () => {} })}
                className="mt-4 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-glow-primary transition-all hover:scale-105"
              >
                Add "{q.trim()}" as a custom {mode === 'skills' ? 'skill' : 'interest'}
              </button>
            )}
          </div>
        )}

        {/* Dedicated Custom Entry Section */}
        {grouped.size > 0 && (
          <div className="mt-8 border-t border-borderline/50 pt-6">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-primary/80">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </span>
              Custom Entry
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Type your own ${mode === 'skills' ? 'skill' : 'interest'}...`}
                className="flex-1 rounded-xl border border-borderline bg-surface/50 px-4 py-2.5 text-sm font-medium text-accent placeholder:text-muted backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault()
                    const customLabel = e.target.value.trim()
                    if (!selected.includes(customLabel)) {
                      onChange([...selected, customLabel])
                    }
                    e.target.value = ''
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling
                  if (input.value.trim()) {
                    const customLabel = input.value.trim()
                    if (!selected.includes(customLabel)) {
                      onChange([...selected, customLabel])
                    }
                    input.value = ''
                  }
                }}
                className="shrink-0 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-glow-primary transition-all hover:scale-105 active:scale-95"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
