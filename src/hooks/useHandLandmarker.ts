import { useCallback, useEffect, useRef, useState } from 'react'

import { closeHandLandmarker, getHandLandmarker } from '@/services/handLandmarker'
import type { HandFrame, Landmark } from '@/types/handLandmarks'

export type LandmarkerStatus =
  | 'idle'
  | 'loading' // descargando modelo / runtime
  | 'ready' // modelo cargado, listo para detectar
  | 'running' // bucle de deteccion activo
  | 'error'

interface UseHandLandmarkerResult {
  status: LandmarkerStatus
  errorMessage: string | null
  /** Ultimo frame detectado (null si aun no hay). */
  frame: HandFrame | null
  /** Numero de manos en el ultimo frame. */
  handCount: number
  /** Carga el modelo (idempotente). */
  load: () => void
  /** Inicia el bucle de deteccion sobre el video dado. */
  start: (video: HTMLVideoElement) => void
  /** Detiene el bucle (no libera el modelo). */
  stop: () => void
}

const EMPTY: Landmark[][] = []

/**
 * Ejecuta el Hand Landmarker de MediaPipe sobre un <video> en un bucle de
 * requestAnimationFrame y expone el ultimo frame de landmarks.
 *
 * FASE 3: solo deteccion. La interpretacion de senas es una fase posterior.
 */
export function useHandLandmarker(): UseHandLandmarkerResult {
  const [status, setStatus] = useState<LandmarkerStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [frame, setFrame] = useState<HandFrame | null>(null)

  const rafRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const lastVideoTimeRef = useRef<number>(-1)
  const runningRef = useRef(false)

  const load = useCallback(() => {
    setStatus((current) => (current === 'idle' || current === 'error' ? 'loading' : current))
    setErrorMessage(null)
    getHandLandmarker()
      .then(() => setStatus((c) => (c === 'running' ? c : 'ready')))
      .catch((error: unknown) => {
        setStatus('error')
        setErrorMessage(
          error instanceof Error
            ? `No se pudo cargar el detector de manos: ${error.message}`
            : 'No se pudo cargar el detector de manos.',
        )
      })
  }, [])

  const stop = useCallback(() => {
    runningRef.current = false
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setStatus((c) => (c === 'running' ? 'ready' : c))
  }, [])

  const start = useCallback(
    (video: HTMLVideoElement) => {
      videoRef.current = video
      runningRef.current = true

      const tick = async () => {
        if (!runningRef.current) return
        const el = videoRef.current
        const landmarker = await getHandLandmarker().catch(() => null)

        if (!landmarker || !el || el.readyState < 2 || el.videoWidth === 0) {
          rafRef.current = requestAnimationFrame(() => void tick())
          return
        }

        // Evitar reprocesar el mismo frame.
        if (el.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = el.currentTime
          const now = performance.now()
          try {
            const result = landmarker.detectForVideo(el, now)
            setFrame({
              hands: (result.landmarks ?? EMPTY) as Landmark[][],
              handedness: (result.handedness ?? []).map(
                (h) => h[0]?.categoryName ?? '',
              ),
              timestamp: now,
            })
          } catch {
            // Un frame fallido no detiene el bucle.
          }
        }

        rafRef.current = requestAnimationFrame(() => void tick())
      }

      getHandLandmarker()
        .then(() => {
          setStatus('running')
          rafRef.current = requestAnimationFrame(() => void tick())
        })
        .catch((error: unknown) => {
          setStatus('error')
          setErrorMessage(
            error instanceof Error
              ? `No se pudo iniciar el detector: ${error.message}`
              : 'No se pudo iniciar el detector de manos.',
          )
        })
    },
    [],
  )

  // Limpieza al desmontar: detener bucle y liberar el modelo compartido.
  useEffect(() => {
    return () => {
      runningRef.current = false
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      closeHandLandmarker()
    }
  }, [])

  return {
    status,
    errorMessage,
    frame,
    handCount: frame?.hands.length ?? 0,
    load,
    start,
    stop,
  }
}
