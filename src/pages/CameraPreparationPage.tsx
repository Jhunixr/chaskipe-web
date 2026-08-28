import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Button, Card, PageHeader } from '@/components/ui'

import './pages.css'

const RECOMMENDATIONS = [
  'Buena iluminacion',
  'Muestra ambas manos',
  'Manten el rostro visible',
]

export function CameraPreparationPage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <PageHeader
        title="Antes de comenzar"
        subtitle="Prepara el entorno para un mejor reconocimiento."
      />

      <Card>
        <ul className="recommendation-list">
          {RECOMMENDATIONS.map((item, index) => (
            <li key={item} className="recommendation-list__item">
              <span className="recommendation-list__marker">{index + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <p className="demo-note">
        La camara todavia no esta activa en esta version. Esta pantalla solo
        muestra la preparacion.
      </p>

      <div className="stack-sm">
        <Button fullWidth onClick={() => navigate(ROUTES.signToText)}>
          Abrir camara
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate(ROUTES.help)}>
          Ver tutorial
        </Button>
      </div>
    </div>
  )
}
