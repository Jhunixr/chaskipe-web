/**
 * Tipos del dataset de landmarks.
 * Espejo del esquema de `ai/data/DATASET_FORMAT.md` (schemaVersion 1).
 *
 * Captura de senas de la Lengua de Senas Peruana (LSP). Cada grabacion es una
 * secuencia temporal de landmarks (no una foto): sirve tanto para poses fijas
 * como para senas con movimiento.
 */

export const DATASET_SCHEMA_VERSION = 1

/** Una entrada del vocabulario a capturar. */
export interface VocabItem {
  /** Etiqueta segura como carpeta/clave: MAYUSCULAS, sin tildes ni espacios. */
  label: string
  /** Texto legible que se muestra en la interfaz. */
  word: string
  /**
   * true si la sena lleva movimiento (se graba mas tiempo y se pide hacer el
   * gesto completo). false = pose que se mantiene quieta.
   */
  dynamic?: boolean
}

/**
 * Vocabulario de senas a reconocer.
 *
 * IMPORTANTE: estas senas deben validarse con personas usuarias de LSP o
 * interpretes. La LSP tiene su propia gramatica y variacion regional.
 *
 * "REPOSO" es la mano/manos sin hacer ninguna sena: ayuda al modelo a no
 * confundir cualquier movimiento con una sena.
 */
export const SIGN_VOCAB: readonly VocabItem[] = [
  // --- Palabras y frases ---
  { label: 'HOLA', word: 'Hola', dynamic: true },
  { label: 'GRACIAS', word: 'Gracias', dynamic: true },
  { label: 'ADIOS', word: 'Adios', dynamic: true },
  { label: 'HOLA_COMO_ESTAS', word: 'Hola, como estas', dynamic: true },
  { label: 'CUIDATE', word: 'Cuidate', dynamic: true },
  { label: 'REPOSO', word: 'Reposo (sin sena)', dynamic: false },

  // --- Abecedario dactilologico ---
  // La mayoria son poses fijas; J, Z y ENYE llevan movimiento.
  { label: 'A', word: 'A', dynamic: false },
  { label: 'B', word: 'B', dynamic: false },
  { label: 'C', word: 'C', dynamic: false },
  { label: 'D', word: 'D', dynamic: false },
  { label: 'E', word: 'E', dynamic: false },
  { label: 'F', word: 'F', dynamic: false },
  { label: 'G', word: 'G', dynamic: false },
  { label: 'H', word: 'H', dynamic: false },
  { label: 'I', word: 'I', dynamic: false },
  { label: 'J', word: 'J', dynamic: true },
  { label: 'K', word: 'K', dynamic: false },
  { label: 'L', word: 'L', dynamic: false },
  { label: 'M', word: 'M', dynamic: false },
  { label: 'N', word: 'N', dynamic: false },
  { label: 'ENYE', word: 'N (enye)', dynamic: true },
  { label: 'O', word: 'O', dynamic: false },
  { label: 'P', word: 'P', dynamic: false },
  { label: 'Q', word: 'Q', dynamic: false },
  { label: 'R', word: 'R', dynamic: false },
  { label: 'S', word: 'S', dynamic: false },
  { label: 'T', word: 'T', dynamic: false },
  { label: 'U', word: 'U', dynamic: false },
  { label: 'V', word: 'V', dynamic: false },
  { label: 'W', word: 'W', dynamic: false },
  { label: 'X', word: 'X', dynamic: false },
  { label: 'Y', word: 'Y', dynamic: false },
  { label: 'Z', word: 'Z', dynamic: true },
]

/** Vocabulario activo de la herramienta de captura. */
export const CAPTURE_VOCAB = SIGN_VOCAB

/** Una mano dentro de un frame. */
export interface SampleHand {
  handedness: string // "Left" | "Right"
  score: number
  /** 21 landmarks, cada uno [x, y, z]. */
  landmarks: [number, number, number][]
  /**
   * 21 world landmarks de MediaPipe (metros) [x, y, z]. Opcional: las
   * muestras antiguas no lo tienen. Los usa el modelo de letras estaticas.
   */
  worldLandmarks?: [number, number, number][]
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
