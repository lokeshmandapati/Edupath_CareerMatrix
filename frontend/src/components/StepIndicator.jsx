import { motion } from 'framer-motion'

export default function StepIndicator({ current, total, labels }) {
  const pct = total <= 1 ? 100 : ((current - 1) / (total - 1)) * 100
  return (
    <div className="relative mb-10 w-full px-2">
      {/* Background Line */}
      <div className="absolute left-0 top-5 -z-10 h-1 w-full -translate-y-1/2 rounded-full bg-borderline" />
      
      {/* Animated Progress Line */}
      <div 
        className="absolute left-0 top-5 -z-10 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />

      <div className="flex items-center justify-between">
        {Array.from({ length: total }, (_, i) => i + 1).map((step) => {
          const isCompleted = step < current
          const isActive = step === current
          
          return (
            <div key={step} className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isActive || isCompleted ? 'rgb(var(--primary))' : 'rgb(var(--surface))',
                  borderColor: isActive || isCompleted ? 'transparent' : 'rgba(var(--borderline))',
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-all duration-300 ${
                  isActive || isCompleted ? 'text-white shadow-glow-primary' : 'border-2 text-muted'
                }`}
              >
                {isCompleted ? (
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </motion.div>
              <span
                className={`absolute mt-12 text-center text-[11px] font-bold uppercase tracking-wider transition-all duration-300 sm:text-xs ${
                  isActive ? 'text-primary' : isCompleted ? 'text-primary/70' : 'text-muted'
                } ${!isActive && 'hidden sm:block'}`}
              >
                {labels[step - 1]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
