/**
 * Animacion del avatar (FASE 9).
 *
 * - `applyIdle`: respiracion, balanceo y parpadeo. Siempre activo.
 * - `DEMO_GESTURE`: un gesto generico de marcador de posicion. NO representa
 *   ninguna sena real; sirve para probar el rig. Las animaciones de senas
 *   validadas con personas usuarias de LSP o interpretes son la FASE 10.
 */
import * as THREE from 'three'

import type { AvatarBones } from './rig'

// --- Idle ---

export function applyIdle(bones: AvatarBones, t: number): void {
  // Respiracion: escala sutil del torso.
  const breath = Math.sin(t * 1.6) * 0.012
  bones.torso.scale.set(1 + breath, 1 - breath * 0.5, 1 + breath)

  // Balanceo lento del cuerpo y la cabeza.
  bones.root.rotation.y = Math.sin(t * 0.5) * 0.05
  bones.head.rotation.y = Math.sin(t * 0.4 + 1) * 0.08
  bones.head.rotation.x = Math.sin(t * 0.7) * 0.03

  // Parpadeo: cada ~3.5 s, cerrado durante ~120 ms.
  const phase = t % 3.5
  const blink = phase > 3.38 ? 1 : phase > 3.26 ? (phase - 3.26) / 0.12 : 0
  const lidScale = blink > 0 ? Math.min(1, blink) : 0.02
  for (const lid of bones.eyelids) {
    lid.scale.y = 0.02 + lidScale
  }

  // Balanceo muy sutil de los brazos en reposo (sobre la pose base 0.15).
  const armSway = Math.sin(t * 0.8) * 0.03
  bones.shoulderL.rotation.x = 0.15 + armSway
  bones.shoulderR.rotation.x = 0.15 - armSway
}

// --- Sistema de poses / gestos ---

/** Una pose = rotaciones (en radianes) de los huesos que intervienen. */
export interface Pose {
  shoulderL?: THREE.Vector3Like
  shoulderR?: THREE.Vector3Like
  elbowL?: THREE.Vector3Like
  elbowR?: THREE.Vector3Like
  wristL?: THREE.Vector3Like
  wristR?: THREE.Vector3Like
  neck?: THREE.Vector3Like
}

export interface Keyframe {
  /** Momento del keyframe, 0..1 dentro del gesto. */
  at: number
  pose: Pose
}

export interface Gesture {
  id: string
  /** Duracion total en segundos. */
  durationMs: number
  keyframes: Keyframe[]
  /** true si NO esta validado con personas usuarias de LSP / interpretes. */
  isDemo: boolean
}

const REST_POSE: Required<Pose> = {
  shoulderL: { x: 0.15, y: 0, z: -0.3 },
  shoulderR: { x: 0.15, y: 0, z: 0.3 },
  elbowL: { x: 0, y: 0, z: 0 },
  elbowR: { x: 0, y: 0, z: 0 },
  wristL: { x: 0, y: 0, z: 0 },
  wristR: { x: 0, y: 0, z: 0 },
  neck: { x: 0, y: 0, z: 0 },
}

/**
 * Gesto DEMO: el chaski saluda (levanta la mano derecha y la agita), como en
 * el logo. Marcador de posicion, NO es una sena de LSP.
 */
export const DEMO_GESTURE: Gesture = {
  id: 'demo-saludo',
  durationMs: 2400,
  isDemo: true,
  keyframes: [
    { at: 0, pose: {} },
    {
      at: 0.22,
      pose: {
        // brazo derecho arriba, junto a la cabeza
        shoulderR: { x: -0.2, y: 0, z: -2.6 },
        elbowR: { x: -0.3, y: 0, z: 0 },
        neck: { x: 0, y: -0.15, z: 0 },
      },
    },
    {
      at: 0.42,
      pose: {
        shoulderR: { x: -0.2, y: 0, z: -2.75 },
        elbowR: { x: -0.15, y: 0, z: 0.35 },
        wristR: { x: 0, y: 0, z: 0.4 },
        neck: { x: 0, y: -0.15, z: 0 },
      },
    },
    {
      at: 0.62,
      pose: {
        shoulderR: { x: -0.2, y: 0, z: -2.75 },
        elbowR: { x: -0.15, y: 0, z: -0.35 },
        wristR: { x: 0, y: 0, z: -0.4 },
        neck: { x: 0, y: -0.15, z: 0 },
      },
    },
    {
      at: 0.8,
      pose: {
        shoulderR: { x: -0.2, y: 0, z: -2.7 },
        elbowR: { x: -0.2, y: 0, z: 0.2 },
        neck: { x: 0, y: -0.1, z: 0 },
      },
    },
    { at: 1, pose: {} },
  ],
}

function lerpVec(
  a: THREE.Vector3Like,
  b: THREE.Vector3Like,
  k: number,
): THREE.Vector3Like {
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    z: a.z + (b.z - a.z) * k,
  }
}

function resolvePose(gesture: Gesture, progress: number): Required<Pose> {
  const kfs = gesture.keyframes
  let prev = kfs[0]!
  let next = kfs[kfs.length - 1]!
  for (let i = 0; i < kfs.length - 1; i++) {
    if (progress >= kfs[i]!.at && progress <= kfs[i + 1]!.at) {
      prev = kfs[i]!
      next = kfs[i + 1]!
      break
    }
  }
  const span = next.at - prev.at || 1
  const k = THREE.MathUtils.clamp((progress - prev.at) / span, 0, 1)
  const eased = k * k * (3 - 2 * k) // smoothstep

  const out = { ...REST_POSE }
  for (const key of Object.keys(REST_POSE) as (keyof Pose)[]) {
    const from = prev.pose[key] ?? REST_POSE[key]
    const to = next.pose[key] ?? REST_POSE[key]
    out[key] = lerpVec(from, to, eased)
  }
  return out
}

/**
 * Aplica un gesto al rig. `elapsedMs` desde el inicio del gesto.
 * Devuelve true si el gesto sigue en curso.
 */
export function applyGesture(
  bones: AvatarBones,
  gesture: Gesture,
  elapsedMs: number,
): boolean {
  const progress = elapsedMs / gesture.durationMs
  const pose = resolvePose(gesture, THREE.MathUtils.clamp(progress, 0, 1))

  bones.shoulderL.rotation.set(pose.shoulderL.x, pose.shoulderL.y, pose.shoulderL.z)
  bones.shoulderR.rotation.set(pose.shoulderR.x, pose.shoulderR.y, pose.shoulderR.z)
  bones.elbowL.rotation.set(pose.elbowL.x, pose.elbowL.y, pose.elbowL.z)
  bones.elbowR.rotation.set(pose.elbowR.x, pose.elbowR.y, pose.elbowR.z)
  bones.wristL.rotation.set(pose.wristL.x, pose.wristL.y, pose.wristL.z)
  bones.wristR.rotation.set(pose.wristR.x, pose.wristR.y, pose.wristR.z)
  bones.neck.rotation.set(pose.neck.x, pose.neck.y, pose.neck.z)

  return progress < 1
}

/** Devuelve el rig a la pose de reposo. */
export function applyRest(bones: AvatarBones): void {
  bones.shoulderL.rotation.set(0, 0, REST_POSE.shoulderL.z)
  bones.shoulderR.rotation.set(0, 0, REST_POSE.shoulderR.z)
  bones.elbowL.rotation.set(0, 0, 0)
  bones.elbowR.rotation.set(0, 0, 0)
  bones.wristL.rotation.set(0, 0, 0)
  bones.wristR.rotation.set(0, 0, 0)
  bones.neck.rotation.set(0, 0, 0)
}
