import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ChaskiFigure, Hills } from '@/components/brand'
import { Icon } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useSpeech } from '@/hooks/useSpeech'
import { letterOfTheDay } from '@/services/learning'

import './HomePage.css'
import './pages.css'

/** Frases que la persona sorda suele necesitar al momento: se leen en voz alta. */
const QUICK = ['Hola', 'Gracias', 'No entiendo', 'Más despacio, por favor']

export function HomePage() {
  // El nombre sale de la sesion, no de una constante: asi Inicio y Perfil
  // muestran siempre lo mismo.
  const { user } = useAuth()
  const firstName = user ? (user.name.split(' ')[0] ?? user.name) : null
  const { speak, supported } = useSpeech()
  const letter = letterOfTheDay()

  return (
    <div className="page home">
      <header className="home__top">
        <p className="home__wordmark wordmark">
          chaski<em>pe</em>
        </p>
        <Link
          to={ROUTES.quickPhrases}
          state={{ category: 'emergencias' }}
          className="home__sos"
          aria-label="Emergencia: frases para pedir ayuda"
        >
          <Icon name="siren" size={20} />
          SOS
        </Link>
      </header>

      <section className="home__greeting" aria-label="Saludo">
        <ChaskiFigure width={104} className="home__chaski" />
        <p className="home__bubble">
          {firstName ? `¡Hola, ${firstName}!` : '¡Hola!'} ¿Cómo quieres conversar hoy?
        </p>
      </section>

      <Link to={ROUTES.faceToFace} className="home__hero">
        <Hills />
        <span className="home__phone" aria-hidden="true">
          <span className="home__phone-top">Aa</span>
          <span className="home__phone-bottom">
            <Icon name="hands" size={26} />
          </span>
        </span>
        <span className="home__pill">
          <Icon name="users" size={16} />
          Para dos personas
        </span>
        <span className="home__hero-text">
          <span className="home__hero-title">Cara a cara</span>
          <span className="home__hero-sub">Pon el celular en la mesa, entre los dos</span>
        </span>
      </Link>

      <div className="home__tiles">
        <Link to={ROUTES.cameraPreparation} className="tile home__tile">
          <span className="icon-badge icon-badge--red">
            <Icon name="camera" size={26} />
          </span>
          <span className="home__tile-title">Hago señas</span>
        </Link>
        <Link to={ROUTES.textToSign} className="tile home__tile">
          <span className="icon-badge icon-badge--teal">
            <Icon name="mic" size={26} />
          </span>
          <span className="home__tile-title">Hablo o escribo</span>
        </Link>
      </div>

      <Link to={ROUTES.learn} className="home__learn">
        <span className="home__learn-letter" aria-hidden="true">
          {letter}
        </span>
        <span className="home__learn-text">
          <strong>Letra del día: {letter}</strong>
          <span>Aprende a deletrear en LSP</span>
        </span>
        <Icon name="chevron" size={24} />
      </Link>

      <div className="chip-row" aria-label="Frases rápidas">
        {QUICK.map((text) => (
          <button
            key={text}
            type="button"
            className="chip"
            onClick={() => speak(text)}
            disabled={!supported}
          >
            <Icon name="volume" size={18} />
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}
