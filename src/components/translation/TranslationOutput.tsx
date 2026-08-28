import type { RecognitionStatus } from '@/types'

import './TranslationOutput.css'

interface TranslationOutputProps {
  label: string
  text: string
  status: RecognitionStatus
  isDemo?: boolean
}

const STATUS_LABEL: Record<RecognitionStatus, string> = {
  idle: 'En espera',
  recognizing: 'Reconociendo...',
  recognized: 'Reconocido',
  error: 'No se pudo reconocer',
}

/** Panel de texto detectado / resultado de traduccion. */
export function TranslationOutput({
  label,
  text,
  status,
  isDemo = false,
}: TranslationOutputProps) {
  return (
    <div className="translation-output">
      <div className="translation-output__head">
        <span className="section-title">{label}</span>
        <span className={`translation-output__status translation-output__status--${status}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <p className="translation-output__text">
        {text || <span className="text-muted">Aun no hay texto</span>}
      </p>
      {isDemo && (
        <p className="demo-note">
          Contenido demostrativo. La correspondencia con LSP no ha sido validada
          con personas usuarias ni interpretes.
        </p>
      )}
    </div>
  )
}
