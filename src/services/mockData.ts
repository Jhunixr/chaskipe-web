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
  HistoryEntry,
  QuickPhraseGroup,
  UserProfile,
} from '@/types'

export const DEMO_USER: UserProfile = {
  name: 'Andersson',
  email: 'andersson@example.pe',
}

/** Espejo de `_seed_phrases` en `backend/app/services/repository.py`. */
export const QUICK_PHRASE_GROUPS: QuickPhraseGroup[] = [
  {
    category: 'saludos',
    label: "Saludos",
    phrases: [
      { id: 'ph-hola', text: 'Hola', category: 'saludos', isDemo: true },
      { id: 'ph-buenos-dias', text: 'Buenos días', category: 'saludos', isDemo: true },
      { id: 'ph-buenas-tardes', text: 'Buenas tardes', category: 'saludos', isDemo: true },
      { id: 'ph-buenas-noches', text: 'Buenas noches', category: 'saludos', isDemo: true },
      { id: 'ph-gracias', text: 'Gracias', category: 'saludos', isDemo: true },
      { id: 'ph-por-favor', text: 'Por favor', category: 'saludos', isDemo: true },
      { id: 'ph-de-nada', text: 'De nada', category: 'saludos', isDemo: true },
      { id: 'ph-adios', text: 'Adiós, cuídese', category: 'saludos', isDemo: true },
      { id: 'ph-mucho-gusto', text: 'Mucho gusto', category: 'saludos', isDemo: true },
      { id: 'ph-soy-sordo', text: 'Soy una persona sorda, uso lengua de señas', category: 'saludos', isDemo: true },
    ],
  },
  {
    category: 'respuestas',
    label: "Respuestas rapidas",
    phrases: [
      { id: 'ph-si', text: 'Sí', category: 'respuestas', isDemo: true },
      { id: 'ph-no', text: 'No', category: 'respuestas', isDemo: true },
      { id: 'ph-no-se', text: 'No sé', category: 'respuestas', isDemo: true },
      { id: 'ph-espere', text: 'Espere un momento, por favor', category: 'respuestas', isDemo: true },
      { id: 'ph-repita', text: '¿Puede repetirlo, por favor?', category: 'respuestas', isDemo: true },
      { id: 'ph-despacio', text: 'Más despacio, por favor', category: 'respuestas', isDemo: true },
      { id: 'ph-escribalo', text: '¿Puede escribirlo, por favor?', category: 'respuestas', isDemo: true },
      { id: 'ph-entiendo', text: 'Entiendo', category: 'respuestas', isDemo: true },
      { id: 'ph-de-acuerdo', text: 'De acuerdo', category: 'respuestas', isDemo: true },
    ],
  },
  {
    category: 'necesidades',
    label: "Necesidades",
    phrases: [
      { id: 'ph-ayuda', text: 'Necesito ayuda', category: 'necesidades', isDemo: true },
      { id: 'ph-no-entiendo', text: 'No entiendo', category: 'necesidades', isDemo: true },
      { id: 'ph-bano', text: '¿Dónde está el baño?', category: 'necesidades', isDemo: true },
      { id: 'ph-agua', text: 'Quisiera un vaso de agua', category: 'necesidades', isDemo: true },
      { id: 'ph-perdido', text: 'Estoy perdido, ¿me puede ayudar?', category: 'necesidades', isDemo: true },
      { id: 'ph-interprete', text: '¿Hay un intérprete de lengua de señas?', category: 'necesidades', isDemo: true },
      { id: 'ph-cargar-celular', text: '¿Dónde puedo cargar mi celular?', category: 'necesidades', isDemo: true },
    ],
  },
  {
    category: 'salud',
    label: "Salud",
    phrases: [
      { id: 'ph-me-siento-mal', text: 'Me siento mal', category: 'salud', isDemo: true },
      { id: 'ph-me-duele', text: 'Me duele aquí', category: 'salud', isDemo: true },
      { id: 'ph-doctor', text: 'Necesito un médico', category: 'salud', isDemo: true },
      { id: 'ph-alergia', text: 'Soy alérgico a un medicamento', category: 'salud', isDemo: true },
      { id: 'ph-medicina', text: 'Tomo esta medicina', category: 'salud', isDemo: true },
      { id: 'ph-cita', text: 'Tengo una cita médica', category: 'salud', isDemo: true },
      { id: 'ph-farmacia', text: '¿Dónde hay una farmacia?', category: 'salud', isDemo: true },
    ],
  },
  {
    category: 'transporte',
    label: "Transporte",
    phrases: [
      { id: 'ph-como-llego', text: '¿Cómo llego a esta dirección?', category: 'transporte', isDemo: true },
      { id: 'ph-bus', text: '¿Este bus va a…?', category: 'transporte', isDemo: true },
      { id: 'ph-bajo-aqui', text: 'Bajo en el siguiente paradero', category: 'transporte', isDemo: true },
      { id: 'ph-taxi', text: 'Necesito un taxi', category: 'transporte', isDemo: true },
      { id: 'ph-cuanto-pasaje', text: '¿Cuánto es el pasaje?', category: 'transporte', isDemo: true },
    ],
  },
  {
    category: 'compras',
    label: "Compras y tramites",
    phrases: [
      { id: 'ph-cuanto-cuesta', text: '¿Cuánto cuesta?', category: 'compras', isDemo: true },
      { id: 'ph-tarjeta', text: '¿Puedo pagar con tarjeta?', category: 'compras', isDemo: true },
      { id: 'ph-yape', text: '¿Puedo pagar con Yape o Plin?', category: 'compras', isDemo: true },
      { id: 'ph-boleta', text: '¿Me da boleta, por favor?', category: 'compras', isDemo: true },
      { id: 'ph-turno', text: '¿Dónde hago la cola?', category: 'compras', isDemo: true },
      { id: 'ph-dni', text: 'Aquí está mi DNI', category: 'compras', isDemo: true },
    ],
  },
  {
    category: 'emergencias',
    label: "Emergencias",
    phrases: [
      { id: 'ph-emergencias', text: 'Llame a emergencias', category: 'emergencias', isDemo: true },
      { id: 'ph-ambulancia', text: 'Llame a una ambulancia (106)', category: 'emergencias', isDemo: true },
      { id: 'ph-policia', text: 'Llame a la policía (105)', category: 'emergencias', isDemo: true },
      { id: 'ph-bomberos', text: 'Llame a los bomberos (116)', category: 'emergencias', isDemo: true },
      { id: 'ph-robo', text: 'Me robaron', category: 'emergencias', isDemo: true },
      { id: 'ph-accidente', text: 'Hubo un accidente', category: 'emergencias', isDemo: true },
      { id: 'ph-familiar', text: 'Llame a mi familiar, este es su número', category: 'emergencias', isDemo: true },
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
