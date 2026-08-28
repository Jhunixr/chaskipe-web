import type { TranslationDirection } from '@/types'

const DATE_FORMATTER = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/** Formatea una fecha ISO 8601 a un texto corto en espanol (Peru). */
export function formatDateTime(isoDate: string): string {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) {
    return isoDate
  }
  return DATE_FORMATTER.format(parsed)
}

const DIRECTION_LABEL: Record<TranslationDirection, string> = {
  'sign-to-text': 'Senas a texto',
  'text-to-sign': 'Texto a senas',
}

export function directionLabel(direction: TranslationDirection): string {
  return DIRECTION_LABEL[direction]
}
