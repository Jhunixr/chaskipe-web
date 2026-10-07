/**
 * Features de una POSE de mano (un frame) para las letras estaticas del
 * abecedario de la LSP.
 *
 * ESTO DEBE COINCIDIR EXACTAMENTE con `ai/scripts/static_features.py`.
 * Si cambias la logica, cambiala en ambos sitios, sube
 * STATIC_FEATURE_VERSION y vuelve a correr `ai/scripts/train_letters.py`
 * (regenera el fixture que comprueba `staticFeatures.test.ts`).
 */
import type { Landmark } from '@/types/handLandmarks'

export const STATIC_FEATURE_VERSION = 1

const NUM_LANDMARKS = 21
const WRIST = 0
const MIDDLE_MCP = 9
const FINGER_TIPS = [4, 8, 12, 16, 20] as const

const TIP_PAIRS: [number, number][] = []
FINGER_TIPS.forEach((a, i) => {
  FINGER_TIPS.slice(i + 1).forEach((b) => TIP_PAIRS.push([a, b]))
})

/** 21 * 3 coordenadas + 10 distancias entre puntas de dedos. */
export const STATIC_FEATURE_LENGTH = NUM_LANDMARKS * 3 + TIP_PAIRS.length // 73

type Vec3 = [number, number, number]

/**
 * Mano centrada en la muneca, escalada por muneca -> nudillo medio y reflejada
 * si su etiqueta no es la de referencia (la mano del dataset).
 */
function canonicalHand(
  world: Landmark[],
  handedness: string,
  referenceHandedness: string,
): Vec3[] {
  const ref = referenceHandedness.charAt(0).toLowerCase()
  const flip = !handedness.toLowerCase().startsWith(ref)
  const pts: Vec3[] = world.map((p) => [flip ? -p.x : p.x, p.y, p.z])
  const wrist = pts[WRIST] ?? [0, 0, 0]
  const centered: Vec3[] = pts.map(([x, y, z]) => [
    x - wrist[0],
    y - wrist[1],
    z - wrist[2],
  ])
  const mcp = centered[MIDDLE_MCP] ?? [0, 0, 0]
  let scale = Math.hypot(mcp[0], mcp[1], mcp[2])
  if (scale < 1e-9) scale = 1
  return centered.map(([x, y, z]) => [x / scale, y / scale, z / scale])
}

/**
 * Features de una mano. Devuelve null si la mano no tiene los 21 puntos.
 *
 * `world` son los world landmarks de MediaPipe (metros), no los de imagen:
 * no dependen de la proporcion del video.
 */
export function handToStaticFeatures(
  world: Landmark[],
  handedness: string,
  referenceHandedness = 'Left',
): Float32Array | null {
  if (world.length !== NUM_LANDMARKS) return null
  const pts = canonicalHand(world, handedness, referenceHandedness)
  const out = new Float32Array(STATIC_FEATURE_LENGTH)
  let k = 0
  for (const [x, y, z] of pts) {
    out[k++] = x
    out[k++] = y
    out[k++] = z
  }
  for (const [a, b] of TIP_PAIRS) {
    const pa = pts[a] ?? [0, 0, 0]
    const pb = pts[b] ?? [0, 0, 0]
    out[k++] = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2])
  }
  return out
}
