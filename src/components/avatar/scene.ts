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

/** Textura radial (blanco->transparente) para la sombra de contacto. */
function makeRadialShadow(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62)
  g.addColorStop(0, 'rgba(60,40,30,0.9)')
  g.addColorStop(1, 'rgba(60,40,30,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

export class SignAvatarScene {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private bones: AvatarBones
  private startTime = performance.now()
  private lastTime = performance.now()
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
    // Sin shadow map: usamos una sombra de contacto pintada (mas ligera y
    // compatible con GPUs / renderers limitados).
    this.renderer.shadowMap.enabled = false

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(BG)

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    this.camera.position.set(0, 0.9, 4.9)
    this.camera.lookAt(0, 0.7, 0)

    // Luces
    const ambient = new THREE.HemisphereLight(0xffffff, 0xd9c7a8, 0.9)
    this.scene.add(ambient)

    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(2, 3, 3)
    this.scene.add(key)

    const fill = new THREE.DirectionalLight(0xffe6c8, 0.4)
    fill.position.set(-3, 1, 2)
    this.scene.add(fill)

    // Sombra de contacto simple (disco oscuro difuminado bajo el avatar).
    const shadowTex = makeRadialShadow()
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.6),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.35,
      }),
    )
    contactShadow.rotation.x = -Math.PI / 2
    contactShadow.position.y = -0.56
    this.scene.add(contactShadow)

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

    const now = performance.now()
    const dt = Math.min((now - this.lastTime) / 1000, 0.1)
    this.lastTime = now
    const t = (now - this.startTime) / 1000

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
