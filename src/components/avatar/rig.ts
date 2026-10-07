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
const SKIN = 0xe0a070
const SKIN_SHADOW = 0xc98656
const SHIRT = 0xf3ece0
const RED = 0xc62a24
const RED_DARK = 0x8e1c18
const GREEN = 0x2e7d3c
const CREAM = 0xf2e6cc
const GOLD = 0xe0a63a
const HAIR = 0x1c1412
const DARK = 0x2b2320
const WHITE = 0xf7f4ee

function mat(color: number, rough = 0.85): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 })
}

const css = (c: number) => '#' + c.toString(16).padStart(6, '0')

function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** Rombo relleno centrado en (x, y). */
function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: number) {
  ctx.fillStyle = css(color)
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r, y)
  ctx.closePath()
  ctx.fill()
}

/**
 * Tejido del chullo como en el logo: base roja, franja crema con rombos verdes
 * y rojos, zigzag claro y borde crema. `v` va de la coronilla (0) al borde (1).
 */
let _chulloTexture: THREE.CanvasTexture | null = null
function chulloTexture(): THREE.CanvasTexture {
  if (_chulloTexture) return _chulloTexture
  _chulloTexture = canvasTexture(512, 256, (ctx) => {
    // coronilla roja con puntos tejidos
    ctx.fillStyle = css(RED)
    ctx.fillRect(0, 0, 512, 256)
    for (let y = 18; y < 84; y += 22) {
      for (let x = 8; x < 512; x += 32) diamond(ctx, x + ((y / 22) % 2) * 16, y, 4, CREAM)
    }
    // zigzag crema
    ctx.strokeStyle = css(CREAM)
    ctx.lineWidth = 5
    ctx.beginPath()
    for (let x = 0; x <= 512; x += 16) ctx.lineTo(x, x % 32 === 0 ? 90 : 102)
    ctx.stroke()
    // franja principal: rombos crema con centro verde sobre rojo (como el logo)
    for (let x = 32; x < 512; x += 64) {
      diamond(ctx, x, 142, 30, CREAM)
      diamond(ctx, x, 142, 22, RED)
      diamond(ctx, x, 142, 14, GREEN)
      diamond(ctx, x, 142, 5, CREAM)
    }
    for (let x = 0; x < 512; x += 64) {
      diamond(ctx, x, 128, 6, CREAM)
      diamond(ctx, x, 156, 6, CREAM)
    }
    // lineas y banda inferior con rombitos
    ctx.fillStyle = css(CREAM)
    ctx.fillRect(0, 178, 512, 6)
    ctx.fillStyle = css(RED_DARK)
    ctx.fillRect(0, 184, 512, 4)
    for (let x = 8; x < 512; x += 16) diamond(ctx, x, 204, 6, CREAM)
    ctx.fillStyle = css(CREAM)
    ctx.fillRect(0, 222, 512, 5)
    // ribete a cuadros crema / rojo
    for (let x = 0; x < 512; x += 12) {
      ctx.fillStyle = css((x / 12) % 2 === 0 ? CREAM : RED_DARK)
      ctx.fillRect(x, 230, 12, 26)
    }
  })
  return _chulloTexture
}

/** Chaleco: rojo con franjas verticales de colores junto a la abertura. */
let _vestTexture: THREE.CanvasTexture | null = null
function vestTexture(): THREE.CanvasTexture {
  if (_vestTexture) return _vestTexture
  _vestTexture = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = css(RED)
    ctx.fillRect(0, 0, 256, 256)
    const bands: [number, number][] = [
      [CREAM, 8], [RED_DARK, 6], [GOLD, 6], [GREEN, 8], [CREAM, 6], [RED_DARK, 10], [CREAM, 4],
    ]
    // franjas en los bordes izquierdo y derecho de la textura (la abertura)
    for (const side of [0, 1]) {
      let x = side === 0 ? 0 : 256
      for (const [color, w] of bands) {
        ctx.fillStyle = css(color)
        if (side === 0) {
          ctx.fillRect(x, 0, w, 256)
          x += w
        } else {
          x -= w
          ctx.fillRect(x, 0, w, 256)
        }
      }
    }
    // pequenos rombos en la franja crema
    for (let y = 6; y < 256; y += 14) {
      diamond(ctx, 4, y, 3, RED)
      diamond(ctx, 252, y, 3, RED)
    }
  })
  return _vestTexture
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

