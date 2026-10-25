import { useCallback, useState } from 'react'
import { writeStorage } from './storage'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

// index.html sets data-theme before first paint; read it back as the initial state.
const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(currentTheme)

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next
    // If storage is blocked the theme still applies for this visit.
    writeStorage('local', STORAGE_KEY, next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  return { theme, setTheme, toggleTheme }
}
