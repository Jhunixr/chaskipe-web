import { useCallback, useEffect, useRef, useState } from 'react'

import { loadSignModel, predictSign } from '@/services/signModel'
import type { HandFrame } from '@/types/handLandmarks'

export type RecognitionPhase =
  | 'idle'
  | 'model-missing' // no hay modelo exportado
  | 'loading-model'
  | 'ready'
  | 'recording' // capturando ~2 s de landmarks
  | 'predicting'
  | 'done'
  | 'low-confidence' // predijo pero por debajo del umbral
  | 'no-hands' // no hubo suficientes manos en la grabacion
  | 'error'

export interface RecognitionOutput {
  label: string
  confidence: number
  scores: { label: string; score: number }[]
  isSynthetic: boolean
}

interface UseSignRecognitionOptions {
  /** ms a grabar. */
  recordMs?: number
  /** confianza minima para aceptar la prediccion. */
  minConfidence?: number
  /** fraccion minima de frames con manos para intentar predecir. */
  minHandFrames?: number
}

interface UseSignRecognitionResult {
  phase: RecognitionPhase
  errorMessage: string | null
  result: RecognitionOutput | null
  /** true mientras se graba. */
  recording: boolean
  /** progreso de la grabacion 0..1. */
  progress: number
  /** carga el modelo (idempotente). */
  loadModel: () => void
  /** empieza a grabar; usa `pushFrame` durante `recordMs` y luego predice. */
  start: () => void
  /** alimenta un frame de landmarks (llamar desde el bucle de MediaPipe). */
  pushFrame: (frame: HandFrame) => void
  /** vuelve a 'ready' descartando el resultado. */
  reset: () => void
}

const DEFAULTS = {
  recordMs: 2000,
  minConfidence: 0.6,
  minHandFrames: 0.4,
}

/**
 * Orquesta el reconocimiento de una sena (FASE 6):
 * grabar landmarks -> features -> MLP -> prediccion con umbral de confianza.
 */
export function useSignRecognition(
  options: UseSignRecognitionOptions = {},
): UseSignRecognitionResult {
  const cfg = { ...DEFAULTS, ...options }

  const [phase, setPhase] = useState<RecognitionPhase>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<RecognitionOutput | null>(null)
  const [progress, setProgress] = useState(0)

  const framesRef = useRef<HandFrame[]>([])
  const recordingRef = useRef(false)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current.forEach((id) => window.clearInterval(id))
    timersRef.current = []
  }, [])

  const loadModel = useCallback(() => {
    setPhase((p) => (p === 'idle' || p === 'error' ? 'loading-model' : p))
    loadSignModel()
      .then(() => setPhase('ready'))
      .catch((error: unknown) => {
        // 404 del model.json => no hay modelo exportado (caso esperado).
        const msg = error instanceof Error ? error.message : ''
        if (/model\.json\s*(404|Failed to fetch)/i.test(msg) || /404/.test(msg)) {
          setPhase('model-missing')
          return
        }
        setPhase('error')
        setErrorMessage(
          error instanceof Error
            ? `No se pudo cargar el modelo: ${error.message}`
            : 'No se pudo cargar el modelo de reconocimiento.',
        )
      })
  }, [])

  const pushFrame = useCallback((frame: HandFrame) => {
    if (recordingRef.current) framesRef.current.push(frame)
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    recordingRef.current = false
    framesRef.current = []
    setResult(null)
    setProgress(0)
    setErrorMessage(null)
    setPhase((p) => (p === 'model-missing' ? p : 'ready'))
  }, [clearTimers])

  const start = useCallback(() => {
    if (phase === 'model-missing') return
    clearTimers()
    framesRef.current = []
    setResult(null)
    setErrorMessage(null)
    setProgress(0)
    recordingRef.current = true
    setPhase('recording')

    const startedAt = performance.now()
    const interval = window.setInterval(() => {
      setProgress(Math.min(1, (performance.now() - startedAt) / cfg.recordMs))
    }, 60)
    timersRef.current.push(interval)

    timersRef.current.push(
      window.setTimeout(() => {
        window.clearInterval(interval)
        recordingRef.current = false
        setProgress(1)

        const frames = framesRef.current
        const handFrames = frames.filter((f) => f.hands.length > 0).length
        if (frames.length === 0 || handFrames < frames.length * cfg.minHandFrames) {
          setPhase('no-hands')
          return
        }

        setPhase('predicting')
        predictSign(frames)
          .then((pred) => {
            const out: RecognitionOutput = {
              label: pred.label,
              confidence: pred.confidence,
              scores: pred.scores,
              isSynthetic: pred.isSynthetic,
            }
            setResult(out)
            setPhase(pred.confidence >= cfg.minConfidence ? 'done' : 'low-confidence')
          })
          .catch((error: unknown) => {
            setPhase('error')
            setErrorMessage(
              error instanceof Error
                ? `Fallo la prediccion: ${error.message}`
                : 'No se pudo reconocer la sena.',
            )
          })
      }, cfg.recordMs),
    )
  }, [phase, clearTimers, cfg.recordMs, cfg.minConfidence, cfg.minHandFrames])

  useEffect(() => clearTimers, [clearTimers])

  return {
    phase,
    errorMessage,
    result,
    recording: phase === 'recording',
    progress,
    loadModel,
    start,
    pushFrame,
    reset,
  }
}
