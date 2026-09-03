import { createContext } from 'react'

import type { Preferences } from '@/types/preferences'

export type SaveState = 'idle' | 'saving' | 'saved' | 'local'

export interface PreferencesContextValue {
  prefs: Preferences
  /** Aplica un cambio al instante (y lo guarda en localStorage). */
  set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  /** Envia las preferencias al backend. */
  save: () => Promise<void>
  saveState: SaveState
  /** true si hay cambios sin enviar al servidor. */
  dirty: boolean
}

/**
 * Contexto de preferencias. Vive en su propio modulo para que el archivo del
 * provider exporte solo componentes (fast refresh).
 */
export const PreferencesContext = createContext<PreferencesContextValue | null>(
  null,
)
