import { m, type Variants } from 'framer-motion'
import { photoChips, profile } from '../data/profile'
import { imageUrl, PHOTO_MAX_WIDTH, PHOTO_SIZES, srcSet } from '../lib/images'

const { photo } = profile
const { cutout } = photo
const largest = cutout.widths[cutout.widths.length - 1]

const glass =
  'absolute whitespace-nowrap border border-line/70 bg-surface/70 shadow-lg shadow-black/10 backdrop-blur-md'

interface Props {
  /** Hero entrance variants. Applied to this box itself: a transformed wrapper would become the
   *  containing block and break the height-based sizing. */
  variants: Variants
}

/**
 * Desktop hero figure (the hero mounts it at 1024 px+ only). Sized from the hero's height and
 * absolutely positioned, so it never affects layout; aspect-ratio fixes its box before the image
 * loads (zero layout shift). Likely the desktop LCP element: eager, fetchpriority high, preloaded.
 * The canvas network stays visible around it.
 */
export function HeroCutout({ variants }: Props) {
  return (
    // Box: the right grid column, bottom-aligned, 85% of the hero's height.
    <m.div
      variants={variants}
      className="pointer-events-none absolute bottom-0 right-6 h-[85%] w-[28rem]"
      style={{ maxHeight: PHOTO_MAX_WIDTH * (cutout.height / cutout.width) }}
    >
      <div
        className="group pointer-events-auto absolute bottom-0 left-1/2 h-full -translate-x-1/2"
        style={{ aspectRatio: `${cutout.width} / ${cutout.height}` }}
      >
        {/* Soft mint → cyan glow behind head and shoulders; theme sets its strength (--hero-glow). */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[3%] h-[55%] w-[125%] -translate-x-1/2 rounded-full opacity-[var(--hero-glow)] blur-3xl group-hover:opacity-[calc(var(--hero-glow)*1.35)] motion-safe:transition-opacity motion-safe:duration-500"
          style={{
            background:
              'radial-gradient(closest-side, var(--accent), color-mix(in oklab, var(--accent-2) 70%, transparent) 55%, transparent)',
          }}
        />

        {/* The bottom fades into the page with a mask, so it works on either theme's background. */}
        <picture className="relative block h-full w-full [mask-image:linear-gradient(to_bottom,#000_72%,transparent)]">
          <source type="image/avif" srcSet={srcSet(cutout, 'avif')} sizes={PHOTO_SIZES} />
          <source type="image/webp" srcSet={srcSet(cutout, 'webp')} sizes={PHOTO_SIZES} />
          <img
            src={imageUrl(cutout, largest, 'webp')}
            alt={photo.alt}
            width={cutout.width}
            height={cutout.height}
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-contain"
          />
        </picture>

        {/* Glass chips, positioned clear of the face (top ~36% of the image). */}
        <p className={`${glass} -right-4 top-[38%] rounded-md px-2.5 py-1 font-mono text-[11px] text-muted`}>
          {photoChips.stats}
        </p>
        <p className={`${glass} -left-4 top-[64%] flex items-center gap-2 rounded-full px-3.5 py-2 text-sm`}>
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
          {photoChips.role}
        </p>
      </div>
    </m.div>
  )
}
