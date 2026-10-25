import type { ReactNode } from 'react'
import { sectionById, type SectionId } from '../data/profile'

interface Props {
  id: SectionId
  /** Two-digit index shown as a mono label, e.g. "03". */
  index: string
  children?: ReactNode
}

export function Section({ id, index, children }: Props) {
  const meta = sectionById(id)
  const headingId = `${id}-heading`
  return (
    <section id={id} aria-labelledby={headingId} className="border-t border-line py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-2">
          <span aria-hidden="true">{index} / </span>
          {id}
        </p>
        <h2 id={headingId} className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {meta.heading}
        </h2>
        {children ?? <p className="mt-4 font-mono text-sm text-muted">// {meta.placeholder}</p>}
      </div>
    </section>
  )
}
