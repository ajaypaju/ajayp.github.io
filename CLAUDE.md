# Ajay P — Portfolio

Static single-page **Technical Lead** portfolio that feels like a **developer tool, not a template**.
Recruiters must understand the value in 10 seconds; engineers should find depth and easter eggs.
**Every visual effect must carry real content** (a real metric, a real system Ajay built) — never decoration alone.

## Positioning (applies to every step)
- This is a Technical Lead portfolio, **not a showcase of the employer's product**. Ajay is a Technical Lead
  who builds scalable systems and AI automation; the SaaS platform is proof, not the label.
- **Never show the product name "Desklog" / "Desklog.io"** anywhere visible: hero, status line, boot sequence,
  metrics, section text, terminal output, page title, meta tags. Say "the platform" or
  "a multi-tenant SaaS platform" instead.
- The employer, **Infinite Open Source Solutions LLP**, appears **only in the Experience section**.
- **Keep every real number and achievement** (500+ organizations, 5+ years, ~900 ms → ~300 ms, 60%, the MCP
  server, Claude Code integration, AI bot users, awards). Only the product name goes.
- Check before every commit: `grep -rli desklog dist/` must find nothing (the CV PDF is exempt).

## Stack (fixed — do not change without asking)
- Vite + React + TypeScript (`strict: true`), Tailwind CSS v4 (`@tailwindcss/vite`), Framer Motion.
- No backend, no API keys, no tracking/analytics scripts. Output is a static build in `dist/`.
- Minimal dependencies. **No 3D libraries.** Ask before adding any new dependency.

## Commands
- `npm run dev` — dev server
- `npm run build` — `tsc -b && vite build`; must pass with zero TypeScript errors
- `npm run lint` — oxlint
- `npm run preview` — serve `dist/`

## Non-negotiable rules
1. **Facts come only from `src/data/profile.ts`.** Never invent skills, metrics, companies, testimonials or projects.
   If something seems missing, ask Ajay instead of filling it in.
2. **Never show the phone number anywhere on the site.**
3. Every animation respects `prefers-reduced-motion` — show the final state instead.
4. Mobile-first, responsive down to **360px** wide.
5. Accessible: semantic HTML, full keyboard navigation, visible focus states, good contrast (4.5:1+ for text).
6. Fast: Lighthouse **90+ performance**, **95+ accessibility**.
7. **All content lives in `src/data/profile.ts`.** Components read from it; no hard-coded copy in components.
8. `localStorage` / `sessionStorage` access is always wrapped in try/catch; the site must work without storage.

## Design direction
- Engineering console / developer tool. Precise, calm, high-contrast. **Not** a generic purple AI gradient.
- Dark by default, light theme via toggle (saved in localStorage key `theme`; applied pre-paint by an inline
  script in `index.html`, read back by `src/lib/theme.ts`).
- Tokens are CSS variables in `src/index.css`, mapped to Tailwind colors via `@theme inline`.
  Use the Tailwind names, never raw hex in components:

  | Tailwind     | Dark      | Light     | Role                     |
  |--------------|-----------|-----------|--------------------------|
  | `bg`         | `#0A0B0D` | `#F7F8FA` | page background          |
  | `surface`    | `#121419` | `#FFFFFF` | cards, panels            |
  | `line`       | `#1F232B` | `#DDE1E7` | borders                  |
  | `text`       | `#E6E8EB` | `#0F1115` | body text                |
  | `muted`      | `#8A93A3` | `#586170` | secondary text           |
  | `accent`     | `#7CFFB2` | `#047857` | primary — terminal mint  |
  | `accent-2`   | `#5CC8FF` | `#0369A1` | secondary — data-flow cyan |
  | `on-accent`  | `#0A0B0D` | `#FFFFFF` | text on accent fills     |

  (Light accents are darkened so they pass contrast as text.)
- Fonts: **Inter** (`font-sans`) for text; **JetBrains Mono** (`font-mono`) for technical labels, numbers and
  terminal UI. Loaded from Google Fonts with `display=swap`.

## Layout
- `src/data/profile.ts` — all content + types, including `sections` (id, nav label, heading, placeholder;
  their order is page order and drives the `01 / …` labels), `capabilities`, `codeCard`, and `meta`.
  Derived lines (`heroStatus`, `bootLines`, `codeCardEntries`) are composed there from the facts, never retyped.
- `index.html` gets `<title>` and the meta description from `profile.meta` via the `profile-meta` plugin in
  `vite.config.ts` (`%PROFILE_TITLE%`, `%PROFILE_DESCRIPTION%`).
