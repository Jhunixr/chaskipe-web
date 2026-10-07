import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { AvatarView } from '@/components/avatar'
import { SignReader, type LiveSign } from '@/components/conversation/SignReader'
import { Icon } from '@/components/ui'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { addHistory } from '@/services/api'
import {
  appendPiece,
  loadConversation,
  newMessage,
  saveConversation,
  type ChatMessage,
  type Speaker,
} from '@/services/conversation'
import type { ModelKind } from '@/services/signModel'

import './TableModePage.css'
import './pages.css'

const NO_LIVE: LiveSign = { candidate: null, progress: 0, status: null }

/**
 * Modo mesa: el celular queda parado (en un soporte) mirando a la persona
 * sorda. Ella ve a Chaski y la camara frontal la ve a ella; la persona oyente
 * solo habla y escucha.
 *
 * - La persona oyente toca el microfono y habla; al terminar, Chaski se lo
 *   dice en señas.
 * - La persona sorda hace señas o deletrea y toca «Decir»: el celular lo dice
 *   en voz alta.
 */
export function TableModePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadConversation)
  const [deafText, setDeafText] = useState('')
  const [live, setLive] = useState<LiveSign>(NO_LIVE)
  const [heard, setHeard] = useState('')
  const { speak, supported: canSpeak } = useSpeech()
  const dictation = useSpeechRecognition({ onTranscript: setHeard })

  useEffect(() => saveConversation(messages), [messages])

  const send = useCallback((from: Speaker, raw: string) => {
    const text = raw.trim()
    if (!text) return
    setMessages((list) => [...list, newMessage(from, text)])
    void addHistory({
      direction: from === 'sorda' ? 'sign-to-text' : 'text-to-sign',
      text,
      isDemo: true,
    })
  }, [])

  // Al terminar de hablar, Chaski se lo dice en señas a la persona sorda.
  const sendHeard = () => {
    if (dictation.listening) dictation.stop()
    send('oyente', heard)
    setHeard('')
    dictation.reset()
  }

  const onMic = () => {
    if (dictation.listening || heard.trim()) {
      sendHeard()
      return
    }
    dictation.start()
  }

  const onSign = useCallback(
    (piece: string, mode: ModelKind) => setDeafText((t) => appendPiece(t, piece, mode)),
    [],
  )

  const sayIt = () => {
    const text = deafText.trim()
    if (!text) return
    send('sorda', text)
    speak(text)
    setDeafText('')
  }

  let fromHearing: ChatMessage | undefined
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]!.from === 'oyente') {
      fromHearing = messages[i]
      break
    }
  }

  return (
    <div className="mesa">
      <div className="mesa__top">
        <span className="mesa__pill">
          <Icon name="phrases" size={18} />
          Modo mesa
        </span>
        <Link to={ROUTES.home} className="mesa__close" aria-label="Salir">
          <Icon name="close" size={20} />
        </Link>
      </div>

      <div className="mesa__stage">
        <AvatarView
          spell={fromHearing?.text}
          caption={fromHearing?.text ?? 'Hola, soy Chaski'}
          playing
          compact
          captionBelow
        />
      </div>

      <div className="mesa__bottom">
        <div className="mesa__camera">
          <SignReader facing="user" onSign={onSign} onLive={setLive} compact />
        </div>

        <div className="mesa__side">
          <section className="mesa__card mesa__card--teal">
            <span className="mesa__label">
              <Icon name="mic" size={16} />
              Persona oyente
            </span>
            {dictation.supported ? (
              <button
                type="button"
                className={`mesa__mic${dictation.listening ? ' mesa__mic--live' : ''}`}
                onClick={onMic}
              >
                <Icon name={dictation.listening || heard.trim() ? 'send' : 'mic'} size={22} />
                {dictation.listening ? 'Listo' : heard.trim() ? 'Mostrar' : 'Toca y habla'}
              </button>
            ) : (
              <span className="mesa__text">Este navegador no permite dictar.</span>
            )}
            {heard && <span className="mesa__text">{heard}</span>}
          </section>

          <section className="mesa__card mesa__card--red" aria-live="polite">
            <span className="mesa__label">
              <Icon name="hands" size={16} />
              Persona sorda
            </span>
            <span className="mesa__text mesa__text--big">
              {deafText}
              {live.candidate && <span className="mesa__candidate">{live.candidate}</span>}
              {!deafText && !live.candidate && (live.status ?? 'Haz señas a la cámara')}
            </span>
            <div className="mesa__actions">
              <button
                type="button"
                className="mesa__mini"
                onClick={() => setDeafText((t) => t.slice(0, -1))}
                disabled={!deafText}
                aria-label="Borrar letra"
              >
                <Icon name="backspace" size={18} />
              </button>
              <button
                type="button"
                className="mesa__say"
                onClick={sayIt}
                disabled={!canSpeak || !deafText.trim()}
              >
                <Icon name="volume" size={18} />
                Decir
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
