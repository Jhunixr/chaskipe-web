import { describe, expect, it } from 'vitest'

import { groupApiPhrases } from './api'

describe('groupApiPhrases', () => {
  it('adapta y agrupa la respuesta del backend Java', () => {
    const groups = groupApiPhrases([
      { fraseFrecuenteId: 1, texto: 'Hola', categoria: 'saludos', ordenUso: 1 },
      { fraseFrecuenteId: 2, texto: 'Gracias', categoria: 'saludos', ordenUso: 2 },
      { fraseFrecuenteId: 3, texto: 'Necesito ayuda', categoria: 'necesidades', ordenUso: 1 },
    ])

    expect(groups).toEqual([
      {
        category: 'saludos',
        label: 'Saludos',
        phrases: [
          { id: '1', text: 'Hola', category: 'saludos', isDemo: true },
          { id: '2', text: 'Gracias', category: 'saludos', isDemo: true },
        ],
      },
      {
        category: 'necesidades',
        label: 'Necesidades',
        phrases: [
          { id: '3', text: 'Necesito ayuda', category: 'necesidades', isDemo: true },
        ],
      },
    ])
  })

  it('ubica categorías desconocidas en necesidades', () => {
    const groups = groupApiPhrases([
      { fraseFrecuenteId: 9, texto: 'Texto', categoria: 'otra', ordenUso: 1 },
    ])

    expect(groups[0]?.category).toBe('necesidades')
  })
})
