import './Hills.css'

interface HillsProps {
  /** Muestra el sol dorado detras de las montañas. */
  sun?: boolean
  className?: string
}

/**
 * Montañas suaves en dos capas (como las del logo) para el fondo de las
 * tarjetas rojas. Decorativo: se oculta a lectores de pantalla.
 */
export function Hills({ sun = false, className }: HillsProps) {
  return (
    <span className={['hills', className ?? ''].filter(Boolean).join(' ')} aria-hidden="true">
      {sun && <span className="hills__sun" />}
      <svg viewBox="0 0 360 120" preserveAspectRatio="none" focusable="false">
        <path
          className="hills__back"
          d="M0 56 C40 30 74 22 116 42 C156 60 184 16 226 20 C266 24 300 54 360 40 V120 H0Z"
        />
        <path
          className="hills__front"
          d="M0 92 C50 72 92 70 134 82 C176 94 216 70 258 72 C298 74 328 86 360 82 V120 H0Z"
        />
      </svg>
    </span>
  )
}
