import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = (): boolean => window.matchMedia(query).matches

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/** Live `prefers-reduced-motion` value; re-renders when the OS setting changes. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion)
}
