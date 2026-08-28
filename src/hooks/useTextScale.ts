import { useCallback, useEffect, useState } from 'react'

export type TextSize = 'normal' | 'grande' | 'muy-grande'

const SCALE: Record<TextSize, number> = {
  normal: 1,
  grande: 1.12,
  'muy-grande': 1.28,
}

const STORAGE_KEY = 'chaskipe:text-size'

function readStored(): TextSize {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'normal' || value === 'grande' || value === 'muy-grande') {
      return value
    }
  } catch {
    // localStorage no disponible: usar valor por defecto
  }
  return 'normal'
}

/**
 * Ajusta la escala tipografica global (variable CSS --text-scale) y la
 * recuerda en localStorage. Es una preferencia de accesibilidad que si
 * afecta a toda la app en la FASE 1.
 */
export function useTextScale() {
  const [size, setSize] = useState<TextSize>(readStored)

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(SCALE[size]))
    try {
      window.localStorage.setItem(STORAGE_KEY, size)
    } catch {
      // ignorar si no se puede persistir
    }
  }, [size])

  const increase = useCallback(() => {
    setSize((current) =>
      current === 'normal' ? 'grande' : current === 'grande' ? 'muy-grande' : current,
    )
  }, [])

  const decrease = useCallback(() => {
    setSize((current) =>
      current === 'muy-grande' ? 'grande' : current === 'grande' ? 'normal' : current,
    )
  }, [])

  return { size, setSize, increase, decrease }
}
