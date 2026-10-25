import { profile } from '../data/profile'

const btn =
  'inline-flex h-11 items-center justify-center rounded-md px-5 font-mono text-sm transition-colors'

export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative">
      {/* Canvas network background comes in a later step. */}
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-32">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-2">{profile.location}</p>
        <h1 id="hero-heading" className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
          {profile.name}
        </h1>
        <p className="mt-3 font-mono text-base text-accent sm:text-lg">{profile.title}</p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{profile.tagline}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href={profile.cvPath} download className={`${btn} bg-accent text-on-accent hover:opacity-90`}>
            Download CV
          </a>
          <a
            href="#contact"
            className={`${btn} border border-line bg-surface text-text hover:border-accent`}
          >
            Contact
          </a>
          {/* Wired to the terminal overlay in a later step. */}
          <button
            type="button"
            disabled
            title="Terminal mode is coming soon"
            className={`${btn} border border-line text-muted disabled:cursor-not-allowed`}
          >
            <span aria-hidden="true" className="mr-2 text-accent">&gt;_</span>
            Open Terminal
          </button>
        </div>
      </div>
    </section>
  )
}
