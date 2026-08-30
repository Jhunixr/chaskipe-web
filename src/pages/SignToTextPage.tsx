import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { CameraView, HandOverlay } from '@/components/camera'
import { Button, Icon, PageHeader } from '@/components/ui'
import { useCamera } from '@/hooks/useCamera'
import { useHandLandmarker } from '@/hooks/useHandLandmarker'
import { useSignRecognition } from '@/hooks/useSignRecognition'
import {
  phraseForLabel,
  saveRecognition,
  type RecognitionResult,
} from '@/services/recognition'
import type { HandFrame } from '@/types/handLandmarks'

import './SignToTextPage.css'
import './pages.css'

/**
 * FASE 6: la camara y MediaPipe detectan las manos y "Analizar sena" ejecuta
 * el modelo (MLP) sobre ~2 s de landmarks.
 *
 * El modelo actual esta entrenado con datos SINTETICOS: no reconoce senas
 * reales. Se avisa en pantalla. El modelo real necesita un dataset validado
 * con personas usuarias de LSP o interpretes.
 */
export function SignToTextPage() {
  const navigate = useNavigate()
  const camera = useCamera('user')
  const recog = useSignRecognition()

  // Alimenta cada frame de MediaPipe al reconocedor mientras graba.
  const handleFrame = useCallback(
    (frame: HandFrame) => recog.pushFrame(frame),
    [recog],
  )
  const hands = useHandLandmarker({ onFrame: handleFrame })

  // Activar camara + modelos una sola vez al entrar.
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    camera.start()
    hands.load()
    recog.loadModel()
  }, [camera, hands, recog])

  // Iniciar la deteccion de manos cuando la camara esta activa.
  const detStartedRef = useRef(false)
  useEffect(() => {
    if (camera.status !== 'active' || detStartedRef.current) return
    const video = camera.videoRef.current
    if (!video) return
    detStartedRef.current = true
    hands.start(video)
  }, [camera.status, camera.videoRef, hands])

  const cameraReady = camera.status === 'active'
  const detectorRunning = hands.status === 'running'
  const modelMissing = recog.phase === 'model-missing'

  const done = recog.phase === 'done' || recog.phase === 'low-confidence'
  const result = recog.result
  const detectedText =
    done && result && recog.phase === 'done' ? phraseForLabel(result.label) : ''

  const handleAnalyze = () => recog.start()

  const goToResult = () => {
    if (!result) return
    const payload: RecognitionResult = {
      label: result.label,
      text: phraseForLabel(result.label),
      confidence: result.confidence,
      isSynthetic: result.isSynthetic,
      at: Date.now(),
    }
    saveRecognition(payload)
    navigate(ROUTES.translationResult, { state: payload })
  }

  let overlayStatus: string | undefined
  if (recog.phase === 'recording') {
    overlayStatus = 'Grabando la sena...'
  } else if (recog.phase === 'predicting') {
    overlayStatus = 'Reconociendo...'
  } else if (cameraReady && recog.phase === 'loading-model') {
    overlayStatus = 'Cargando modelo...'
  } else if (detectorRunning && hands.handCount > 0) {
    overlayStatus =
      hands.handCount === 1 ? '1 mano detectada' : '2 manos detectadas'
  } else if (detectorRunning) {
    overlayStatus = 'Muestra las manos'
  } else if (cameraReady && hands.status === 'loading') {
    overlayStatus = 'Cargando detector...'
  }

  const busy = recog.phase === 'recording' || recog.phase === 'predicting'
  const canAnalyze =
    cameraReady && detectorRunning && !busy && !modelMissing

  return (
    <div className="page sign-to-text">
      <PageHeader title="Senas a texto" />

      <CameraView
        status={camera.status}
        errorMessage={camera.errorMessage}
        facing={camera.facing}
        canSwitch={camera.canSwitch}
        videoRef={camera.videoRef}
        onStart={camera.start}
        onRetry={camera.start}
        onToggleFacing={camera.toggleFacing}
        overlayStatus={overlayStatus}
        overlay={
          <HandOverlay frame={hands.frame} mirrored={camera.facing === 'user'} />
        }
      />

      {recog.phase === 'recording' && (
        <div
          className="sign-to-text__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(recog.progress * 100)}
        >
          <span style={{ width: `${recog.progress * 100}%` }} />
        </div>
      )}

      {hands.status === 'error' && (
        <p className="disclaimer-note">
          <Icon name="shield" size={16} />
          {hands.errorMessage ?? 'No se pudo cargar el detector de manos.'}
        </p>
      )}

      {modelMissing && (
        <p className="disclaimer-note">
          <Icon name="shield" size={16} />
          No hay un modelo de reconocimiento. Genera uno con los scripts de{' '}
          <code>ai/</code> (ver <code>ai/README.md</code>).
        </p>
      )}

      {recog.phase === 'error' && (
        <p className="disclaimer-note">
          <Icon name="shield" size={16} />
          {recog.errorMessage}
        </p>
      )}

      <section className="sign-to-text__panel">
        <span className="section-title">Texto detectado</span>
        <p className="sign-to-text__text">
          {detectedText ? (
            detectedText
          ) : (
            <span className="text-muted">
              {recog.phase === 'recording'
                ? 'Haz la sena ahora...'
                : recog.phase === 'predicting'
                  ? 'Analizando...'
                  : recog.phase === 'no-hands'
                    ? 'No se vieron las manos. Intenta de nuevo.'
                    : recog.phase === 'low-confidence'
                      ? `No estoy seguro (${result ? Math.round(result.confidence * 100) : 0}%). Repite la sena.`
                      : 'Aun no hay texto'}
            </span>
          )}
        </p>

        {recog.phase === 'done' && result && (
          <p className="sign-to-text__confidence text-xs text-muted">
            Confianza {Math.round(result.confidence * 100)}%
            {result.isSynthetic ? ' · modelo de prueba (datos sinteticos)' : ''}
          </p>
        )}
      </section>

      <p className="demo-note">
        El modelo de reconocimiento esta entrenado con datos{' '}
        <strong>sinteticos de prueba</strong>: aun no reconoce senas reales.
        La Lengua de Senas Peruana no comparte la gramatica del espanol; el
        vocabulario debe validarse con personas usuarias o interpretes.
      </p>

      {recog.phase === 'done' && result ? (
        <div className="stack-sm">
          <Button size="lg" fullWidth icon="check" onClick={goToResult}>
            Ver resultado
          </Button>
          <Button variant="ghost" fullWidth icon="refresh" onClick={recog.reset}>
            Nueva sena
          </Button>
        </div>
      ) : recog.phase === 'low-confidence' || recog.phase === 'no-hands' ? (
        <Button size="lg" fullWidth icon="refresh" onClick={handleAnalyze}>
          Reintentar
        </Button>
      ) : (
        <Button
          size="lg"
          fullWidth
          icon="hands"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
        >
          {recog.phase === 'recording'
            ? 'Grabando...'
            : recog.phase === 'predicting'
              ? 'Analizando...'
              : modelMissing
                ? 'Modelo no disponible'
                : canAnalyze
                  ? 'Analizar sena'
                  : 'Preparando camara y modelo...'}
        </Button>
      )}
    </div>
  )
}
