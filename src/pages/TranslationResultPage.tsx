import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Mascot } from '@/components/brand'
import { Button, DemoBadge, Icon, PageHeader } from '@/components/ui'
import { useSpeech } from '@/hooks/useSpeech'
import { DEMO_RESULT } from '@/services/mockData'

import './TranslationResultPage.css'
import './pages.css'

export function TranslationResultPage() {
  const navigate = useNavigate()
  const { speak, speaking, cancel, supported } = useSpeech()

  return (
    <div className="page result">
      <PageHeader title="Resultado" />

      <div className="result__hero">
        <span className="result__check" aria-hidden="true">
          <Icon name="check" size={40} />
        </span>
        <h2 className="result__text">{DEMO_RESULT.text}</h2>
        <div className="result__status">
          <span className="result__badge">
            <Icon name="check" size={14} />
            Reconocido
          </span>
          <DemoBadge />
        </div>
      </div>

      <div className="result__audio">
        <button
          type="button"
          className="result__audio-btn"
          onClick={() => (speaking ? cancel() : speak(DEMO_RESULT.text))}
          disabled={!supported}
          aria-label={speaking ? 'Pausar' : 'Reproducir'}
        >
          <Icon name={speaking ? 'pause' : 'volume'} size={20} />
        </button>
        <span className="result__audio-track" aria-hidden="true">
          <span className="result__audio-fill" />
        </span>
        <span className="result__audio-time text-xs text-muted">0:02 / 0:03</span>
      </div>

      <p className="demo-note">
        Equivalencia demostrativa, no validada con personas usuarias de LSP ni
        interpretes.
      </p>

      <div className="stack-sm result__actions">
        <Button
          size="lg"
          fullWidth
          icon="volume"
          onClick={() => speak(DEMO_RESULT.text)}
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
