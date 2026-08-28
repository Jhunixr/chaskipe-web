import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Button } from '@/components/ui'

import './pages.css'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="page text-center">
      <h1>Pagina no encontrada</h1>
      <p className="text-muted">La ruta que buscas no existe.</p>
      <Button onClick={() => navigate(ROUTES.home)}>Ir al inicio</Button>
    </div>
  )
}
