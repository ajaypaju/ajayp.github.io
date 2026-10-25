import type { Theme } from '../lib/theme'

interface Props {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${next} theme`}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-text"
    >
      <span aria-hidden="true" className="text-accent">
        {theme === 'dark' ? '◐' : '◑'}
      </span>
      {theme}
    </button>
  )
}
