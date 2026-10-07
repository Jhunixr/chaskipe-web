/**
 * Conversacion entre una persona sorda y una persona oyente.
 *
 * Los mensajes se guardan en este dispositivo (localStorage) para que la
 * conversacion no se pierda al cambiar de pantalla, por ejemplo al ir a
 * deletrear con la camara. Cada mensaje enviado tambien va al historial.
 */

/** Quien dice el mensaje. */
export type Speaker = 'sorda' | 'oyente'

export interface ChatMessage {
  id: string
  from: Speaker
  text: string
  /** ISO 8601 */
  at: string
}

/** Situacion de la conversacion: cambia las frases sugeridas. */
export interface Situation {
  id: string
  label: string
  /** Frases sugeridas para la persona sorda (se leen en voz alta). */
  sorda: string[]
  /** Frases habituales de la persona oyente (por si prefiere tocar en vez de hablar). */
  oyente: string[]
}

export const SITUATIONS: Situation[] = [
  {
    id: 'general',
    label: 'General',
    sorda: [
      'Hola',
      'Soy una persona sorda, uso lengua de señas',
      'Gracias',
      'Sí',
      'No',
      '¿Puede escribirlo, por favor?',
      'Más despacio, por favor',
      'No entiendo',
    ],
    oyente: [
      'Hola, ¿en qué puedo ayudarle?',
      'Un momento, por favor',
      '¿Me lo puede escribir?',
      'Gracias, que le vaya bien',
    ],
  },
  {
    id: 'salud',
    label: 'Salud',
    sorda: [
      'Tengo una cita médica',
      'Me siento mal',
      'Me duele aquí',
      'Soy alérgico a un medicamento',
      'Tomo esta medicina',
      '¿Cada cuántas horas lo tomo?',
      '¿Puede escribir la receta, por favor?',
    ],
    oyente: [
      '¿Qué le duele?',
      '¿Desde cuándo se siente así?',
      '¿Es alérgico a algún medicamento?',
      'Tome esta pastilla cada 8 horas',
      'Espere a que lo llamen',
    ],
  },
  {
    id: 'transporte',
    label: 'Transporte',
    sorda: [
      '¿Cómo llego a esta dirección?',
      '¿Este bus va a…?',
      'Bajo en el siguiente paradero',
      '¿Cuánto es el pasaje?',
      'Necesito un taxi',
    ],
    oyente: [
      '¿A dónde va?',
      'Siga derecho y voltee a la derecha',
      'El pasaje cuesta…',
      'Baje en el siguiente paradero',
    ],
  },
  {
    id: 'compras',
    label: 'Tienda',
    sorda: [
      '¿Cuánto cuesta?',
      'Quisiera esto, por favor',
      '¿Puedo pagar con tarjeta?',
      '¿Puedo pagar con Yape o Plin?',
      '¿Me da boleta, por favor?',
      '¿Tiene otra talla?',
    ],
    oyente: [
      '¿Qué desea?',
      'Son … soles',
      '¿Boleta o factura?',
      'No tenemos, lo siento',
    ],
  },
  {
    id: 'tramites',
    label: 'Trámites',
    sorda: [
      'Vengo a hacer un trámite',
      'Aquí está mi DNI',
      '¿Dónde hago la cola?',
      '¿Qué documentos necesito?',
      '¿Puede escribirme los pasos?',
    ],
    oyente: [
      'Su DNI, por favor',
      'Tome un ticket y espere su turno',
      'Firme aquí, por favor',
      'Vuelva mañana',
    ],
  },
  {
    id: 'emergencia',
    label: 'Emergencia',
    sorda: [
      'Necesito ayuda',
      'Llame a una ambulancia (106)',
      'Llame a la policía (105)',
      'Llame a los bomberos (116)',
      'Me robaron',
      'Hubo un accidente',
      'Llame a mi familiar, este es su número',
    ],
    oyente: [
      '¿Está herido?',
      'Ya llamé a emergencias',
      'Quédese aquí, ya vienen',
      '¿Dónde está?',
    ],
  },
]

const KEY = 'chaskipe:conversation'
/** Texto que vuelve de "Senas a texto" para la conversacion. */
const SPELLED_KEY = 'chaskipe:conversation-spelled'
const MAX_MESSAGES = 200

export function newMessage(from: Speaker, text: string): ChatMessage {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    from,
    text: text.trim(),
    at: new Date().toISOString(),
  }
}

export function loadConversation(): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (m): m is ChatMessage =>
        typeof m === 'object' &&
        m !== null &&
        typeof (m as ChatMessage).text === 'string' &&
        ((m as ChatMessage).from === 'sorda' || (m as ChatMessage).from === 'oyente'),
    )
  } catch {
    return []
  }
}

export function saveConversation(messages: ChatMessage[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)))
  } catch {
    // sin almacenamiento: la conversacion dura lo que la pantalla
  }
}

/** Deja un texto deletreado con la camara para que la conversacion lo recoja. */
export function handOffSpelled(text: string): void {
  try {
    window.sessionStorage.setItem(SPELLED_KEY, text)
  } catch {
    // ignorar
  }
}

/** Texto deletreado pendiente, si lo hay (no lo borra). */
export function peekSpelled(): string | null {
  try {
    const text = window.sessionStorage.getItem(SPELLED_KEY)
    return text && text.trim() ? text.trim() : null
  } catch {
    return null
  }
}

/** Borra el texto deletreado pendiente una vez recogido. */
export function clearSpelled(): void {
  try {
    window.sessionStorage.removeItem(SPELLED_KEY)
  } catch {
    // ignorar
  }
}
