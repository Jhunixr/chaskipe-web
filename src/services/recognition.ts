/**
 * Resultado del ultimo reconocimiento de sena, compartido entre
 * "Senas a texto" y "Resultado" (FASE 6).
 *
 * Se pasa por el `state` de React Router; ademas se guarda en sessionStorage
 * para que un refresco de la pagina de resultado no la deje vacia.
 */
import { INITIAL_VOCAB } from '@/types/dataset'

export interface RecognitionResult {
  /** Etiqueta del vocabulario (HOLA, GRACIAS, ...). */
  label: string
  /** Frase legible que se muestra y se lee en voz alta. */
  text: string
  /** Confianza 0..1 del modelo. */
  confidence: number
  /** true si el modelo se entreno con datos sinteticos (no valido). */
  isSynthetic: boolean
  /** Marca de tiempo del reconocimiento. */
  at: number
}

const KEY = 'chaskipe:last-recognition'

/**
 * Frase que se muestra para cada sena reconocida.
 *
 * DEMO: estas equivalencias son aproximadas y NO han sido validadas con
 * personas usuarias de LSP ni interpretes. La LSP no comparte la gramatica
 * del espanol.
 */
const PHRASE_BY_LABEL: Record<string, string> = {
  HOLA: 'Hola',
  GRACIAS: 'Gracias',
  AYUDA: 'Necesito ayuda',
  SI: 'Si',
  NO: 'No',
}

export function phraseForLabel(label: string): string {
  return (
    PHRASE_BY_LABEL[label] ??
    INITIAL_VOCAB.find((v) => v.label === label)?.word ??
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
