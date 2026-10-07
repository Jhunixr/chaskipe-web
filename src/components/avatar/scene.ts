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
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import {
  applyGesture,
  applyIdle,
  applyRest,
  type Gesture,
} from './animation'
import { LETTER_POSES, textToSpelling, type SignClip, type SpellToken, type Vec3 } from './fingerspelling'
import { buildAvatar, type AvatarBones } from './rig'
import { lerpPose, SpellingArm } from './spellingHand'


/** Tiempos del deletreo (s), a velocidad normal. */
const SPELL_TRANSITION = 0.24
const SPELL_HOLD = 0.62
const SPELL_NO_POSE = 0.9
const SPELL_SPACE = 0.5

/** Donde se coloca la muneca al deletrear: delante del pecho, lado derecho. */
const SPELL_WRIST = new THREE.Vector3(-0.22, 0.74, 0.42)

const CAMERA_FULL = { pos: new THREE.Vector3(0, 0.9, 4.9), target: new THREE.Vector3(0, 0.7, 0) }
const CAMERA_HAND = { pos: new THREE.Vector3(-0.08, 1.0, 3.0), target: new THREE.Vector3(-0.1, 0.95, 0) }

/**
 * Modelo 3D del Chaski generado desde el logo (ver avatar/models/README.md).
 * Se le quito la mano esculpida del brazo levantado; en su lugar va la mano
 * articulada que forma las letras. `wrist` es el centro del puno de la manga.
 */
