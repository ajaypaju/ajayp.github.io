import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { profile } from './src/data/profile.ts'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Fills %PROFILE_TITLE% / %PROFILE_DESCRIPTION% in index.html from profile.ts.
const profileMeta = (): Plugin => ({
  name: 'profile-meta',
  transformIndexHtml: (html) =>
    html
      .replaceAll('%PROFILE_TITLE%', escapeHtml(profile.meta.title))
      .replaceAll('%PROFILE_DESCRIPTION%', escapeHtml(profile.meta.description)),
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), profileMeta()],
})
