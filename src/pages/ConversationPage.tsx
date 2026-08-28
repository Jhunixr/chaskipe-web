import { useState } from 'react'

import { Mascot } from '@/components/brand'
import { Button, Icon } from '@/components/ui'
import { useSpeech } from '@/hooks/useSpeech'

import './ConversationPage.css'
import './pages.css'

/**
 * Vista conceptual de conversacion bidireccional:
 * senas -> texto (entrante) y texto -> senas (saliente).
 * FASE 1: contenido de ejemplo, sin reconocimiento ni avatar reales.
 */
export function ConversationPage() {
  const [reply, setReply] = useState('De nada')
  const { speak, supported } = useSpeech()

  return (
    <div className="page conversation">
      <header className="conversation__header">
        <h1>Conversacion</h1>
        <span className="conversation__live">
          <span className="conversation__live-dot" aria-hidden="true" />
          En vivo
        </span>
      </header>

      <section className="conversation__panel conversation__panel--in">
        <span className="conversation__panel-title">
          <Icon name="hands" size={16} />
          Senas a texto
        </span>
        <div className="conversation__in-body">
          <span className="conversation__avatar" aria-hidden="true">
            <Mascot size={44} alt="" />
          </span>
          <div>
            <span className="text-xs text-muted">Texto detectado:</span>
            <p className="conversation__detected">Gracias</p>
            <span className="text-xs text-muted">Ahora</span>
          </div>
        </div>
      </section>

      <div className="conversation__swap" aria-hidden="true">
        <Icon name="swap" size={18} />
      </div>

      <section className="conversation__panel conversation__panel--out">
        <span className="conversation__panel-title">
          <Icon name="chat" size={16} />
          Texto a senas
        </span>
        <span className="text-xs text-muted">Tu respuesta:</span>
        <input
          className="conversation__reply"
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          aria-label="Tu respuesta"
        />
        <div className="conversation__out-actions">
          <Button icon="send" disabled={reply.trim() === ''}>
            Enviar
          </Button>
          <button
            type="button"
            className="conversation__icon-btn"
            onClick={() => speak(reply)}
            disabled={!supported}
            aria-label="Escuchar respuesta"
          >
            <Icon name="volume" size={20} />
          </button>
        </div>
      </section>

      <p className="demo-note">
        Conversacion de ejemplo. El reconocimiento de senas y el avatar se
        integran en fases posteriores.
      </p>
    </div>
  )
}
