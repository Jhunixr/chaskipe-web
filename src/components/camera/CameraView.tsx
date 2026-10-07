import type { ReactNode } from 'react'

import { Button, Icon } from '@/components/ui'
import type { CameraFacing, CameraStatus } from '@/hooks/useCamera'

import './CameraView.css'

interface CameraViewProps {
  status: CameraStatus
  errorMessage: string | null
  facing: CameraFacing
  canSwitch: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  onStart: () => void
  onRetry: () => void
  onToggleFacing: () => void
  /** Texto de estado sobre el video (ej. "Reconociendo..."). */
  overlayStatus?: string | undefined
  /** Capa opcional sobre el video (ej. landmarks de manos). */
  overlay?: ReactNode
}

/**
 * Vista de camara con video en vivo y una capa de overlay opcional.
 */
export function CameraView({
  status,
  errorMessage,
  facing,
  canSwitch,
  videoRef,
  onStart,
  onRetry,
  onToggleFacing,
  overlayStatus,
  overlay,
}: CameraViewProps) {
  const isActive = status === 'active'
  const isBusy = status === 'requesting'
  const hasError =
    status === 'denied' || status === 'unavailable' || status === 'error'

  return (
    <div className="camera-view">
      <div className="camera-view__corners" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <video
        ref={videoRef}
        className={`camera-view__video${
          facing === 'user' ? ' camera-view__video--mirror' : ''
        }${isActive ? '' : ' camera-view__video--hidden'}`}
        playsInline
        autoPlay
        muted
        aria-label="Video de la camara"
      />

      {isActive && overlay}

      {!isActive && (
        <div className="camera-view__state">
          {status === 'idle' && (
            <>
              <Icon name="camera" size={40} />
              <p className="camera-view__hint">Toca para activar la camara</p>
              <Button icon="camera" onClick={onStart}>
                Activar camara
              </Button>
            </>
          )}

          {isBusy && (
            <>
              <span className="camera-view__spinner" aria-hidden="true" />
              <p className="camera-view__hint">Abriendo la camara...</p>
            </>
          )}

          {status === 'unsupported' && (
            <p className="camera-view__hint">
              Este navegador no permite el acceso a la camara.
            </p>
          )}

          {hasError && (
            <>
              <Icon name="camera" size={36} />
              <p className="camera-view__hint">
                {errorMessage ?? 'No se pudo abrir la camara.'}
              </p>
              <Button variant="secondary" icon="refresh" onClick={onRetry}>
                Reintentar
              </Button>
            </>
          )}
        </div>
      )}

      {isActive && overlayStatus && (
        <span className="camera-view__overlay-status">
          <span className="camera-view__pulse" aria-hidden="true" />
          {overlayStatus}
        </span>
      )}

      {isActive && canSwitch && (
        <button
          type="button"
          className="camera-view__switch"
          onClick={onToggleFacing}
          aria-label="Cambiar de camara"
        >
          <Icon name="refresh" size={20} />
        </button>
      )}
    </div>
  )
}
