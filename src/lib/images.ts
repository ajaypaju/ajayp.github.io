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

// Hero photo card geometry: 28rem column, 1px border, 12px padding → 422 px of photo.
export const PHOTO_MEDIA = '(min-width: 1024px)'
export const PHOTO_SIZES = '422px'
