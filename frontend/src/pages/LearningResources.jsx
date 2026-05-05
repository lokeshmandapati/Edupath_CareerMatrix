import { motion } from 'framer-motion'
import { LEARNING_RESOURCES } from '../data/learningResources'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
}

export default function LearningResources() {
  return (
    <PageTransition>
      <div className="mesh-gradient min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <header className="space-y-4">
             <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-emerald-600 uppercase ring-1 ring-emerald-500/20"
            >
              📚 Knowledge Hub
            </motion.div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
              Free Learning <span className="text-primary">Resources</span>
            </h1>
            <p className="max-w-2xl text-lg font-medium text-muted">
              Curated world-class education at your fingertips. No cost, just high-quality practical knowledge.
            </p>
          </header>

          <motion.div 
            variants={container} 
            initial="hidden" 
            animate="show" 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {LEARNING_RESOURCES.map((resource) => (
              <motion.div key={resource.id} variants={item}>
                <Card className="glass group h-full border-none p-6 shadow-premium transition-all hover:scale-[1.02] hover:shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary ring-1 ring-primary/20">
                      {resource.type}
                    </span>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{resource.category}</span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold text-accent leading-tight">{resource.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted line-clamp-2">{resource.description}</p>

                  <div className="mt-6 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Select Your Path:</p>
                    {resource.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl bg-black/[0.02] px-4 py-3 ring-1 ring-black/5 transition-all hover:bg-primary hover:text-white group/link shadow-sm active:scale-[0.97]"
                      >
                        <span className="text-sm font-bold truncate pr-2">{link.name}</span>
                        <svg className="h-4 w-4 shrink-0 transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <section className="rounded-3xl bg-primary/5 p-8 text-center ring-1 ring-primary/10">
             <h2 className="font-display text-xl font-bold text-accent">Want more specialized resources?</h2>
             <p className="mt-2 text-muted">Ask our AI Chatbot for a personalized study plan based on your predicted career!</p>
          </section>
        </div>
      </div>
    </PageTransition>
  )
}
