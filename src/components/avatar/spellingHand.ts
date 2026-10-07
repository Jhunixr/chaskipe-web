/**
 * Mano 3D articulada (21 puntos de MediaPipe) y brazo para deletrear.
 *
 * La mano no se anima rotando huesos: cada articulacion se coloca en la
 * posicion exacta de la foto real de la letra, y falanges y palma se estiran
 * entre esos puntos. Asi la forma es la del dataset, sin aproximaciones.
 *
 * El brazo se resuelve con IK de dos segmentos (hombro -> codo -> muneca),
 * para que siempre termine en la muneca de la mano.
 */
import * as THREE from 'three'

import type { Vec3 } from './fingerspelling'

const SKIN = 0xe0a070
const SHIRT = 0xf3ece0

/** Falanges: pares de puntos de MediaPipe (pulgar, indice, medio, anular, menique). */
const FINGER_BONES: [number, number][] = [
  [1, 2], [2, 3], [3, 4],
  [5, 6], [6, 7], [7, 8],
  [9, 10], [10, 11], [11, 12],
  [13, 14], [14, 15], [15, 16],
  [17, 18], [18, 19], [19, 20],
]
/** Contorno de la palma, en orden. */
const PALM_RING = [0, 1, 5, 9, 13, 17]

/** Grosor (en unidades de mano: muneca -> nudillo medio = 1). */
function jointRadius(i: number): number {
  if (i === 0) return 0.2
  if (i <= 4) return [0, 0.15, 0.13, 0.115, 0.1][i]! // pulgar
  const k = (i - 5) % 4 // 0 = nudillo ... 3 = punta
  const finger = Math.floor((i - 5) / 4) // 0 indice ... 3 menique
  const base = [0.12, 0.125, 0.115, 0.1][finger]!
  return base * [1, 0.9, 0.82, 0.75][k]!
}

const UP = new THREE.Vector3(0, 1, 0)

/** Coloca un cilindro (altura 1, a lo largo de Y) entre dos puntos. */
function placeSegment(mesh: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3): void {
  const dir = new THREE.Vector3().subVectors(b, a)
  const len = dir.length()
  mesh.position.copy(a).addScaledVector(dir, 0.5)
  if (len > 1e-6) mesh.quaternion.setFromUnitVectors(UP, dir.divideScalar(len))
  mesh.scale.set(1, Math.max(len, 1e-4), 1)
}

export class SpellingArm {
  readonly group = new THREE.Group()
  /** Tamano de la mano en la escena: muneca -> nudillo medio. */
  private readonly handScale: number
  private readonly joints: THREE.Mesh[] = []
  private readonly bones: THREE.Mesh[] = []
  private readonly palm: THREE.Mesh
  private readonly upperArm: THREE.Mesh
  private readonly forearm: THREE.Mesh
  private readonly elbowBall: THREE.Mesh
  private readonly points = Array.from({ length: 21 }, () => new THREE.Vector3())

