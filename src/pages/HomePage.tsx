import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ChaskiFigure, Hills } from '@/components/brand'
import { Icon } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

import './HomePage.css'
import './pages.css'

/**
 * Inicio para la persona oyente: una sola accion principal, hablar con una
 * persona sorda (la camara lee sus señas y Chaski responde en LSP).
 */
export function HomePage() {
  // El nombre sale de la sesion, no de una constante: asi Inicio y Perfil
  // muestran siempre lo mismo.
  const { user } = useAuth()
  const firstName = user ? (user.name.split(' ')[0] ?? user.name) : null

  return (
    <div className="page home">
      <header className="home__top">
        <p className="home__wordmark wordmark">
          chaski<em>pe</em>
        </p>
      </header>

      <section className="home__greeting" aria-label="Saludo">
        <ChaskiFigure width={96} className="home__chaski" />
        <p className="home__bubble">
          {firstName ? `¡Hola, ${firstName}! ` : ''}Te ayudo a hablar con personas sordas
        </p>
      </section>

      <Link to={ROUTES.converse} className="home__hero">
        <Hills sun />
        <span className="home__hero-icons" aria-hidden="true">
          <span className="home__hero-icon home__hero-icon--red">
            <Icon name="hands" size={34} />
          </span>
          <span className="home__hero-icon home__hero-icon--teal">
            <Icon name="mic" size={32} />
          </span>
        </span>
        <span className="home__hero-title">Hablar con una persona sorda</span>
        <span className="home__hero-sub">Ella hace señas · tú hablas · Chaski responde en señas</span>
        <span className="home__hero-cta">
          Empezar
          <Icon name="chevron" size={22} />
        </span>
      </Link>

      <div className="home__tiles">
        <Link to={ROUTES.tableMode} className="tile home__tile">
          <span className="icon-badge icon-badge--teal">
            <Icon name="phrases" size={26} />
          </span>
          <span className="home__tile-title">Modo mesa</span>
          <span className="home__tile-sub">Celular parado frente a ella</span>
        </Link>
        <Link to={ROUTES.learn} className="tile home__tile">
          <span className="icon-badge icon-badge--gold">
            <Icon name="cap" size={26} />
          </span>
          <span className="home__tile-title">Aprender LSP</span>
          <span className="home__tile-sub">El abecedario con Chaski</span>
        </Link>
      </div>

      <Link to={ROUTES.quickPhrases} className="home__phrases">
        <Icon name="grid" size={20} />
        Frases listas para mostrar en señas
        <Icon name="chevron" size={20} />
      </Link>
    </div>
  )
}
