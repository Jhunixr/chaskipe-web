import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Mascot, Mountains } from '@/components/brand'
import { Button, Icon } from '@/components/ui'

import './OnboardingPage.css'
import './pages.css'

const HIGHLIGHTS = [
  {
    icon: 'hands' as const,
    title: 'Senas a texto y voz',
    description: 'Convierte tus senas en texto y voz al instante.',
    tone: 'primary' as const,
  },
  {
    icon: 'user' as const,
    title: 'Texto a senas con avatar',
    description: 'Convierte cualquier mensaje en senas con un avatar.',
    tone: 'success' as const,
  },
]

export function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <div className="fullscreen onboarding">
      <div className="onboarding__body">
        <h1 className="onboarding__title wordmark">
          Comunicate <em>sin barreras</em>
        </h1>

        <div className="onboarding__art">
          <Mascot size={168} alt="" />
        </div>

        <ul className="onboarding__highlights">
          {HIGHLIGHTS.map((item) => (
            <li key={item.title} className="onboarding__highlight">
              <span
                className={`onboarding__highlight-icon onboarding__highlight-icon--${item.tone}`}
              >
                <Icon name={item.icon} size={20} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <span className="text-muted text-sm">{item.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="onboarding__actions">
        <Button
          size="lg"
          fullWidth
          onClick={() => navigate(ROUTES.login)}
        >
          Comenzar
        </Button>
        <Link to={ROUTES.home} className="link onboarding__skip">
          Omitir
        </Link>
      </div>

      <Mountains />
    </div>
  )
}
