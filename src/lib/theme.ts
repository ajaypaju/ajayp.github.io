import { useCallback, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

// index.html sets data-theme before first paint; read it back as the initial state.
const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(currentTheme)

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be blocked (private mode, disabled site data); the theme still applies for this visit.
    }
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  return { theme, setTheme, toggleTheme }
}
