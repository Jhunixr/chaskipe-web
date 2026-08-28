import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { DEMO_USER } from '@/services/mockData'

import './HomePage.css'
import './pages.css'

interface CommOption {
  to: string
  title: string
  description: string
  icon: string
}

const OPTIONS: CommOption[] = [
  {
    to: ROUTES.cameraPreparation,
    title: 'Senas a texto',
    description: 'Interpreta Lengua de Senas Peruana.',
    icon: '✋',
  },
  {
    to: ROUTES.textToSign,
    title: 'Texto a senas',
    description: 'Responde mediante el avatar.',
    icon: '⌨',
  },
  {
    to: ROUTES.conversation,
    title: 'Conversacion',
    description: 'Comunicacion bidireccional.',
    icon: '⇄',
  },
]

export function HomePage() {
  return (
    <div className="page home">
      <header className="home__brand">
        <span className="home__logo" aria-hidden="true">
          CH
        </span>
        <span className="home__name">Chaski Pe</span>
      </header>

      <div className="home__greeting">
        <h1>Hola, {DEMO_USER.name}</h1>
        <p className="text-muted">¿Como deseas comunicarte?</p>
      </div>

      <div className="home__options">
        {OPTIONS.map((option) => (
          <Link key={option.to} to={option.to} className="home-option">
            <span className="home-option__icon" aria-hidden="true">
              {option.icon}
            </span>
            <span className="home-option__body">
              <span className="home-option__title">{option.title}</span>
              <span className="home-option__description text-muted text-sm">
                {option.description}
              </span>
            </span>
            <span className="home-option__chevron" aria-hidden="true">
              ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
