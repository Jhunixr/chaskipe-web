/**
 * Mano realista de Chaski (modelo humano de MakeHuman, CC0) con huesos.
 *
 * El GLB (`public/models/avatar/mano.glb`, generado con
 * `chaskipe-ai/avatar/scripts/build_real_hand.py`) trae una malla de mano
 * derecha y 16 huesos: la palma y las 15 falanges. Cada letra del dataset son
 * 21 puntos; aqui se convierten en un esqueleto anatomico:
 *
 * - la palma toma la orientacion de los datos;
 * - cada dedo se dobla solo como una bisagra (hacia la palma, con limites de
 *   una mano real) y abre en abanico sin cruzarse;
 * - el pulgar sigue la direccion de los datos;
 * - las falanges conservan su largo (los puntos del dataset tienen ruido).
 *
 * Las fotos del dataset estan en espejo (como una selfie): se reflejan para
 * que Chaski haga la letra con la mano derecha, como la veria quien lo mira.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import type { Vec3 } from './fingerspelling'

const D2R = Math.PI / 180
const Y = new THREE.Vector3(0, 1, 0)
const Z = new THREE.Vector3(0, 0, 1)
const X = new THREE.Vector3(1, 0, 0)
const FINGERS = [5, 9, 13, 17]
const THUMB: [number, number][] = [[1, 2], [2, 3], [3, 4]]
/** Separacion minima entre dedos vecinos (abanico). */
const FINGER_GAP = 6 * D2R

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

interface BoneExtras {
  kind: 'palm' | 'segment'
  a?: number
  b?: number
  length?: number
}

/**
 * Marco de la palma: y = muneca -> nudillo del medio, x hacia el menique,
 * z = x * y (en una mano derecha, la palma mira a -z).
 */
function palmFrame(p: THREE.Vector3[]): THREE.Quaternion {
  const y = p[9]!.clone().sub(p[0]!).normalize()
  const x = p[17]!.clone().sub(p[5]!)
  x.addScaledVector(y, -x.dot(y)).normalize()
  const z = new THREE.Vector3().crossVectors(x, y)
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z))
}

export class RealHand {
  readonly group = new THREE.Group()
  private readonly handScale: number
  private bones: Record<string, THREE.Bone> = {}
  private restPos: Record<number, THREE.Vector3> = {}
  private restQ: Record<string, THREE.Quaternion> = {}
  private lengths: Record<string, number> = {}
  private spread: Record<number, number> = {}
  private loaded = false
  private readonly points = Array.from({ length: 21 }, () => new THREE.Vector3())
  private readonly material: THREE.MeshPhysicalMaterial

  constructor(options: { handScale: number; skinColor: number }) {
    this.handScale = options.handScale
    this.group.visible = false
    this.material = new THREE.MeshPhysicalMaterial({
      color: options.skinColor,
      roughness: 0.62,
      sheen: 0.4,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(0xffb59a),
      vertexColors: true,
    })
  }

  get isLoaded(): boolean {
    return this.loaded
  }

