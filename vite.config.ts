import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { profile } from './src/data/profile.ts'
import { PHOTO_MEDIA, PHOTO_SIZES, srcSet } from './src/lib/images.ts'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Fills %PROFILE_TITLE% / %PROFILE_DESCRIPTION% in index.html from profile.ts, and preloads the
// desktop hero cutout: the page renders client-side, so the browser would otherwise only discover
// the image after the JS bundle runs. `type` makes non-AVIF browsers skip it; `media` keeps phones
// from downloading it.
const profileHead = (): Plugin => ({
  name: 'profile-head',
  transformIndexHtml: (html) => ({
    html: html
      .replaceAll('%PROFILE_TITLE%', escapeHtml(profile.meta.title))
      .replaceAll('%PROFILE_DESCRIPTION%', escapeHtml(profile.meta.description)),
    tags: [
      {
        tag: 'link',
        attrs: {
          rel: 'preload',
          as: 'image',
          type: 'image/avif',
          imagesrcset: srcSet(profile.photo.cutout, 'avif'),
          imagesizes: PHOTO_SIZES,
          media: PHOTO_MEDIA,
          fetchpriority: 'high',
        },
        injectTo: 'head',
      },
    ],
  }),
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), profileHead()],
})
