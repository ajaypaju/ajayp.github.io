import { codeCardEntries, profile } from '../data/profile'

// The profile as a TypeScript object, generated from profile.ts.
// Each line is its own small block so the card never outranks the tagline as the LCP element.
// aria-hidden: every fact here is also stated in plain text elsewhere on the page.

// Longest line (in characters, indent included) that fits the card at its 1024 px+ width.
// Longer arrays break one item per line, like Prettier would, so edits to profile.ts can't overflow.
const MAX_LINE = 58

const inlineLength = (key: string, items: string[]) =>
  `  ${key}: [${items.map((item) => `"${item}"`).join(', ')}],`.length

const str = (s: string) => <span className="text-accent">"{s}"</span>
const punct = (s: string) => <span className="text-muted">{s}</span>

const value = (v: string | string[]) =>
  Array.isArray(v) ? (
    <>
      {punct('[')}
      {v.map((item, i) => (
        <span key={item}>
          {str(item)}
          {i < v.length - 1 && punct(', ')}
        </span>
      ))}
      {punct(']')}
    </>
  ) : (
    str(v)
  )

export function CodeCard() {
  const { fileName, variable } = profile.codeCard
  const lines = [
    <>
      <span className="text-accent-2">const</span> {variable} {punct('= {')}
    </>,
    ...codeCardEntries.flatMap(([key, v]) =>
      Array.isArray(v) && inlineLength(key, v) > MAX_LINE
        ? [
            <>
              {'  '}
              {key}
              {punct(': [')}
            </>,
            ...v.map((item) => (
              <>
                {'    '}
                {str(item)}
                {punct(',')}
              </>
            )),
            <>{punct('  ],')}</>,
          ]
        : [
            <>
              {'  '}
              {key}
              {punct(': ')}
              {value(v)}
              {punct(',')}
            </>,
          ],
    ),
    <>
      {punct('};')}
      <span className="ml-0.5 text-accent motion-safe:animate-blink">▍</span>
    </>,
  ]

  return (
    <div aria-hidden="true" className="overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-black/20">
      <div className="flex items-center gap-4 border-b border-line px-4">
        <div className="flex gap-1.5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
        <p className="-mb-px border-b border-accent py-2.5 font-mono text-xs text-text">{fileName}</p>
      </div>
      <div className="overflow-x-auto py-4 font-mono text-[12.5px] leading-6">
        {lines.map((line, i) => (
          <div key={i} className="flex whitespace-pre pr-4">
            <span className="w-10 shrink-0 select-none pr-4 text-right text-muted/50">{i + 1}</span>
            <span className="text-text">{line}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
