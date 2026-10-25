// Structural type, not an import from profile.ts: vite.config.ts also loads this file, under
// nodenext resolution, which would require file extensions on every import.
interface ImageSet {
  path: string
  widths: number[]
}

/** `srcset` for one format, e.g. "/images/x-600.avif 600w, /images/x-1200.avif 1200w". */
export const srcSet = (img: ImageSet, ext: 'avif' | 'webp') =>
  img.widths.map((w) => `${img.path}-${w}.${ext} ${w}w`).join(', ')

export const imageUrl = (img: ImageSet, width: number, ext: 'avif' | 'webp' | 'jpg') =>
  `${img.path}-${width}.${ext}`

// Desktop hero cutout geometry: 85% of the hero's height (viewport minus the 3.5rem nav), capped
// at 480 px wide; the image is 600:1028, so width = height × 0.5837 → 0.85 × 0.5837 ≈ 0.496.
export const PHOTO_MEDIA = '(min-width: 1024px)'
export const PHOTO_MAX_WIDTH = 480
export const PHOTO_SIZES = `min(${PHOTO_MAX_WIDTH}px, calc((100vh - 3.5rem) * 0.496))`
