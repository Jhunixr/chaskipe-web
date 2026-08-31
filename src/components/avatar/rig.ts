/**
 * Rig del avatar "Chaski" (FASE 9, version detallada).
 *
 * Avatar estilizado inspirado en la mascota del logo: nino andino con chullo
 * (gorro con orejeras y pompon), chaleco rojo con rayas, camisa clara, cara
 * amigable. Construido solo con geometrias de Three.js (sin GLB / assets).
 *
 * Expone los "huesos" (Object3D) que rotan las animaciones: hombros, codos,
 * munecas, dedos (indice), cuello y torso. La FASE 10 puede sustituir la malla
 * por un GLB manteniendo esta misma interfaz `AvatarBones`.
 */
import * as THREE from 'three'

export interface HandBones {
  wrist: THREE.Group
  fingers: THREE.Group[] // 5: pulgar, indice, medio, anular, menique (base)
  indexMid: THREE.Group // falange media del indice (para senalar)
}

export interface AvatarBones {
  root: THREE.Group
  torso: THREE.Group
  neck: THREE.Group
  head: THREE.Group
  shoulderL: THREE.Group
  shoulderR: THREE.Group
  elbowL: THREE.Group
  elbowR: THREE.Group
  wristL: THREE.Group
  wristR: THREE.Group
  handL: HandBones
  handR: HandBones
  /** Parpados para el parpadeo. */
  eyelids: THREE.Mesh[]
}

// --- Paleta (tomada del logo) ---
const SKIN = 0xe7a877
const SKIN_SHADOW = 0xd9945f
const SHIRT = 0xf4efe6
const RED = 0xc0322b
const RED_DARK = 0x8f221d
const GREEN = 0x2f6b3c
const CREAM = 0xefe4cf
const HAIR = 0x241812
const DARK = 0x2b2320
const WHITE = 0xf7f4ee

function mat(color: number, rough = 0.85): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 })
}

/** Textura procedural de rayas andinas para el chaleco / chullo (cacheada). */
let _stripesTexture: THREE.CanvasTexture | null = null
function andeanStripes(): THREE.CanvasTexture {
  if (_stripesTexture) return _stripesTexture
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const ctx = c.getContext('2d')!
  const bands = [RED, CREAM, GREEN, CREAM, RED_DARK, CREAM]
  const h = c.height / bands.length
  bands.forEach((col, i) => {
    ctx.fillStyle = '#' + col.toString(16).padStart(6, '0')
    ctx.fillRect(0, i * h, c.width, h + 1)
  })
  // rombos simples en una banda
  ctx.fillStyle = '#' + GREEN.toString(16).padStart(6, '0')
  for (let x = 4; x < c.width; x += 16) {
    ctx.save()
    ctx.translate(x, h * 2.5)
    ctx.rotate(Math.PI / 4)
    ctx.fillRect(-3, -3, 6, 6)
    ctx.restore()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  _stripesTexture = tex
  return tex
}

// --- Mano con dedos ---

function makeHand(side: 'L' | 'R'): { group: THREE.Group; bones: HandBones } {
  const dir = side === 'L' ? 1 : -1
  const wrist = new THREE.Group()

  const palm = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.15, 0.06),
    mat(SKIN),
  )
  palm.position.y = -0.08
  wrist.add(palm)

  const fingerMat = mat(SKIN)
  const fingers: THREE.Group[] = []
  let indexMid = new THREE.Group()

  // 4 dedos largos
  const spread = [-0.045, -0.015, 0.015, 0.045]
  const lengths = [0.075, 0.085, 0.078, 0.06]
  for (let i = 0; i < 4; i++) {
    const base = new THREE.Group()
    base.position.set(spread[i]!, -0.15, 0)
    const p1 = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.017, lengths[i]!, 3, 6),
      fingerMat,
    )
    p1.position.y = -lengths[i]! / 2 - 0.01
    base.add(p1)

    const mid = new THREE.Group()
    mid.position.y = -lengths[i]! - 0.02
    const p2 = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.015, lengths[i]! * 0.7, 3, 6),
      fingerMat,
    )
    p2.position.y = -(lengths[i]! * 0.7) / 2 - 0.01
    mid.add(p2)
    base.add(mid)

    wrist.add(base)
    fingers.push(base)
    if (i === 1) indexMid = mid // indice
  }

  // pulgar
  const thumb = new THREE.Group()
  thumb.position.set(dir * 0.07, -0.06, 0.02)
  thumb.rotation.z = dir * 0.9
  const tp = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.02, 0.06, 3, 6),
    fingerMat,
  )
  tp.position.y = -0.04
  thumb.add(tp)
  wrist.add(thumb)
  fingers.unshift(thumb)

  return {
    group: wrist,
    bones: { wrist, fingers, indexMid },
  }
}

