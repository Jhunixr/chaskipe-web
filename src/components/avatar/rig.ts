/**
 * Rig geometrico del avatar (FASE 9).
 *
 * Construye un humanoide simple con geometrias de Three.js y expone los
 * "huesos" (Object3D) que las animaciones rotan: hombros, codos, munecas,
 * cuello y torso. No es un modelo realista; es un placeholder controlable
 * mientras no haya un GLB con esqueleto (y, sobre todo, animaciones LSP
 * validadas — FASE 10).
 */
import * as THREE from 'three'

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
  /** Parpados para el parpadeo. */
  eyelids: THREE.Mesh[]
}

const SKIN = 0xe8a06a
const SHIRT = 0xf3ede2
const VEST = 0xb3261e
const HAIR = 0x2b1c14
const DARK = 0x2c2622

function limbMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0 })
}

function makeArm(side: 'L' | 'R'): {
  shoulder: THREE.Group
  elbow: THREE.Group
  wrist: THREE.Group
} {
  const dir = side === 'L' ? 1 : -1

  const shoulder = new THREE.Group()
  shoulder.position.set(dir * 0.42, 1.4, 0)

  const upper = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.11, 0.42, 4, 12),
    limbMaterial(SHIRT),
  )
  upper.position.y = -0.28
  upper.castShadow = true
  shoulder.add(upper)

  const elbow = new THREE.Group()
  elbow.position.y = -0.52
  shoulder.add(elbow)

  const forearm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.095, 0.4, 4, 12),
    limbMaterial(SKIN),
  )
  forearm.position.y = -0.26
  forearm.castShadow = true
  elbow.add(forearm)

  const wrist = new THREE.Group()
  wrist.position.y = -0.5
  elbow.add(wrist)

  const hand = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.2, 0.08),
    limbMaterial(SKIN),
  )
  hand.position.y = -0.12
  hand.castShadow = true
  wrist.add(hand)

  // Brazos en reposo: separados del cuerpo para que no se solapen con el torso.
  shoulder.rotation.z = dir * -0.28

  return { shoulder, elbow, wrist }
}

export function buildAvatar(): { object: THREE.Group; bones: AvatarBones } {
  const root = new THREE.Group()

  const torso = new THREE.Group()
  root.add(torso)

  // Cadera / base
  const hips = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.24, 0.2, 4, 16),
    limbMaterial(DARK),
  )
  hips.position.y = 0.7
  hips.castShadow = true
  torso.add(hips)

  // Torso (camisa)
  const chest = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 0.5, 4, 16),
    limbMaterial(SHIRT),
  )
  chest.position.y = 1.15
  chest.castShadow = true
  torso.add(chest)

  // Chaleco andino (detalle de identidad, sin patron)
  const vest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.34, 0.5, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: VEST,
      roughness: 0.8,
      side: THREE.DoubleSide,
    }),
  )
  vest.position.y = 1.15
  torso.add(vest)

  // Cuello
  const neck = new THREE.Group()
  neck.position.set(0, 1.5, 0)
  torso.add(neck)

  const neckMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.1, 0.14, 12),
    limbMaterial(SKIN),
  )
  neckMesh.position.y = 0.07
  neck.add(neckMesh)

  // Cabeza
  const head = new THREE.Group()
  head.position.y = 0.16
  neck.add(head)

  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 20),
    limbMaterial(SKIN),
  )
  skull.position.y = 0.16
  skull.castShadow = true
  head.add(skull)

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.205, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.6),
    limbMaterial(HAIR),
  )
  hair.position.y = 0.17
  head.add(hair)

  // Chullo (gorro): banda simple
  const chullo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.215, 0.215, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: VEST, roughness: 0.9 }),
  )
  chullo.position.y = 0.28
  head.add(chullo)
  const pompom = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshStandardMaterial({ color: VEST, roughness: 1 }),
  )
  pompom.position.y = 0.4
  head.add(pompom)

  // Ojos
  const eyeGeo = new THREE.SphereGeometry(0.028, 10, 10)
  const eyeMat = new THREE.MeshStandardMaterial({ color: DARK })
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
  eyeL.position.set(0.07, 0.17, 0.18)
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat)
  eyeR.position.set(-0.07, 0.17, 0.18)
  head.add(eyeL, eyeR)

  // Parpados (planos que bajan para parpadear)
  const lidGeo = new THREE.CircleGeometry(0.04, 12)
  const lidMat = limbMaterial(SKIN)
  const lidL = new THREE.Mesh(lidGeo, lidMat)
  lidL.position.set(0.07, 0.17, 0.185)
  lidL.scale.y = 0.001
  const lidR = new THREE.Mesh(lidGeo, lidMat)
  lidR.position.set(-0.07, 0.17, 0.185)
  lidR.scale.y = 0.001
  head.add(lidL, lidR)

  // Brazos
  const armL = makeArm('L')
  const armR = makeArm('R')
  torso.add(armL.shoulder, armR.shoulder)

  root.position.y = -0.55 // centrar en el encuadre

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
    eyelids: [lidL, lidR],
  }

  return { object: root, bones }
}
