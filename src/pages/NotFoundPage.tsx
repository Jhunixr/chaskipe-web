import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Mascot } from '@/components/brand'
import { Button } from '@/components/ui'

import './pages.css'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="fullscreen">
      <div className="fullscreen__center">
        <Mascot size={120} alt="" />
        <h1>Pagina no encontrada</h1>
        <p className="text-muted">La ruta que buscas no existe.</p>
        <Button size="lg" icon="home" onClick={() => navigate(ROUTES.home)}>
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}
