import { useEffect, useState } from 'react'

const TYPE_MS = 55
const DELETE_MS = 30
const PAUSE_MS = 2000
const GAP_MS = 300

interface Props {
  roles: string[]
  /** Shown instead of the cycle under reduced motion, and always to screen readers. */
  staticText: string
  /** Cycling starts once true (after the boot overlay hands off). */
  active: boolean
  reducedMotion: boolean
}

/** Types each role in, pauses, deletes it, moves on. Starts with the first role fully shown. */
export function RoleTyper({ roles, staticText, active, reducedMotion }: Props) {
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(roles[0]?.length ?? 0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!active || reducedMotion || roles.length < 2) return
    const word = roles[index]
    let delay: number
    let next: () => void
    if (!deleting && length === word.length) {
      delay = PAUSE_MS
      next = () => setDeleting(true)
    } else if (deleting && length === 0) {
      delay = GAP_MS
      next = () => {
        setDeleting(false)
        setIndex((index + 1) % roles.length)
      }
    } else {
      delay = deleting ? DELETE_MS : TYPE_MS
      next = () => setLength(length + (deleting ? -1 : 1))
    }
    const timer = window.setTimeout(next, delay)
    return () => window.clearTimeout(timer)
  }, [active, reducedMotion, roles, index, length, deleting])

  if (reducedMotion) return <>{staticText}</>

  // The invisible longest role shares a grid cell with the typed text, so the line is always
  // exactly as tall as the longest role wraps to at this width: no shift, no oversized gap.
  const longest = roles.reduce((a, b) => (b.length > a.length ? b : a), '')

  return (
    <>
      <span className="sr-only">{staticText}</span>
      <span aria-hidden="true" className="grid">
        <span className="invisible col-start-1 row-start-1">{longest}▍</span>
        <span className="relative col-start-1 row-start-1">
          {roles[index].slice(0, length)}
          {/* Moved with a transform (monospace, so n chars = n ch): a caret that reflows with the
              text counts as layout shift on every keystroke. Every role fits one line from 360 px. */}
          <span
            className="absolute left-0 top-0 text-accent motion-safe:animate-blink"
            style={{ transform: `translateX(${length}ch)` }}
          >
            ▍
          </span>
        </span>
      </span>
    </>
  )
}
