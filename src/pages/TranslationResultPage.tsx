import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Mascot } from '@/components/brand'
import { Button, DemoBadge, Icon, PageHeader } from '@/components/ui'
import { useSpeech } from '@/hooks/useSpeech'
import {
  loadRecognition,
  type RecognitionResult,
} from '@/services/recognition'

import './TranslationResultPage.css'
import './pages.css'

/**
 * FASE 6: muestra el resultado real del modelo. La sena reconocida llega por
 * el `state` de React Router (con respaldo en sessionStorage para el refresco).
 */
export function TranslationResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { speak, speaking, cancel, supported } = useSpeech()

  const fromState = location.state as RecognitionResult | null
  const result = fromState ?? loadRecognition()

  if (!result) {
    return (
      <div className="page result result--empty">
        <PageHeader title="Resultado" />
        <p className="text-muted">
          No hay un reconocimiento reciente. Vuelve a "Senas a texto".
        </p>
        <Button size="lg" icon="hands" onClick={() => navigate(ROUTES.signToText)}>
          Ir a Senas a texto
        </Button>
      </div>
    )
  }

  const confidencePct = Math.round(result.confidence * 100)

  return (
    <div className="page result">
      <PageHeader title="Resultado" />

      <div className="result__hero">
        <span className="result__check" aria-hidden="true">
          <Icon name="check" size={40} />
        </span>
        <h2 className="result__text">{result.text}</h2>
        <div className="result__status">
          <span className="result__badge">
            <Icon name="check" size={14} />
            Reconocido · {confidencePct}%
          </span>
          <DemoBadge />
        </div>
      </div>

      <div className="result__audio">
        <button
          type="button"
          className="result__audio-btn"
          onClick={() => (speaking ? cancel() : speak(result.text))}
          disabled={!supported}
          aria-label={speaking ? 'Pausar' : 'Reproducir'}
        >
          <Icon name={speaking ? 'pause' : 'volume'} size={20} />
        </button>
        <span className="result__audio-track" aria-hidden="true">
          <span className="result__audio-fill" />
        </span>
        <span className="result__audio-time text-xs text-muted">
          {supported ? 'Toca para escuchar' : 'Voz no disponible'}
        </span>
      </div>

      <p className="demo-note">
        {result.isSynthetic
          ? 'Resultado de un modelo de prueba (datos sinteticos): no es una traduccion real.'
          : 'Equivalencia demostrativa, no validada con personas usuarias de LSP ni interpretes.'}
      </p>

      <div className="stack-sm result__actions">
        <Button
          size="lg"
          fullWidth
          icon="volume"
          onClick={() => speak(result.text)}
          disabled={!supported}
        >
          Escuchar en voz alta
        </Button>
        <div className="result__actions-row">
          <Button
            variant="secondary"
            fullWidth
            icon="edit"
            onClick={() => navigate(ROUTES.signToText)}
          >
            Corregir
          </Button>
          <Button
            variant="secondary"
            fullWidth
            icon="refresh"
            onClick={() => navigate(ROUTES.signToText)}
          >
            Nueva sena
          </Button>
        </div>
      </div>

      <div className="result__mascot" aria-hidden="true">
        <Mascot size={72} alt="" />
      </div>
    </div>
  )
}
