/**
 * Extraccion de caracteristicas de una grabacion de landmarks para el
 * clasificador de senas (FASE 5 / 6).
 *
 * ESTO DEBE COINCIDIR EXACTAMENTE con `ai/scripts/features.py`.
 * Si cambias la logica, cambiala en ambos sitios y sube FEATURE_VERSION.
 *
 * FASE 5: solo la extraccion. La inferencia con el modelo TF.js se conecta en
 * la FASE 6.
 */
import type { HandFrame, Landmark } from '@/types/handLandmarks'

export const FEATURE_VERSION = 1

const NUM_LANDMARKS = 21
const WRIST = 0
const MIDDLE_TIP = 12

/** 2 manos * 21 landmarks * 3 coords * 3 estadisticos + 2 velocidades + 1 presencia. */
export const FEATURE_LENGTH = 2 * NUM_LANDMARKS * 3 * 3 + 2 + 1 // 381

type Vec3 = [number, number, number]

function emptyHand(): Vec3[] {
  return Array.from({ length: NUM_LANDMARKS }, () => [0, 0, 0] as Vec3)
}

/** Centra en la muneca y escala por el tamano de la mano. */
function normalizeHand(landmarks: Landmark[]): Vec3[] {
  const wrist = landmarks[WRIST]
  if (!wrist) return emptyHand()
  const centered: Vec3[] = landmarks.map((p) => [
    p.x - wrist.x,
    p.y - wrist.y,
    p.z - wrist.z,
  ])
  const mid = centered[MIDDLE_TIP] ?? [0, 0, 0]
  let scale = Math.hypot(mid[0], mid[1], mid[2])
  if (scale < 1e-6) scale = 1
  return centered.map(([x, y, z]) => [x / scale, y / scale, z / scale])
}

function pickHands(frame: HandFrame): {
  left: Vec3[]
  right: Vec3[]
  presence: number
} {
  let left = emptyHand()
  let right = emptyHand()
  let presence = 0
  frame.hands.forEach((landmarks, i) => {
    if (landmarks.length !== NUM_LANDMARKS) return
    const handed = (frame.handedness[i] ?? '').toLowerCase()
    const norm = normalizeHand(landmarks)
    if (handed.startsWith('l')) left = norm
    else right = norm
    presence += 0.5
  })
  return { left, right, presence: Math.min(presence, 1) }
}

function stats(seq: number[][]): { mean: number[]; std: number[]; range: number[] } {
  const t = seq.length
  const dim = seq[0]?.length ?? 0
  const mean = new Array<number>(dim).fill(0)
  const min = new Array<number>(dim).fill(Infinity)
  const max = new Array<number>(dim).fill(-Infinity)
  for (const row of seq) {
    for (let d = 0; d < dim; d++) {
      const v = row[d] ?? 0
      mean[d]! += v
      if (v < min[d]!) min[d] = v
      if (v > max[d]!) max[d] = v
    }
  }
  for (let d = 0; d < dim; d++) mean[d]! /= t || 1
  const std = new Array<number>(dim).fill(0)
  for (const row of seq) {
    for (let d = 0; d < dim; d++) {
      const diff = (row[d] ?? 0) - mean[d]!
      std[d]! += diff * diff
    }
  }
  for (let d = 0; d < dim; d++) std[d]! = Math.sqrt(std[d]! / (t || 1))
  const range = mean.map((_, d) => (max[d]! - min[d]!) || 0)
  return { mean, std, range }
}

/** Convierte los frames grabados en el vector de features del clasificador. */
export function framesToFeatures(frames: HandFrame[]): Float32Array {
  if (frames.length === 0) {
    throw new Error('sin frames')
  }

  const leftFlat: number[][] = []
  const rightFlat: number[][] = []
  const presence: number[] = []
  const leftWrist: Vec3[] = []
  const rightWrist: Vec3[] = []

  for (const frame of frames) {
    const { left, right, presence: p } = pickHands(frame)
    leftFlat.push(left.flat())
    rightFlat.push(right.flat())
    presence.push(p)
    leftWrist.push(left[WRIST] ?? [0, 0, 0])
    rightWrist.push(right[WRIST] ?? [0, 0, 0])
  }

  const feats: number[] = []
  for (const flat of [leftFlat, rightFlat]) {
    const s = stats(flat)
    feats.push(...s.mean, ...s.std, ...s.range)
  }

  for (const wrist of [leftWrist, rightWrist]) {
    let vel = 0
    for (let i = 1; i < wrist.length; i++) {
      const a = wrist[i]!
      const b = wrist[i - 1]!
      vel += Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
    }
    feats.push(wrist.length > 1 ? vel / (wrist.length - 1) : 0)
  }

  feats.push(presence.reduce((s, v) => s + v, 0) / presence.length)

  return Float32Array.from(feats)
}

/** Aplica la estandarizacion guardada en `scaler.json` (StandardScaler). */
export function standardize(
  features: Float32Array,
  scaler: { mean: number[]; scale: number[] },
): Float32Array {
  const out = new Float32Array(features.length)
  for (let i = 0; i < features.length; i++) {
    const m = scaler.mean[i] ?? 0
    const s = scaler.scale[i] || 1
    out[i] = (features[i]! - m) / s
  }
  return out
}
