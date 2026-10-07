import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { AvatarView, type AvatarViewHandle } from '@/components/avatar'
import { SignReader, type LiveSign } from '@/components/conversation/SignReader'
import { Icon } from '@/components/ui'
import { usePreferences } from '@/hooks/usePreferences'
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

import './ConversarPage.css'
import './pages.css'

type Turn = 'habla' | 'respondes' | 'muestra'

/** Respuestas habituales de la persona oyente. */
const QUICK_REPLIES = ['Un momento, por favor', 'Sí', 'No', 'Sígame', '¿Me lo puede escribir?']

const NO_LIVE: LiveSign = { candidate: null, progress: 0, status: null }

function lastFrom(messages: ChatMessage[], who: Speaker): ChatMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]!.from === who) return messages[i]
  }
  return undefined
}

/**
 * Conversacion bidireccional por turnos. El celular lo usa la persona oyente.
 *
 * 1. «Te habla»: la camara trasera apunta a la persona sorda; sus señas (o su
 *    deletreo) se vuelven texto en grande.
 * 2. «Respondes»: la persona oyente habla (dictado) o escribe.
 * 3. «Chaski»: se gira el celular hacia la persona sorda y Chaski se lo dice
 *    en LSP, con subtitulos debajo para no tapar sus manos.
 *
 * Los mensajes se guardan en el mismo historial que Conversacion.
 */
