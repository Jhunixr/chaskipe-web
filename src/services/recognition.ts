/**
 * Resultado del ultimo reconocimiento, compartido entre "Senas a texto" y
 * "Resultado".
 *
 * Se pasa por el `state` de React Router; ademas se guarda en sessionStorage
 * para que un refresco de la pagina de resultado no la deje vacia.
 *
 * FASE 10: el modelo reconoce **letras del abecedario de la LSP** (deletreo
 * manual). El deletreo NO es toda la LSP: la lengua tiene su propia gramatica
 * y vocabulario. Las senas deben validarse con personas usuarias o interpretes.
 */
import { LSP_ALPHABET } from '@/types/dataset'

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

/** Texto legible para una etiqueta del abecedario. */
export function phraseForLabel(label: string): string {
  return LSP_ALPHABET.find((v) => v.label === label)?.word ?? label
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
