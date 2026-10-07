import { useCallback, useEffect, useRef, useState } from 'react'

import {
  loadSignModel,
  predictLetter,
  predictSign,
  type ModelKind,
} from '@/services/signModel'
import type { HandFrame } from '@/types/handLandmarks'

export type RecognitionPhase =
  | 'idle'
  | 'model-missing' // no hay modelo exportado
  | 'loading-model'
  | 'watching' // analizando en vivo, aun sin candidato estable
  | 'candidate' // hay un candidato pero no se ha confirmado
  | 'confirmed' // sena confirmada (estable)
  | 'paused' // el usuario pauso el analisis
  | 'error'

export interface RecognitionOutput {
  label: string
  confidence: number
  scores: { label: string; score: number }[]
  isSynthetic: boolean
}

interface UseSignRecognitionOptions {
  /**
   * 'sign': senas con movimiento (resumen de la ventana completa).
   * 'letters': letras estaticas del abecedario (pose por frame, promediada).
   *   En este modo el analisis es continuo: cada letra confirmada se entrega
   *   por `onConfirm` y se sigue analizando (deletreo).
   */
  mode?: ModelKind
  /** Se invoca con cada sena/letra confirmada. */
  onConfirm?: (output: RecognitionOutput) => void
  /** ventana deslizante de landmarks, en ms. */
  windowMs?: number
  /** cada cuanto se ejecuta una prediccion, en ms. */
  intervalMs?: number
  /** confianza minima para considerar un candidato. */
  minConfidence?: number
  /** fraccion minima de frames con manos en la ventana. */
  minHandFrames?: number
  /** frames minimos en la ventana para predecir. */
  minFrames?: number
  /** ms que la misma clase debe mantenerse para confirmarse. */
  holdMs?: number
  /** ms de pausa tras confirmar antes de volver a analizar. */
  cooldownMs?: number
}

interface UseSignRecognitionResult {
  phase: RecognitionPhase
  errorMessage: string | null
  /** candidato actual (en vivo, aun sin confirmar). */
  candidate: RecognitionOutput | null
  /** ultima sena confirmada. */
  confirmed: RecognitionOutput | null
  /** progreso de la confirmacion del candidato 0..1. */
  holdProgress: number
  /** true si el bucle de analisis esta activo. */
  active: boolean
  loadModel: () => void
  /** alimenta un frame de landmarks (desde el bucle de MediaPipe). */
  pushFrame: (frame: HandFrame) => void
  /** empieza / reanuda el analisis en vivo. */
  startWatching: () => void
  /** pausa el analisis. */
  pause: () => void
  /** descarta la confirmacion y reanuda el analisis. */
  resume: () => void
}

const DEFAULTS: Record<ModelKind, Required<Omit<UseSignRecognitionOptions, 'mode' | 'onConfirm'>>> = {
  // Ventana de 2.5 s: cubre senas con movimiento (HOLA, GRACIAS).
  // Se predice cada ~300 ms y se confirma cuando la sena se mantiene ~0.7 s.
  sign: {
    windowMs: 2500,
    intervalMs: 300,
    minConfidence: 0.6,
    minHandFrames: 0.35,
    minFrames: 5,
    holdMs: 700,
    cooldownMs: 1200,
  },
  // Letras: pose quieta. Se promedian los frames de los ultimos 0.8 s y se
  // confirma cuando la misma letra se mantiene ~0.8 s. Basta con 2 frames:
  // en moviles lentos MediaPipe puede ir a pocos fps.
  letters: {
    windowMs: 800,
    intervalMs: 200,
    minConfidence: 0.7,
    minHandFrames: 0.6,
    minFrames: 2,
    holdMs: 800,
    cooldownMs: 500,
  },
}

/**
 * Reconocimiento de senas EN TIEMPO REAL con confirmacion (FASE 6).
 *
 * Mantiene una ventana deslizante de landmarks y ejecuta el MLP cada
 * `intervalMs`. Muestra el candidato en vivo y lo confirma cuando la misma
 * clase se mantiene por encima del umbral durante `holdMs`. Tras confirmar
 * hace una pausa (`cooldownMs`) para no repetir la misma sena.
 */
