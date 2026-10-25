import { useCallback, useEffect, useRef } from 'react'

const EASE = 0.08 // fraction of the remaining distance covered per frame: eased follow-through
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/**
 * Pointer parallax for the hero. `depths` (a module-level constant) maps each layer to its max
 * offset in px at the viewport edge; negative moves against the pointer. Attach `root` to any
 * element inside the hero <section> and `layer(name)` to each layer.
 *
 * The pointer only sets a target; one rAF loop eases every layer toward it with transforms and
 * stops once settled. Off-screen, the loop stops and the section gets `data-offscreen` (CSS pauses
 * the hero's ambient animations). Off when `enabled` is false (reduced motion); pointer tracking
 * also needs a fine pointer.
 */
export function useHeroParallax<K extends string>(depths: Record<K, number>, enabled: boolean) {
  const rootRef = useRef<HTMLElement | null>(null)
  const layersRef = useRef<Partial<Record<K, HTMLElement | null>>>({})

  const root = useCallback((el: HTMLElement | null) => {
    rootRef.current = el
  }, [])
  const layer = useCallback(
    (name: K) => (el: HTMLElement | null) => {
      layersRef.current[name] = el
    },
    [],
  )

  useEffect(() => {
    const section = rootRef.current?.closest('section')
    if (!section || !enabled) return
    const layers = (Object.keys(depths) as K[]).map((name) => ({ el: layersRef.current[name], depth: depths[name] }))

    let tx = 0 // target, -1..1
    let ty = 0
    let x = 0 // current, eased toward the target
    let y = 0
    let raf = 0
    let visible = true

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      section.toggleAttribute('data-offscreen', !visible)
      if (!visible && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    })
    observer.observe(section)

    const apply = () => {
      for (const { el, depth } of layers) {
        if (el) el.style.transform = `translate3d(${(x * depth).toFixed(2)}px, ${(y * depth).toFixed(2)}px, 0)`
      }
    }
    const tick = () => {
      x += (tx - x) * EASE
      y += (ty - y) * EASE
      const settled = Math.abs(tx - x) < 0.001 && Math.abs(ty - y) < 0.001
      if (settled) {
        x = tx
        y = ty
      }
      apply()
      raf = settled ? 0 : requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick)
    }
    // Normalised to the viewport (-1..1), so no layout read is needed per event.
    const onMove = (e: PointerEvent) => {
      tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1))
      ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1))
      kick()
    }
    const onLeave = () => {
      tx = 0
      ty = 0
      kick()
    }

    const tracking = window.matchMedia(FINE_POINTER).matches
    if (tracking) {
      for (const { el } of layers) el?.style.setProperty('will-change', 'transform')
      section.addEventListener('pointermove', onMove, { passive: true })
      section.addEventListener('pointerleave', onLeave)
    }

    return () => {
      observer.disconnect()
      section.removeAttribute('data-offscreen')
      cancelAnimationFrame(raf)
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
      for (const { el } of layers) {
        el?.style.removeProperty('transform')
        el?.style.removeProperty('will-change')
      }
    }
  }, [depths, enabled])

  return { root, layer }
}
