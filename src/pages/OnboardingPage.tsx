import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ChaskiBubble } from '@/components/brand'
import { Icon } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

import './OnboardingPage.css'
import './pages.css'

/**
 * Bienvenida. Una sola pregunta, con dos botones grandes: quien usa el
 * celular. Las dos opciones entran sin cuenta (modo invitado); la cuenta es
 * opcional y se crea despues desde Perfil.
 */
export function OnboardingPage() {
  const navigate = useNavigate()
  const { continueAsGuest } = useAuth()

  const enter = () => {
    // Entrar sin cuenta es entrar como invitado: hay que declararlo, no solo
    // navegar, o la app quedaria sin sesion.
    continueAsGuest()
    navigate(ROUTES.home)
  }

  return (
    <div className="onboarding">
      <section className="onboarding__hero">
        <span className="onboarding__ring onboarding__ring--a" aria-hidden="true" />
        <span className="onboarding__ring onboarding__ring--b" aria-hidden="true" />
        <ChaskiBubble size={256} />
        <h1 className="onboarding__wordmark">
          chaski<span>pe</span>
        </h1>
        <p className="onboarding__tagline">Comunicación sin barreras</p>
      </section>

      <section className="onboarding__sheet">
        <h2 className="onboarding__question">¿Cómo te comunicas?</h2>

        <button type="button" className="onboarding__choice onboarding__choice--red" onClick={enter}>
          <span className="onboarding__choice-icon">
            <Icon name="hands" size={30} />
          </span>
          <span className="onboarding__choice-text">
            <strong>Con señas</strong>
            <span>Soy una persona sorda</span>
          </span>
          <Icon name="chevron" size={26} />
        </button>

        <button type="button" className="onboarding__choice onboarding__choice--teal" onClick={enter}>
          <span className="onboarding__choice-icon">
            <Icon name="mic" size={28} />
          </span>
          <span className="onboarding__choice-text">
            <strong>Hablando</strong>
            <span>Soy una persona oyente</span>
          </span>
          <Icon name="chevron" size={26} />
        </button>

        <div className="onboarding__foot">
          <Link to={ROUTES.login} className="link">
            Ya tengo cuenta
          </Link>
          <p>Funciona sin cuenta · La cámara nunca graba</p>
        </div>
      </section>
    </div>
  )
}
