import { describe, expect, it } from 'vitest'

import { appendPiece } from './conversation'

describe('appendPiece', () => {
  it('pega las letras del deletreo', () => {
    expect(appendPiece('HOL', 'A', 'letters')).toBe('HOLA')
  })

  it('separa las señas completas como palabras', () => {
    expect(appendPiece('', 'Hola', 'sign')).toBe('Hola ')
    expect(appendPiece('Hola ', 'Gracias', 'sign')).toBe('Hola Gracias ')
    expect(appendPiece('MARIA', 'Hola', 'sign')).toBe('MARIA Hola ')
  })
})
