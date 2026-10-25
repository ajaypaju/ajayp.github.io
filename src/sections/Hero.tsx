import { m, type Variants } from 'framer-motion'
import { CodeCard } from '../components/CodeCard'
import { NetworkCanvas } from '../components/NetworkCanvas'
import { RoleTyper } from '../components/RoleTyper'
import { heroStatus, profile } from '../data/profile'
import { usePrefersReducedMotion } from '../lib/motion'

const btn =
  'inline-flex h-11 items-center justify-center rounded-md px-5 font-mono text-sm transition-colors'

// Staggered entrance, ~580 ms end to end (8 items, 40 ms apart, 300 ms each).
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}
// The name and tagline are the likely LCP elements: they slide but never start invisible.
const lcpItem: Variants = {
  hidden: { opacity: 1, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

interface Props {
  /** False while the boot overlay is up; the entrance plays when it hands off. */
  ready: boolean
}

export function Hero({ ready }: Props) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden">
      <NetworkCanvas />
      <m.div
        variants={container}
        initial={reducedMotion ? false : 'hidden'}
        animate={ready || reducedMotion ? 'show' : 'hidden'}
        className="relative mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-5xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-8"
      >
        <div>
        <m.div variants={item} className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-accent-2">{profile.location}</p>
          {profile.openToWork && (
            <p className="rounded-full border border-accent/40 px-2.5 py-0.5 font-mono text-xs text-accent">
              {profile.ui.openToWork}
            </p>
          )}
        </m.div>

        <m.h1
          variants={lcpItem}
          id="hero-heading"
          className="mt-4 text-5xl font-bold tracking-tight sm:text-7xl"
        >
          {profile.name}
        </m.h1>

        <m.p variants={item} className="mt-4 flex gap-[1ch] font-mono text-base text-accent sm:text-lg">
          <span aria-hidden="true" className="text-muted">
            &gt;
          </span>
          <RoleTyper
            roles={profile.heroRoles}
            staticText={profile.title}
            active={ready}
            reducedMotion={reducedMotion}
          />
        </m.p>

        <m.p variants={lcpItem} className="mt-4 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          {profile.tagline}
        </m.p>

        {/* One line from 1024 px: the code card leaves ~496 px for this column. */}
        <m.p
          variants={item}
          className="mt-6 flex items-center gap-2.5 font-mono text-xs text-muted sm:text-sm lg:whitespace-nowrap lg:text-xs"
        >
          <span aria-hidden="true" className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          {heroStatus}
        </m.p>

        <m.div variants={item} className="mt-10 flex flex-wrap gap-3">
          <a href={profile.cvPath} download className={`${btn} bg-accent text-on-accent hover:opacity-90`}>
            {profile.ui.downloadCv}
          </a>
          <a href="#contact" className={`${btn} border border-line bg-surface text-text hover:border-accent`}>
            {profile.ui.contact}
          </a>
          {/* Wired to the terminal overlay in a later step. */}
          <button
            type="button"
            disabled
            title={profile.ui.openTerminalSoon}
            className={`${btn} border border-line text-muted disabled:cursor-not-allowed`}
          >
            <span aria-hidden="true" className="mr-2 text-accent">
              &gt;_
            </span>
            {profile.ui.openTerminal}
          </button>
        </m.div>
        </div>

        {/* Desktop only; not rendered into layout below 1024 px. */}
        <m.div variants={item} className="hidden lg:block">
          <CodeCard />
        </m.div>
      </m.div>
    </section>
  )
}
