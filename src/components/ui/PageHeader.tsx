import { useNavigate } from 'react-router-dom'

import { Icon } from './Icon'

import './PageHeader.css'

interface PageHeaderProps {
  title: string
  /** Muestra el boton de retroceso. Por defecto true. */
  showBack?: boolean | undefined
  /** Contenido opcional a la derecha (ej. boton de notificaciones). */
  action?: React.ReactNode
}

/** Cabecera compacta tipo app movil: atras + titulo centrado. */
export function PageHeader({ title, showBack = true, action }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className={`page-header${showBack ? '' : ' page-header--root'}`}>
      <div className="page-header__slot">
        {showBack && (
          <button
            type="button"
            className="page-header__icon-btn"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <Icon name="back" size={22} />
          </button>
        )}
      </div>
      <h1 className="page-header__title">{title}</h1>
      <div className="page-header__slot page-header__slot--end">{action}</div>
    </header>
  )
}
