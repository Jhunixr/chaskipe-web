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

export type SpellToken =
  | { kind: 'letter'; char: string; pose: Vec3[] | null }
  | { kind: 'space'; char: ' ' }

/**
 * Texto -> secuencia de letras. Se quitan tildes (salvo la enye), signos y
 * numeros quedan como letras sin forma (se muestran escritas).
 */
export function textToSpelling(text: string): SpellToken[] {
  const tokens: SpellToken[] = []
  // NFD separa la tilde de la letra; la enye (N + tilde combinada) se
  // recompone antes de quitar el resto de tildes.
  const clean = text
    .toUpperCase()
    .normalize('NFD')
    .replace(/N\u0303/g, '\u00d1')
    .replace(/[\u0300-\u036f]/g, '')
  for (const char of clean) {
    if (/\s/.test(char)) {
      if (tokens.length > 0 && tokens[tokens.length - 1]!.kind !== 'space') {
        tokens.push({ kind: 'space', char: ' ' })
      }
      continue
    }
    if (!/[A-ZÑ0-9]/.test(char)) continue
    tokens.push({ kind: 'letter', char, pose: LETTER_POSES[char] ?? null })
  }
  while (tokens.length > 0 && tokens[tokens.length - 1]!.kind === 'space') tokens.pop()
  return tokens
}

/** Letras del abecedario LSP que el avatar sabe formar. */
export const SPELLABLE_LETTERS = Object.keys(LETTER_POSES).sort()
