import { useMediaQuery } from './media'

const query = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = (): boolean => window.matchMedia(query).matches

/** Live `prefers-reduced-motion` value; re-renders when the OS setting changes. */
export const usePrefersReducedMotion = (): boolean => useMediaQuery(query)