/** Sonrisa abierta (como el logo): boca oscura, dientes y lengua, curvada a la cara. */
function makeMouth(): THREE.Group {
  const mouth = new THREE.Group()
  const w = 0.062
  const h = 0.05
  const shape = new THREE.Shape()
  shape.moveTo(-w, 0)
  shape.quadraticCurveTo(0, 0.012, w, 0)
  shape.bezierCurveTo(w * 0.9, -h, -w * 0.9, -h, -w, 0)

  const bend = (geo: THREE.BufferGeometry) => {
    const pos = geo.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      pos.setZ(i, pos.getZ(i) - x * x * 3.2)
    }
    geo.computeVertexNormals()
    return geo
  }

  const inside = new THREE.Mesh(bend(new THREE.ShapeGeometry(shape, 16)), mat(0x5a1414, 0.6))
  mouth.add(inside)

  const teethShape = new THREE.Shape()
  teethShape.moveTo(-w * 0.82, -0.002)
  teethShape.quadraticCurveTo(0, 0.008, w * 0.82, -0.002)
  teethShape.lineTo(w * 0.72, -0.014)
  teethShape.quadraticCurveTo(0, -0.008, -w * 0.72, -0.014)
  const teeth = new THREE.Mesh(bend(new THREE.ShapeGeometry(teethShape, 12)), mat(WHITE, 0.4))
  teeth.position.z = 0.001
  mouth.add(teeth)

  const tongue = new THREE.Mesh(new THREE.CircleGeometry(0.026, 20), mat(0xd9666a, 0.6))
  tongue.scale.set(1.25, 0.6, 1)
  tongue.position.set(0, -0.034, 0.001)
  mouth.add(tongue)
  return mouth
}

function makeHead(): { group: THREE.Group; eyelids: THREE.Mesh[] } {
  const head = new THREE.Group()
  head.position.y = 0.06
  const C = 0.17 // centro del craneo
  const R = 0.25

  // craneo (redondo, estilo del logo)
  const skull = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 32), mat(SKIN, 0.7))
  skull.scale.set(1, 0.98, 0.9)
  skull.position.y = C
  head.add(skull)

  // pelo: casquete negro algo atras (se ve a los lados y detras de la cara)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(R * 1.02, 32, 24), mat(HAIR, 0.9))
  hair.scale.set(1.01, 0.98, 0.9)
  hair.position.set(0, C + 0.01, -0.035)
  head.add(hair)

  // flequillo: mechones bajo el borde del chullo
  const bangs = [-0.95, -0.62, -0.3, 0.02, 0.33, 0.64, 0.93]
  bangs.forEach((phi, i) => {
    const lock = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), mat(HAIR, 0.9))
    lock.scale.set(0.05, 0.075, 0.028)
    const y = C + 0.085 - Math.abs(phi) * 0.03
    lock.position.set(Math.sin(phi) * 0.232, y, Math.cos(phi) * 0.205)
    lock.rotation.set(-0.35, phi, (i % 2 === 0 ? 1 : -1) * 0.35)
    head.add(lock)
  })

  // mejillas sonrosadas
  const cheekMat = new THREE.MeshStandardMaterial({
    color: 0xe8796a,
    roughness: 1,
    transparent: true,
    opacity: 0.45,
  })
  for (const s of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), cheekMat)
    cheek.scale.set(1, 0.7, 0.4)
    cheek.position.set(s * 0.135, C - 0.075, 0.175)
    head.add(cheek)
  }

  // --- Chullo ---
  // Inclinado hacia atras: en la frente queda alto (deja ver el flequillo) y
  // a los lados baja hasta las orejas.
  const chullo = new THREE.Group()
  chullo.position.set(0, C, -0.01)
  chullo.rotation.x = -0.42
  head.add(chullo)

  const knit = new THREE.MeshStandardMaterial({ map: chulloTexture(), roughness: 0.95 })
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.07, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.53),
    knit,
  )
  cap.scale.set(1, 1.08, 0.97)
  chullo.add(cap)

  // borde enrollado
  const edgeY = Math.cos(Math.PI * 0.53) * R * 1.07 * 1.08
  const edgeR = Math.sin(Math.PI * 0.53) * R * 1.07
  const brim = new THREE.Mesh(new THREE.TorusGeometry(edgeR, 0.016, 10, 48), mat(CREAM, 0.95))
  brim.rotation.x = Math.PI / 2
  brim.scale.set(1, 0.97, 1)
  brim.position.y = edgeY
  chullo.add(brim)

  // pompon
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 16), mat(RED, 1))
  pom.position.y = R * 1.07 * 1.08 + 0.035
  chullo.add(pom)

  // orejeras con cordon y borla (cuelgan rectas, fuera del grupo inclinado)
  for (const s of [-1, 1]) {
    const flap = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), knit)
    flap.scale.set(0.035, 0.1, 0.075)
    flap.position.set(s * 0.245, C - 0.07, -0.01)
    flap.rotation.z = s * 0.12
    head.add(flap)

    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.12, 8), mat(CREAM, 1))
    cord.position.set(s * 0.25, C - 0.22, 0)
    head.add(cord)

    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 10), mat(DARK, 1))
    knot.position.set(s * 0.25, C - 0.285, 0)
    head.add(knot)

    const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 12), mat(RED, 1))
    tassel.position.set(s * 0.25, C - 0.335, 0)
    head.add(tassel)
  }

  // --- Cara ---
  const eyelids: THREE.Mesh[] = []
  const EYE_Y = C - 0.025
  const EYE_X = 0.085
  const EYE_Z = 0.19
  for (const s of [1, -1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 20), mat(WHITE, 0.3))
    white.scale.set(0.9, 1.15, 0.55)
    white.position.set(s * EYE_X, EYE_Y, EYE_Z)
    head.add(white)

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.034, 18, 18), mat(0x5a3218, 0.3))
    iris.scale.set(1, 1.08, 0.5)
    iris.position.set(s * EYE_X, EYE_Y - 0.004, EYE_Z + 0.022)
    head.add(iris)

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.019, 14, 14), mat(0x120c08, 0.2))
    pupil.scale.set(1, 1.08, 0.5)
    pupil.position.set(s * EYE_X, EYE_Y - 0.004, EYE_Z + 0.032)
    head.add(pupil)

    const glint = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 }),
    )
    glint.position.set(s * EYE_X + 0.012, EYE_Y + 0.014, EYE_Z + 0.044)
    head.add(glint)

    // parpado (baja para parpadear)
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(SKIN, 0.7),
    )
    lid.position.set(s * EYE_X, EYE_Y, EYE_Z)
    lid.scale.set(0.92, 0.02, 0.58)
    head.add(lid)
    eyelids.push(lid)

    // ceja gruesa y arqueada
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.05, 4, 8), mat(HAIR, 0.8))
    brow.rotation.z = Math.PI / 2 + s * 0.18
    brow.position.set(s * (EYE_X + 0.004), EYE_Y + 0.075, EYE_Z + 0.012)
    head.add(brow)
  }

  // nariz
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), mat(SKIN_SHADOW, 0.7))
  nose.scale.set(1, 0.85, 0.9)
  nose.position.set(0, EYE_Y - 0.06, EYE_Z + 0.03)
  head.add(nose)

  const mouth = makeMouth()
  mouth.position.set(0, EYE_Y - 0.1, EYE_Z + 0.008)
  mouth.rotation.x = -0.22
  head.add(mouth)

  return { group: head, eyelids }
}

