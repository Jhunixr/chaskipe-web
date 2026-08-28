import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Button, Card, DemoBadge, PageHeader } from '@/components/ui'
import { useSpeech } from '@/hooks/useSpeech'
import { DEMO_RESULT } from '@/services/mockData'

import './TranslationResultPage.css'
import './pages.css'

export function TranslationResultPage() {
  const navigate = useNavigate()
  const { speak, supported } = useSpeech()

  return (
    <div className="page">
      <PageHeader title="Resultado" subtitle="Revisa el texto reconocido." />

      <Card className="result-card">
        <div className="result-card__status">
          <span className="result-card__badge">Reconocido</span>
          <DemoBadge />
        </div>
        <p className="result-card__text">{DEMO_RESULT.text}</p>
        <p className="demo-note">
          Equivalencia demostrativa. La Lengua de Senas Peruana no comparte la
          gramatica del espanol; este resultado debe validarse con personas
          usuarias o interpretes.
        </p>
      </Card>

      <div className="stack-sm">
        <Button
          fullWidth
          onClick={() => speak(DEMO_RESULT.text)}
          disabled={!supported}
        >
          Escuchar en voz alta
        </Button>
        {!supported && (
          <p className="text-sm text-muted">
            Tu navegador no permite reproducir voz.
          </p>
        )}
        <Button variant="secondary" fullWidth onClick={() => navigate(ROUTES.signToText)}>
          Corregir
        </Button>
        <Button variant="ghost" fullWidth onClick={() => navigate(ROUTES.signToText)}>
          Nueva sena
        </Button>
      </div>
    </div>
  )
}
