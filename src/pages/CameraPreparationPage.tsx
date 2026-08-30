import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { CameraView } from '@/components/camera'
import { Button, Card, Icon, type IconName, PageHeader } from '@/components/ui'
import { useCamera } from '@/hooks/useCamera'

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

/**
 * FASE 2: permite probar la camara real antes de empezar.
 * Sin MediaPipe ni deteccion todavia.
 */
export function CameraPreparationPage() {
  const navigate = useNavigate()
  const camera = useCamera('user')

  return (
    <div className="page">
      <PageHeader title="Antes de comenzar" />

      <CameraView
        status={camera.status}
        errorMessage={camera.errorMessage}
        facing={camera.facing}
        canSwitch={camera.canSwitch}
        videoRef={camera.videoRef}
        onStart={camera.start}
        onRetry={camera.start}
        onToggleFacing={camera.toggleFacing}
      />

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
        La camara ya funciona, pero el reconocimiento de senas (MediaPipe e IA)
        se agrega en fases posteriores.
      </p>

      <div className="stack-sm">
        <Button
          size="lg"
          fullWidth
          icon="camera"
          onClick={() => {
            camera.stop()
            navigate(ROUTES.signToText)
          }}
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
