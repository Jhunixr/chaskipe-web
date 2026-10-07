import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ChaskiBubble } from '@/components/brand'
import { Icon } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

import './OnboardingPage.css'
import './pages.css'

/**
 * Bienvenida. Explica en tres pasos para que sirve la app (la usa la persona
 * oyente para hablar con una persona sorda) y entra sin cuenta (modo
 * invitado); la cuenta es opcional y se crea despues desde Perfil.
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
        <h2 className="onboarding__question">Habla con personas sordas</h2>

        <ul className="onboarding__steps">
          <li>
            <span className="onboarding__step-icon onboarding__step-icon--red">
              <Icon name="camera" size={24} />
            </span>
            La cámara entiende sus señas
          </li>
          <li>
            <span className="onboarding__step-icon onboarding__step-icon--teal">
              <Icon name="mic" size={24} />
            </span>
            Tú hablas o escribes
          </li>
          <li>
            <span className="onboarding__step-icon onboarding__step-icon--gold">
              <Icon name="hands" size={24} />
            </span>
            Chaski le responde en señas
          </li>
        </ul>

        <button type="button" className="onboarding__choice onboarding__choice--red" onClick={enter}>
          <span className="onboarding__choice-text">
            <strong>Empezar</strong>
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
