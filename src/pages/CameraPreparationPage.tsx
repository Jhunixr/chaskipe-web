import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { CameraPlaceholder } from '@/components/camera/CameraPlaceholder'
import { Button, Card, Icon, type IconName, PageHeader } from '@/components/ui'

import './pages.css'

interface Recommendation {
  text: string
  icon: IconName
}

const RECOMMENDATIONS: Recommendation[] = [
  { text: 'Buena iluminacion', icon: 'sun' },
  { text: 'Muestra ambas manos', icon: 'hands' },
  { text: 'Manten el rostro visible', icon: 'user' },
]

export function CameraPreparationPage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <PageHeader title="Antes de comenzar" />

      <CameraPlaceholder />

      <Card>
        <ul className="recommendation-list">
          {RECOMMENDATIONS.map((item) => (
            <li key={item.text} className="recommendation-list__item">
              <span className="recommendation-list__check">
                <Icon name="check" size={16} />
              </span>
              <span className="recommendation-list__text">{item.text}</span>
              <Icon
                name={item.icon}
                size={20}
                className="recommendation-list__aside"
              />
            </li>
          ))}
        </ul>
      </Card>

      <p className="demo-note">
        La camara todavia no esta activa en esta version. Esta pantalla solo
        muestra la preparacion.
      </p>

      <div className="stack-sm">
        <Button
          size="lg"
          fullWidth
          icon="camera"
          onClick={() => navigate(ROUTES.signToText)}
        >
          Abrir camara
        </Button>
        <Button
          variant="secondary"
          fullWidth
          icon="play"
          onClick={() => navigate(ROUTES.help)}
        >
          Ver tutorial
        </Button>
      </div>
    </div>
  )
}
