import { useState } from 'react'

import { AvatarView } from '@/components/avatar/AvatarView'
import { FlowHeader } from '@/components/layout'
import { Button, Card, Icon } from '@/components/ui'
import { useSpeech } from '@/hooks/useSpeech'
import { DEMO_INCOMING_PROMPT, DEMO_REPLY_TEXT } from '@/services/mockData'

import './TextToSignPage.css'
import './pages.css'

type Stage = 'compose' | 'avatar'

/**
 * FASE 1: estructura visual. No hay conversion real de espanol a LSP ni avatar 3D.
 * "Dictar respuesta" no captura audio todavia.
 */
export function TextToSignPage() {
  const [stage, setStage] = useState<Stage>('compose')
  const [text, setText] = useState(DEMO_REPLY_TEXT)
  const { speak, speaking, cancel, supported } = useSpeech()

  if (stage === 'avatar') {
    return (
      <div className="page text-to-sign">
        <FlowHeader step={2} totalSteps={4} />

        <p className="text-to-sign__label section-title">Respuesta en senas</p>

        <AvatarView caption={text.trim() || undefined} playing />

        <div className="text-to-sign__playback">
          <span className="text-xs text-muted">0:02</span>
          <span className="text-to-sign__track" aria-hidden="true">
            <span className="text-to-sign__track-fill" />
          </span>
          <span className="text-xs text-muted">0:04</span>
        </div>

        <div className="text-to-sign__controls">
          <button type="button" className="chip">
            <Icon name="pause" size={16} />
            Pausar
          </button>
          <button type="button" className="chip" onClick={() => setStage('avatar')}>
            <Icon name="refresh" size={16} />
            Repetir
          </button>
          <button type="button" className="chip">
            <Icon name="clock" size={16} />
            1x
          </button>
        </div>

        <Button
          variant="dark"
          size="lg"
          fullWidth
          icon="volume"
          onClick={() => (speaking ? cancel() : speak(text))}
          disabled={!supported}
        >
          {speaking ? 'Pausar voz' : 'Escuchar voz'}
        </Button>

        <p className="demo-note">
          Animacion demostrativa. La correspondencia con LSP no ha sido validada
          con personas usuarias ni interpretes.
        </p>

        <Button variant="ghost" fullWidth icon="back" onClick={() => setStage('compose')}>
          Editar respuesta
        </Button>
      </div>
    )
  }

  return (
    <div className="page text-to-sign">
      <FlowHeader step={1} totalSteps={4} />

      <Card className="text-to-sign__incoming">
        <span className="row text-sm text-muted">
          <Icon name="chat" size={16} />
          La otra persona dijo:
        </span>
        <p className="text-to-sign__incoming-text">{DEMO_INCOMING_PROMPT}</p>
      </Card>

      <div className="field">
        <label className="field__label" htmlFor="text-to-sign-input">
          Escribe tu respuesta
        </label>
        <textarea
          id="text-to-sign-input"
          className="field__textarea"
          placeholder="Estoy bien, gracias."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <div className="stack-sm">
        <Button
          size="lg"
          fullWidth
          icon="send"
          disabled={text.trim() === ''}
          onClick={() => setStage('avatar')}
        >
          Enviar al avatar
        </Button>
        <Button variant="secondary" fullWidth icon="mic">
          Dictar respuesta
        </Button>
      </div>

      <p className="demo-note">
        La conversion de espanol a Lengua de Senas Peruana requiere un modelo y
        animaciones validadas; aun no esta disponible.
      </p>
    </div>
  )
}
