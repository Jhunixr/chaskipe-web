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
  description?: string
  icon: IconName
  featured?: boolean
}

const OPTIONS: CommOption[] = [
  {
    to: ROUTES.cameraPreparation,
    title: 'Senas a texto',
    description: 'Interpreta Lengua de Senas Peruana.',
    icon: 'hands',
    featured: true,
  },
  {
    to: ROUTES.textToSign,
    title: 'Texto a senas',
    description: 'Responde mediante el avatar.',
    icon: 'keyboard',
    featured: true,
  },
  {
    to: ROUTES.conversation,
    title: 'Conversacion',
    description: 'Comunicacion bidireccional.',
    icon: 'chat',
  },
]

export function HomePage() {
  return (
    <div className="page home">
      <header className="home__top">
        <div className="home__user">
          <span className="home__avatar" aria-hidden="true">
            <Mascot size={40} alt="" />
          </span>
          <p className="home__greeting">
            Hola, <strong>{DEMO_USER.name}</strong>
          </p>
        </div>
        <button type="button" className="home__bell" aria-label="Notificaciones">
          <Icon name="bell" size={22} />
        </button>
      </header>

      <p className="home__question">¿Como deseas comunicarte?</p>

      <div className="home__options">
        {OPTIONS.map((option) => (
          <Link
            key={option.to}
            to={option.to}
            className={`home-option${option.featured ? ' home-option--featured' : ''}`}
          >
            <span className="home-option__icon" aria-hidden="true">
              <Icon name={option.icon} size={option.featured ? 26 : 22} />
            </span>
            <span className="home-option__body">
              <span className="home-option__title">{option.title}</span>
              {option.description && (
                <span className="home-option__description text-muted text-sm">
                  {option.description}
                </span>
              )}
            </span>
            <Icon name="chevron" size={20} className="home-option__chevron" />
          </Link>
        ))}
      </div>

      <Mountains />
    </div>
  )
}
