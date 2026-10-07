/**
 * Progreso de "Aprende LSP" (abecedario manual).
 *
 * Todo vive en este dispositivo (localStorage): que letras ya se hicieron
 * bien con la camara y que dias se practico (para la racha).
 */

/** Abecedario manual de la LSP, en orden. */
export const LSP_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
] as const

/**
 * Letras con movimiento: el modelo actual solo reconoce formas quietas, asi
 * que estas aun no se pueden practicar con la camara.
 */
export const MOVING_LETTERS = new Set(['J', 'Ñ', 'Z'])

/** Letras que se pueden practicar con la camara. */
export const PRACTICE_LETTERS = LSP_ALPHABET.filter((l) => !MOVING_LETTERS.has(l))

const KEY = 'chaskipe.learning'

interface LearningState {
  learned: string[]
  /** Dias con practica, en formato AAAA-MM-DD (hora local). */
  days: string[]
}

function read(): LearningState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { learned: [], days: [] }
    const data = JSON.parse(raw) as Partial<LearningState>
    return {
      learned: Array.isArray(data.learned) ? data.learned.filter((l) => typeof l === 'string') : [],
      days: Array.isArray(data.days) ? data.days.filter((d) => typeof d === 'string') : [],
    }
  } catch {
    return { learned: [], days: [] }
  }
}

function write(state: LearningState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Sin almacenamiento (modo privado): el progreso no se guarda.
  }
}

export function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

export function getLearned(): Set<string> {
  return new Set(read().learned)
}

/** Guarda la letra como aprendida y cuenta el dia de hoy para la racha. */
export function markLearned(letter: string, now = new Date()): void {
  const state = read()
  if (!state.learned.includes(letter)) state.learned.push(letter)
  const today = dayKey(now)
  if (!state.days.includes(today)) state.days.push(today)
  write(state)
}

/** Dias seguidos con practica, contando hasta hoy (o hasta ayer si hoy aun no). */
export function streakDays(days: Iterable<string> = read().days, now = new Date()): number {
  const set = new Set(days)
  const cursor = new Date(now)
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let count = 0
  while (set.has(dayKey(cursor))) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
}

export function getStreak(now = new Date()): number {
  return streakDays(read().days, now)
}

/**
 * Letra del dia: la siguiente letra practicable que aun no se aprendio,
 * empezando por una distinta cada dia. Si ya se aprendieron todas, rota.
 */
export function letterOfTheDay(
  now = new Date(),
  learned: Set<string> = getLearned(),
): string {
  const start = Math.floor(now.getTime() / 86_400_000) % PRACTICE_LETTERS.length
  for (let i = 0; i < PRACTICE_LETTERS.length; i += 1) {
    const letter = PRACTICE_LETTERS[(start + i) % PRACTICE_LETTERS.length]!
    if (!learned.has(letter)) return letter
  }
  return PRACTICE_LETTERS[start]!
}
