/** Sesion de la persona usuaria. Espejo de `backend/app/schemas/auth.py`. */

export interface AuthUser {
  id: number
  name: string
  email: string
}

/**
 * Modo de la sesion:
 * - `guest`  entro como invitado: sin cuenta, sin datos en el servidor
 * - `user`   tiene cuenta y token valido
 */
export type SessionMode = 'guest' | 'user'

export interface AuthError {
  /** Mensaje listo para mostrar. */
  message: string
  /** Codigo HTTP, util para distinguir 409 (correo en uso) de 401. */
  status?: number
}