// --- Brazo ---

function makeArm(side: 'L' | 'R'): {
  shoulder: THREE.Group
  elbow: THREE.Group
  wrist: THREE.Group
  hand: HandBones
} {
  const dir = side === 'L' ? 1 : -1

  const shoulder = new THREE.Group()
  shoulder.position.set(dir * 0.3, 1.38, 0.06)

  // manga de la camisa (parte alta del brazo)
  const sleeve = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.085, 0.24, 4, 12),
    mat(SHIRT),
  )
  sleeve.position.y = -0.17
  shoulder.add(sleeve)

  const elbow = new THREE.Group()
  elbow.position.y = -0.32
  shoulder.add(elbow)

  // antebrazo (piel)
  const forearm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.072, 0.24, 4, 12),
    mat(SKIN),
  )
  forearm.position.y = -0.16
  elbow.add(forearm)

  const wrist = new THREE.Group()
  wrist.position.y = -0.32
  elbow.add(wrist)

  const { group: handGroup, bones: handBones } = makeHand(side)
  handGroup.scale.setScalar(0.8)
  wrist.add(handGroup)

  // reposo: brazos ligeramente hacia adelante y separados
  shoulder.rotation.z = dir * -0.3
  shoulder.rotation.x = 0.15

  return { shoulder, elbow, wrist, hand: handBones }
}

// --- Cabeza ---

function makeHead(): { group: THREE.Group; eyelids: THREE.Mesh[] } {
  const head = new THREE.Group()
  head.position.y = 0.14

  // craneo (algo achatado, estilo cartoon)
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.23, 32, 28), mat(SKIN))
  skull.scale.set(1, 0.98, 0.92)
  skull.position.y = 0.16
  head.add(skull)

  // mejillas
  const cheekGeo = new THREE.SphereGeometry(0.055, 12, 12)
  const cheekMat = new THREE.MeshStandardMaterial({
    color: 0xe08a6a,
    roughness: 1,
    transparent: true,
    opacity: 0.55,
  })
  const cheekL = new THREE.Mesh(cheekGeo, cheekMat)
  cheekL.position.set(0.11, 0.1, 0.17)
  const cheekR = cheekL.clone()
  cheekR.position.x = -0.11
  head.add(cheekL, cheekR)

  // pelo: casquete que cubre la parte de atras y arriba (no baja a los ojos)
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.238,
      24,
      18,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.48,
    ),
    mat(HAIR, 0.95),
  )
  hairCap.position.y = 0.19
  hairCap.position.z = -0.03
  head.add(hairCap)

  // patillas cortas a los lados
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 10, 10),
      mat(HAIR, 0.95),
    )
    side.position.set(s * 0.18, 0.16, -0.02)
    head.add(side)
  }

  // --- Chullo (gorro) ---
  const chullo = new THREE.Group()
  chullo.position.y = 0.28
  head.add(chullo)

  const stripes = andeanStripes()

  // copa del gorro
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.245,
      32,
      20,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.62,
    ),
    new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.95 }),
  )
  cap.position.y = 0.02
  cap.scale.set(1, 1.05, 0.98)
  chullo.add(cap)

  // borde inferior del gorro
  const brim = new THREE.Mesh(
    new THREE.TorusGeometry(0.235, 0.03, 12, 32),
    mat(RED, 0.9),
  )
  brim.rotation.x = Math.PI / 2
  brim.position.y = 0.02
  chullo.add(brim)

  // pompon
  const pom = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    mat(RED, 1),
  )
  pom.position.y = 0.3
  chullo.add(pom)

  // orejeras (pegadas a los lados de la cabeza) con borla corta
  for (const s of [-1, 1]) {
    const flap = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.95 }),
    )
    flap.rotation.x = Math.PI
    flap.rotation.z = s * -0.15
    flap.position.set(s * 0.2, -0.04, 0)
    chullo.add(flap)

    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.06, 6),
      mat(RED_DARK, 1),
    )
    cord.position.set(s * 0.205, -0.1, 0)
    chullo.add(cord)

    const tassel = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 8, 8),
      mat(RED, 1),
    )
    tassel.position.set(s * 0.205, -0.14, 0)
    chullo.add(tassel)
  }

  // --- Cara ---
  // ojos grandes y expresivos
  const eyelids: THREE.Mesh[] = []
  const EYE_Y = 0.14
  const EYE_X = 0.078
  const EYE_Z = 0.19
  for (const s of [1, -1]) {
    const white = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 18, 18),
      mat(WHITE, 0.35),
    )
    white.scale.set(0.95, 1.25, 0.6)
    white.position.set(s * EYE_X, EYE_Y, EYE_Z)
    head.add(white)

    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 16, 16),
      mat(0x2a1a0f, 0.25),
    )
    iris.scale.set(1, 1, 0.6)
    iris.position.set(s * EYE_X, EYE_Y - 0.004, EYE_Z + 0.03)
    head.add(iris)

    const glint = new THREE.Mesh(
      new THREE.SphereGeometry(0.011, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.7,
      }),
    )
    glint.position.set(s * EYE_X + 0.013, EYE_Y + 0.014, EYE_Z + 0.05)
    head.add(glint)

    // parpado (baja para parpadear)
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(SKIN),
    )
    lid.scale.set(0.95, 1.25, 0.6)
    lid.position.set(s * EYE_X, EYE_Y, EYE_Z)
    lid.scale.y = 0.02
    head.add(lid)
    eyelids.push(lid)
  }

  // nariz pequena
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 10, 10),
    mat(SKIN_SHADOW),
  )
  nose.position.set(0, EYE_Y - 0.055, EYE_Z + 0.045)
  head.add(nose)

  // boca sonriente
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.045, 0.012, 10, 20, Math.PI),
    mat(0x9a4038, 0.5),
  )
  smile.position.set(0, EYE_Y - 0.11, EYE_Z + 0.02)
  smile.rotation.z = Math.PI
  head.add(smile)

  return { group: head, eyelids }
}

