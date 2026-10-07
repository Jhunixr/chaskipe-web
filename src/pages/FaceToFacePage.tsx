import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { AvatarView } from '@/components/avatar'
import { ChaskiFigure } from '@/components/brand'
import { Icon } from '@/components/ui'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { addHistory } from '@/services/api'
import {
  clearSpelled,
  loadConversation,
  newMessage,
  peekSpelled,
  saveConversation,
  SITUATIONS,
  type ChatMessage,
  type Speaker,
} from '@/services/conversation'

import './FaceToFacePage.css'
import './pages.css'

/** Frases para la persona sorda: todas las situaciones, sin repetir. */
const DEAF_PHRASES = [...new Set(SITUATIONS.flatMap((s) => s.sorda))].filter(
  (t) => !t.includes('…'),
)

function lastFrom(messages: ChatMessage[], who: Speaker): ChatMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]!.from === who) return messages[i]
  }
  return undefined
}

/**
 * Cara a cara: el celular queda en la mesa, entre las dos personas.
 *
 * - Mitad de arriba (girada 180°): para la persona oyente. Ve en grande lo
 *   que dijo la persona sorda y responde hablando o escribiendo.
 * - Mitad de abajo: para la persona sorda. Chaski deletrea en LSP lo que dijo
 *   la persona oyente; responde con señas (camara), con una frase o
 *   escribiendo, y la app lo lee en voz alta.
 *
 * Comparte los mensajes con "Conversacion" (mismo almacenamiento local).
 */