const CHASKI_MODEL = {
  url: `${import.meta.env.BASE_URL}models/avatar/chaski.glb`,
  wrist: new THREE.Vector3(-0.589, -0.3, 0.395),
  handScale: 0.25,
  skin: 0xe39a62,
}
const REAL_FULL = { pos: new THREE.Vector3(0, -0.1, 4.7), target: new THREE.Vector3(0, -0.18, 0) }
const REAL_HAND = { pos: new THREE.Vector3(-0.12, -0.08, 4.0), target: new THREE.Vector3(-0.12, -0.16, 0) }
/** Mano en reposo: la B (mano abierta), como saludando. */
const REST_POSE = LETTER_POSES.B ?? null

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
  /** Desplazamiento de la muneca (en "manos") durante una sena grabada. */
  private wristOffset = new THREE.Vector3()
  private wristTmp = new THREE.Vector3()

  // --- Modelo 3D del Chaski (si carga) ---
  private avatarObject: THREE.Object3D
  private realistic: { root: THREE.Group; hand: SpellingArm } | null = null

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
    // Fondo transparente: el escenario (rojo con montañas) lo pinta el CSS.
    this.scene.background = null
    this.renderer.setClearColor(0x000000, 0)

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
    this.avatarObject = object
    this.scene.add(object)
    this.scene.add(this.spellArm.group)
    void this.loadChaskiModel()

    this.animate = this.animate.bind(this)
    this.frame = requestAnimationFrame(this.animate)
  }

  /**
   * Carga el modelo 3D del Chaski. Si falla (sin conexion, archivo ausente),
   * se queda el avatar geometrico, que tambien deletrea.
   */
  private async loadChaskiModel(): Promise<void> {
    try {
      const gltf = await new GLTFLoader().loadAsync(CHASKI_MODEL.url)
      if (this.disposed) return
      const root = new THREE.Group()
      gltf.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          const m = obj.material as THREE.MeshStandardMaterial
          m.roughness = 0.8
          m.metalness = 0
        }
      })
      root.add(gltf.scene)
      const hand = new SpellingArm({
        withArm: false,
        handScale: CHASKI_MODEL.handScale,
        skinColor: CHASKI_MODEL.skin,
      })
      hand.group.visible = true
      root.add(hand.group)
      this.scene.add(root)
      this.avatarObject.visible = false
      this.spellArm.group.visible = false
      this.realistic = { root, hand }
    } catch {
      // se queda el avatar geometrico
    }
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
    this.fromPose = this.handPose ?? (this.realistic ? REST_POSE : null)
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
    this.wristOffset.set(0, 0, 0)
    this.spellArm.group.visible = false
    this.bones.shoulderR.visible = true
  }

  /** true si se esta mostrando el modelo 3D del Chaski (no el geometrico). */
  get isRealistic(): boolean {
    return this.realistic !== null
  }

  get isSpelling(): boolean {
    return this.spellIndex >= 0
  }

  private tokenDuration(token: SpellToken): number {
    if (token.kind === 'space') return SPELL_SPACE
    if (token.kind === 'sign') return SPELL_TRANSITION + token.clip.durationMs / 1000 + SPELL_HOLD / 2
    return token.pose ? SPELL_TRANSITION + SPELL_HOLD : SPELL_NO_POSE
  }

  /** Cuadro de la sena grabada en `ms` (interpolado entre los dos vecinos). */
  private sampleClip(clip: SignClip, ms: number): { pose: Vec3[]; wrist: Vec3 } {
    const frames = clip.frames
    let i = 0
    while (i < frames.length - 2 && frames[i + 1]!.t <= ms) i++
    const a = frames[i]!
    const b = frames[Math.min(i + 1, frames.length - 1)]!
    const k = b.t > a.t ? THREE.MathUtils.clamp((ms - a.t) / (b.t - a.t), 0, 1) : 0
    const w: Vec3 = [
      a.wrist[0] + (b.wrist[0] - a.wrist[0]) * k,
      a.wrist[1] + (b.wrist[1] - a.wrist[1]) * k,
      a.wrist[2] + (b.wrist[2] - a.wrist[2]) * k,
    ]
    return { pose: lerpPose(a.pose, b.pose, k), wrist: w }
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
    this.fromPose = this.handPose ?? (this.realistic ? REST_POSE : null)
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
      this.wristOffset.multiplyScalar(1 - k)
    } else if (token.kind === 'sign') {
      // Entrada suave al primer cuadro y luego la grabacion tal cual.
      const ms = Math.max(0, this.spellElapsed - SPELL_TRANSITION) * 1000
      const frame = this.sampleClip(token.clip, Math.min(ms, token.clip.durationMs))
      const k = THREE.MathUtils.clamp(this.spellElapsed / SPELL_TRANSITION, 0, 1)
      const e = k * k * (3 - 2 * k)
      this.handPose = this.fromPose ? lerpPose(this.fromPose, frame.pose, e) : frame.pose
      this.wristOffset.set(frame.wrist[0] * e, frame.wrist[1] * e, frame.wrist[2] * e)
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

    const showHand = this.handPose !== null
    let view = showHand ? CAMERA_HAND : CAMERA_FULL
    if (this.realistic) {
      // Modelo 3D: respira y se balancea; la mano siempre esta (en reposo, la B).
      const { root, hand } = this.realistic
      root.rotation.y = Math.sin(t * 0.5) * 0.04
      root.position.y = Math.sin(t * 1.6) * 0.006
      const pose = this.handPose ?? REST_POSE
      if (!this.handPose) this.wristOffset.set(0, 0, 0)
      this.wristTmp.copy(CHASKI_MODEL.wrist).addScaledVector(this.wristOffset, CHASKI_MODEL.handScale)
      if (pose) hand.update(pose, this.wristTmp)
      view = showHand ? REAL_HAND : REAL_FULL
    } else {
      // Avatar geometrico: el brazo de deletreo reemplaza al brazo derecho.
      this.spellArm.group.visible = showHand
      this.bones.shoulderR.visible = !showHand
      if (showHand) {
        this.bones.shoulderR.getWorldPosition(this.shoulderWorld)
        this.wristTmp.copy(SPELL_WRIST).addScaledVector(this.wristOffset, 0.15)
        this.spellArm.update(this.handPose!, this.wristTmp, this.shoulderWorld)
      }
    }

    // Camara: se acerca a la mano mientras deletrea.
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
    this.realistic?.hand.dispose()
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
