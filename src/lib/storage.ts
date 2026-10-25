// Storage can throw (private mode, blocked site data). Every access goes through these.

type Area = 'local' | 'session'

const store = (area: Area): Storage => (area === 'local' ? window.localStorage : window.sessionStorage)

/** Returns the stored value, or null when missing or storage is unavailable. */
export function readStorage(area: Area, key: string): string | null {
  try {
    return store(area).getItem(key)
  } catch {
    return null
  }
}

/** Returns false when storage is unavailable. */
export function writeStorage(area: Area, key: string, value: string): boolean {
  try {
    store(area).setItem(key, value)
    return true
  } catch {
    return false
  }
}
