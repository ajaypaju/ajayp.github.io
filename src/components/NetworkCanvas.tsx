import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../lib/motion'

// Tenants (drifting nodes) connected to one platform (the hub). Every PULSE_EVERY ms a
// cyan "request" travels from a tenant to the hub. Decorative: aria-hidden, no pointer events.

const AREA_PER_NODE = 10_000 // px² of viewport per node: ~25 on a phone, capped at 60 on desktop
const MIN_NODES = 12
const MAX_NODES = 60
const LINK_DIST = 130
const HUB_DIST = 240
const SPEED = 0.012 // px per ms
const PULSE_EVERY_MIN = 1000
const PULSE_EVERY_MAX = 2000
const PULSE_DURATION = 1100
const CURSOR_DIST = 140
const MAX_DPR = 2
const RESIZE_DEBOUNCE = 150

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

interface Pulse {
  from: Node
  born: number
}

interface Colors {
  node: string
  hub: string
  pulse: string
}

const readColors = (): Colors => {
  const css = getComputedStyle(document.documentElement)
  return {
    node: css.getPropertyValue('--muted').trim(),
    hub: css.getPropertyValue('--accent').trim(),
    pulse: css.getPropertyValue('--accent-2').trim(),
  }
}

export function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let nodes: Node[] = []
    let hub: Node = { x: 0, y: 0, vx: 0, vy: 0 }
    let pulses: Pulse[] = []
    let colors = readColors()
    let cursor: { x: number; y: number } | null = null

    let raf = 0
    let last = 0
    let clock = 0 // animation time; only advances while running
    let nextPulse = 0
    let inView = true
    let started = false

    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    const layout = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Hub sits right of the hero copy on tablets, top-right on phones, and above the
      // code card on desktop so the card never hides it.
      const [hx, hy] = width >= 1024 ? [0.8, 0.12] : width >= 768 ? [0.74, 0.48] : [0.78, 0.2]
      hub = { x: width * hx, y: height * hy, vx: 0, vy: 0 }

      const count = Math.max(MIN_NODES, Math.min(MAX_NODES, Math.round((window.innerWidth * window.innerHeight) / AREA_PER_NODE)))
      nodes = Array.from({ length: count }, () => {
        const angle = rand(0, Math.PI * 2)
        return { x: rand(0, width), y: rand(0, height), vx: Math.cos(angle) * SPEED, vy: Math.sin(angle) * SPEED }
      })
      pulses = []
    }

    const step = (dt: number) => {
      for (const n of nodes) {
        n.x += n.vx * dt
        n.y += n.vy * dt
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
      }

      if (clock >= nextPulse) {
        // A request from a tenant near the hub, or the nearest one if none are in range.
        const near = nodes.filter((n) => Math.hypot(n.x - hub.x, n.y - hub.y) < HUB_DIST)
        const pool = near.length ? near : nodes
        const from = pool[Math.floor(Math.random() * pool.length)]
        if (from) pulses.push({ from, born: clock })
        nextPulse = clock + rand(PULSE_EVERY_MIN, PULSE_EVERY_MAX)
      }
      pulses = pulses.filter((p) => clock - p.born < PULSE_DURATION)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Tenant-to-tenant links
      ctx.strokeStyle = colors.node
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK_DIST) {
            ctx.globalAlpha = 0.18 * (1 - d / LINK_DIST)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // Tenant-to-platform links
      ctx.strokeStyle = colors.hub
      for (const n of nodes) {
        const d = Math.hypot(n.x - hub.x, n.y - hub.y)
        if (d < HUB_DIST) {
          ctx.globalAlpha = 0.14 * (1 - d / HUB_DIST)
          ctx.beginPath()
          ctx.moveTo(n.x, n.y)
          ctx.lineTo(hub.x, hub.y)
          ctx.stroke()
        }
      }

      // Tenants; those near the cursor brighten
      ctx.fillStyle = colors.node
      for (const n of nodes) {
        let alpha = 0.45
        if (cursor) {
          const d = Math.hypot(n.x - cursor.x, n.y - cursor.y)
          if (d < CURSOR_DIST) alpha += 0.4 * (1 - d / CURSOR_DIST)
        }
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }

      // Platform hub
      ctx.fillStyle = colors.hub
      ctx.globalAlpha = 0.15
      ctx.beginPath()
      ctx.arc(hub.x, hub.y, 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.arc(hub.x, hub.y, 3.5, 0, Math.PI * 2)
      ctx.fill()

      // Requests in flight
      ctx.fillStyle = colors.pulse
      ctx.strokeStyle = colors.pulse
      for (const p of pulses) {
        const t = (clock - p.born) / PULSE_DURATION
        const e = t * t * (3 - 2 * t) // smoothstep
        const x = p.from.x + (hub.x - p.from.x) * e
        const y = p.from.y + (hub.y - p.from.y) * e
        ctx.globalAlpha = 0.25
        ctx.beginPath()
        ctx.moveTo(p.from.x, p.from.y)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.globalAlpha = 0.9 * Math.sin(Math.PI * t) + 0.1
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const frame = (now: number) => {
      const dt = Math.min(now - last, 50) // clamp so a dropped frame doesn't teleport nodes
      last = now
      clock += dt
      step(dt)
      draw()
      raf = requestAnimationFrame(frame)
    }

    const shouldRun = () => started && !reducedMotion && inView && !document.hidden

    const sync = () => {
      if (shouldRun()) {
        if (!raf) {
          last = performance.now()
          raf = requestAnimationFrame(frame)
        }
      } else if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    // Under reduced motion we draw one static frame and stop.
    const redrawIfStatic = () => {
      if (started && reducedMotion) draw()
    }

    let resizeTimer = 0
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        layout()
        redrawIfStatic()
      }, RESIZE_DEBOUNCE)
    })

    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      sync()
    })

    const themeObserver = new MutationObserver(() => {
      colors = readColors()
      redrawIfStatic()
    })

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onPointerLeave = () => {
      cursor = null
    }

    // Start after first paint so the canvas never competes with the hero text.
    let startTimer = 0
    const startRaf = requestAnimationFrame(() => {
      startTimer = window.setTimeout(() => {
        started = true
        layout()
        draw()
        resizeObserver.observe(canvas)
        intersection.observe(canvas)
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
        document.addEventListener('visibilitychange', sync)
        if (finePointer && !reducedMotion) {
          window.addEventListener('pointermove', onPointerMove, { passive: true })
          document.documentElement.addEventListener('pointerleave', onPointerLeave)
        }
        sync()
      }, 0)
    })

    return () => {
      cancelAnimationFrame(startRaf)
      window.clearTimeout(startTimer)
      window.clearTimeout(resizeTimer)
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersection.disconnect()
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70 [mask-image:linear-gradient(to_right,rgb(0_0_0/0.3),#000_65%)]"
    />
  )
}
