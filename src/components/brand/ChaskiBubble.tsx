import { ChaskiFigure } from './ChaskiFigure'

import './ChaskiBubble.css'

interface ChaskiBubbleProps {
  /** Diametro del globo en px. */
  size?: number
}

/**
 * El globo de dialogo del logo con Chaski 3D adentro, el sol y las montañas.
 * Decorativo.
 */
export function ChaskiBubble({ size = 260 }: ChaskiBubbleProps) {
  return (
    <span className="chaski-bubble" style={{ width: size, height: size }} aria-hidden="true">
      <svg className="chaski-bubble__tail" viewBox="0 0 74 70" focusable="false">
        <path d="M30 0 L74 22 C58 40 30 58 4 70 C16 50 22 30 30 0Z" />
      </svg>
      <span className="chaski-bubble__inner">
        <span className="chaski-bubble__sun" />
        <svg className="chaski-bubble__hills" viewBox="0 0 272 120" preserveAspectRatio="none" focusable="false">
          <path className="chaski-bubble__hill-back" d="M0 64 C34 40 58 30 92 46 C122 60 140 22 180 24 C214 26 236 52 272 44 V120 H0Z" />
          <path className="chaski-bubble__hill-front" d="M0 92 C40 70 74 66 110 80 C146 94 176 64 214 66 C240 68 258 80 272 78 V120 H0Z" />
        </svg>
        <ChaskiFigure width={Math.round(size * 0.76)} className="chaski-bubble__figure" />
      </span>
    </span>
  )
}
