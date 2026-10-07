import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { AvatarView, type AvatarViewHandle } from '@/components/avatar'
import { Button, Icon, PageHeader } from '@/components/ui'
import { addHistory } from '@/services/api'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

import './TextToSignPage.css'
import './pages.css'

type Stage = 'compose' | 'avatar'

/** Lo que otras pantallas pueden pasar por el `state` del router. */
interface TextToSignState {
  /** Texto a mostrar directamente con el avatar (Frases, Conversacion, Aprende). */
  text?: string
  /** Lo que dijo la otra persona, para mostrarlo arriba. */
  incoming?: string
}

/**
 * "Hablo o escribo": la persona oyente habla (dictado del navegador) o
 * escribe, y Chaski lo muestra en señas.
 *
 * Chaski deletrea con el abecedario manual de la LSP y usa las señas
 * completas que ya estan grabadas; NO hay traduccion real de español a LSP.
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
        <PageHeader title="Chaski te lo dice" />

        <p className="text-to-sign__said">
          <Icon name="mic" size={22} />
          {text.trim()}
        </p>

        <AvatarView ref={avatarRef} spell={text.trim() || undefined} playing />

        <div className="text-to-sign__controls">
          <button
            type="button"
            className="text-to-sign__round"
            onClick={() => avatarRef.current?.play()}
            aria-label="Repetir"
          >
            <Icon name="refresh" size={28} />
          </button>
          <Button
            variant="secondary"
            size="lg"
            icon="pause"
            className="text-to-sign__grow"
            onClick={() => avatarRef.current?.stop()}
          >
            Detener
          </Button>
          <button
            type="button"
            className="text-to-sign__round text-to-sign__round--teal"
            onClick={() => (speaking ? cancel() : speak(text))}
            disabled={!supported}
            aria-label={speaking ? 'Pausar voz' : 'Escuchar voz'}
          >
            <Icon name={speaking ? 'pause' : 'volume'} size={28} />
          </button>
        </div>

        <Button variant="ghost" fullWidth icon="edit" onClick={() => setStage('compose')}>
          Cambiar el texto
        </Button>
      </div>
    )
  }

  return (
    <div className="page text-to-sign">
      <PageHeader title="Hablo o escribo" />

      {incoming && (
        <p className="text-to-sign__incoming">
          <span className="section-title">La otra persona dijo</span>
          {incoming}
        </p>
      )}

      {dictation.supported && (
        <button
          type="button"
          className={`text-to-sign__mic${dictation.listening ? ' text-to-sign__mic--live' : ''}`}
          onClick={dictation.listening ? dictation.stop : dictation.start}
        >
          <span className="text-to-sign__mic-icon">
            <Icon name={dictation.listening ? 'pause' : 'mic'} size={36} />
          </span>
          {dictation.listening ? 'Escuchando… toca para terminar' : 'Toca y habla'}
        </button>
      )}
      {dictation.error && <p className="text-sm text-muted">{dictation.error}</p>}

      <div className="field">
        <label className="field__label" htmlFor="text-to-sign-input">
          {dictation.supported ? 'O escribe aquí' : 'Escribe lo que quieres decir'}
        </label>
        <textarea
          id="text-to-sign-input"
          className="field__textarea"
          placeholder="Por ejemplo: Hola, ¿cómo estás?"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <Button size="lg" fullWidth icon="hands" disabled={text.trim() === ''} onClick={goToAvatar}>
        Que Chaski lo diga en señas
      </Button>

      <p className="demo-note">
        Chaski deletrea con el abecedario de la LSP y usa las señas que ya están
        grabadas. La traducción completa de español a LSP aún no está disponible.
      </p>
    </div>
  )
}