  constructor(handScale = 0.15) {
    this.handScale = handScale
    const skin = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.62 })
    const shirt = new THREE.MeshStandardMaterial({ color: SHIRT, roughness: 0.85 })
    const sphere = new THREE.SphereGeometry(1, 16, 12)
    const cylinder = new THREE.CylinderGeometry(1, 1, 1, 14, 1, true)

    for (let i = 0; i < 21; i++) {
      const joint = new THREE.Mesh(sphere, skin)
      joint.scale.setScalar(jointRadius(i) * handScale)
      this.joints.push(joint)
      this.group.add(joint)
    }
    for (const [a, b] of FINGER_BONES) {
      const r = ((jointRadius(a) + jointRadius(b)) / 2) * handScale
      const bone = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 14, 1, true), skin)
      this.bones.push(bone)
      this.group.add(bone)
    }

    // Palma: prisma con el contorno de los nudillos, se rehace cada frame.
    const palmGeo = new THREE.BufferGeometry()
    palmGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array((PALM_RING.length * 2 + 2) * 3), 3),
    )
    palmGeo.setIndex(palmIndices(PALM_RING.length))
    this.palm = new THREE.Mesh(palmGeo, skin)
    this.palm.material = skin.clone()
    ;(this.palm.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
    this.group.add(this.palm)

    // Brazo: manga (camisa) y antebrazo (piel), como el resto del avatar.
    this.upperArm = new THREE.Mesh(cylinder, shirt)
    this.upperArm.scale.set(0.08, 1, 0.08)
    this.forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.068, 1, 14, 1, true), skin)
    this.elbowBall = new THREE.Mesh(sphere, shirt)
    this.elbowBall.scale.setScalar(0.075)
    const shoulderBall = new THREE.Mesh(sphere, shirt)
    shoulderBall.scale.setScalar(0.085)
    shoulderBall.name = 'shoulder'
    this.group.add(this.upperArm, this.forearm, this.elbowBall, shoulderBall)

    this.group.visible = false
  }

  /**
   * Coloca mano y brazo.
   * @param pose   21 puntos de la letra (mano centrada en la muneca, escala 1).
   * @param wrist  posicion de la muneca en la escena.
   * @param shoulder posicion del hombro derecho del avatar en la escena.
   */
  update(pose: Vec3[], wrist: THREE.Vector3, shoulder: THREE.Vector3): void {
    for (let i = 0; i < 21; i++) {
      const p = pose[i] ?? [0, 0, 0]
      this.points[i]!.set(p[0], p[1], p[2]).multiplyScalar(this.handScale).add(wrist)
      this.joints[i]!.position.copy(this.points[i]!)
    }
    FINGER_BONES.forEach(([a, b], k) => placeSegment(this.bones[k]!, this.points[a]!, this.points[b]!))
    this.updatePalm()
    this.updateArm(shoulder, this.points[0]!)
  }

  private updatePalm(): void {
    const ring = PALM_RING.map((i) => this.points[i]!)
    const center = ring.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(ring.length)
    // Normal de la palma: producto de muneca->indice y muneca->menique.
    const normal = new THREE.Vector3()
      .subVectors(this.points[5]!, this.points[0]!)
      .cross(new THREE.Vector3().subVectors(this.points[17]!, this.points[0]!))
      .normalize()
      .multiplyScalar(0.11 * this.handScale)

    const pos = this.palm.geometry.getAttribute('position') as THREE.BufferAttribute
    ring.forEach((p, i) => {
      pos.setXYZ(i, p.x + normal.x, p.y + normal.y, p.z + normal.z)
      pos.setXYZ(i + ring.length, p.x - normal.x, p.y - normal.y, p.z - normal.z)
    })
    const n = ring.length * 2
    pos.setXYZ(n, center.x + normal.x, center.y + normal.y, center.z + normal.z)
    pos.setXYZ(n + 1, center.x - normal.x, center.y - normal.y, center.z - normal.z)
    pos.needsUpdate = true
    this.palm.geometry.computeVertexNormals()
    this.palm.geometry.computeBoundingSphere()
  }

  private updateArm(shoulder: THREE.Vector3, wrist: THREE.Vector3): void {
    const upper = 0.34
    const lower = 0.33
    const toWrist = new THREE.Vector3().subVectors(wrist, shoulder)
    const d = THREE.MathUtils.clamp(toWrist.length(), 0.05, upper + lower - 1e-3)
    const u = toWrist.normalize()
    // El codo cae hacia abajo y hacia afuera (lado derecho del avatar = -x).
    const pole = new THREE.Vector3(-0.5, -1, -0.15)
    const v = pole.addScaledVector(u, -pole.dot(u)).normalize()
    const cosA = (upper * upper + d * d - lower * lower) / (2 * upper * d)
    const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA))
    const elbow = new THREE.Vector3()
      .copy(shoulder)
      .addScaledVector(u, upper * cosA)
      .addScaledVector(v, upper * sinA)

    placeSegment(this.upperArm, shoulder, elbow)
    this.upperArm.scale.x = this.upperArm.scale.z = 0.08
    placeSegment(this.forearm, elbow, wrist)
    this.elbowBall.position.copy(elbow)
    this.group.getObjectByName('shoulder')!.position.copy(shoulder)
  }

  dispose(): void {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        const m = obj.material
        if (Array.isArray(m)) m.forEach((x) => x.dispose())
        else m.dispose()
      }
    })
  }
}

/** Triangulos del prisma de la palma: tapa, base y lados. */
function palmIndices(n: number): number[] {
  const idx: number[] = []
  const top = n * 2
  const bottom = top + 1
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    idx.push(top, i, j) // tapa
    idx.push(bottom, j + n, i + n) // base
    idx.push(i, i + n, j, j, i + n, j + n) // lado
  }
  return idx
}

/** Interpola dos poses de mano punto a punto. */
export function lerpPose(a: Vec3[], b: Vec3[], k: number): Vec3[] {
  return a.map((p, i) => {
    const q = b[i] ?? p
    return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k]
  })
}
