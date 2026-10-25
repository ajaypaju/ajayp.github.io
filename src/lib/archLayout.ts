import type { ArchNodeId } from '../data/profile'

// Geometry of the architecture map, in viewBox units. Each view has a wide (768 px+, left to right)
// and a narrow (vertical) layout; both views share one viewBox per breakpoint, so toggling views
// never changes the map's height.

export type ArchView = 'request' | 'deploy'

export interface Pt {
  x: number
  y: number
}

/** Centre point plus size. */
export interface Box extends Pt {
  w: number
  h: number
}

export interface MapLayout {
  width: number
  height: number
  nodes: Partial<Record<ArchNodeId, Box>>
  /** Directed edges, drawn border to border with an arrowhead. */
  edges: [ArchNodeId, ArchNodeId][]
  /** Dashed monitoring taps: vertical lines from a server-side node down to the band. */
  taps: { x: number; y1: number; y2: number }[]
}

export const DATA_NODES: ArchNodeId[] = ['redis', 'queue', 'mysql', 'mongo', 's3']
export const REQUEST_ROUTE: ArchNodeId[] = ['client', 'cloudflare', 'web', 'app']
export const DEPLOY_ROUTE: ArchNodeId[] = ['git', 'ci', 'build', 'deploy', 'monitoring']

const requestEdges: [ArchNodeId, ArchNodeId][] = [
  ['client', 'cloudflare'],
  ['cloudflare', 'web'],
  ['web', 'app'],
  ['app', 'ai'],
  ['app', 'integrations'],
  ...DATA_NODES.map((d): [ArchNodeId, ArchNodeId] => ['app', d]),
]
const deployEdges = DEPLOY_ROUTE.slice(1).map((to, i): [ArchNodeId, ArchNodeId] => [DEPLOY_ROUTE[i], to])

const box = (x: number, y: number, w: number, h: number): Box => ({ x, y, w, h })

const WIDE = { width: 1000, height: 600 }
const NARROW = { width: 360, height: 820 }

export const LAYOUTS: Record<ArchView, { wide: MapLayout; narrow: MapLayout }> = {
  request: {
    // Left to right; data fanned out on the right, AI/integrations above the app servers,
    // monitoring as a band underneath the server-side nodes.
    wide: {
      ...WIDE,
      nodes: {
        client: box(90, 290, 160, 60),
        cloudflare: box(262, 290, 140, 60),
        web: box(425, 290, 140, 60),
        app: box(605, 290, 160, 64),
        ai: box(525, 120, 150, 56),
        integrations: box(705, 120, 150, 56),
        redis: box(890, 140, 160, 52),
        queue: box(890, 215, 160, 52),
        mysql: box(890, 290, 160, 52),
        mongo: box(890, 365, 160, 52),
        s3: box(890, 440, 160, 52),
        monitoring: box(640, 545, 600, 44),
      },
      edges: requestEdges,
      taps: [
        { x: 425, y1: 320, y2: 523 },
        { x: 605, y1: 322, y2: 523 },
        { x: 890, y1: 466, y2: 523 },
      ],
    },
    // Vertical: the request path down the middle, AI/integrations as a side row above the app
    // servers, data nodes in a grid below, monitoring at the bottom.
    narrow: {
      ...NARROW,
      nodes: {
        client: box(180, 40, 240, 52),
        cloudflare: box(180, 125, 240, 52),
        web: box(180, 210, 240, 52),
        ai: box(92, 300, 150, 52),
        integrations: box(268, 300, 150, 52),
        app: box(180, 390, 240, 56),
        redis: box(92, 485, 150, 52),
        queue: box(268, 485, 150, 52),
        mysql: box(92, 560, 150, 52),
        mongo: box(268, 560, 150, 52),
        s3: box(180, 635, 150, 52),
        monitoring: box(180, 735, 320, 44),
      },
      edges: requestEdges,
      taps: [{ x: 180, y1: 661, y2: 713 }],
    },
  },
  deploy: {
    wide: {
      ...WIDE,
      nodes: Object.fromEntries(DEPLOY_ROUTE.map((id, i) => [id, box(100 + i * 200, 300, 170, 64)])),
      edges: deployEdges,
      taps: [],
    },
    narrow: {
      ...NARROW,
      nodes: Object.fromEntries(DEPLOY_ROUTE.map((id, i) => [id, box(180, 90 + i * 160, 240, 60)])),
      edges: deployEdges,
      taps: [],
    },
  },
}

/** Edge endpoints clipped to both nodes' borders (with a gap for the arrowhead). */
export function clipEdge(a: Box, b: Box, gap = 5): [Pt, Pt] {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const toBorder = (n: Box) => Math.min(ux ? n.w / 2 / Math.abs(ux) : Infinity, uy ? n.h / 2 / Math.abs(uy) : Infinity)
  const s = toBorder(a)
  const e = toBorder(b) + gap
  return [
    { x: a.x + ux * s, y: a.y + uy * s },
    { x: b.x - ux * e, y: b.y - uy * e },
  ]
}

/** Point at fraction t (0..1) of the way along a polyline. */
export function along(points: Pt[], t: number): Pt {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y))
  let d = Math.max(0, Math.min(1, t)) * lengths.reduce((a, b) => a + b, 0)
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] ? Math.min(1, d / lengths[i]) : 0
      return { x: points[i].x + (points[i + 1].x - points[i].x) * f, y: points[i].y + (points[i + 1].y - points[i].y) * f }
    }
    d -= lengths[i]
  }
  return points[points.length - 1]
}
