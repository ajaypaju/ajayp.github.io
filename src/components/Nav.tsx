import { profile } from '../data/profile'
import type { Theme } from '../lib/theme'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  theme: Theme
  onToggleTheme: () => void
}

const navSections = profile.sections.filter((s) => s.id !== 'hero')

export function Nav({ theme, onToggleTheme }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <nav aria-label="Primary" className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:px-6">
        <a href="#hero" className="shrink-0 font-mono text-sm text-text">
          <span className="text-accent" aria-hidden="true">
            ~/
          </span>
          ajay-p
        </a>
        <ul className="flex min-w-0 flex-1 gap-1 overflow-x-auto font-mono text-xs [scrollbar-width:none] max-md:[mask-image:linear-gradient(to_right,#000_80%,transparent)]">
          {navSections.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                className="block rounded px-2 py-1.5 text-muted transition-colors hover:text-text"
              >
                {s.navLabel}
              </a>
            </li>
          ))}
        </ul>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </nav>
    </header>
  )
}
