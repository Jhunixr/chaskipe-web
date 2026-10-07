/**
 * Deletreo con el alfabeto manual de la LSP.
 *
 * Las formas de la mano salen de `lspAlphabet.json`: para cada letra, una
 * imagen REAL del dataset publico "Static Hand Gestures of the Peruvian Sign
 * Language Alphabet" (la mas tipica de su letra, ver
 * `ai/scripts/export_avatar_alphabet.py`). No hay poses inventadas.
 *
 * Solo las 24 letras estaticas tienen forma: J, N con tilde y Z llevan
 * movimiento y aun no hay datos; se muestran escritas.
 */
import alphabet from './lspAlphabet.json'

export type Vec3 = [number, number, number]

interface AlphabetJson {
  letters: Record<string, { source: string; points: Vec3[] }>
}

/**
 * Coordenadas de la foto (x derecha, y abajo, z alejandose) a Three.js
 * (y arriba, z hacia la camara). Asi quien mira al avatar ve la mano igual que
 * en la foto del dataset.
 */
const toThree = ([x, y, z]: Vec3): Vec3 => [x, -y, -z]

export const LETTER_POSES: Record<string, Vec3[]> = Object.fromEntries(
  Object.entries((alphabet as unknown as AlphabetJson).letters).map(([letter, entry]) => [
    letter,
    entry.points.map(toThree),
  ]),
)

/**
 * Sena completa grabada con `/dev/dataset` y convertida con
 * `ai/scripts/export_avatar_sign.py`: forma de la mano y desplazamiento de la
 * muneca (en "manos", Three.js) cuadro a cuadro.
 */
export interface SignClip {
  label: string
  word: string
  durationMs: number
  validated: boolean
  frames: { t: number; pose: Vec3[]; wrist: Vec3 }[]
}

const clipModules = import.meta.glob<SignClip>('./signs/*.json', {
  eager: true,
  import: 'default',
})

/** Quita tildes (salvo la enye) y pasa a mayusculas. */
function normalizeText(text: string): string {
  return text
    .toUpperCase()
    .normalize('NFD')
    .replace(/N\u0303/g, '\u00d1')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Senas grabadas, por palabra normalizada (HOLA, GRACIAS...). */
export const SIGN_CLIPS: Record<string, SignClip> = Object.fromEntries(
  Object.values(clipModules).flatMap((clip) => [
    [normalizeText(clip.word).replace(/[^A-Z0-9Ñ]/g, ''), clip],
    [clip.label, clip],
  ]),
)

export type SpellToken =
  | { kind: 'letter'; char: string; pose: Vec3[] | null }
  | { kind: 'sign'; char: string; clip: SignClip }
  | { kind: 'space'; char: ' ' }

/**
 * Texto -> secuencia de letras. Se quitan tildes (salvo la enye), signos y
 * numeros quedan como letras sin forma (se muestran escritas).
 */
export function textToSpelling(text: string): SpellToken[] {
  const tokens: SpellToken[] = []
  const words = normalizeText(text).split(/\s+/).filter(Boolean)
  for (const raw of words) {
    if (tokens.length > 0) tokens.push({ kind: 'space', char: ' ' })
    const word = raw.replace(/[^A-Z0-9Ñ]/g, '')
    if (!word) {
      tokens.pop()
      continue
    }
    // Palabra con sena grabada: se hace la sena completa, no se deletrea.
    const clip = SIGN_CLIPS[word]
    if (clip) {
      tokens.push({ kind: 'sign', char: clip.word, clip })
      continue
    }
    for (const char of word) {
      tokens.push({ kind: 'letter', char, pose: LETTER_POSES[char] ?? null })
    }
  }
  return tokens
}

/** Letras del abecedario LSP que el avatar sabe formar. */
export const SPELLABLE_LETTERS = Object.keys(LETTER_POSES).sort()
