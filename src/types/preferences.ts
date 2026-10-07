/** Preferencias de accesibilidad. Espejo de `backend/app/schemas/preferences.py`. */

export type ThemePreference = 'claro' | 'oscuro' | 'sistema'
export type TextSize = 'normal' | 'grande' | 'muy-grande'
export type Speed = 'lenta' | 'normal' | 'rapida'

export interface Preferences {
  theme: ThemePreference
  textSize: TextSize
  voiceSpeed: Speed
  avatarSpeed: Speed
  subtitles: boolean
  language: string
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'sistema',
  textSize: 'normal',
  voiceSpeed: 'normal',
  avatarSpeed: 'normal',
  subtitles: true,
  language: 'es-PE',
}

/** Escala tipografica global aplicada a `--text-scale`. */
export const TEXT_SCALE: Record<TextSize, number> = {
  normal: 1,
  grande: 1.12,
  'muy-grande': 1.28,
}

/** Multiplicador de velocidad para la sintesis de voz (`utterance.rate`). */
export const VOICE_RATE: Record<Speed, number> = {
  lenta: 0.75,
  normal: 1,
  rapida: 1.35,
}

/** Multiplicador de velocidad de reproduccion de los gestos del avatar. */
export const AVATAR_RATE: Record<Speed, number> = {
  lenta: 0.6,
  normal: 1,
  rapida: 1.5,
}

export const LANGUAGES: { value: string; label: string }[] = [
  { value: 'es-PE', label: 'Espanol (Peru)' },
  { value: 'es-ES', label: 'Espanol (Espana)' },
  { value: 'es-MX', label: 'Espanol (Mexico)' },
]

const SPEEDS: Speed[] = ['lenta', 'normal', 'rapida']
const SIZES: TextSize[] = ['normal', 'grande', 'muy-grande']
const THEMES: ThemePreference[] = ['claro', 'oscuro', 'sistema']

/**
 * Valida un objeto desconocido (localStorage o backend) y rellena con los
 * valores por defecto lo que falte o no sea valido. Nunca lanza.
 */
export function coercePreferences(raw: unknown): Preferences {
  if (typeof raw !== 'object' || raw === null) return { ...DEFAULT_PREFERENCES }
  const o = raw as Record<string, unknown>
  const pick = <T extends string>(value: unknown, allowed: T[], fallback: T): T =>
    typeof value === 'string' && (allowed as string[]).includes(value)
      ? (value as T)
      : fallback

  return {
    theme: pick(o['theme'], THEMES, DEFAULT_PREFERENCES.theme),
    textSize: pick(o['textSize'], SIZES, DEFAULT_PREFERENCES.textSize),
    voiceSpeed: pick(o['voiceSpeed'], SPEEDS, DEFAULT_PREFERENCES.voiceSpeed),
    avatarSpeed: pick(o['avatarSpeed'], SPEEDS, DEFAULT_PREFERENCES.avatarSpeed),
    subtitles:
      typeof o['subtitles'] === 'boolean'
        ? o['subtitles']
        : DEFAULT_PREFERENCES.subtitles,
    language:
      typeof o['language'] === 'string' && o['language'].length >= 2
        ? o['language']
        : DEFAULT_PREFERENCES.language,
  }
}
