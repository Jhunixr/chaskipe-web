import { describe, expect, it } from 'vitest'

import { SIGN_CLIPS, SPELLABLE_LETTERS, textToSpelling } from './fingerspelling'

describe('textToSpelling', () => {
  it('quita tildes, conserva la enye y separa palabras', () => {
    const tokens = textToSpelling('  Árbol  niño! ')
    expect(tokens.map((t) => t.char).join('')).toBe('ARBOL NIÑO')
  })

  it('solo las 24 letras estaticas tienen forma de mano', () => {
    expect(SPELLABLE_LETTERS).toHaveLength(24)
    const tokens = textToSpelling('jaz ñ')
    const posed = tokens.filter((t) => t.kind === 'letter' && t.pose !== null).map((t) => t.char)
    expect(posed).toEqual(['A'])
  })

  it('cada forma tiene 21 puntos con la muneca en el origen', () => {
    const [token] = textToSpelling('B')
    expect(token?.kind).toBe('letter')
    if (token?.kind !== 'letter' || !token.pose) throw new Error('sin pose')
    expect(token.pose).toHaveLength(21)
    expect(token.pose[0]).toEqual([0, -0, -0])
  })
})

describe('senas grabadas', () => {
  it('una palabra con sena grabada no se deletrea', () => {
    const clip = SIGN_CLIPS.HOLA
    if (!clip) return // sin grabacion de HOLA en signs/
    const tokens = textToSpelling('Hola amigo')
    expect(tokens[0]).toMatchObject({ kind: 'sign', char: clip.word })
    expect(tokens.slice(2).map((t) => t.char).join('')).toBe('AMIGO')
  })
})
