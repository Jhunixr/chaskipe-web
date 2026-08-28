import { Mascot } from '@/components/brand'
import { Icon } from '@/components/ui'

import './AvatarView.css'

interface AvatarViewProps {
  /** Descripcion de la sena/secuencia que el avatar reproduciria. */
  caption?: string | undefined
  /** Muestra la etiqueta "Mostrando en senas". */
  playing?: boolean
}

/**
 * Area reservada para el avatar 3D que reproducira Lengua de Senas Peruana.
 *
 * FASE 1: sin Three.js ni modelos GLB/glTF. Solo marcador visual.
 * Las animaciones LSP deben validarse con personas usuarias o interpretes
 * antes de usarse (ver FASE 10).
 */
export function AvatarView({ caption, playing = false }: AvatarViewProps) {
  return (
    <div className="avatar-view">
      <div className="avatar-view__stage">
        {playing && (
          <span className="avatar-view__tag">
            <Icon name="hands" size={14} />
            Mostrando en senas
          </span>
        )}
        <Mascot size={128} alt="Avatar de Lengua de Senas (vista previa no disponible)" />
      </div>
      {caption && <p className="avatar-view__caption">{caption}</p>}
      <p className="avatar-view__note text-xs text-muted">
        Avatar 3D disponible en una fase posterior
      </p>
    </div>
  )
}
