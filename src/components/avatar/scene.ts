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
import { textToSpelling, type SpellToken, type Vec3 } from './fingerspelling'
import { buildAvatar, type AvatarBones } from './rig'
import { lerpPose, SpellingArm } from './spellingHand'

const BG = 0xfbf5ec

/** Tiempos del deletreo (s), a velocidad normal. */
const SPELL_TRANSITION = 0.24
const SPELL_HOLD = 0.62
const SPELL_NO_POSE = 0.9
const SPELL_SPACE = 0.5

/** Donde se coloca la muneca al deletrear: delante del pecho, lado derecho. */
const SPELL_WRIST = new THREE.Vector3(-0.22, 0.74, 0.42)

const CAMERA_FULL = { pos: new THREE.Vector3(0, 0.9, 4.9), target: new THREE.Vector3(0, 0.7, 0) }
const CAMERA_HAND = { pos: new THREE.Vector3(-0.08, 1.0, 3.0), target: new THREE.Vector3(-0.1, 0.95, 0) }

export interface SpellCallbacks {
  /** Indice del token (letra o espacio) que se esta mostrando. */
  onToken?: (index: number, token: SpellToken) => void
  onEnd?: () => void
}

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
  private gestureSpeed = 1
  private onGestureEnd: (() => void) | null = null

  // --- Deletreo ---
  private spellArm = new SpellingArm()
  private spellTokens: SpellToken[] = []
  private spellIndex = -1
  private spellElapsed = 0
  private spellCallbacks: SpellCallbacks = {}
  private fromPose: Vec3[] | null = null
  private handPose: Vec3[] | null = null
  private cameraTarget = CAMERA_FULL.target.clone()
  private shoulderWorld = new THREE.Vector3()
  /** Momento (performance.now) en que la mano baja tras terminar de deletrear. */
  private lowerHandAt = 0

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
    this.scene.add(this.spellArm.group)

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

  /**
   * Velocidad de reproduccion de los gestos (preferencia de accesibilidad).
   * 1 = normal. No afecta a la animacion de reposo.
   */
  setGestureSpeed(speed: number): void {
    this.gestureSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1
  }

  stopGesture(): void {
    this.currentGesture = null
    this.onGestureEnd = null
    applyRest(this.bones)
  }

  /**
   * Deletrea `text` con el alfabeto manual de la LSP (letras del dataset).
   * Devuelve la secuencia de tokens para mostrarla como subtitulo.
   */
  spell(text: string, callbacks: SpellCallbacks = {}): SpellToken[] {
    this.stopGesture()
    this.spellTokens = textToSpelling(text)
    this.spellCallbacks = callbacks
    this.spellIndex = -1
    this.spellElapsed = 0
    this.fromPose = this.handPose
    this.lowerHandAt = 0
    if (this.spellTokens.length === 0) {
      callbacks.onEnd?.()
      return []
    }
    this.advanceSpelling()
    return this.spellTokens
  }

  stopSpelling(): void {
    this.spellTokens = []
    this.spellIndex = -1
    this.spellCallbacks = {}
    this.handPose = null
    this.spellArm.group.visible = false
    this.bones.shoulderR.visible = true
  }

  get isSpelling(): boolean {
    return this.spellIndex >= 0
  }

  private tokenDuration(token: SpellToken): number {
    if (token.kind === 'space') return SPELL_SPACE
    return token.pose ? SPELL_TRANSITION + SPELL_HOLD : SPELL_NO_POSE
  }

  private advanceSpelling(): void {
    this.spellIndex++
    this.spellElapsed = 0
    if (this.spellIndex >= this.spellTokens.length) {
      const onEnd = this.spellCallbacks.onEnd
      this.spellIndex = -1
      this.spellTokens = []
      this.spellCallbacks = {}
      // La mano se queda en la ultima letra un momento y luego baja.
      this.lowerHandAt = performance.now() + 1400
      onEnd?.()
      return
    }
    const token = this.spellTokens[this.spellIndex]!
    this.fromPose = this.handPose
    this.spellCallbacks.onToken?.(this.spellIndex, token)
  }

  private updateSpelling(dt: number): void {
    const token = this.spellTokens[this.spellIndex]
    if (!token) return
    this.spellElapsed += dt * this.gestureSpeed
    if (token.kind === 'letter' && token.pose) {
      const from = this.fromPose ?? token.pose
      const k = THREE.MathUtils.clamp(this.spellElapsed / SPELL_TRANSITION, 0, 1)
      this.handPose = lerpPose(from, token.pose, k * k * (3 - 2 * k))
    }
    if (this.spellElapsed >= this.tokenDuration(token)) this.advanceSpelling()
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

    if (this.isSpelling) this.updateSpelling(dt)
    else if (this.handPose && this.lowerHandAt > 0 && now >= this.lowerHandAt) {
      this.handPose = null
      this.lowerHandAt = 0
    }

    // Mano de deletreo: visible mientras haya una pose que mostrar.
    const showHand = this.handPose !== null
    this.spellArm.group.visible = showHand
    this.bones.shoulderR.visible = !showHand
    if (showHand) {
      this.bones.shoulderR.getWorldPosition(this.shoulderWorld)
      this.spellArm.update(this.handPose!, SPELL_WRIST, this.shoulderWorld)
    }

    // Camara: se acerca a la mano mientras deletrea.
    const view = showHand ? CAMERA_HAND : CAMERA_FULL
    const ease = 1 - Math.exp(-dt * 4)
    this.camera.position.lerp(view.pos, ease)
    this.cameraTarget.lerp(view.target, ease)
    this.camera.lookAt(this.cameraTarget)

    if (this.currentGesture) {
      this.gestureElapsed += dt * 1000 * this.gestureSpeed
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
    this.spellArm.dispose()
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
