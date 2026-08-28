import './Mountains.css'

interface MountainsProps {
  /** Posicion del motivo. 'bottom' fija al pie del contenedor. */
  position?: 'bottom' | 'inline'
}

/**
 * Motivo de montañas rojas (identidad peruana sutil).
 * SVG decorativo, sin texto; se oculta a lectores de pantalla.
 */
export function Mountains({ position = 'bottom' }: MountainsProps) {
  return (
    <svg
      className={`mountains mountains--${position}`}
      viewBox="0 0 460 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="mountains__back"
        d="M0 120 L0 78 L70 40 L140 74 L210 30 L300 76 L370 44 L460 82 L460 120 Z"
      />
      <path
        className="mountains__front"
        d="M0 120 L0 96 L60 66 L130 98 L200 60 L280 100 L360 72 L460 104 L460 120 Z"
      />
    </svg>
  )
}
