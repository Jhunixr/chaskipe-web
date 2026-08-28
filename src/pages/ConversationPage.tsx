import { PageHeader } from '@/components/ui'
import { CONVERSATION_MESSAGES } from '@/services/mockData'
import { directionLabel, formatDateTime } from '@/utils/format'

import './ConversationPage.css'
import './pages.css'

/**
 * Vista conceptual de conversacion bidireccional:
 * senas -> texto (entrante) y texto -> senas (saliente).
 * FASE 1: mensajes de ejemplo (mock), sin reconocimiento ni avatar reales.
 */
export function ConversationPage() {
  return (
    <div className="page conversation">
      <PageHeader
        title="Conversacion"
        subtitle="Senas a texto y texto a senas en un mismo lugar."
        showBack={false}
      />

      <div className="conversation__legend text-sm text-muted">
        <span>
          <span className="conversation__dot conversation__dot--in" aria-hidden="true" />
          Persona con LSP
        </span>
        <span>
          <span className="conversation__dot conversation__dot--out" aria-hidden="true" />
          Persona oyente
        </span>
      </div>

      <ol className="conversation__thread">
        {CONVERSATION_MESSAGES.map((message) => (
          <li
            key={message.id}
            className={[
              'conversation__message',
              message.direction === 'sign-to-text'
                ? 'conversation__message--in'
                : 'conversation__message--out',
            ].join(' ')}
          >
            <p className="conversation__text">{message.text}</p>
            <span className="conversation__meta">
              {directionLabel(message.direction)} · {formatDateTime(message.createdAt)}
              {message.isDemo ? ' · demo' : ''}
            </span>
          </li>
        ))}
      </ol>

      <p className="demo-note">
        Conversacion de ejemplo. El reconocimiento de senas y el avatar se
        integran en fases posteriores.
      </p>
    </div>
  )
}
