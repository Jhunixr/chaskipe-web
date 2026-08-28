/**
 * Tipos de dominio de Chaski Pe.
 *
 * Nota: la Lengua de Senas Peruana (LSP) NO comparte la gramatica del espanol.
 * Los datos con `isDemo: true` son demostrativos y deben validarse con personas
 * usuarias de LSP o interpretes antes de considerarse reales.
 */

export type TranslationDirection = 'sign-to-text' | 'text-to-sign'

export type RecognitionStatus = 'idle' | 'recognizing' | 'recognized' | 'error'

export interface UserProfile {
  name: string
  email: string
}

export interface QuickPhrase {
  id: string
  text: string
  category: QuickPhraseCategory
  /** true mientras la sena LSP asociada no ha sido validada. */
  isDemo: boolean
}

export type QuickPhraseCategory = 'saludos' | 'necesidades' | 'emergencias'

export interface QuickPhraseGroup {
  category: QuickPhraseCategory
  label: string
  phrases: QuickPhrase[]
}

export interface HistoryEntry {
  id: string
  direction: TranslationDirection
  /** Texto reconocido (sign-to-text) o texto de entrada (text-to-sign). */
  text: string
  /** Fecha ISO 8601. */
  createdAt: string
  isDemo: boolean
}

export interface ConversationMessage {
  id: string
  direction: TranslationDirection
  text: string
  createdAt: string
  isDemo: boolean
}

export interface AccessibilitySettings {
  textSize: 'normal' | 'grande' | 'muy-grande'
  voiceSpeed: 'lenta' | 'normal' | 'rapida'
  avatarSpeed: 'lenta' | 'normal' | 'rapida'
  subtitles: boolean
  language: 'es-PE'
}
