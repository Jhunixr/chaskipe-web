import { createContext } from 'react'

import type { AuthUser, SessionMode } from '@/types/auth'

export interface AuthContextValue {
  /** Usuario con cuenta, o null si es invitado / sin sesion. */
  user: AuthUser | null
  mode: SessionMode
  /** true mientras se comprueba el token guardado al arrancar. */
  loading: boolean
  /** Atajo: hay cuenta con sesion iniciada. */
  isAuthenticated: boolean
  /** Inicia sesion. Devuelve null si fue bien, o el mensaje de error. */
  signIn: (email: string, password: string) => Promise<string | null>
  /** Crea una cuenta. Devuelve null si fue bien, o el mensaje de error. */
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>
  /** Entra sin cuenta. */
  continueAsGuest: () => void
  signOut: () => void
  /** Refleja en la sesion un perfil editado desde otra pantalla. */
  updateUser: (patch: { name?: string; email?: string }) => void
}

/**
 * Contexto de sesion. Vive en su propio modulo para que el archivo del
 * provider exporte solo componentes (fast refresh).
 */
export const AuthContext = createContext<AuthContextValue | null>(null)
