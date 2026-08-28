import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { CameraPlaceholder } from '@/components/camera/CameraPlaceholder'
import { Button, Icon, PageHeader } from '@/components/ui'
import { useSpeech } from '@/hooks/useSpeech'
import { DEMO_RESULT } from '@/services/mockData'
import type { RecognitionStatus } from '@/types'

import './SignToTextPage.css'
import './pages.css'

/**
 * FASE 1: interfaz unicamente. No hay acceso a la camara ni a MediaPipe.
 * "Analizar sena" simula el cambio de estado para revisar la UI.
 */
export function SignToTextPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<RecognitionStatus>('idle')
  const { speak, speaking, cancel, supported } = useSpeech()

  const detectedText = status === 'recognized' ? DEMO_RESULT.text : ''

  const handleAnalyze = () => {
    setStatus('recognizing')
    window.setTimeout(() => setStatus('recognized'), 1100)
  }

  return (
    <div className="page sign-to-text">
      <PageHeader title="Senas a texto" />

      <CameraPlaceholder
        status={status === 'recognizing' ? 'Reconociendo...' : undefined}
        showLandmarks={status !== 'idle'}
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
          <Button variant="ghost" fullWidth icon="refresh" onClick={() => setStatus('idle')}>
            Nueva sena
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          fullWidth
          icon="hands"
          onClick={handleAnalyze}
          disabled={status === 'recognizing'}
        >
          {status === 'recognizing' ? 'Analizando...' : 'Analizar sena'}
        </Button>
      )}
    </div>
  )
}
