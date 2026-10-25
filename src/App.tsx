import { AnimatePresence, domAnimation, LazyMotion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { CommandPalette } from './components/CommandPalette'
import { Nav } from './components/Nav'
import { TerminalOverlay } from './components/TerminalOverlay'
import { profile } from './data/profile'
import { shouldPlayBoot } from './lib/boot'
import { useTheme } from './lib/theme'
import { Architecture } from './sections/Architecture'
import { Awards } from './sections/Awards'
import { BootSequence } from './sections/BootSequence'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Hero } from './sections/Hero'
import { Metrics } from './sections/Metrics'
import { PromptToTask } from './sections/PromptToTask'
import { Skills } from './sections/Skills'

const year = new Date().getFullYear()

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [booting, setBooting] = useState(shouldPlayBoot)
  const endBoot = useCallback(() => setBooting(false), [])

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence>{booting && <BootSequence onDone={endBoot} />}</AnimatePresence>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-on-accent"
      >
        {profile.ui.skipLink}
      </a>
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      <main id="main">
        <Hero ready={!booting} />
        <Metrics />
        <PromptToTask />
        <Architecture />
        <Experience />
        <Skills />
        <Awards />
        <Contact />
      </main>
      <footer className="border-t border-line py-8">
        <p className="mx-auto max-w-5xl px-4 font-mono text-xs text-muted sm:px-6">
          © {year} {profile.name} · {profile.location}
        </p>
      </footer>
      <CommandPalette />
      <TerminalOverlay />
    </LazyMotion>
  )
}
