import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CameraView, HandOverlay } from '@/components/camera'
import { Button, Card, Icon, PageHeader } from '@/components/ui'
import { useCamera } from '@/hooks/useCamera'
import { useHandLandmarker } from '@/hooks/useHandLandmarker'
import {
  buildSample,
  downloadSample,
  framesWithHands,
  sampleFileName,
  toSampleFrames,
} from '@/services/datasetSample'
import { INITIAL_VOCAB } from '@/types/dataset'
import type { HandFrame } from '@/types/handLandmarks'

import './DatasetCollectorPage.css'
import './pages.css'

const RECORD_MS = 2000

type RecState = 'idle' | 'countdown' | 'recording' | 'review'

interface CapturedFrame {
  frame: HandFrame
  t: number
}

/**
 * Herramienta interna (FASE 4) para capturar muestras del dataset de landmarks.
 *
 * Elegir sena -> grabar ~2 s con la camara + MediaPipe -> descargar JSON.
 * El archivo va, manualmente, a `ai/data/raw/<ETIQUETA>/`.
 * Ver `ai/data/DATASET_FORMAT.md`.
 *
 * No entrena nada. Los datos NO estan validados con personas usuarias de LSP.
 */
export function DatasetCollectorPage() {
  const camera = useCamera('user')
  const [vocabIndex, setVocabIndex] = useState(0)
  const [consent, setConsent] = useState(false)
  const [notes, setNotes] = useState('')
  const [recState, setRecState] = useState<RecState>('idle')
  const [countdown, setCountdown] = useState(3)
  const [savedCount, setSavedCount] = useState<Record<string, number>>({})
  const [lastSummary, setLastSummary] = useState<string | null>(null)
  /** Grabacion terminada: frames + relacion de aspecto del video. */
  const [recorded, setRecorded] = useState<{
    frames: CapturedFrame[]
    aspect: number
  }>({ frames: [], aspect: 0.75 })

  const vocab = INITIAL_VOCAB[vocabIndex] ?? INITIAL_VOCAB[0]!

  const capturedRef = useRef<CapturedFrame[]>([])
  const recStartRef = useRef(0)
  const recordingRef = useRef(false)

  const handleFrame = useCallback((frame: HandFrame) => {
    if (!recordingRef.current) return
    capturedRef.current.push({ frame, t: performance.now() - recStartRef.current })
  }, [])

  const hands = useHandLandmarker({ onFrame: handleFrame })

  // Activar camara + modelo al montar.
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    camera.start()
    hands.load()
  }, [camera, hands])

  // Iniciar deteccion cuando la camara esta activa.
  const detStartedRef = useRef(false)
  useEffect(() => {
    if (camera.status !== 'active' || detStartedRef.current) return
    const video = camera.videoRef.current
    if (!video) return
    detStartedRef.current = true
    hands.start(video)
  }, [camera.status, camera.videoRef, hands])

  const cameraReady = camera.status === 'active'
  const detectorReady = hands.status === 'running' || hands.status === 'ready'
  const canRecord = cameraReady && detectorReady && consent && recState === 'idle'

  const timersRef = useRef<number[]>([])
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  const startRecording = useCallback(() => {
    clearTimers()
    setRecState('countdown')
    setCountdown(3)

    // Cuenta regresiva de 3 a 1, luego grabar RECORD_MS.
    timersRef.current.push(window.setTimeout(() => setCountdown(2), 700))
    timersRef.current.push(window.setTimeout(() => setCountdown(1), 1400))
    timersRef.current.push(
      window.setTimeout(() => {
        capturedRef.current = []
        recStartRef.current = performance.now()
        recordingRef.current = true
        setCountdown(0)
        setRecState('recording')
      }, 2100),
    )
    timersRef.current.push(
      window.setTimeout(() => {
        recordingRef.current = false
        const v = camera.videoRef.current
        const aspect =
          v && v.videoWidth > 0 ? v.videoHeight / v.videoWidth : 0.75
        setRecorded({ frames: capturedRef.current.slice(), aspect })
        setRecState('review')
      }, 2100 + RECORD_MS),
    )
  }, [clearTimers, camera.videoRef])

  // Limpiar timers al desmontar.
  useEffect(() => clearTimers, [clearTimers])

  const lastSample = useMemo(() => {
    const { frames: rec, aspect } = recorded
    if (recState !== 'review' || rec.length === 0) return null
    const durationMs = rec[rec.length - 1]?.t ?? RECORD_MS
    const fps = durationMs > 0 ? (rec.length / durationMs) * 1000 : 0
    return buildSample({
      vocab,
      frames: toSampleFrames(rec),
      durationMs,
      fps: Number(fps.toFixed(1)),
      mirrored: camera.facing === 'user',
      imageAspect: aspect,
      consent,
      notes,
    })
  }, [recState, recorded, vocab, camera.facing, consent, notes])

  const withHands = lastSample ? framesWithHands(lastSample) : 0
  const goodSample = lastSample ? withHands >= lastSample.frames.length * 0.5 : false

  const handleSave = () => {
    if (!lastSample) return
    downloadSample(lastSample)
    setSavedCount((prev) => ({
      ...prev,
      [vocab.label]: (prev[vocab.label] ?? 0) + 1,
    }))
    setLastSummary(
      `${sampleFileName(lastSample)} · ${lastSample.frames.length} frames · ${withHands} con manos`,
    )
    setRecState('idle')
  }

  const discard = () => {
    capturedRef.current = []
    setRecorded({ frames: [], aspect: 0.75 })
    setRecState('idle')
  }

  return (
    <div className="page collector">
      <PageHeader title="Captura de dataset" />

      <p className="disclaimer-note">
        <Icon name="shield" size={16} />
        Herramienta interna (FASE 4). Solo se guardan coordenadas de landmarks,
        no video. Las senas capturadas <strong>no estan validadas</strong> con
        personas usuarias de LSP ni interpretes.
      </p>

      <div className="collector__vocab" role="group" aria-label="Sena a capturar">
        {INITIAL_VOCAB.map((item, i) => (
          <button
            key={item.label}
            type="button"
            className={`chip${i === vocabIndex ? ' chip--active' : ''}`}
            onClick={() => setVocabIndex(i)}
            disabled={recState !== 'idle'}
          >
            {item.word}
          </button>
        ))}
      </div>

      <CameraView
        status={camera.status}
        errorMessage={camera.errorMessage}
        facing={camera.facing}
        canSwitch={camera.canSwitch}
        videoRef={camera.videoRef}
        onStart={camera.start}
        onRetry={camera.start}
        onToggleFacing={camera.toggleFacing}
        overlayStatus={
          recState === 'recording'
            ? 'Grabando...'
            : recState === 'countdown'
              ? `Prepara la sena: ${countdown}`
              : hands.handCount > 0
                ? `${hands.handCount} mano(s)`
                : 'Muestra las manos'
        }
        overlay={
          <HandOverlay frame={hands.frame} mirrored={camera.facing === 'user'} />
        }
      />

      <Card className="stack-sm">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            La persona frente a la camara dio su consentimiento para capturar los
            landmarks de esta sena.
          </span>
        </label>
        <label className="field">
          <span className="field__label">Notas (opcional)</span>
          <input
            className="input-group__field collector__notes"
            type="text"
            placeholder="persona, variacion, contexto..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </Card>

      {recState === 'review' && lastSample ? (
        <Card className="stack-sm collector__review">
          <p className="section-title">Revisar muestra</p>
          <p className="text-sm">
            <strong>{lastSample.word}</strong> · {lastSample.frames.length} frames
            · {withHands} con manos · {lastSample.capture.fps} fps
          </p>
          {!goodSample && (
            <p className="demo-note">
              Pocos frames con manos. Repite acercando las manos a la camara.
            </p>
          )}
          <div className="collector__review-actions">
            <Button icon="check" onClick={handleSave} disabled={!goodSample}>
              Descargar JSON
            </Button>
            <Button variant="ghost" icon="refresh" onClick={discard}>
              Descartar
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          size="lg"
          fullWidth
          icon="camera"
          onClick={startRecording}
          disabled={!canRecord}
        >
          {recState === 'countdown'
            ? `Grabando en ${countdown}...`
            : recState === 'recording'
              ? 'Grabando...'
              : !consent
                ? 'Marca el consentimiento para grabar'
                : !cameraReady || !detectorReady
                  ? 'Preparando camara y detector...'
                  : `Grabar "${vocab.word}" (2 s)`}
        </Button>
      )}

      {lastSummary && (
        <p className="text-xs text-muted collector__summary">
          Ultimo guardado: {lastSummary}
        </p>
      )}

      <Card className="card--flat stack-sm">
        <p className="section-title">Guardados en esta sesion</p>
        <ul className="collector__counts">
          {INITIAL_VOCAB.map((item) => (
            <li key={item.label}>
              <span>{item.word}</span>
              <strong>{savedCount[item.label] ?? 0}</strong>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">
          Mueve cada archivo descargado a{' '}
          <code>ai/data/raw/{vocab.label}/</code>. Formato en{' '}
          <code>ai/data/DATASET_FORMAT.md</code>.
        </p>
      </Card>
    </div>
  )
}
