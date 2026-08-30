/**
 * Escena Three.js del avatar (FASE 9).
 *
 * `SignAvatarScene` encapsula renderer + camara + luces + rig y expone un
 * bucle de render. Sin dependencias de assets externos (el rig es geometrico).
 *
 * FASE 10: aqui se cargara un GLB con esqueleto y clips de animacion de senas
 * validadas. `playGesture` ya define la interfaz.
 */
import * as THREE from 'three'

import {
  applyGesture,
  applyIdle,
  applyRest,
  type Gesture,
} from './animation'
import { buildAvatar, type AvatarBones } from './rig'

const BG = 0xfbf5ec

export class SignAvatarScene {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private bones: AvatarBones
  private clock = new THREE.Clock()
  private frame = 0
  private disposed = false

  private currentGesture: Gesture | null = null
  private gestureElapsed = 0
  private onGestureEnd: (() => void) | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(BG)

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    this.camera.position.set(0, 0.55, 4.6)
    this.camera.lookAt(0, 0.35, 0)

    // Luces
    const ambient = new THREE.HemisphereLight(0xffffff, 0xd9c7a8, 0.9)
    this.scene.add(ambient)

    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(2, 3, 3)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 0.5
    key.shadow.camera.far = 12
    this.scene.add(key)

    const fill = new THREE.DirectionalLight(0xffe6c8, 0.4)
    fill.position.set(-3, 1, 2)
    this.scene.add(fill)

    // Suelo (recibe sombra)
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3, 32),
      new THREE.ShadowMaterial({ opacity: 0.12 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.57
    floor.receiveShadow = true
    this.scene.add(floor)

    // Avatar
    const { object, bones } = buildAvatar()
    this.bones = bones
    this.scene.add(object)

    this.animate = this.animate.bind(this)
    this.frame = requestAnimationFrame(this.animate)
  }

  /** Ajusta el tamano del render al contenedor. */
  resize(width: number, height: number): void {
    if (this.disposed || width === 0 || height === 0) return
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  /**
   * Reproduce un gesto. En la FASE 9 solo se usa el gesto DEMO.
   * `onEnd` se llama cuando termina.
   */
  playGesture(gesture: Gesture, onEnd?: () => void): void {
    this.currentGesture = gesture
    this.gestureElapsed = 0
    this.onGestureEnd = onEnd ?? null
  }

  stopGesture(): void {
    this.currentGesture = null
    this.onGestureEnd = null
    applyRest(this.bones)
  }

  get isPlaying(): boolean {
    return this.currentGesture !== null
  }

  private animate(): void {
    if (this.disposed) return
    this.frame = requestAnimationFrame(this.animate)

    const dt = this.clock.getDelta()
    const t = this.clock.elapsedTime

    applyIdle(this.bones, t)

    if (this.currentGesture) {
      this.gestureElapsed += dt * 1000
      const running = applyGesture(
        this.bones,
        this.currentGesture,
        this.gestureElapsed,
      )
      if (!running) {
        const cb = this.onGestureEnd
        this.currentGesture = null
        this.onGestureEnd = null
        applyRest(this.bones)
        cb?.()
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.frame)
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        const mat = obj.material
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat.dispose()
      }
    })
    this.renderer.dispose()
  }
}
