import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ChaskiBubble } from '@/components/brand'
import { useAuth } from '@/hooks/useAuth'

import './SplashPage.css'
import './pages.css'

/**
 * Pantalla de carga inicial. Espera a que se compruebe la sesion guardada y
 * lleva a Inicio si ya hay una (cuenta o invitado); si no, a la bienvenida.
 */
export function SplashPage() {
  const navigate = useNavigate()
  const { isAuthenticated, mode, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const hasSession = isAuthenticated || mode === 'guest'
    const timer = window.setTimeout(() => {
      navigate(hasSession ? ROUTES.home : ROUTES.onboarding, { replace: true })
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [navigate, isAuthenticated, mode, loading])

  return (
    <div className="fullscreen splash">
      <div className="fullscreen__center">
        <ChaskiBubble size={210} />
        <p className="splash__wordmark">
          chaski<span>pe</span>
        </p>
        <div className="splash__loader" aria-label="Cargando" role="status">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