export function useSignRecognition(
  options: UseSignRecognitionOptions = {},
): UseSignRecognitionResult {
  const mode: ModelKind = options.mode ?? 'sign'
  const continuous = mode === 'letters'
  const cfg = { ...DEFAULTS[mode], ...options }

  const onConfirmRef = useRef(options.onConfirm)
  useEffect(() => {
    onConfirmRef.current = options.onConfirm
  }, [options.onConfirm])

  const [phase, setPhase] = useState<RecognitionPhase>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [candidate, setCandidate] = useState<RecognitionOutput | null>(null)
  const [confirmed, setConfirmed] = useState<RecognitionOutput | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const [active, setActive] = useState(false)

  /** frames con su marca de tiempo de llegada (ms). */
  const bufferRef = useRef<{ frame: HandFrame; t: number }[]>([])
  const activeRef = useRef(false)
  const predictingRef = useRef(false)
  const loopRef = useRef<number | null>(null)
  /** clase candidata sostenida y desde cuando. */
  const holdRef = useRef<{ label: string; since: number } | null>(null)
  const cooldownUntilRef = useRef(0)
  /**
   * Ultima letra confirmada en modo continuo. No se vuelve a confirmar hasta
   * que la mano cambie de letra o salga del cuadro: si no, mantener la pose
   * escribiria "AAAA".
   */
  const lockedLabelRef = useRef<string | null>(null)

  const stopLoop = useCallback(() => {
    if (loopRef.current !== null) {
      window.clearInterval(loopRef.current)
      loopRef.current = null
    }
  }, [])

  const loadModel = useCallback(() => {
    setPhase((p) => (p === 'idle' || p === 'error' ? 'loading-model' : p))
    loadSignModel(mode)
      .then(() => setPhase((p) => (p === 'loading-model' ? 'watching' : p)))
      .catch((error: unknown) => {
        const msg = error instanceof Error ? error.message : ''
        if (/404/.test(msg) || /Failed to fetch/i.test(msg)) {
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
  }, [mode])

  const pushFrame = useCallback(
    (frame: HandFrame) => {
      if (!activeRef.current) return
      const now = performance.now()
      const buf = bufferRef.current
      buf.push({ frame, t: now })
      // descartar lo que sale de la ventana
      const cutoff = now - cfg.windowMs
      while (buf.length > 0 && buf[0]!.t < cutoff) buf.shift()
    },
    [cfg.windowMs],
  )

  const tick = useCallback(() => {
    if (!activeRef.current || predictingRef.current) return
    if (performance.now() < cooldownUntilRef.current) return

    const window = bufferRef.current.map((e) => e.frame)
    if (window.length < cfg.minFrames) {
      setCandidate(null)
      holdRef.current = null
      setHoldProgress(0)
      setPhase((p) => (p === 'candidate' ? 'watching' : p))
      return
    }
    const handFrames = window.filter((f) => f.hands.length > 0).length
    if (handFrames < window.length * cfg.minHandFrames) {
      lockedLabelRef.current = null
      setCandidate(null)
      holdRef.current = null
      setHoldProgress(0)
      setPhase((p) => (p === 'candidate' ? 'watching' : p))
      return
    }

    predictingRef.current = true
    const prediction = mode === 'letters' ? predictLetter(window) : predictSign(window)
    prediction
      .then((pred) => {
        if (!activeRef.current) return
        if (!pred) {
          setCandidate(null)
          holdRef.current = null
          setHoldProgress(0)
          return
        }
        const out: RecognitionOutput = {
          label: pred.label,
          confidence: pred.confidence,
          scores: pred.scores,
          isSynthetic: pred.isSynthetic,
        }

        if (lockedLabelRef.current !== null && pred.label !== lockedLabelRef.current) {
          lockedLabelRef.current = null
        }

        if (pred.confidence < cfg.minConfidence || pred.label === lockedLabelRef.current) {
          setCandidate(null)
          holdRef.current = null
          setHoldProgress(0)
          setPhase('watching')
          return
        }

        setCandidate(out)
        setPhase('candidate')

        const now = performance.now()
        const hold = holdRef.current
        if (!hold || hold.label !== pred.label) {
          holdRef.current = { label: pred.label, since: now }
          setHoldProgress(0)
          return
        }

        const elapsed = now - hold.since
        setHoldProgress(Math.min(1, elapsed / cfg.holdMs))
        if (elapsed >= cfg.holdMs) {
          setConfirmed(out)
          holdRef.current = null
          setHoldProgress(0)
          cooldownUntilRef.current = now + cfg.cooldownMs
          bufferRef.current = []
          onConfirmRef.current?.(out)
          if (continuous) {
            // Deletreo: se sigue analizando, sin repetir la misma letra.
            lockedLabelRef.current = out.label
            setCandidate(null)
            setPhase('watching')
          } else {
            setPhase('confirmed')
          }
        }
      })
      .catch((error: unknown) => {
        if (!activeRef.current) return
        setPhase('error')
        setErrorMessage(
          error instanceof Error
            ? `Fallo la prediccion: ${error.message}`
            : 'No se pudo reconocer la sena.',
        )
      })
      .finally(() => {
        predictingRef.current = false
      })
  }, [
    mode,
    continuous,
    cfg.minConfidence,
    cfg.minHandFrames,
    cfg.minFrames,
    cfg.holdMs,
    cfg.cooldownMs,
  ])

  const startWatching = useCallback(() => {
    setPhase((p) => {
      if (p === 'model-missing' || p === 'loading-model' || p === 'idle') return p
      return 'watching'
    })
    activeRef.current = true
    setActive(true)
    bufferRef.current = []
    holdRef.current = null
    lockedLabelRef.current = null
    setHoldProgress(0)
    stopLoop()
    loopRef.current = window.setInterval(tick, cfg.intervalMs)
  }, [stopLoop, tick, cfg.intervalMs])

  const pause = useCallback(() => {
    activeRef.current = false
    setActive(false)
    stopLoop()
    bufferRef.current = []
    holdRef.current = null
    setHoldProgress(0)
    setCandidate(null)
    setPhase('paused')
  }, [stopLoop])

  const resume = useCallback(() => {
    setConfirmed(null)
    setCandidate(null)
    setErrorMessage(null)
    cooldownUntilRef.current = 0
    startWatching()
  }, [startWatching])

  useEffect(() => {
    return () => {
      activeRef.current = false
      stopLoop()
    }
  }, [stopLoop])

  // Al cambiar de modo (senas <-> letras) se descarta todo y se vuelve a
  // 'idle': quien use el hook carga el otro modelo y reanuda el analisis.
  const modeRef = useRef(mode)
  useEffect(() => {
    if (modeRef.current === mode) return
    modeRef.current = mode
    activeRef.current = false
    stopLoop()
    bufferRef.current = []
    holdRef.current = null
    lockedLabelRef.current = null
    cooldownUntilRef.current = 0
    setActive(false)
    setCandidate(null)
    setConfirmed(null)
    setHoldProgress(0)
    setErrorMessage(null)
    setPhase('idle')
  }, [mode, stopLoop])

  return {
    phase,
    errorMessage,
    candidate,
    confirmed,
    holdProgress,
    active,
    loadModel,
    pushFrame,
    startWatching,
    pause,
    resume,
  }
}
