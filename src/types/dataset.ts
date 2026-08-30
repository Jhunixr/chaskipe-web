/**
 * Tipos del dataset de landmarks (FASE 4).
 * Espejo del esquema de `ai/data/DATASET_FORMAT.md` (schemaVersion 1).
 *
 * Solo captura y organizacion de datos. No se entrena nada aqui.
 */

export const DATASET_SCHEMA_VERSION = 1

/** Palabra del vocabulario inicial de senas. */
export interface VocabItem {
  /** Etiqueta segura como carpeta/clave: MAYUSCULAS, sin tildes ni espacios. */
  label: string
  /** Palabra legible. */
  word: string
}

export const INITIAL_VOCAB: readonly VocabItem[] = [
  { label: 'HOLA', word: 'Hola' },
  { label: 'GRACIAS', word: 'Gracias' },
  { label: 'AYUDA', word: 'Ayuda' },
  { label: 'SI', word: 'Si' },
  { label: 'NO', word: 'No' },
]

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
