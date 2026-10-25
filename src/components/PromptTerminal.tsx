import { useLayoutEffect, useRef } from 'react'
import type { PromptToTask, TranscriptKind } from '../data/profile'
import { stepStatus, visibleChars, type Timeline } from '../lib/promptTimeline'

const PREFIX: Record<TranscriptKind, string> = { shell: '$ ', prompt: '> ', call: '→ ', ok: '✓ ' }
const PREFIX_COLOR: Record<TranscriptKind, string> = {
  shell: 'text-muted',
  prompt: 'text-accent-2',
  call: 'text-accent-2',
  ok: 'text-accent',
}
// Keeps an empty typed span measurable, so the caret can sit right after the prompt prefix.
const ZWSP = String.fromCharCode(0x200b)

const TEXT_COLOR: Record<TranscriptKind, string> = {
  shell: 'text-text',
  prompt: 'text-text',
  call: 'text-muted',
  ok: 'text-text',
}

interface Props {
  content: PromptToTask
  timeline: Timeline
  t: number
}

/**
 * Each line renders its full text in transparent ink, which reserves the final height up front
 * (zero layout shift) and keeps the whole transcript readable to screen readers. A visible copy
 * grows over it as the line types; its untyped remainder is kept but invisible, so the partial
 * line always wraps exactly like the finished one.
 */
export function PromptTerminal({ content, timeline, t }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const typedRefs = useRef<(HTMLSpanElement | null)[]>([])

  // The line being typed right now, if any.
  const typingLine = timeline.lines.findIndex(
    (l) => l.typeMs > 0 && t >= l.start && t < l.start + l.typeMs + 250 && t < timeline.total,
  )

  // Caret moves with a transform from a measured Range: a caret that reflowed after the text
  // would count as layout shift on every keystroke.
  useLayoutEffect(() => {
    const caret = caretRef.current
    const body = bodyRef.current
    const typed = typingLine >= 0 ? typedRefs.current[typingLine] : null
    if (!caret || !body) return
    const textNode = typed?.firstChild
    if (!(textNode instanceof Text) || textNode.length === 0) {
      caret.style.opacity = '0'
      return
    }
    const range = document.createRange()
    range.setStart(textNode, textNode.length - 1)
    range.setEnd(textNode, textNode.length)
    const rects = range.getClientRects()
    const last = rects[rects.length - 1]
    if (!last) return
    const origin = body.getBoundingClientRect()
    caret.style.transform = `translate(${last.right - origin.left}px, ${last.top - origin.top}px)`
    caret.style.height = `${last.height}px`
    caret.style.opacity = '1'
  })

  let lineIndex = 0
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div aria-hidden="true" className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
        <p className="min-w-0 truncate font-mono text-xs text-muted">{content.terminalTitle}</p>
        <p className="ml-auto shrink-0 whitespace-nowrap rounded border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
          {content.exampleLabel}
        </p>
      </div>

      <div ref={bodyRef} className="relative flex-1 p-4 font-mono text-[13px] leading-6 sm:text-sm">
        {content.steps.map((step, s) => {
          const active = stepStatus(timeline.steps[s], t, timeline.total) === 'active'
          return (
            <div
              key={step.node}
              className={`border-l-2 pl-3 transition-colors duration-300 ${s > 0 ? 'mt-3' : ''} ${
                active ? 'border-accent' : 'border-transparent'
              }`}
            >
              {step.lines.map((line) => {
                const i = lineIndex++
                const shown = visibleChars(timeline.lines[i], t)
                return (
                  <p key={i} className="relative break-words">
                    <span className="text-transparent">
                      <span aria-hidden="true">{PREFIX[line.kind]}</span>
                      {line.text}
                    </span>
                    <span aria-hidden="true" className="absolute inset-0">
                      {shown >= 0 && (
                        <>
                          <span className={PREFIX_COLOR[line.kind]}>{PREFIX[line.kind]}</span>
                          <span
                            ref={(el) => {
                              typedRefs.current[i] = el
                            }}
                            className={TEXT_COLOR[line.kind]}
                          >
                            {line.text.slice(0, shown) || ZWSP}
                          </span>
                          <span className="invisible">{line.text.slice(shown)}</span>
                        </>
                      )}
                    </span>
                  </p>
                )
              })}
            </div>
          )
        })}
        <span
          ref={caretRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 w-[0.55em] bg-accent opacity-0"
        />
      </div>
    </div>
  )
}
