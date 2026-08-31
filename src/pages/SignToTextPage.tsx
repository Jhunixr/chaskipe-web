import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { CameraView, HandOverlay } from '@/components/camera'
import { Button, Icon, PageHeader } from '@/components/ui'
import { useCamera } from '@/hooks/useCamera'
import { useHandLandmarker } from '@/hooks/useHandLandmarker'
import { useSignRecognition } from '@/hooks/useSignRecognition'
import { addHistory } from '@/services/api'
import {
  phraseForLabel,
  saveRecognition,
  type RecognitionResult,
} from '@/services/recognition'
import type { HandFrame } from '@/types/handLandmarks'

import './SignToTextPage.css'
import './pages.css'

/**
 * Reconocimiento EN TIEMPO REAL del **abecedario de la LSP** (deletreo manual).
 *
 * La camara + MediaPipe alimentan una ventana deslizante de landmarks; el
 * modelo (MLP) se ejecuta varias veces por segundo. La letra candidata se
 * muestra en vivo y se confirma cuando se mantiene estable ~0.6 s.
 *
 * El deletreo manual NO es toda la LSP: la lengua tiene su propia gramatica y
 * vocabulario. Las senas deben validarse con personas usuarias o interpretes.
 * Si aun no hay un modelo entrenado, la pantalla lo avisa (ver `ai/README.md`).
 */
export function SignToTextPage() {
  const navigate = useNavigate()
  const camera = useCamera('user')
  const recog = useSignRecognition()

  const handleFrame = useCallback(
    (frame: HandFrame) => recog.pushFrame(frame),
    [recog],
  )
  const hands = useHandLandmarker({ onFrame: handleFrame })

  // Activar camara + modelos una sola vez.
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    camera.start()
    hands.load()
    recog.loadModel()
  }, [camera, hands, recog])

  // Iniciar deteccion de manos cuando la camara esta activa.
  const detStartedRef = useRef(false)
  useEffect(() => {
    if (camera.status !== 'active' || detStartedRef.current) return
    const video = camera.videoRef.current
    if (!video) return
    detStartedRef.current = true
    hands.start(video)
  }, [camera.status, camera.videoRef, hands])

  // Arrancar el analisis en vivo cuando camara + detector + modelo estan listos.
  const watchStartedRef = useRef(false)
  useEffect(() => {
    const ready =
      camera.status === 'active' &&
      hands.status === 'running' &&
      (recog.phase === 'watching' || recog.phase === 'candidate')
    if (ready && !watchStartedRef.current) {
      watchStartedRef.current = true
      recog.startWatching()
    }
  }, [camera.status, hands.status, recog])

  const modelMissing = recog.phase === 'model-missing'
  const confirmed = recog.confirmed
  const candidate = recog.candidate

  const goToResult = () => {
    if (!confirmed) return
    const text = phraseForLabel(confirmed.label)
    const payload: RecognitionResult = {
      label: confirmed.label,
      text,
      confidence: confirmed.confidence,
      isSynthetic: confirmed.isSynthetic,
      at: Date.now(),
    }
    saveRecognition(payload)
    // Guardar en el historial (si el backend no responde, se ignora).
    void addHistory({ direction: 'sign-to-text', text, isDemo: true })
    navigate(ROUTES.translationResult, { state: payload })
  }

  let overlayStatus: string | undefined
  if (recog.phase === 'confirmed' && confirmed) {
    overlayStatus = `Reconocido: ${phraseForLabel(confirmed.label)}`
  } else if (recog.phase === 'candidate' && candidate) {
    overlayStatus = `${phraseForLabel(candidate.label)}...`
  } else if (recog.phase === 'watching') {
    overlayStatus = hands.handCount > 0 ? 'Analizando...' : 'Muestra las manos'
  } else if (recog.phase === 'paused') {
    overlayStatus = 'En pausa'
  } else if (recog.phase === 'loading-model') {
    overlayStatus = 'Cargando modelo...'
  } else if (camera.status === 'active' && hands.status === 'loading') {
    overlayStatus = 'Cargando detector...'
  }

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
          {recog.phase === 'confirmed' && confirmed ? (
            phraseForLabel(confirmed.label)
          ) : recog.phase === 'candidate' && candidate ? (
            <span className="sign-to-text__candidate">
              {phraseForLabel(candidate.label)}
            </span>
          ) : (
            <span className="text-muted">
              {recog.phase === 'paused'
                ? 'Analisis en pausa'
                : recog.phase === 'watching'
                  ? hands.handCount > 0
                    ? 'Analizando...'
                    : 'Muestra las manos a la camara'
                  : 'Preparando...'}
            </span>
          )}
        </p>

        {recog.phase === 'candidate' && candidate && (
          <>
            <div
              className="sign-to-text__hold"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(recog.holdProgress * 100)}
              aria-label="Confirmando sena"
            >
              <span style={{ width: `${recog.holdProgress * 100}%` }} />
            </div>
            <p className="sign-to-text__confidence text-xs text-muted">
              Manten la sena · {Math.round(candidate.confidence * 100)}%
            </p>
          </>
        )}

        {recog.phase === 'confirmed' && confirmed && (
          <p className="sign-to-text__confidence text-xs text-muted">
            Confianza {Math.round(confirmed.confidence * 100)}%
            {confirmed.isSynthetic ? ' · modelo de prueba (datos sinteticos)' : ''}
          </p>
        )}
      </section>

      <p className="demo-note">
        Reconoce el <strong>abecedario de la LSP</strong> (deletreo manual). El
        deletreo <strong>no es toda la LSP</strong>: la lengua tiene su propia
        gramatica y vocabulario. Las senas deben validarse con personas
        usuarias o interpretes.
      </p>

      {recog.phase === 'confirmed' && confirmed ? (
        <div className="stack-sm">
          <Button size="lg" fullWidth icon="check" onClick={goToResult}>
            Ver resultado
          </Button>
          <Button variant="ghost" fullWidth icon="refresh" onClick={recog.resume}>
            Reconocer otra sena
          </Button>
        </div>
      ) : recog.phase === 'paused' ? (
        <Button size="lg" fullWidth icon="camera" onClick={recog.resume}>
          Reanudar analisis
        </Button>
      ) : (
        <Button
          variant="secondary"
          fullWidth
          icon="pause"
          onClick={recog.pause}
          disabled={
            modelMissing ||
            !(recog.phase === 'watching' || recog.phase === 'candidate')
          }
        >
          Pausar analisis
        </Button>
      )}
    </div>
  )
}
