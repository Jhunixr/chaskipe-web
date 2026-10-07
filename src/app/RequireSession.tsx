import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'

import { ROUTES } from './routes'

/**
 * Deja pasar a quien tiene cuenta o entro como invitado. Quien no ha elegido
 * ninguna de las dos cosas va a iniciar sesion.
 *
 * Mientras se comprueba el token guardado no se decide nada: redirigir antes
 * de tiempo expulsaria a alguien con sesion valida en cada recarga.
 */
export function RequireSession() {
  const { isAuthenticated, mode, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="route-loading" role="status" aria-live="polite">
        <span className="route-loading__spinner" aria-hidden="true" />
        <span className="visually-hidden">Cargando</span>
      </div>
    )
  }

  if (!isAuthenticated && mode !== 'guest') {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
