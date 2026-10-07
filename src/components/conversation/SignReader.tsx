import { useCallback, useEffect, useRef, useState } from 'react'

import { CameraView, HandOverlay } from '@/components/camera'
import { useCamera, type CameraFacing } from '@/hooks/useCamera'
import { useHandLandmarker } from '@/hooks/useHandLandmarker'
import { useSignRecognition, type RecognitionOutput } from '@/hooks/useSignRecognition'
import { phraseForLabel } from '@/services/recognition'
import type { ModelKind } from '@/services/signModel'
import type { HandFrame } from '@/types/handLandmarks'

import './SignReader.css'

/** Lo que se esta reconociendo ahora mismo (para mostrarlo en vivo). */
export interface LiveSign {
  /** Letra o palabra candidata, aun sin confirmar. */
  candidate: string | null
  /** Progreso de la confirmacion del candidato, 0..1. */
  progress: number
  /** Mensaje de estado corto (cargando, muestra las manos...). */
  status: string | null
}

interface SignReaderProps {
  /** Camara a usar: trasera para apuntar a la otra persona, frontal en modo mesa. */
  facing: CameraFacing
  /** Se llama con cada letra (deletreo) o palabra (seña) confirmada. */
  onSign: (piece: string, mode: ModelKind) => void
  /** Estado en vivo para pintarlo fuera de la camara. */
  onLive?: (live: LiveSign) => void
  /** Vista pequeña (modo mesa): sin selector ni textos sobre el video. */
  compact?: boolean
}

/**
 * Camara + MediaPipe + modelo de señas, listos para conversar.
 *
 * - "Letras": abecedario estatico de la LSP; cada letra confirmada se entrega
 *   y se sigue analizando (deletreo).
 * - "Señas": vocabulario con movimiento; cada seña confirmada se entrega como
 *   palabra y el analisis se reanuda solo.
 *
 * Al desmontar se apagan la camara y el bucle de deteccion.
 */
export function SignReader({ facing, onSign, onLive, compact = false }: SignReaderProps) {
  const camera = useCamera(facing)
  const [mode, setMode] = useState<ModelKind>('letters')

  const onSignRef = useRef(onSign)
  useEffect(() => {
    onSignRef.current = onSign
  }, [onSign])

  const handleConfirm = useCallback(
    (out: RecognitionOutput) => onSignRef.current(phraseForLabel(out.label), mode),
    [mode],
  )
  const recog = useSignRecognition({ mode, onConfirm: handleConfirm })
  const handleFrame = useCallback((frame: HandFrame) => recog.pushFrame(frame), [recog])
  const hands = useHandLandmarker({ onFrame: handleFrame })

  // Camara y detector una sola vez.
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    camera.start()
    hands.load()
  }, [camera, hands])

  // Modelo del modo actual.
  useEffect(() => {
    if (recog.phase === 'idle') recog.loadModel()
  }, [recog])

  // Deteccion de manos cuando el video esta activo.
  const detStartedRef = useRef(false)
  useEffect(() => {
    if (camera.status !== 'active' || detStartedRef.current) return
    const video = camera.videoRef.current
    if (!video) return
    detStartedRef.current = true
    hands.start(video)
  }, [camera.status, camera.videoRef, hands])

  // Analisis en vivo cuando todo esta listo.
  useEffect(() => {
    const ready =
      camera.status === 'active' &&
      hands.status === 'running' &&
      (recog.phase === 'watching' || recog.phase === 'candidate')
    if (ready && !recog.active) recog.startWatching()
  }, [camera.status, hands.status, recog])

  // Señas: tras confirmar una, seguir escuchando la siguiente.
  useEffect(() => {
    if (mode !== 'sign' || recog.phase !== 'confirmed') return
    const id = window.setTimeout(() => recog.resume(), 900)
    return () => window.clearTimeout(id)
  }, [mode, recog])

  let status: string | null = null
  if (recog.phase === 'model-missing') status = 'Falta el modelo de reconocimiento'
  else if (recog.phase === 'error') status = recog.errorMessage ?? 'Error del modelo'
  else if (hands.status === 'error') status = 'No se pudo cargar el detector de manos'
  else if (camera.status === 'active' && hands.status === 'loading') status = 'Preparando…'
  else if (recog.phase === 'loading-model') status = 'Cargando señas…'
  else if (recog.phase === 'watching' && hands.handCount === 0) status = 'Muestra las manos'

  const candidate =
    recog.phase === 'candidate' && recog.candidate ? phraseForLabel(recog.candidate.label) : null
  const progress = recog.phase === 'candidate' ? recog.holdProgress : 0

  const onLiveRef = useRef(onLive)
  useEffect(() => {
    onLiveRef.current = onLive
  }, [onLive])
  useEffect(() => {
    onLiveRef.current?.({ candidate, progress, status })
  }, [candidate, progress, status])

  return (
    <div className={`sign-reader${compact ? ' sign-reader--compact' : ''}`}>
      <CameraView
        status={camera.status}
        errorMessage={camera.errorMessage}
        facing={camera.facing}
        canSwitch={camera.canSwitch && !compact}
        videoRef={camera.videoRef}
        onStart={camera.start}
        onRetry={camera.start}
        onToggleFacing={camera.toggleFacing}
        overlayStatus={compact ? undefined : (status ?? undefined)}
        overlay={<HandOverlay frame={hands.frame} mirrored={camera.facing === 'user'} />}
      />

      {!compact && (
        <div className="segmented sign-reader__modes" role="tablist" aria-label="Qué reconocer">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'letters'}
            className={`segmented__option${mode === 'letters' ? ' segmented__option--active' : ''}`}
            onClick={() => setMode('letters')}
          >
            Letras
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sign'}
            className={`segmented__option${mode === 'sign' ? ' segmented__option--active' : ''}`}
            onClick={() => setMode('sign')}
          >
            Señas
          </button>
        </div>
      )}

      {candidate && (
        <span className="sign-reader__live" aria-hidden="true">
          <svg viewBox="0 0 60 60" className="sign-reader__ring">
            <circle cx="30" cy="30" r="25" className="sign-reader__ring-bg" />
            <circle
              cx="30"
              cy="30"
              r="25"
              className="sign-reader__ring-fg"
              strokeDasharray={157}
              strokeDashoffset={157 * (1 - progress)}
            />
          </svg>
          <span className="sign-reader__live-text">{candidate}</span>
        </span>
      )}
    </div>
  )
}
