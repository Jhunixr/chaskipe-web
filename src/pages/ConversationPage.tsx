import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Mascot } from '@/components/brand'
import { Button, Icon } from '@/components/ui'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { addHistory } from '@/services/api'
import {
  loadConversation,
  newMessage,
  saveConversation,
  SITUATIONS,
  clearSpelled,
  peekSpelled,
  type ChatMessage,
  type Speaker,
} from '@/services/conversation'
import { formatTime } from '@/utils/format'

import './ConversationPage.css'
import './pages.css'

/**
 * Conversacion cara a cara con un solo telefono entre una persona sorda y una
 * persona oyente.
 *
 * - Persona sorda: escribe, toca una frase sugerida o deletrea con la camara
 *   (abecedario LSP). La app lo lee en voz alta.
 * - Persona oyente: habla al microfono (dictado) o escribe. Su mensaje se
 *   muestra en letra grande y puede verse con el avatar (gesto DEMO).
 *
 * La conversacion se guarda en el dispositivo y cada mensaje va al historial.
 */
export function ConversationPage() {
  const navigate = useNavigate()
  const { speak, supported: canSpeak } = useSpeech()
  const [messages, setMessages] = useState<ChatMessage[]>(loadConversation)
  const [speaker, setSpeaker] = useState<Speaker>('sorda')
  // Texto deletreado con la camara ("Senas a texto" -> "Enviar a la conversacion").
  // Se lee sin borrar (StrictMode llama dos veces al inicializador) y se
  // borra en el efecto de abajo.
  const [draft, setDraft] = useState(() => peekSpelled() ?? '')
  // El dictado va llenando el borrador de la persona oyente.
  const dictation = useSpeechRecognition({ onTranscript: setDraft })
  const [situationId, setSituationId] = useState(SITUATIONS[0]!.id)
  const situation = SITUATIONS.find((s) => s.id === situationId) ?? SITUATIONS[0]!

  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => clearSpelled(), [])

  useEffect(() => {
    saveConversation(messages)
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const send = (from: Speaker, raw: string) => {
    const text = raw.trim()
    if (!text) return
    if (dictation.listening) dictation.stop()
    dictation.reset()
    const msg = newMessage(from, text)
    setMessages((list) => [...list, msg])
    setDraft('')
    if (from === 'sorda') speak(text)
    void addHistory({
      direction: from === 'sorda' ? 'sign-to-text' : 'text-to-sign',
      text,
      isDemo: true,
    })
  }

  const changeSpeaker = (next: Speaker) => {
    if (next === speaker) return
    if (dictation.listening) dictation.stop()
    dictation.reset()
    setDraft('')
    setSpeaker(next)
  }

  const clearConversation = () => {
    if (messages.length > 0 && !window.confirm('¿Empezar una conversacion nueva?')) return
    setMessages([])
    setDraft('')
  }

  const suggestions = speaker === 'sorda' ? situation.sorda : situation.oyente

  return (
    <div className="page conversation">
      <header className="conversation__header">
        <h1>Conversacion</h1>
        <button
          type="button"
          className="chip"
          onClick={clearConversation}
          disabled={messages.length === 0}
        >
          <Icon name="refresh" size={16} />
          Nueva
        </button>
      </header>

      <div className="conversation__situations" role="tablist" aria-label="Situacion">
        {SITUATIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === situationId}
            className={`chip${s.id === situationId ? ' chip--active' : ''}`}
            onClick={() => setSituationId(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <section className="conversation__thread" aria-live="polite" aria-label="Mensajes">
        {messages.length === 0 ? (
          <div className="conversation__empty">
            <Mascot size={64} alt="" />
            <p>
              Pon el telefono entre las dos personas. Quien habla elige su lado
              abajo: <strong>Yo</strong> (persona sorda) o{' '}
              <strong>Persona oyente</strong>.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <article
              key={m.id}
              className={`conversation__bubble conversation__bubble--${m.from}`}
            >
              <span className="conversation__bubble-who">
                <Icon name={m.from === 'sorda' ? 'hands' : 'mic'} size={14} />
                {m.from === 'sorda' ? 'Yo' : 'Persona oyente'} · {formatTime(m.at)}
              </span>
              <p className="conversation__bubble-text">{m.text}</p>
              <div className="conversation__bubble-actions">
                {m.from === 'sorda' ? (
                  <button
                    type="button"
                    onClick={() => speak(m.text)}
                    disabled={!canSpeak}
                    aria-label="Leer en voz alta otra vez"
                  >
                    <Icon name="volume" size={16} />
                    Repetir voz
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.textToSign, { state: { text: m.text } })}
                  >
                    <Icon name="hands" size={16} />
                    Ver con avatar
                  </button>
                )}
              </div>
            </article>
          ))
        )}
        <div ref={endRef} className="conversation__end" />
      </section>

      <section className={`conversation__composer conversation__composer--${speaker}`}>
        <div className="segmented conversation__who" role="tablist" aria-label="Quien habla">
          <button
            type="button"
            role="tab"
            aria-selected={speaker === 'sorda'}
            className={`segmented__option${speaker === 'sorda' ? ' segmented__option--active' : ''}`}
            onClick={() => changeSpeaker('sorda')}
          >
            Yo (persona sorda)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={speaker === 'oyente'}
            className={`segmented__option${speaker === 'oyente' ? ' segmented__option--active' : ''}`}
            onClick={() => changeSpeaker('oyente')}
          >
            Persona oyente
          </button>
        </div>

        <div className="conversation__suggestions">
          {suggestions.map((text) => (
            <button
              key={text}
              type="button"
              className="chip"
              onClick={() => (text.includes('…') ? setDraft(text.replace('…', '')) : send(speaker, text))}
            >
              {text}
            </button>
          ))}
        </div>

        <textarea
          className="field__textarea conversation__draft"
          placeholder={
            speaker === 'sorda'
              ? 'Escribe lo que quieres decir...'
              : 'Lo que dice la persona oyente...'
          }
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label="Escribe el mensaje"
          rows={1}
        />
        {speaker === 'oyente' && !dictation.supported && (
          <p className="text-xs text-muted">
            Este navegador no permite dictar por voz: escribe el mensaje.
          </p>
        )}
        {dictation.error && <p className="text-xs text-muted">{dictation.error}</p>}

        <div className="conversation__send-row">
          {speaker === 'sorda' ? (
            <Button
              variant="secondary"
              icon="camera"
              onClick={() => navigate(ROUTES.signToText, { state: { from: 'conversation' } })}
            >
              Deletrear
            </Button>
          ) : (
            dictation.supported && (
              <Button
                variant={dictation.listening ? 'dark' : 'secondary'}
                icon={dictation.listening ? 'pause' : 'mic'}
                onClick={dictation.listening ? dictation.stop : dictation.start}
              >
                {dictation.listening ? 'Escuchando' : 'Hablar'}
              </Button>
            )
          )}
          <Button
            icon={speaker === 'sorda' ? 'volume' : 'send'}
            fullWidth
            onClick={() => send(speaker, draft)}
            disabled={draft.trim() === ''}
          >
            {speaker === 'sorda' ? 'Enviar y leer' : 'Enviar'}
          </Button>
        </div>
      </section>

    </div>
  )
}
