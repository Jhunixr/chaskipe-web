/**
 * Tipos del dataset de landmarks.
 * Espejo del esquema de `ai/data/DATASET_FORMAT.md` (schemaVersion 1).
 *
 * FASE 4: captura de datos.
 * FASE 10: abecedario de la Lengua de Senas Peruana (LSP).
 */

export const DATASET_SCHEMA_VERSION = 1

/** Una entrada del vocabulario a capturar. */
export interface VocabItem {
  /** Etiqueta segura como carpeta/clave: MAYUSCULAS, sin tildes ni espacios. */
  label: string
  /** Texto legible que se muestra en la interfaz. */
  word: string
  /**
   * true si la sena lleva movimiento (no es una pose fija).
   * En LSP el deletreo manual de J, Z, N (enye), LL y RR incluye un
   * desplazamiento; el resto son poses estaticas.
   */
  dynamic?: boolean
}

/**
 * Abecedario de la LSP para el deletreo manual (dactilologia).
 *
 * Referencia: cartel "El Alfabeto - Lengua de Senas Peruana" (Paz y Esperanza).
 * IMPORTANTE: estas senas deben validarse con personas usuarias de LSP o
 * interpretes. La orientacion de la muneca y la variacion regional no se
 * aprecian bien en una lamina.
 */
export const LSP_ALPHABET: readonly VocabItem[] = [
  { label: 'A', word: 'A' },
  { label: 'B', word: 'B' },
  { label: 'C', word: 'C' },
  { label: 'D', word: 'D' },
  { label: 'E', word: 'E' },
  { label: 'F', word: 'F' },
  { label: 'G', word: 'G' },
  { label: 'H', word: 'H' },
  { label: 'I', word: 'I' },
  { label: 'J', word: 'J', dynamic: true },
  { label: 'K', word: 'K' },
  { label: 'L', word: 'L' },
  { label: 'LL', word: 'LL', dynamic: true },
  { label: 'M', word: 'M' },
  { label: 'N', word: 'N' },
  { label: 'ENYE', word: 'Ñ', dynamic: true },
  { label: 'O', word: 'O' },
  { label: 'P', word: 'P' },
  { label: 'Q', word: 'Q' },
  { label: 'R', word: 'R' },
  { label: 'RR', word: 'RR', dynamic: true },
  { label: 'S', word: 'S' },
  { label: 'T', word: 'T' },
  { label: 'U', word: 'U' },
  { label: 'V', word: 'V' },
  { label: 'W', word: 'W' },
  { label: 'X', word: 'X' },
  { label: 'Y', word: 'Y' },
  { label: 'Z', word: 'Z', dynamic: true },
]

/** Vocabulario activo de la herramienta de captura. */
export const CAPTURE_VOCAB = LSP_ALPHABET

/** Una mano dentro de un frame. */
export interface SampleHand {
  handedness: string // "Left" | "Right"
  score: number
  /** 21 landmarks, cada uno [x, y, z]. */
  landmarks: [number, number, number][]
}

/** Un frame de la grabacion. */
export interface SampleFrame {
  /** ms desde el inicio de la grabacion. */
  t: number
  hands: SampleHand[]
}

export interface SampleCapture {
  fps: number
  durationMs: number
  frameCount: number
  mirrored: boolean
  model: 'hand_landmarker'
  modelVersion: string
  handsMax: number
  imageAspect: number
}

/** Una muestra completa = un archivo .json. */
export interface DatasetSample {
  schemaVersion: typeof DATASET_SCHEMA_VERSION
  label: string
  word: string
  sampleId: string
  createdAt: string
  source: 'web-collector'
  validated: false
  consent: boolean
  notes: string
  capture: SampleCapture
  frames: SampleFrame[]
}
