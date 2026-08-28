import { useNavigate } from 'react-router-dom'

import './PageHeader.css'

interface PageHeaderProps {
  title: string
  subtitle?: string | undefined
  /** Muestra el boton de retroceso. Por defecto true. */
  showBack?: boolean | undefined
}

export function PageHeader({ title, subtitle, showBack = true }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="page-header">
      {showBack && (
        <button
          type="button"
          className="page-header__back"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <span aria-hidden="true">&#8592;</span>
        </button>
      )}
      <div className="page-header__text">
        <h1>{title}</h1>
        {subtitle && <p className="text-muted text-sm">{subtitle}</p>}
      </div>
    </header>
  )
}
