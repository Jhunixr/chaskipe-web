import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Mascot, Mountains } from '@/components/brand'
import { Icon, type IconName } from '@/components/ui'
import { DEMO_USER } from '@/services/mockData'

import './HomePage.css'
import './pages.css'

interface CommOption {
  to: string
  title: string
  description: string
  icon: IconName
  featured?: boolean
}

const OPTIONS: CommOption[] = [
  {
    to: ROUTES.cameraPreparation,
    title: 'Senas a texto',
    description: 'Interpreta Lengua de Senas Peruana con la camara.',
    icon: 'hands',
    featured: true,
  },
  {
    to: ROUTES.textToSign,
    title: 'Texto a senas',
    description: 'Responde con el avatar y con voz.',
    icon: 'keyboard',
    featured: true,
  },
  {
    to: ROUTES.conversation,
    title: 'Conversacion',
    description: 'Ida y vuelta en la misma pantalla.',
    icon: 'chat',
  },
]

export function HomePage() {
  const firstName = DEMO_USER.name.split(' ')[0] ?? DEMO_USER.name

  return (
    <div className="page home">
      <header className="home__top">
        <div className="home__user">
          <span className="home__avatar" aria-hidden="true">
            <Mascot size={40} alt="" />
          </span>
          <span className="home__hello">
            <span className="section-title">Bienvenido de vuelta</span>
            <p className="home__greeting">{firstName}</p>
          </span>
        </div>
        <button type="button" className="home__bell" aria-label="Notificaciones">
          <Icon name="bell" size={20} />
        </button>
      </header>

      <div className="home__lead">
        <h1 className="home__question wordmark">
          ¿Como deseas <em>comunicarte</em> hoy?
        </h1>
        <span className="andean-rule" aria-hidden="true">
          <span className="andean-rule__diamond" />
        </span>
      </div>

      <div className="home__options">
        {OPTIONS.map((option, index) => (
          <Link
            key={option.to}
            to={option.to}
            className={`home-option${option.featured ? ' home-option--featured' : ''}`}
          >
            <span className="home-option__index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="home-option__icon" aria-hidden="true">
              <Icon name={option.icon} size={option.featured ? 24 : 20} />
            </span>
            <span className="home-option__body">
              <span className="home-option__title">{option.title}</span>
              <span className="home-option__description text-sm text-muted">
                {option.description}
              </span>
            </span>
            <Icon name="chevron" size={20} className="home-option__chevron" />
          </Link>
        ))}
      </div>

      <Link to={ROUTES.quickPhrases} className="home__phrases">
        <Icon name="chat" size={18} />
        <span>Frases rapidas para empezar</span>
        <Icon name="chevron" size={18} />
      </Link>

      <Mountains />
    </div>
  )
}
