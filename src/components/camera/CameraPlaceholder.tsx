import './CameraPlaceholder.css'

interface CameraPlaceholderProps {
  /** Texto de estado sobre la vista (ej. "Reconociendo..."). */
  status?: string | undefined
}

/**
 * Marcador visual de la vista de camara.
 * FASE 1: no accede a la camara real ni a MediaPipe.
 */
export function CameraPlaceholder({ status }: CameraPlaceholderProps) {
  return (
    <div className="camera-placeholder" role="img" aria-label="Vista de camara (no activa)">
      <div className="camera-placeholder__frame" aria-hidden="true" />
      <p className="camera-placeholder__hint">Vista de camara</p>
      {status && <span className="camera-placeholder__status">{status}</span>}
    </div>
  )
}
