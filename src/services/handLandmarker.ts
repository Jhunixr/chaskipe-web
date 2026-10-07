/**
 * Carga y acceso al Hand Landmarker de MediaPipe Tasks Vision.
 *
 * Los assets (wasm + modelo .task) se sirven localmente desde
 * `public/mediapipe/` (ver `public/mediapipe/README.md`).
 *
 * FASE 3: solo deteccion de manos. Sin reconocimiento de senas.
 */
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

const WASM_PATH = `${import.meta.env.BASE_URL}mediapipe/wasm`
const MODEL_PATH = `${import.meta.env.BASE_URL}mediapipe/models/hand_landmarker.task`

let instance: HandLandmarker | null = null
let loadingPromise: Promise<HandLandmarker> | null = null

/**
 * Devuelve una instancia compartida del Hand Landmarker en modo VIDEO.
 * La primera llamada descarga el modelo (~8 MB) y el runtime wasm.
 */
export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (instance) return instance
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const fileset = await FilesetResolver.forVisionTasks(WASM_PATH)
    const landmarker = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: MODEL_PATH,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
    instance = landmarker
    return landmarker
  })()

  try {
    return await loadingPromise
  } catch (error) {
    loadingPromise = null
    throw error
  }
}

/** Libera el modelo (por ejemplo al salir de la funcion de camara). */
export function closeHandLandmarker(): void {
  if (instance) {
    instance.close()
    instance = null
  }
  loadingPromise = null
}
