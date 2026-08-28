import { Icon } from '@/components/ui'

import './CameraPlaceholder.css'

interface CameraPlaceholderProps {
  /** Texto de estado sobre la vista (ej. "Reconociendo..."). */
  status?: string | undefined
  /** Muestra puntos de landmarks decorativos sobre la figura. */
  showLandmarks?: boolean
}

/**
 * Marcador visual de la vista de camara.
 * FASE 1: no accede a la camara real ni a MediaPipe.
 */
export function CameraPlaceholder({
  status,
  showLandmarks = false,
}: CameraPlaceholderProps) {
  return (
    <div
      className="camera-placeholder"
      role="img"
      aria-label="Vista de camara (no activa)"
    >
      <div className="camera-placeholder__corners" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="camera-placeholder__figure" aria-hidden="true">
        <Icon name="user" size={72} />
        {showLandmarks && <span className="camera-placeholder__dots" />}
      </div>

      {status ? (
        <span className="camera-placeholder__status">
          <span className="camera-placeholder__pulse" aria-hidden="true" />
          {status}
        </span>
      ) : (
        <p className="camera-placeholder__hint">Vista de camara</p>
      )}
    </div>
  )
}
