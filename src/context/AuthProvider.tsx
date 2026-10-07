import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  fetchMe,
  isAuthError,
  login as apiLogin,
  register as apiRegister,
  setAccessToken,
  setUnauthorizedHandler,
} from '@/services/api'
import type { AuthUser, SessionMode } from '@/types/auth'

import { AuthContext } from './authContext'

const TOKEN_KEY = 'chaskipe:token'
const MODE_KEY = 'chaskipe:session-mode'

function readToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function storeToken(token: string | null): void {
  try {
    if (token === null) window.localStorage.removeItem(TOKEN_KEY)
    else window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // localStorage no disponible: la sesion dura lo que la pestana
  }
}

function readMode(): SessionMode {
  try {
    return window.localStorage.getItem(MODE_KEY) === 'guest' ? 'guest' : 'user'
  } catch {
    return 'user'
  }
}

function storeMode(mode: SessionMode): void {
  try {
    window.localStorage.setItem(MODE_KEY, mode)
  } catch {
    // ignorar
  }
}

/**
 * Sesion de la app.
 *
 * El token se guarda en localStorage y se restaura al arrancar, comprobandolo
 * contra `/auth/me`: si el backend lo rechaza (caducado, secreto rotado,
 * cuenta borrada) la sesion se limpia en vez de quedar en un estado a medias.
 *
 * "Invitado" es un modo explicito: sin cuenta y sin datos en el servidor.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [mode, setMode] = useState<SessionMode>(readMode)
  // Solo hay algo que comprobar si habia un token guardado; sin el, la sesion
  // ya esta resuelta en el primer render.
  const [storedToken] = useState(readToken)
  const [loading, setLoading] = useState(() => storedToken !== null)

  const signOut = useCallback(() => {
    setAccessToken(null)
    storeToken(null)
    setUser(null)
    setMode('user')
    storeMode('user')
  }, [])

  // Si cualquier llamada recibe un 401, la sesion dejo de valer.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null)
      storeToken(null)
      setUser(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // Al arrancar: restaurar el token y validarlo contra el backend.
  useEffect(() => {
    if (storedToken === null) return
    setAccessToken(storedToken)
    let cancelled = false
    void fetchMe().then((me) => {
      if (cancelled) return
      if (me === null) {
        // Token invalido: limpiar en vez de dejar una sesion fantasma.
        setAccessToken(null)
        storeToken(null)
      } else {
        setUser(me)
        setMode('user')
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [storedToken])

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email: email.trim(), password })
    if (isAuthError(res)) return res.message
    setAccessToken(res.token)
    storeToken(res.token)
    setUser(res.user)
    setMode('user')
    storeMode('user')
    return null
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiRegister({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      if (isAuthError(res)) return res.message
      setAccessToken(res.token)
      storeToken(res.token)
      setUser(res.user)
      setMode('user')
      storeMode('user')
      return null
    },
    [],
  )

  const continueAsGuest = useCallback(() => {
    setAccessToken(null)
    storeToken(null)
    setUser(null)
    setMode('guest')
    storeMode('guest')
  }, [])

  const updateUser = useCallback((patch: { name?: string; email?: string }) => {
    setUser((current) => (current === null ? current : { ...current, ...patch }))
  }, [])

  const value = useMemo(
    () => ({
      user,
      mode,
      loading,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      continueAsGuest,
      signOut,
      updateUser,
    }),
    [user, mode, loading, signIn, signUp, continueAsGuest, signOut, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
