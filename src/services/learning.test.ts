import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  LSP_ALPHABET,
  PRACTICE_LETTERS,
  getLearned,
  letterOfTheDay,
  markLearned,
  streakDays,
} from './learning'

// Las pruebas corren en Node: un localStorage en memoria basta.
function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  }
}

describe('learning', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: memoryStorage() })
  })

  it('tiene 27 letras y 24 practicables con la camara', () => {
    expect(LSP_ALPHABET).toHaveLength(27)
    expect(PRACTICE_LETTERS).toHaveLength(24)
    expect(PRACTICE_LETTERS).not.toContain('Ñ')
  })

  it('guarda las letras aprendidas sin duplicar', () => {
    markLearned('A')
    markLearned('A')
    markLearned('L')
    expect([...getLearned()].sort()).toEqual(['A', 'L'])
  })

  it('cuenta la racha de dias seguidos', () => {
    const now = new Date(2026, 9, 7)
    expect(streakDays(['2026-10-05', '2026-10-06', '2026-10-07'], now)).toBe(3)
    // Hoy aun sin practicar: la racha de ayer sigue viva.
    expect(streakDays(['2026-10-05', '2026-10-06'], now)).toBe(2)
    expect(streakDays(['2026-10-04'], now)).toBe(0)
  })

  it('la letra del dia salta las ya aprendidas', () => {
    const now = new Date(2026, 9, 7)
    const first = letterOfTheDay(now, new Set())
    expect(PRACTICE_LETTERS).toContain(first)
    expect(letterOfTheDay(now, new Set([first]))).not.toBe(first)
  })
})
