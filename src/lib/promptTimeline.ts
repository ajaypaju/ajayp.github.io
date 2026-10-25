import type { FlowStep, TranscriptKind } from '../data/profile'

// The Prompt → Task walkthrough as one deterministic timeline (ms). The terminal, the diagram
// and the controls all derive their state from a single clock `t`, so they can't drift apart.

const CHAR_MS: Partial<Record<TranscriptKind, number>> = { shell: 45, prompt: 28 } // typed kinds
const AFTER_TYPED = 250 // pause after a typed line
const OUTPUT_GAP = 420 // output lines appear one per gap
const LINES_LEAD = 350 // lines start this long after their step (packet already moving)
export const PACKET_MS = 700 // packet travel along the edge into the step's node
const STEP_HOLD = 450 // pause before the next step

export interface LineTiming {
  step: number
  start: number
  /** 0 for lines that appear at once. */
  typeMs: number
  length: number
}

export interface StepTiming {
  start: number
  end: number
}

export interface Timeline {
  lines: LineTiming[]
  steps: StepTiming[]
  total: number
}

export function buildTimeline(steps: FlowStep[]): Timeline {
  const lines: LineTiming[] = []
  const stepTimings: StepTiming[] = []
  let cursor = 0
  steps.forEach((step, stepIndex) => {
    const start = cursor
    let at = start + LINES_LEAD
    for (const line of step.lines) {
      const perChar = CHAR_MS[line.kind]
      const typeMs = perChar ? line.text.length * perChar : 0
      lines.push({ step: stepIndex, start: at, typeMs, length: line.text.length })
      at += typeMs ? typeMs + AFTER_TYPED : OUTPUT_GAP
    }
    const end = Math.max(at, start + PACKET_MS) + STEP_HOLD
    stepTimings.push({ start, end })
    cursor = end
  })
  return { lines, steps: stepTimings, total: cursor }
}

/** Characters of a line visible at time t; -1 while the line hasn't started (prefix hidden too). */
export function visibleChars(line: LineTiming, t: number): number {
  if (t < line.start) return -1
  if (!line.typeMs) return line.length
  return Math.min(line.length, Math.floor(((t - line.start) / line.typeMs) * line.length))
}

export type StepStatus = 'upcoming' | 'active' | 'done'

export function stepStatus(step: StepTiming, t: number, total: number): StepStatus {
  if (t >= total || t >= step.end) return 'done'
  if (t > step.start) return 'active' // strict, so nothing is active at t = 0 before playback
  return 'upcoming'
}

/** 0..1 progress of the packet travelling into a step's node. */
export const packetProgress = (step: StepTiming, t: number): number =>
  Math.max(0, Math.min(1, (t - step.start) / PACKET_MS))
