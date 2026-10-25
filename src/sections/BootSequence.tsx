import { m, useIsPresent } from 'framer-motion'
import { useEffect, useState } from 'react'
import { bootLines, profile } from '../data/profile'
import { markBootSeen } from '../lib/boot'

// Timeline (ms). Lines start LINE_GAP apart and each types in over LINE_TYPE;
// the overlay hands off at DONE_AT, inside the 1.5 s budget, then fades for FADE.
const LINE_GAP = 180
const LINE_TYPE = 140
const DONE_AT = 1400
const FADE = 0.3

interface Props {
  onDone: () => void
}

/**
 * Decorative overlay: hidden from assistive tech, never takes focus. The page renders
 * underneath from the start, so it never delays the real content.
 * Render inside <AnimatePresence> so the exit fade plays.
 */
export function BootSequence({ onDone }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const isPresent = useIsPresent()

  useEffect(() => {
    markBootSeen()
  }, [])

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = now - start
      setElapsed(t)
      if (t >= DONE_AT) onDone()
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Any key, click or tap skips. Nothing is prevented, so the key still does its normal job.
    window.addEventListener('keydown', onDone)
    window.addEventListener('pointerdown', onDone)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onDone)
      window.removeEventListener('pointerdown', onDone)
    }
  }, [onDone])

  return (
    <m.div
      aria-hidden="true"
      exit={{ opacity: 0 }}
      transition={{ duration: FADE, ease: 'easeOut' }}
      className={`fixed inset-0 z-50 flex flex-col bg-bg font-mono text-[13px] leading-6 sm:text-sm ${
        isPresent ? '' : 'pointer-events-none'
      }`}
    >
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-24 sm:px-6 sm:pt-32">
        {bootLines.map((line, i) => {
          const lineElapsed = elapsed - i * LINE_GAP
          if (lineElapsed <= 0) return null
          const chars = Math.ceil((Math.min(lineElapsed, LINE_TYPE) / LINE_TYPE) * line.text.length)
          const typing = chars < line.text.length
          return (
            <p key={i} className="break-words text-muted">
              {line.kind === 'prompt' && <span className="text-accent-2">&gt; </span>}
              {line.kind === 'ok' && <span className="text-accent">[ ok ] </span>}
              {line.text.slice(0, chars)}
              {typing && <span className="text-accent">▍</span>}
            </p>
          )
        })}
      </div>
      <p className="px-4 pb-8 text-center text-xs text-muted">{profile.ui.bootSkipHint}</p>
    </m.div>
  )
}