- `src/components/` — `Nav`, `ThemeToggle`, `Section` (shared section shell, auto-numbered), `NetworkCanvas`,
  `RoleTyper`, `CodeCard` (hero, 1024 px+ only), `PromptTerminal` + `FlowDiagram` (Prompt → Task),
  `CommandPalette`, `TerminalOverlay`.
- `src/sections/` — one component per section.
- `src/lib/` — `theme.ts`, `storage.ts` (the only place storage is touched), `motion.ts`
  (`usePrefersReducedMotion`), `boot.ts` (once-per-session check), `promptTimeline.ts` (the Prompt → Task
  timeline: one clock `t` drives terminal, diagram and controls).
- `public/Ajay_P_CV.pdf` — the Download CV target (`profile.cvPath`).

## Implementation notes
- Framer Motion is used through `LazyMotion` + `m.*` (strict mode, set in `App.tsx`) to keep the bundle small.
  Use `m.div`, not `motion.div`.
- Hero LCP elements (name, tagline) must never start at opacity 0; they only slide.
- Google Fonts load non-blocking (`media="print"` swap in `index.html`); don't make them render-blocking again.
- The boot overlay covers the page but the page renders underneath from the first frame.
- Zero layout shift: typing carets move with `transform` (see `RoleTyper`), never by reflowing after the text.
  Reserve space for changing text with an invisible copy of the longest value in the same grid cell.
- Large text blocks that aren't the intended LCP (e.g. the code card) render as many small line blocks.
- Typed text: render the full line in transparent ink (reserves height, readable by screen readers) with a
  visible overlay that grows; keep the untyped remainder `invisible` in the overlay so wrapping never changes.
- Keep numbers and units together with a non-breaking space (`'~300\u00a0ms'`).

## Section plan (built step by step — only build the step currently asked for)
1. **Boot sequence** — 1–1.5 s of terminal boot lines on first visit only (sessionStorage), skippable with any
   key or click, skipped entirely under reduced motion.
2. **Hero** — name, cycling role line, tagline, status line, buttons (Download CV, Contact, Open Terminal),
   canvas network background, and on 1024 px+ a code-editor card (`ajay.ts`) generated from profile.ts.
3. **Metrics strip** — 500+ organizations, 5+ years, reporting latency ~900 ms → ~300 ms (animated),
   60% faster report generation.
3b. **What I do** (built in Step 2.5) — the 6 `capabilities` as cards (3 / 2 / 1 columns), hover lift on desktop.
4. **Prompt → Task (centerpiece, section id `ai`, built in Step 3)** — content in `profile.promptToTask`.
   Terminal (left / top) + 4-node flow diagram (right / below), one ~9 s autoplay when scrolled into view,
   paused off-screen, Replay + step dots, finished state under reduced motion, "Illustrative example" label.
5. **Architecture map** — interactive diagram of a generic multi-tenant SaaS: clients → Cloudflare →
   Laravel/Node APIs on AWS EC2 → queues/background jobs → Redis cache → MySQL/MongoDB on RDS, S3 for files.
   Hover or tap a node to see what Ajay built there. Generic only — no confidential internals.
6. **Experience timeline.**
7. **Skills** — grouped grid with a "view as JSON" toggle showing the same data as syntax-highlighted JSON.
8. **Awards and education.**
9. **Contact** — terminal-styled block with copy-email-to-clipboard and links.
10. **Global** — Ctrl/Cmd+K command palette (jump to sections, download CV, copy email, toggle theme, open
    terminal) and a full terminal-mode overlay with commands: `help`, `whoami`, `about`, `experience`,
    `skills`, `capabilities` (alias `projects`: the 6 capabilities plus the three AI systems — MCP server,
    Claude Code integration, AI bot users), `awards`, `contact`, `cv`, `theme`, `clear`, `exit`, plus the easter egg
    `sudo hire-ajay` which opens a pre-filled email.

## Progress
- [x] Step 1 — scaffold, CLAUDE.md, profile data, tokens/fonts/theme toggle, page skeleton with section stubs.
- [x] Step 2 — data updates (skills, projects, openToWork), boot sequence, hero, network canvas.
- [x] Step 2.5 — repositioned as a Technical Lead portfolio (no product name), capabilities + "What I do",
  hero code card, meta from profile.ts, zero-CLS caret. CV PDF still missing: the copy in Downloads has the
  phone number, so it was not copied.
- [x] Step 3 — CV added (`Ajay_P_CV_Web.pdf`, checked: no phone, no product name), broader positioning copy,
  Prompt → Task centerpiece.
