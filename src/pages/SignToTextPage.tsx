import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { CameraView } from '@/components/camera'
import { Button, Icon, PageHeader } from '@/components/ui'
import { useCamera } from '@/hooks/useCamera'
import { useSpeech } from '@/hooks/useSpeech'
import { DEMO_RESULT } from '@/services/mockData'
import type { RecognitionStatus } from '@/types'

import './SignToTextPage.css'
import './pages.css'

/**
 * FASE 2: la camara ya funciona (video en vivo).
 * El reconocimiento sigue simulado: "Analizar sena" produce un resultado DEMO.
 * MediaPipe y el modelo de IA llegan en fases posteriores.
 */
export function SignToTextPage() {
  const navigate = useNavigate()
  const camera = useCamera('user')
  const [status, setStatus] = useState<RecognitionStatus>('idle')
  const { speak, speaking, cancel, supported } = useSpeech()

  // Activar la camara una sola vez al entrar a la pantalla.
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    camera.start()
  }, [camera])

  const detectedText = status === 'recognized' ? DEMO_RESULT.text : ''
  const cameraReady = camera.status === 'active'

  const handleAnalyze = () => {
    setStatus('recognizing')
    window.setTimeout(() => setStatus('recognized'), 1100)
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
        overlayStatus={status === 'recognizing' ? 'Reconociendo...' : undefined}
      />

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
        Equivalencia demostrativa. La Lengua de Senas Peruana no comparte la
        gramatica del espanol; debe validarse con personas usuarias o interpretes.
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
