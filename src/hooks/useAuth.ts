import { useContext } from 'react'

import { AuthContext, type AuthContextValue } from '@/context/authContext'

/** Sesion de la app. Requiere `AuthProvider` (montado en `App`). */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth requiere <AuthProvider>')
  }
  return ctx
}
