import './AvatarView.css'

interface AvatarViewProps {
  /** Descripcion de la sena/secuencia que el avatar reproduciria. */
  caption?: string | undefined
}

/**
 * Area reservada para el avatar 3D que reproducira Lengua de Senas Peruana.
 *
 * FASE 1: sin Three.js ni modelos GLB/glTF. Solo marcador visual.
 * Las animaciones LSP deben validarse con personas usuarias o interpretes
 * antes de usarse (ver FASE 10).
 */
export function AvatarView({ caption }: AvatarViewProps) {
  return (
    <div className="avatar-view" role="img" aria-label="Avatar de Lengua de Senas (no disponible)">
      <div className="avatar-view__stage" aria-hidden="true">
        <span className="avatar-view__glyph">☺</span>
      </div>
      <p className="avatar-view__note text-sm text-muted">
        Avatar 3D disponible en una fase posterior
      </p>
      {caption && <p className="avatar-view__caption">{caption}</p>}
    </div>
  )
}