export function ConversarPage() {
  const navigate = useNavigate()
  const [turn, setTurn] = useState<Turn>('habla')
  const [messages, setMessages] = useState<ChatMessage[]>(loadConversation)
  const [deafText, setDeafText] = useState('')
  const [live, setLive] = useState<LiveSign>(NO_LIVE)
  const [draft, setDraft] = useState('')
  const { speak, speaking, cancel, supported: canSpeak } = useSpeech()
  const dictation = useSpeechRecognition({ onTranscript: setDraft })
  const avatarRef = useRef<AvatarViewHandle | null>(null)
  const { prefs, set } = usePreferences()

  useEffect(() => saveConversation(messages), [messages])

  const send = (from: Speaker, raw: string) => {
    const text = raw.trim()
    if (!text) return
    setMessages((list) => [...list, newMessage(from, text)])
    void addHistory({
      direction: from === 'sorda' ? 'sign-to-text' : 'text-to-sign',
      text,
      isDemo: true,
    })
  }

  const onSign = useCallback(
    (piece: string, mode: ModelKind) => setDeafText((t) => appendPiece(t, piece, mode)),
    [],
  )

  const fromDeaf = lastFrom(messages, 'sorda')
  const fromHearing = lastFrom(messages, 'oyente')

  const goRespond = () => {
    const text = deafText.trim()
    if (text) {
      send('sorda', text)
      speak(text)
    }
    setDeafText('')
    setLive(NO_LIVE)
    setTurn('respondes')
  }

  const showInSigns = () => {
    if (dictation.listening) dictation.stop()
    dictation.reset()
    send('oyente', draft)
    setDraft('')
    setTurn('muestra')
  }

  const backToSigns = () => {
    avatarRef.current?.stop()
    cancel()
    setTurn('habla')
  }

  const toggleMic = () => {
    if (dictation.listening) {
      dictation.stop()
      return
    }
    setDraft('')
    dictation.start()
  }

  const slow = prefs.avatarSpeed === 'lenta'

  const exit = () => navigate(ROUTES.home)

  if (turn === 'muestra') {
    return (
      <div className="conversar conversar--muestra">
        <div className="conversar__top">
          <span className="conversar__pill">
            <Icon name="eye" size={18} />
            Para la persona sorda
          </span>
          <button
            type="button"
            className="conversar__icon-btn"
            onClick={() => setTurn('respondes')}
            aria-label="Volver a responder"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="conversar__stage">
          <AvatarView
            ref={avatarRef}
            spell={fromHearing?.text}
            caption={fromHearing?.text}
            playing
            compact
            captionBelow
          />
        </div>

        <div className="conversar__row">
          <button
            type="button"
            className="conversar__square conversar__square--red"
            onClick={() => avatarRef.current?.play()}
            aria-label="Repetir"
          >
            <Icon name="refresh" size={28} />
          </button>
          <button
            type="button"
            className={`conversar__wide${slow ? ' conversar__wide--on' : ''}`}
            aria-pressed={slow}
            onClick={() => set('avatarSpeed', slow ? 'normal' : 'lenta')}
          >
            <Icon name="clock" size={24} />
            Más lento
          </button>
        </div>

        <button type="button" className="conversar__big conversar__big--gold" onClick={backToSigns}>
          <Icon name="hands" size={26} />
          Listo · te toca
        </button>
      </div>
    )
  }

  const turnSwitch = (
    <div className="conversar__switch" role="tablist" aria-label="Turno">
      <button
        type="button"
        role="tab"
        aria-selected={turn === 'habla'}
        className={`conversar__turn${turn === 'habla' ? ' conversar__turn--habla' : ''}`}
        onClick={() => setTurn('habla')}
      >
        <Icon name="hands" size={18} />
        Te habla
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={turn === 'respondes'}
        className={`conversar__turn${turn === 'respondes' ? ' conversar__turn--respondes' : ''}`}
        onClick={goRespond}
      >
        <Icon name="mic" size={18} />
        Respondes
      </button>
    </div>
  )

  if (turn === 'habla') {
    return (
      <div className="conversar conversar--habla">
        <div className="conversar__top">
          <button type="button" className="conversar__icon-btn conversar__icon-btn--dark" onClick={exit} aria-label="Salir">
            <Icon name="close" size={22} />
          </button>
          {turnSwitch}
        </div>

        <p className="conversar__hint">
          <Icon name="camera" size={16} />
          Apunta la cámara a la persona sorda
        </p>

        <SignReader facing="environment" onSign={onSign} onLive={setLive} />

        <section className="conversar__panel" aria-live="polite">
          <div className="conversar__panel-head">
            <span className="section-title">Te está diciendo</span>
            <button
              type="button"
              className="conversar__chip-btn"
              onClick={() => (speaking ? cancel() : speak(deafText))}
              disabled={!canSpeak || !deafText.trim()}
            >
              <Icon name="volume" size={16} />
              Decir en voz alta
            </button>
          </div>
          <p className="conversar__said">
            {deafText}
            {live.candidate && <span className="conversar__candidate">{live.candidate}</span>}
            {!deafText && !live.candidate && (
              <span className="conversar__placeholder">{live.status ?? 'Esperando señas…'}</span>
            )}
          </p>
          <div className="conversar__edit">
            <button
              type="button"
              className="conversar__square"
              onClick={() => setDeafText((t) => t.slice(0, -1))}
              disabled={!deafText}
              aria-label="Borrar letra"
            >
              <Icon name="backspace" size={24} />
            </button>
            <button
              type="button"
              className="conversar__square"
              onClick={() => setDeafText((t) => (t && !t.endsWith(' ') ? `${t} ` : t))}
              disabled={!deafText}
              aria-label="Espacio"
            >
              <span className="conversar__space" aria-hidden="true" />
            </button>
            <button type="button" className="conversar__big conversar__big--teal" onClick={goRespond}>
              <Icon name="mic" size={24} />
              Tu turno: responder
            </button>
          </div>
        </section>
      </div>
    )
  }

  // turno «respondes»
  return (
    <div className="conversar conversar--respondes">
      <div className="conversar__top">
        <button type="button" className="conversar__icon-btn" onClick={exit} aria-label="Salir">
          <Icon name="close" size={22} />
        </button>
        {turnSwitch}
      </div>

      {fromDeaf && (
        <div className="conversar__deaf-said">
          <span>Te dijo en señas</span>
          <strong>{fromDeaf.text}</strong>
        </div>
      )}

      {dictation.supported ? (
        <div className="conversar__mic-wrap">
          <button
            type="button"
            className={`conversar__mic${dictation.listening ? ' conversar__mic--live' : ''}`}
            onClick={toggleMic}
            aria-label={dictation.listening ? 'Terminar de hablar' : 'Toca y habla'}
          >
            <Icon name={dictation.listening ? 'pause' : 'mic'} size={52} />
          </button>
          <span className="conversar__mic-label">
            {dictation.listening ? 'Escuchando… toca para terminar' : 'Toca y habla'}
          </span>
        </div>
      ) : (
        <p className="text-sm text-muted">Este navegador no permite dictar: escribe tu respuesta.</p>
      )}
      {dictation.error && <p className="text-sm text-muted">{dictation.error}</p>}

      <textarea
        className="conversar__draft"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="O escribe tu respuesta"
        aria-label="Tu respuesta"
        rows={2}
      />

      <div className="chip-row" aria-label="Respuestas rápidas">
        {QUICK_REPLIES.map((text) => (
          <button key={text} type="button" className="chip" onClick={() => setDraft(text)}>
            {text}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="conversar__big conversar__big--red conversar__bottom"
        onClick={showInSigns}
        disabled={!draft.trim()}
      >
        <Icon name="hands" size={26} />
        Mostrar en señas
      </button>
    </div>
  )
}
