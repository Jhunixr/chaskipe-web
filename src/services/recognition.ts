/**
 * Resultado del ultimo reconocimiento, compartido entre "Senas a texto" y
 * "Resultado".
 *
 * Se pasa por el `state` de React Router; ademas se guarda en sessionStorage
 * para que un refresco de la pagina de resultado no la deje vacia.
 *
 * El modelo reconoce senas del vocabulario (`SIGN_VOCAB`). La LSP tiene su
 * propia gramatica; las senas deben validarse con personas usuarias o
 * interpretes.
 */
import { SIGN_VOCAB } from '@/types/dataset'

export interface RecognitionResult {
  /** Etiqueta del vocabulario (A, B, ..., ENYE). */
  label: string
  /** Texto legible (la letra). */
  text: string
  /** Confianza 0..1 del modelo. */
  confidence: number
  /** true si el modelo se entreno con datos sinteticos (no valido). */
  isSynthetic: boolean
  /** Marca de tiempo del reconocimiento. */
  at: number
}

const KEY = 'chaskipe:last-recognition'

/** Texto legible para una etiqueta de sena. */
const READABLE: Record<string, string> = {
  HOLA: 'Hola',
  GRACIAS: 'Gracias',
  REPOSO: '',
}

export function phraseForLabel(label: string): string {
  return (
    READABLE[label] ??
    SIGN_VOCAB.find((v) => v.label === label)?.word ??
    label
  )
}

export function saveRecognition(result: RecognitionResult): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(result))
  } catch {
    // sessionStorage no disponible: solo se usara el state del router
  }
}

export function loadRecognition(): RecognitionResult | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as RecognitionResult
    if (typeof parsed.text === 'string' && typeof parsed.label === 'string') {
      return parsed
    }
  } catch {
    // valor invalido
  }
  return null
}
