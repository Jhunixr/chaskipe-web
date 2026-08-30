/**
 * Datos de ejemplo (mock) para la FASE 1.
 *
 * IMPORTANTE:
 * - No hay backend ni base de datos todavia (React -> FastAPI -> PostgreSQL en fases futuras).
 * - Todo lo relacionado con senas LSP esta marcado con `isDemo: true`: es demostrativo
 *   y no ha sido validado con personas usuarias de LSP ni interpretes.
 * - La gramatica de LSP NO coincide con la del espanol; estos textos son solo
 *   equivalencias aproximadas para la interfaz.
 */

import type {
  ConversationMessage,
  HistoryEntry,
  QuickPhraseGroup,
  UserProfile,
} from '@/types'

export const DEMO_USER: UserProfile = {
  name: 'Andersson',
  email: 'andersson@example.pe',
}

export const QUICK_PHRASE_GROUPS: QuickPhraseGroup[] = [
  {
    category: 'saludos',
    label: 'Saludos',
    phrases: [
      { id: 'ph-hola', text: 'Hola', category: 'saludos', isDemo: true },
      { id: 'ph-gracias', text: 'Gracias', category: 'saludos', isDemo: true },
      { id: 'ph-por-favor', text: 'Por favor', category: 'saludos', isDemo: true },
    ],
  },
  {
    category: 'necesidades',
    label: 'Necesidades',
    phrases: [
      {
        id: 'ph-ayuda',
        text: 'Necesito ayuda',
        category: 'necesidades',
        isDemo: true,
      },
      {
        id: 'ph-no-entiendo',
        text: 'No entiendo',
        category: 'necesidades',
        isDemo: true,
      },
      {
        id: 'ph-bano',
        text: '¿Donde esta el bano?',
        category: 'necesidades',
        isDemo: true,
      },
    ],
  },
  {
    category: 'emergencias',
    label: 'Emergencias',
    phrases: [
      {
        id: 'ph-emergencias',
        text: 'Llame a emergencias',
        category: 'emergencias',
        isDemo: true,
      },
    ],
  },
]

export const HISTORY_ENTRIES: HistoryEntry[] = [
  {
    id: 'h-1',
    direction: 'sign-to-text',
    text: 'Necesito ayuda',
    createdAt: '2026-08-27T14:32:00-05:00',
    isDemo: true,
  },
  {
    id: 'h-2',
    direction: 'text-to-sign',
    text: 'Estoy bien, gracias.',
    createdAt: '2026-08-27T14:35:00-05:00',
    isDemo: true,
  },
  {
    id: 'h-3',
    direction: 'sign-to-text',
    text: 'Hola',
    createdAt: '2026-08-26T09:10:00-05:00',
    isDemo: true,
  },
]

export const CONVERSATION_MESSAGES: ConversationMessage[] = [
  {
    id: 'c-1',
    direction: 'sign-to-text',
    text: 'Hola, buenos dias',
    createdAt: '2026-08-28T10:00:00-05:00',
    isDemo: true,
  },
  {
    id: 'c-2',
    direction: 'text-to-sign',
    text: 'Hola, ¿en que puedo ayudarte?',
    createdAt: '2026-08-28T10:00:20-05:00',
    isDemo: true,
  },
  {
    id: 'c-3',
    direction: 'sign-to-text',
    text: 'Necesito ayuda',
    createdAt: '2026-08-28T10:00:45-05:00',
    isDemo: true,
  },
]

/** Frase entrante de ejemplo en el flujo "texto a senas". */
export const DEMO_INCOMING_PROMPT = '¿Como estas?'

/** Respuesta de ejemplo prellenada en el campo de texto. */
export const DEMO_REPLY_TEXT = 'Estoy bien, gracias.'
