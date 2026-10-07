import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { AvatarView, type AvatarViewHandle } from '@/components/avatar'
import { FlowHeader } from '@/components/layout'
import { Button, Card, Icon } from '@/components/ui'
import { addHistory } from '@/services/api'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

import './TextToSignPage.css'
import './pages.css'

type Stage = 'compose' | 'avatar'

/** Lo que otras pantallas pueden pasar por el `state` del router. */
interface TextToSignState {
  /** Texto a mostrar directamente con el avatar (Frases, Conversacion). */
  text?: string
  /** Lo que dijo la otra persona, para mostrarlo arriba. */
  incoming?: string
}

/**
 * Avatar 3D (Three.js) que reproduce un gesto DEMO.
 *
 * NO hay conversion real de espanol a LSP: el gesto es un marcador de posicion.
 * "Dictar respuesta" usa el reconocimiento de voz del navegador.
 */
export function TextToSignPage() {
  const location = useLocation()
  const initial = (location.state as TextToSignState | null) ?? {}
  const [stage, setStage] = useState<Stage>(initial.text ? 'avatar' : 'compose')
  const [text, setText] = useState(initial.text ?? '')
  const incoming = initial.incoming
  const { speak, speaking, cancel, supported } = useSpeech()
  const dictation = useSpeechRecognition({ onTranscript: setText })
  const avatarRef = useRef<AvatarViewHandle | null>(null)

  const goToAvatar = () => {
    if (dictation.listening) dictation.stop()
    setStage('avatar')
    void addHistory({ direction: 'text-to-sign', text: text.trim(), isDemo: true })
  }

  if (stage === 'avatar') {
    return (
      <div className="page text-to-sign">
        <FlowHeader step={2} totalSteps={4} />

        <p className="text-to-sign__label section-title">Respuesta en senas</p>

        <AvatarView ref={avatarRef} caption={text.trim() || undefined} playing />

        <div className="text-to-sign__controls">
          <button
            type="button"
            className="chip"
            onClick={() => avatarRef.current?.stop()}
          >
            <Icon name="pause" size={16} />
            Detener
          </button>
          <button
            type="button"
            className="chip"
            onClick={() => avatarRef.current?.play()}
          >
            <Icon name="refresh" size={16} />
            Repetir
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

        <Button
          variant="ghost"
          fullWidth
          icon="back"
          onClick={() => setStage('compose')}
        >
          Editar respuesta
        </Button>
      </div>
    )
  }

  return (
    <div className="page text-to-sign">
      <FlowHeader step={1} totalSteps={4} />

      {incoming && (
        <Card className="text-to-sign__incoming">
          <span className="row text-sm text-muted">
            <Icon name="chat" size={16} />
            La otra persona dijo:
          </span>
          <p className="text-to-sign__incoming-text">{incoming}</p>
        </Card>
      )}

      <div className="field">
        <label className="field__label" htmlFor="text-to-sign-input">
          Escribe tu respuesta
        </label>
        <textarea
          id="text-to-sign-input"
          className="field__textarea"
          placeholder="Escribe o dicta lo que quieres decir..."
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
          onClick={goToAvatar}
        >
          Enviar al avatar
        </Button>
        {dictation.supported && (
          <Button
            variant={dictation.listening ? 'dark' : 'secondary'}
            fullWidth
            icon={dictation.listening ? 'pause' : 'mic'}
            onClick={dictation.listening ? dictation.stop : dictation.start}
          >
            {dictation.listening ? 'Escuchando... toca para terminar' : 'Dictar respuesta'}
          </Button>
        )}
        {dictation.error && <p className="text-sm text-muted">{dictation.error}</p>}
      </div>

      <p className="demo-note">
        La conversion de espanol a Lengua de Senas Peruana requiere un modelo y
        animaciones validadas; aun no esta disponible.
      </p>
    </div>
  )
}