// --- Ensamblado ---

export function buildAvatar(): { object: THREE.Group; bones: AvatarBones } {
  const root = new THREE.Group()
  const torso = new THREE.Group()
  root.add(torso)

  const stripes = andeanStripes()

  // pantalon / piernas
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.1, 0.5, 4, 12),
      mat(DARK),
    )
    leg.position.set(s * 0.13, 0.4, 0)
    torso.add(leg)

    // ojota (sandalia simple)
    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.06, 0.24),
      mat(0x5a3a24),
    )
    foot.position.set(s * 0.13, 0.06, 0.05)
    torso.add(foot)
  }

  // camisa (torso): mas ancho abajo (barriga) y estrecho en los hombros
  const shirt = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 20, 18),
    mat(SHIRT),
  )
  shirt.scale.set(1, 1.5, 0.92)
  shirt.position.y = 1.12
  torso.add(shirt)

  // chaleco andino (rayas): franja vertical estrecha por el pecho y la espalda
  const vestMat = new THREE.MeshStandardMaterial({
    map: stripes,
    roughness: 0.95,
    side: THREE.DoubleSide,
  })
  const vestFront = new THREE.Mesh(
    new THREE.CylinderGeometry(0.255, 0.27, 0.44, 20, 1, true, -0.7, 1.4),
    vestMat,
  )
  vestFront.position.y = 1.14
  torso.add(vestFront)
  const vestBack = vestFront.clone()
  vestBack.rotation.y = Math.PI
  torso.add(vestBack)

  // ribete rojo del borde inferior del chaleco
  const hem = new THREE.Mesh(
    new THREE.TorusGeometry(0.255, 0.016, 8, 24),
    mat(RED, 0.9),
  )
  hem.rotation.x = Math.PI / 2
  hem.position.y = 0.93
  torso.add(hem)

  // cuello
  const neck = new THREE.Group()
  neck.position.set(0, 1.5, 0)
  torso.add(neck)
  const neckMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.09, 0.14, 12),
    mat(SKIN),
  )
  neckMesh.position.y = 0.07
  neck.add(neckMesh)

  // cabeza
  const { group: head, eyelids } = makeHead()
  neck.add(head)

  // brazos
  const armL = makeArm('L')
  const armR = makeArm('R')
  torso.add(armL.shoulder, armR.shoulder)

  // proporciones de nino: cabeza un poco mas grande
  head.scale.setScalar(1.08)

  root.position.y = -0.55

  const bones: AvatarBones = {
    root,
    torso,
    neck,
    head,
    shoulderL: armL.shoulder,
    shoulderR: armR.shoulder,
    elbowL: armL.elbow,
    elbowR: armR.elbow,
    wristL: armL.wrist,
    wristR: armR.wrist,
    handL: armL.hand,
    handR: armR.hand,
    eyelids,
  }

  return { object: root, bones }
}
