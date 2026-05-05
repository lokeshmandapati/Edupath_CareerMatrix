import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'

export default function Class10Dashboard() {
  return (
    <PageTransition>
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-accent sm:text-4xl">Class 10 stream assessment</h1>
          <p className="max-w-2xl text-slate-600">
            Answer a quick profile check (marks + interests) and get a suggested stream: Science, Commerce, or Humanities.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-lg">
            <h2 className="font-display text-xl font-semibold text-accent">What you’ll get</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="rounded-xl bg-page/70 px-4 py-3 ring-1 ring-borderline">A ranked list of streams with match %</li>
              <li className="rounded-xl bg-page/70 px-4 py-3 ring-1 ring-borderline">A short explanation of why the stream fits</li>
              <li className="rounded-xl bg-page/70 px-4 py-3 ring-1 ring-borderline">You can retake any time</li>
            </ul>
          </Card>

          <Link to="/assessment/class10/form" className="group block">
            <Card hover className="h-full border-primary/20 bg-gradient-to-br from-surface to-page shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-page shadow-sm ring-1 ring-borderline">
                <span className="text-2xl" aria-hidden>
                  🎯
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-accent">Start assessment</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Takes ~2 minutes.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors duration-300 group-hover:text-primary/80">
                Begin
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Card>
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}

