import { Section } from '../components/Section'
import { profile } from '../data/profile'

export function WhatIDo() {
  return (
    <Section id="what-i-do">
      <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profile.capabilities.map((c, i) => (
          <li
            key={c.title}
            className="rounded-lg border border-line bg-surface p-6 lg:transition lg:duration-200 lg:hover:border-accent motion-safe:lg:hover:-translate-y-1"
          >
            <p aria-hidden="true" className="font-mono text-xs text-accent-2">
              {String(i + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{c.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{c.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
