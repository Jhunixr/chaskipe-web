import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { CameraView, HandOverlay } from '@/components/camera'
import { Button, Icon, PageHeader } from '@/components/ui'
import { useCamera } from '@/hooks/useCamera'
import { useHandLandmarker } from '@/hooks/useHandLandmarker'
import { useSpeech } from '@/hooks/useSpeech'
import { DEMO_RESULT } from '@/services/mockData'
import type { RecognitionStatus } from '@/types'

import './SignToTextPage.css'
import './pages.css'

/**
 * FASE 3: la camara funciona y MediaPipe detecta las manos (landmarks en vivo).
 * El reconocimiento de senas sigue simulado: "Analizar sena" produce un
 * resultado DEMO. El modelo de IA llega en la FASE 5.
 */
export function SignToTextPage() {
  const navigate = useNavigate()
  const camera = useCamera('user')
  const hands = useHandLandmarker()
  const [status, setStatus] = useState<RecognitionStatus>('idle')
  const { speak, speaking, cancel, supported } = useSpeech()

  // Activar la camara una sola vez al entrar.
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    camera.start()
    hands.load()
  }, [camera, hands])

  // Cuando la camara esta activa, iniciar la deteccion de manos sobre el video.
  const detectionStartedRef = useRef(false)
  useEffect(() => {
    if (camera.status !== 'active' || detectionStartedRef.current) return
    const video = camera.videoRef.current
    if (!video) return
    detectionStartedRef.current = true
    hands.start(video)
  }, [camera.status, camera.videoRef, hands])

  const detectedText = status === 'recognized' ? DEMO_RESULT.text : ''
  const cameraReady = camera.status === 'active'
  const detecting = hands.status === 'running'

  const handleAnalyze = () => {
    setStatus('recognizing')
    window.setTimeout(() => setStatus('recognized'), 1100)
  }

  let overlayStatus: string | undefined
  if (status === 'recognizing') overlayStatus = 'Reconociendo...'
  else if (detecting && hands.handCount > 0) {
    overlayStatus = hands.handCount === 1 ? '1 mano detectada' : '2 manos detectadas'
  } else if (detecting) overlayStatus = 'Muestra las manos'
  else if (cameraReady && hands.status === 'loading') overlayStatus = 'Cargando detector...'

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

      <section className="sign-to-text__panel">
        <span className="section-title">Texto detectado</span>
        <p className="sign-to-text__text">
          {detectedText || (
            <span className="text-muted">
              {status === 'recognizing' ? 'Analizando la sena...' : 'Aun no hay texto'}
            </span>
          )}
        </p>

        {status === 'recognized' && (
          <div className="sign-to-text__audio">
            <button
              type="button"
              className="sign-to-text__play"
              onClick={() => (speaking ? cancel() : speak(detectedText))}
              disabled={!supported}
              aria-label={speaking ? 'Pausar voz' : 'Escuchar en voz alta'}
            >
              <Icon name={speaking ? 'pause' : 'play'} size={24} />
            </button>
            <span className="sign-to-text__track" aria-hidden="true">
              <span className="sign-to-text__track-fill" />
            </span>
            <Icon name="volume" size={20} className="text-muted" />
          </div>
        )}
      </section>

      <p className="demo-note">
        MediaPipe detecta la posicion de las manos, pero el reconocimiento de la
        sena es demostrativo. La Lengua de Senas Peruana no comparte la gramatica
        del espanol; debe validarse con personas usuarias o interpretes.
      </p>

      {status === 'recognized' ? (
        <div className="stack-sm">
          <Button
            size="lg"
            fullWidth
            icon="check"
            onClick={() => navigate(ROUTES.translationResult)}
          >
            Ver resultado
          </Button>
          <Button
            variant="ghost"
            fullWidth
            icon="refresh"
            onClick={() => setStatus('idle')}
          >
            Nueva sena
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          fullWidth
          icon="hands"
          onClick={handleAnalyze}
          disabled={status === 'recognizing' || !cameraReady}
        >
          {status === 'recognizing'
            ? 'Analizando...'
            : cameraReady
              ? 'Analizar sena'
              : 'Activa la camara para analizar'}
        </Button>
      )}
    </div>
  )
}
