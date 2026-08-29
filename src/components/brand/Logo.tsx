import { Mascot } from './Mascot'

import './Logo.css'

interface LogoProps {
  /** 'row' = mascota + wordmark en linea; 'stack' = apilado y centrado. */
  layout?: 'row' | 'stack'
  /** Muestra el lema "Comunicacion sin barreras". */
  tagline?: boolean
  mascotSize?: number
}

/**
 * Marca de Chaski Pe: mascota (globo con el chaski) + wordmark tipografico
 * "chaski" (marron) + "pe" (rojo), con lema y cenefa andina opcionales.
 */
export function Logo({ layout = 'row', tagline = false, mascotSize = 40 }: LogoProps) {
  return (
    <div className={`logo logo--${layout}`}>
      <Mascot size={layout === 'stack' ? mascotSize : mascotSize} alt="" />
      <div className="logo__text">
        <span className="logo__wordmark">
          chaski<em>pe</em>
        </span>
        {tagline && (
          <span className="logo__tagline andean-rule">
            <span className="andean-rule__diamond" aria-hidden="true" />
            Comunicacion sin barreras
            <span className="andean-rule__diamond" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  )
}
