import { useEffect, useRef, useState } from 'react'
import { FlowDiagram } from '../components/FlowDiagram'
import { PromptTerminal } from '../components/PromptTerminal'
import { Section } from '../components/Section'
import { profile } from '../data/profile'
import { usePrefersReducedMotion } from '../lib/motion'
import { buildTimeline, stepStatus } from '../lib/promptTimeline'

const content = profile.promptToTask
const timeline = buildTimeline(content.steps)
const START_RATIO = 0.35 // autoplay once this much of the demo is visible

export function PromptToTask() {
  const reducedMotion = usePrefersReducedMotion()
  const demoRef = useRef<HTMLDivElement>(null)
  const tRef = useRef(0)
  const startedRef = useRef(false)
  const [playT, setPlayT] = useState(0)
  // Reduced motion never plays: it shows the finished state, or the step a dot jumped to.
  const [reducedT, setReducedT] = useState(timeline.total)
  const [playing, setPlaying] = useState(false)
  const [inView, setInView] = useState(false)
  const t = reducedMotion ? reducedT : playT

  const setT = (next: number) => {
    tRef.current = next
    setPlayT(next)
  }

  // Autoplay once when the demo scrolls into view; pause while it's off-screen.
  useEffect(() => {
    const el = demoRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= START_RATIO) {
          setInView(true)
          if (!startedRef.current) {
            startedRef.current = true
            setPlaying(true)
          }
        } else if (!entry.isIntersecting) {
          setInView(false)
        }
      },
      { threshold: [0, START_RATIO] },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // The clock. rAF doesn't fire in hidden tabs, and dt is clamped, so a hidden tab pauses too.
  useEffect(() => {
    if (!playing || !inView || reducedMotion) return
    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const next = Math.min(timeline.total, tRef.current + Math.min(now - last, 50))
      last = now
      tRef.current = next
      setPlayT(next)
      if (next >= timeline.total) setPlaying(false)
      else raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [playing, inView, reducedMotion])

  const replay = () => {
    startedRef.current = true
    if (reducedMotion) return setReducedT(timeline.total)
    setT(0)
    setPlaying(true)
  }

  // Under reduced motion a jump shows that step's finished lines at once; otherwise it plays from there.
  const jumpTo = (i: number) => {
    startedRef.current = true
    const step = timeline.steps[i]
    if (reducedMotion) return setReducedT(step.end - 1)
    setT(step.start)
    setPlaying(true)
  }

  const statuses = timeline.steps.map((s) => stepStatus(s, t, timeline.total))

  return (
    <Section
      id="ai"
      className="bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,color-mix(in_oklab,var(--accent)_7%,transparent),transparent)]"
    >
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{content.intro}</p>

      <div ref={demoRef} className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
        <PromptTerminal content={content} timeline={timeline} t={t} />
        <div>
          <FlowDiagram steps={content.steps} timeline={timeline} t={t} />
          <ol aria-label={content.ui.stepsLabel} className="sr-only">
            {content.steps.map((step) => (
              <li key={step.node}>
                {step.node}: {step.caption}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={replay}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-surface px-4 font-mono text-sm text-text transition-colors hover:border-accent"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
          </svg>
          {content.ui.replay}
        </button>
        <div className="flex items-center gap-1">
          {content.steps.map((step, i) => (
            <button
              key={step.node}
              type="button"
              onClick={() => jumpTo(i)}
              aria-label={`${content.ui.jumpTo} ${i + 1}: ${step.node}`}
              aria-current={statuses[i] === 'active' ? 'step' : undefined}
              className="group flex h-8 w-8 items-center justify-center rounded-full"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full transition-colors group-hover:bg-accent ${
                  statuses[i] === 'active'
                    ? 'bg-accent shadow-[0_0_10px_var(--color-accent)]'
                    : statuses[i] === 'done'
                      ? 'bg-accent/50'
                      : 'bg-line'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {content.takeaways.map((item) => (
          <li key={item.title} className="border-l-2 border-accent/60 pl-4">
            <h3 className="font-semibold tracking-tight">{item.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
