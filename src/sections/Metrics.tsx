import { useEffect, useRef, useState } from 'react'
import { Section } from '../components/Section'
import { profile, type Metric } from '../data/profile'
import { usePrefersReducedMotion } from '../lib/motion'

const DURATION = 1200
const START_RATIO = 0.4 // count once this much of the strip is visible
const easeOut = (t: number) => 1 - (1 - t) ** 3

// "~300 ms" → { pre: "~", n: 300, post: " ms" }. Values without a number render as-is.
const parse = (s: string) => {
  const m = s.match(/^(\D*)(\d+)(.*)$/)
  return m ? { pre: m[1], n: Number(m[2]), post: m[3] } : null
}

/** The number at progress p (0..1); a before → after metric counts from `from` to `to`. */
function valueAt(metric: Metric, p: number): string {
  const end = parse(metric.to ?? metric.value)
  if (!end) return metric.value
  const start = metric.from ? (parse(metric.from)?.n ?? 0) : 0
  return `${end.pre}${Math.round(start + (end.n - start) * p)}${end.post}`
}

function LatencyBars({ metric, p }: { metric: Metric; p: number }) {
  const from = parse(metric.from ?? '')?.n ?? 1
  const to = parse(metric.to ?? '')?.n ?? from
  // The "after" bar starts at the full 900 width and shrinks to 300/900 (transform only).
  const scale = 1 - (1 - to / from) * p
  const row = 'grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-2'
  return (
    <div aria-hidden="true" className="mt-4 space-y-1.5 font-mono text-[11px] text-muted">
      <div className={row}>
        <span>{profile.ui.metricBefore}</span>
        <span className="h-1.5 rounded-full bg-muted/35" />
        <span className="tabular-nums">{metric.from}</span>
      </div>
      <div className={row}>
        <span>{profile.ui.metricAfter}</span>
        <span className="h-1.5 origin-left rounded-full bg-accent" style={{ transform: `scaleX(${scale})` }} />
        <span className="tabular-nums text-accent">{metric.to}</span>
      </div>
    </div>
  )
}

export function Metrics() {
  const reducedMotion = usePrefersReducedMotion()
  const ref = useRef<HTMLDListElement>(null)
  const [progress, setProgress] = useState(0)
  // Reduced motion shows the final values immediately.
  const p = reducedMotion ? 1 : easeOut(progress)

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion) return
    let raf = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < START_RATIO) return
        observer.disconnect() // once
        const start = performance.now()
        const frame = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION)
          setProgress(t)
          if (t < 1) raf = requestAnimationFrame(frame)
        }
        raf = requestAnimationFrame(frame)
      },
      { threshold: [START_RATIO] },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [reducedMotion])

  return (
    <Section id="metrics">
      <dl ref={ref} className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {profile.metrics.map((metric) => {
          const final = metric.to ?? metric.value
          return (
            <div key={metric.id} className="flex flex-col border-l border-line pl-4">
              <dt className="order-2 mt-2 text-sm text-muted">{metric.caption ?? metric.label}</dt>
              {/* Screen readers get the final value; the counting text is visual only. Tabular
                  figures plus a min-width of the final value's length keep counting shift-free. */}
              <dd className="order-1">
                <span className="sr-only">{final}</span>
                <span
                  aria-hidden="true"
                  className="inline-block whitespace-nowrap font-mono text-3xl font-medium tabular-nums tracking-tight text-text sm:text-4xl"
                  style={{ minWidth: `${final.length}ch` }}
                >
                  {valueAt(metric, p)}
                </span>
              </dd>
              {metric.from && metric.to && (
                <dd className="order-3">
                  <LatencyBars metric={metric} p={p} />
                </dd>
              )}
            </div>
          )
        })}
      </dl>
    </Section>
  )
}