export function FaceToFacePage() {
  const navigate = useNavigate()
  const { speak } = useSpeech()
  // Texto deletreado con la camara ("Responder"): llega como mensaje de la
  // persona sorda. Se lee sin borrar (StrictMode llama dos veces a los
  // inicializadores) y se borra en el efecto de abajo.
  const [spelled] = useState(peekSpelled)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const list = loadConversation()
    return spelled ? [...list, newMessage('sorda', spelled)] : list
  })
  const [hearingDraft, setHearingDraft] = useState('')
  const [hearingTyping, setHearingTyping] = useState(false)
  const [deafPanel, setDeafPanel] = useState<'none' | 'phrases' | 'write'>('none')
  const [deafDraft, setDeafDraft] = useState('')
  const dictation = useSpeechRecognition({ onTranscript: setHearingDraft })

  const send = (from: Speaker, raw: string) => {
    const text = raw.trim()
    if (!text) return
    setMessages((list) => [...list, newMessage(from, text)])
    if (from === 'sorda') speak(text)
    void addHistory({
      direction: from === 'sorda' ? 'sign-to-text' : 'text-to-sign',
      text,
      isDemo: true,
    })
  }

  // ...y se lee en voz alta una sola vez.
  const spelledDoneRef = useRef(false)
  useEffect(() => {
    if (!spelled || spelledDoneRef.current) return
    spelledDoneRef.current = true
    clearSpelled()
    speak(spelled)
    void addHistory({ direction: 'sign-to-text', text: spelled, isDemo: true })
  }, [spelled, speak])

  useEffect(() => saveConversation(messages), [messages])

  const fromDeaf = lastFrom(messages, 'sorda')
  const fromHearing = lastFrom(messages, 'oyente')

  const sendHearing = () => {
    if (dictation.listening) dictation.stop()
    dictation.reset()
    send('oyente', hearingDraft)
    setHearingDraft('')
    setHearingTyping(false)
  }

  const toggleMic = () => {
    if (dictation.listening) {
      dictation.stop()
      return
    }
    setHearingDraft('')
    dictation.start()
  }

  const sendDeaf = (text: string) => {
    send('sorda', text)
    setDeafDraft('')
    setDeafPanel('none')
  }

  return (
    <div className="face">
      <section className="face__hearing" aria-label="Lado de la persona oyente (girado hacia ella)">
        <div className="face__hearing-inner">
          <span className="face__label">
            <Icon name="hands" size={18} />
            Te dice en señas
          </span>
          <p className="face__said" aria-live="polite">
            {fromDeaf ? fromDeaf.text : 'Aquí verás lo que te dice la otra persona.'}
          </p>

          {(hearingDraft || dictation.listening) && !hearingTyping && (
            <p className="face__draft">
              {hearingDraft || 'Escuchando…'}
            </p>
          )}
          {hearingTyping && (
            <textarea
              className="face__input"
              value={hearingDraft}
              onChange={(e) => setHearingDraft(e.target.value)}
              placeholder="Escribe tu respuesta…"
              aria-label="Respuesta de la persona oyente"
              rows={2}
              autoFocus
            />
          )}
          {dictation.error && <p className="face__hint">{dictation.error}</p>}

          <div className="face__hearing-actions">
            {hearingDraft.trim() && !dictation.listening ? (
              <button type="button" className="face__btn face__btn--white" onClick={sendHearing}>
                <Icon name="send" size={26} />
                Enviar
              </button>
            ) : dictation.supported ? (
              <button
                type="button"
                className={`face__btn face__btn--white${dictation.listening ? ' face__btn--live' : ''}`}
                onClick={toggleMic}
              >
                <Icon name={dictation.listening ? 'pause' : 'mic'} size={28} />
                {dictation.listening ? 'Listo' : 'Toca y habla'}
              </button>
            ) : (
              <p className="face__hint">Este navegador no permite dictar: escribe.</p>
            )}
            <button
              type="button"
              className="face__btn face__btn--glass"
              aria-label={hearingTyping ? 'Cerrar teclado' : 'Escribir'}
              aria-pressed={hearingTyping}
              onClick={() => {
                if (dictation.listening) dictation.stop()
                setHearingTyping((v) => !v)
              }}
            >
              <Icon name={hearingTyping ? 'close' : 'keyboard'} size={28} />
            </button>
          </div>
        </div>
      </section>

      <div className="face__divider">
        <span className="face__divider-chaski" aria-hidden="true">
          <ChaskiFigure width={36} />
        </span>
        <span>Cara a cara</span>
        <Link to={ROUTES.conversation} className="face__divider-btn" aria-label="Ver como chat">
          <Icon name="chat" size={18} />
        </Link>
        <Link to={ROUTES.home} className="face__divider-btn" aria-label="Salir">
          <Icon name="close" size={18} />
        </Link>
      </div>

      <section className="face__deaf" aria-label="Lado de la persona sorda">
        <div className="face__stage">
          <AvatarView compact playing spell={fromHearing?.text} />
          {!fromHearing && (
            <p className="face__stage-empty">Pídele a la otra persona que te hable.</p>
          )}
        </div>

        {deafPanel === 'phrases' && (
          <div className="chip-row face__phrases" aria-label="Frases">
            {DEAF_PHRASES.map((text) => (
              <button key={text} type="button" className="chip" onClick={() => sendDeaf(text)}>
                {text}
              </button>
            ))}
          </div>
        )}
        {deafPanel === 'write' && (
          <form
            className="face__write"
            onSubmit={(e) => {
              e.preventDefault()
              sendDeaf(deafDraft)
            }}
          >
            <input
              className="face__write-input"
              value={deafDraft}
              onChange={(e) => setDeafDraft(e.target.value)}
              placeholder="Escribe lo que quieres decir"
              aria-label="Escribe lo que quieres decir"
              autoFocus
            />
            <button type="submit" className="face__send" aria-label="Decir en voz alta" disabled={!deafDraft.trim()}>
              <Icon name="volume" size={24} />
            </button>
          </form>
        )}

        <div className="face__deaf-actions">
          <button
            type="button"
            className="face__btn face__btn--red"
            onClick={() => navigate(ROUTES.signToText, { state: { from: 'face-to-face' } })}
          >
            <Icon name="hands" size={26} />
            Responder
          </button>
          <button
            type="button"
            className={`face__btn face__btn--card${deafPanel === 'phrases' ? ' face__btn--on' : ''}`}
            aria-pressed={deafPanel === 'phrases'}
            onClick={() => setDeafPanel((p) => (p === 'phrases' ? 'none' : 'phrases'))}
          >
            Frases
          </button>
          <button
            type="button"
            className={`face__btn face__btn--card face__btn--square${deafPanel === 'write' ? ' face__btn--on' : ''}`}
            aria-label="Escribir"
            aria-pressed={deafPanel === 'write'}
            onClick={() => setDeafPanel((p) => (p === 'write' ? 'none' : 'write'))}
          >
            <Icon name="keyboard" size={24} />
          </button>
        </div>
      </section>
    </div>
  )
}
