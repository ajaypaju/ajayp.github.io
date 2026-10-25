import { m } from 'framer-motion'
import { photoChips, profile } from '../data/profile'
import { imageUrl, PHOTO_SIZES, srcSet } from '../lib/images'

const { photo } = profile
const { portrait } = photo
const largest = portrait.widths[portrait.widths.length - 1]

// Thin mint "viewfinder" brackets, one per corner.
const CORNERS = [
  'left-3 top-3 border-l-2 border-t-2',
  'right-3 top-3 border-r-2 border-t-2',
  'bottom-3 left-3 border-b-2 border-l-2',
  'bottom-3 right-3 border-b-2 border-r-2',
]

interface Props {
  /** Plays the one-time scan line; false while the boot overlay is up. */
  ready: boolean
  reducedMotion: boolean
}

/**
 * Hero photo, desktop only (the hero mounts it at 1024 px+ so phones never download the portrait).
 * Likely the desktop LCP element: eager, fetchpriority high, and preloaded from index.html.
 */
export function PhotoCard({ ready, reducedMotion }: Props) {
  return (
    <div className="group relative">
      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-black/20 motion-safe:transition-[border-color,box-shadow] motion-safe:duration-300 motion-safe:group-hover:border-accent motion-safe:group-hover:shadow-[0_0_32px_-8px_var(--color-accent)]">
        <div aria-hidden="true" className="flex items-center gap-4 border-b border-line px-4">
          <div className="flex gap-1.5 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
          </div>
          <p className="-mb-px border-b border-accent py-2.5 font-mono text-xs text-text">{photo.fileName}</p>
        </div>

        <div className="p-3">
          {/* aspect-ratio + width/height reserve the space before the image loads: no layout shift. */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-line">
            <picture>
              <source type="image/avif" srcSet={srcSet(portrait, 'avif')} sizes={PHOTO_SIZES} />
              <source type="image/webp" srcSet={srcSet(portrait, 'webp')} sizes={PHOTO_SIZES} />
              <img
                src={imageUrl(portrait, largest, 'jpg')}
                alt={photo.alt}
                width={portrait.width}
                height={portrait.height}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02]"
              />
            </picture>

            {CORNERS.map((c) => (
              <span key={c} aria-hidden="true" className={`pointer-events-none absolute h-5 w-5 border-accent ${c}`} />
            ))}

            {/* One quick scan line on load; transform-only, so it never shifts layout. */}
            {ready && !reducedMotion && (
              <m.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                initial={{ y: '-100%', opacity: 1 }}
                animate={{ y: '0%', opacity: [1, 1, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut', times: [0, 0.85, 1] }}
              >
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-accent/15" />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-accent shadow-[0_0_12px_var(--color-accent)]" />
              </m.div>
            )}
          </div>
        </div>
      </div>

      {/* Chips overlap the card edges, clear of the face. */}
      <p className="absolute -right-3 -top-3 rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[11px] text-muted shadow-lg shadow-black/20">
        {photoChips.stats}
      </p>
      <p className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm shadow-lg shadow-black/20">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
        {photoChips.role}
      </p>
    </div>
  )
}