// --- Ensamblado ---

export function buildAvatar(): { object: THREE.Group; bones: AvatarBones } {
  const root = new THREE.Group()
  const torso = new THREE.Group()
  root.add(torso)

  // pantalon / piernas
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.5, 4, 12), mat(DARK))
    leg.position.set(s * 0.13, 0.4, 0)
    torso.add(leg)

    // ojota (sandalia simple)
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.24), mat(0x5a3a24))
    foot.position.set(s * 0.13, 0.06, 0.05)
    torso.add(foot)
  }

  // camisa crema
  const shirt = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 20), mat(SHIRT))
  shirt.scale.set(1, 1.5, 0.92)
  shirt.position.y = 1.12
  torso.add(shirt)

  // cuello de la camisa
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.022, 10, 24), mat(SHIRT))
  collar.rotation.x = Math.PI / 2
  collar.position.y = 1.47
  torso.add(collar)

  // chaleco rojo abierto: dos paneles delanteros con franjas en la abertura
  // y la espalda lisa (como el logo)
  const vest = new THREE.Group()
  vest.position.y = 1.15
  vest.scale.z = 0.94
  torso.add(vest)
  const vestFrontMat = new THREE.MeshStandardMaterial({
    map: vestTexture(),
    roughness: 0.95,
    side: THREE.DoubleSide,
  })
  // Perfil del chaleco: sigue la forma de la camisa (elipsoide) un poco por
  // fuera, para que la camisa no lo atraviese.
  const H = 0.46
  const profile: THREE.Vector2[] = []
  for (let i = 0; i <= 16; i++) {
    const y = -H / 2 + (H * i) / 16
    const dy = (y + 0.03) / 0.39 // centro de la camisa 0.03 por debajo del chaleco
    profile.push(new THREE.Vector2(0.26 * Math.sqrt(Math.max(0.05, 1 - dy * dy)) + 0.02, y))
  }
  const gap = 0.16
  const side = Math.PI / 2 + 0.12 - gap
  const leftPanel = new THREE.Mesh(new THREE.LatheGeometry(profile, 20, gap, side), vestFrontMat)
  const rightPanel = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 20, -Math.PI / 2 - 0.12, side),
    vestFrontMat,
  )
  const back = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 32, Math.PI / 2 - 0.12, Math.PI + 0.24),
    new THREE.MeshStandardMaterial({ color: RED, roughness: 0.95, side: THREE.DoubleSide }),
  )
  vest.add(leftPanel, rightPanel, back)

  // ribete inferior
  const hem = new THREE.Mesh(new THREE.TorusGeometry(profile[0]!.x, 0.012, 8, 32), mat(RED_DARK, 0.9))
  hem.rotation.x = Math.PI / 2
  hem.position.y = -H / 2
  vest.add(hem)

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
  head.scale.setScalar(1.15)

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
