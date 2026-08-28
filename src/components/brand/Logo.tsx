import { mascotAssets } from './mascotAssets'
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
 * Marca de Chaski Pe: mascota + wordmark "chaski" (marron) + "pe" (rojo).
 * Si existe el logo completo como imagen, lo usa tal cual.
 */
export function Logo({ layout = 'row', tagline = false, mascotSize = 40 }: LogoProps) {
  if (mascotAssets.logo && layout === 'stack') {
    return (
      <div className="logo logo--stack">
        <img
          className="logo__full-image"
          src={mascotAssets.logo}
          alt="Chaski Pe"
          width={mascotSize * 4}
        />
      </div>
    )
  }

  return (
    <div className={`logo logo--${layout}`}>
      <Mascot size={mascotSize} alt="" />
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
