import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Logo, Mountains } from '@/components/brand'

import './SplashPage.css'
import './pages.css'

/** Pantalla de carga inicial. Avanza a la bienvenida tras un breve momento. */
export function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate(ROUTES.onboarding, { replace: true })
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <div className="fullscreen splash">
      <div className="fullscreen__center">
        <Logo layout="stack" tagline mascotSize={132} />
        <div className="splash__loader" aria-label="Cargando" role="status">
          <span />
          <span />
          <span />
        </div>
      </div>
      <Mountains />
    </div>
  )
}
