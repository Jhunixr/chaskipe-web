import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { CameraPlaceholder } from '@/components/camera/CameraPlaceholder'
import { TranslationOutput } from '@/components/translation/TranslationOutput'
import { Button, PageHeader } from '@/components/ui'
import type { RecognitionStatus } from '@/types'

import './pages.css'

/**
 * FASE 1: interfaz unicamente. No hay acceso a la camara ni a MediaPipe.
 * El boton "Analizar sena" simula el cambio de estado para revisar la UI.
 */
export function SignToTextPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<RecognitionStatus>('idle')

  const handleAnalyze = () => {
    setStatus('recognizing')
    window.setTimeout(() => {
      setStatus('recognized')
      navigate(ROUTES.translationResult)
    }, 900)
  }

  return (
    <div className="page">
      <PageHeader title="Senas a texto" subtitle="Coloca las manos dentro del recuadro." />

      <CameraPlaceholder status={status === 'recognizing' ? 'Reconociendo...' : undefined} />

      <TranslationOutput
        label="Texto detectado"
        text=""
        status={status}
        isDemo
      />

      <Button fullWidth onClick={handleAnalyze} disabled={status === 'recognizing'}>
        {status === 'recognizing' ? 'Analizando...' : 'Analizar sena'}
      </Button>
    </div>
  )
}
