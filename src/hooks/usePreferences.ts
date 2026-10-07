import { useContext } from 'react'

import {
  PreferencesContext,
  type PreferencesContextValue,
} from '@/context/preferencesContext'

/**
 * Preferencias de accesibilidad de la app. Requiere `PreferencesProvider`
 * (montado en `App`).
 */
export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (ctx === null) {
    throw new Error('usePreferences requiere <PreferencesProvider>')
  }
  return ctx
}
