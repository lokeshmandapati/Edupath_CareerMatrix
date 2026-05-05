import { motion } from 'framer-motion'

const ICONS = ['🎯', '📚', '💡', '🛠️', '🚀', '📈', '🌟', '✅']

function BulletList({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">{title}</p>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2 text-xs font-bold text-accent">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * One roadmap step — title, description, optional tools/projects/resources.
 */
export default function RoadmapCard({ step, details, tools, projects, resources, index, total }) {
  const icon = ICONS[index % ICONS.length]
  const toolList = Array.isArray(tools) ? tools : []
  const projectList = Array.isArray(projects) ? projects : []
  const resourceList = Array.isArray(resources) ? resources : []

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
      className="relative pl-0 sm:pl-12"
    >
      {index < total - 1 && (
        <div
          className="absolute left-[1.4rem] top-14 hidden h-[calc(100%-0.5rem)] w-1 bg-gradient-to-b from-primary via-violet-500/50 to-transparent sm:block opacity-30 shadow-[0_0_15px_rgba(var(--primary-glow))]"
          aria-hidden
        />
      )}
      <div className="flex gap-6">
        <div
          className="relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-2xl shadow-premium ring-2 ring-primary/20 transition-transform group-hover:scale-110"
          aria-hidden
        >
          {icon}
        </div>
        <div className="glass min-w-0 flex-1 rounded-3xl border-none p-6 shadow-premium transition-all duration-300 hover:scale-[1.01] hover:bg-surface/80">
          <h3 className="font-display text-xl font-bold text-accent tracking-tight">{step}</h3>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted">{details}</p>
          
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BulletList title="Core Stack" items={toolList} />
            <BulletList title="Practice Projects" items={projectList} />
            <BulletList title="Key Resources" items={resourceList} />
          </div>
        </div>
      </div>
    </motion.article>
  )
}