  async load(url: string): Promise<void> {
    const gltf = await new GLTFLoader().loadAsync(url)
    let mesh: THREE.SkinnedMesh | null = null
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.SkinnedMesh).isSkinnedMesh) mesh = obj as THREE.SkinnedMesh
    })
    if (!mesh) throw new Error('mano.glb sin malla con huesos')
    const skinned = mesh as THREE.SkinnedMesh
    skinned.material = this.material
    skinned.frustumCulled = false
    for (const bone of skinned.skeleton.bones) {
      const e = bone.userData as BoneExtras
      if (e.kind === 'palm') {
        this.bones.palm = bone
        continue
      }
      const key = `${e.a}_${e.b}`
      this.bones[key] = bone
      this.restQ[key] = bone.quaternion.clone()
      this.restPos[e.a!] = bone.position.clone()
      this.lengths[key] = e.length!
      if (FINGERS.includes(e.a!)) {
        const d = Y.clone().applyQuaternion(bone.quaternion)
        this.spread[e.a!] = Math.atan2(d.x, d.y)
      }
    }
    this.group.add(gltf.scene)
    this.loaded = true
  }

  /**
   * Coloca la mano.
   * @param pose  21 puntos de la letra (muneca en el origen, escala 1).
   * @param wrist posicion de la muneca en la escena.
   */
  update(pose: Vec3[], wrist: THREE.Vector3): void {
    if (!this.loaded) return
    const s = this.handScale
    // Espejo: las fotos del dataset estan reflejadas.
    const pts = this.points
    for (let i = 0; i < 21; i++) {
      const p = pose[i] ?? [0, 0, 0]
      pts[i]!.set(-p[0], p[1], p[2])
    }
    const qp = palmFrame(pts)
    const qpi = qp.clone().invert()
    const toScene = (v: THREE.Vector3) => v.clone().multiplyScalar(s).applyQuaternion(qp).add(wrist)

    const palm = this.bones.palm!
    palm.position.copy(wrist)
    palm.quaternion.copy(qp)
    palm.scale.setScalar(s)

    // 1) Angulo de abanico de cada dedo, desde los datos (atenuado).
    const fingers = FINGERS.map((mcp) => {
      const local = [0, 1, 2].map((k) =>
        pts[mcp + k + 1]!.clone().sub(pts[mcp + k]!).normalize().applyQuaternion(qpi),
      )
      const d0 = local[0]!
      const lenXY = Math.hypot(d0.x, d0.y)
      let abd = lenXY > 0.35 ? Math.atan2(d0.x, d0.y) - this.spread[mcp]! : 0
      abd = 0.6 * clamp(abd * Math.min(1, lenXY / 0.6), -20 * D2R, 20 * D2R)
      return { mcp, local, angle: this.spread[mcp]! + abd }
    })
    // 2) Los dedos no se cruzan: abanico ordenado del indice al menique.
    const dir = Math.sign(this.spread[17]! - this.spread[5]!) || 1
    for (let k = 1; k < fingers.length; k++) {
      const prev = fingers[k - 1]!
      const cur = fingers[k]!
      if (dir * (cur.angle - prev.angle) < FINGER_GAP) cur.angle = prev.angle + dir * FINGER_GAP
    }
    // 3) Flexion en bisagra con limites anatomicos; largos fijos.
    for (const f of fingers) {
      const qa = new THREE.Quaternion().setFromAxisAngle(Z, -f.angle)
      const qai = qa.clone().invert()
      const flex = f.local.map((d) => {
        const v = d.clone().applyQuaternion(qai)
        return Math.atan2(-v.z, v.y)
      })
      const t1 = clamp(flex[0]!, -15 * D2R, 95 * D2R)
      const t2 = clamp(flex[1]! - flex[0]!, 0, 110 * D2R)
      // La ultima falange acompana a la del medio (en una mano real van juntas).
      const t3 = 0.5 * clamp(flex[2]! - flex[1]!, 0, 85 * D2R) + 0.5 * clamp(t2 * 0.7, 0, 85 * D2R)
      const cum = [t1, t1 + t2, t1 + t2 + t3]
      const p = this.restPos[f.mcp]!.clone()
      for (let k = 0; k < 3; k++) {
        const key = `${f.mcp + k}_${f.mcp + k + 1}`
        const ql = qa.clone().multiply(new THREE.Quaternion().setFromAxisAngle(X, -cum[k]!))
        const bone = this.bones[key]!
        bone.position.copy(toScene(p))
        bone.quaternion.copy(qp).multiply(ql)
        bone.scale.setScalar(s)
        p.addScaledVector(Y.clone().applyQuaternion(ql), this.lengths[key]!)
      }
    }
    // 4) Pulgar: direccion de los datos, largo fijo.
    const p = this.restPos[1]!.clone()
    for (const [a, b] of THUMB) {
      const key = `${a}_${b}`
      const bone = this.bones[key]!
      const restQ = this.restQ[key]!
      const d = pts[b]!.clone().sub(pts[a]!).normalize().applyQuaternion(qpi)
      const restDir = Y.clone().applyQuaternion(restQ)
      bone.position.copy(toScene(p))
      bone.quaternion.copy(qp).multiply(new THREE.Quaternion().setFromUnitVectors(restDir, d)).multiply(restQ)
      bone.scale.setScalar(s)
      p.addScaledVector(d, this.lengths[key]!)
    }
  }

  dispose(): void {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.geometry.dispose()
    })
    this.material.dispose()
  }
}
