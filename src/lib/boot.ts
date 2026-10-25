import { prefersReducedMotion } from './motion'
import { readStorage, writeStorage } from './storage'

const SEEN_KEY = 'boot-seen'

/**
 * Play only on the first visit of a browser session, never under reduced motion.
 * If sessionStorage is unavailable we can't promise "once", so we skip it.
 * Idempotent, so it is safe as a useState initializer; the overlay marks itself seen on mount.
 */
export function shouldPlayBoot(): boolean {
  if (prefersReducedMotion()) return false
  if (readStorage('session', SEEN_KEY) !== null) return false
  return writeStorage('session', '__probe', '1')
}

export const markBootSeen = () => {
  writeStorage('session', SEEN_KEY, '1')
}
