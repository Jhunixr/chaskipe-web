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
import { CAPTURE_VOCAB } from '@/types/dataset'
import type { HandFrame } from '@/types/handLandmarks'

import './DatasetCollectorPage.css'
import './pages.css'

/** Poses estaticas: 1.2 s basta. Las senas con movimiento graban 2 s. */
const STATIC_MS = 1200
const DYNAMIC_MS = 2000
const TARGET_PER_LETTER = 30

type RecState = 'idle' | 'countdown' | 'recording' | 'review'

interface CapturedFrame {
  frame: HandFrame
  t: number
}

/**
 * Herramienta interna para capturar el dataset del **abecedario de la LSP**
 * (deletreo manual). Elegir letra -> mirar el cartel de referencia -> grabar
 * ~1 s con la camara + MediaPipe -> descargar JSON.
 *
 * El archivo va, manualmente, a `ai/data/raw/<ETIQUETA>/`.
 * Ver `ai/data/DATASET_FORMAT.md`.
 *
 * Las senas capturadas NO estan validadas con personas usuarias de LSP ni
 * interpretes.
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
  const [recorded, setRecorded] = useState<{
    frames: CapturedFrame[]
    aspect: number
  }>({ frames: [], aspect: 0.75 })

  const vocab = CAPTURE_VOCAB[vocabIndex] ?? CAPTURE_VOCAB[0]!
  const recordMs = vocab.dynamic ? DYNAMIC_MS : STATIC_MS

  const capturedRef = useRef<CapturedFrame[]>([])
  const recStartRef = useRef(0)
  const recordingRef = useRef(false)

  const handleFrame = useCallback((frame: HandFrame) => {
    if (!recordingRef.current) return
    capturedRef.current.push({
      frame,
      t: performance.now() - recStartRef.current,
    })
  }, [])

  const hands = useHandLandmarker({ onFrame: handleFrame })

  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    camera.start()
    hands.load()
  }, [camera, hands])

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
    timersRef.current.push(window.setTimeout(() => setCountdown(2), 600))
    timersRef.current.push(window.setTimeout(() => setCountdown(1), 1200))
    timersRef.current.push(
      window.setTimeout(() => {
        capturedRef.current = []
        recStartRef.current = performance.now()
        recordingRef.current = true
        setCountdown(0)
        setRecState('recording')
      }, 1800),
    )
    timersRef.current.push(
      window.setTimeout(() => {
        recordingRef.current = false
        const v = camera.videoRef.current
        const aspect =
          v && v.videoWidth > 0 ? v.videoHeight / v.videoWidth : 0.75
        setRecorded({ frames: capturedRef.current.slice(), aspect })
        setRecState('review')
      }, 1800 + recordMs),
    )
  }, [clearTimers, camera.videoRef, recordMs])

  useEffect(() => clearTimers, [clearTimers])

  const lastSample = useMemo(() => {
    const { frames: rec, aspect } = recorded
    if (recState !== 'review' || rec.length === 0) return null
    const durationMs = rec[rec.length - 1]?.t ?? recordMs
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
  }, [recState, recorded, vocab, camera.facing, consent, notes, recordMs])

  const withHands = lastSample ? framesWithHands(lastSample) : 0
  const goodSample = lastSample
    ? withHands >= lastSample.frames.length * 0.5 && withHands >= 3
    : false

  const savedForLetter = savedCount[vocab.label] ?? 0
  const totalSaved = Object.values(savedCount).reduce((s, n) => s + n, 0)

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

  const go = (delta: number) => {
    if (recState !== 'idle') return
    setVocabIndex((i) => (i + delta + CAPTURE_VOCAB.length) % CAPTURE_VOCAB.length)
    setLastSummary(null)
  }

  return (
    <div className="page collector">
      <PageHeader title="Captura: abecedario LSP" />

      <p className="disclaimer-note">
        <Icon name="shield" size={16} />
        Solo se guardan coordenadas de landmarks, no video. Las senas del
        abecedario capturadas aqui <strong>no estan validadas</strong> con
        personas usuarias de LSP ni interpretes.
      </p>

      {/* Selector de letra */}
      <div className="collector__letter-nav">
        <button
          type="button"
          className="collector__nav-btn"
          onClick={() => go(-1)}
          disabled={recState !== 'idle'}
          aria-label="Letra anterior"
        >
          <Icon name="back" size={20} />
        </button>

        <div className="collector__letter">
          <span className="collector__letter-big">{vocab.word}</span>
          <span className="text-xs text-muted">
            {vocabIndex + 1} / {CAPTURE_VOCAB.length}
            {vocab.dynamic ? ' · con movimiento' : ' · pose fija'}
          </span>
        </div>

        <button
          type="button"
          className="collector__nav-btn"
          onClick={() => go(1)}
          disabled={recState !== 'idle'}
          aria-label="Letra siguiente"
        >
          <Icon name="chevron" size={20} />
        </button>
      </div>

      <p className="collector__hint text-sm text-muted">
        Haz la sena de <strong>{vocab.word}</strong> mirando el cartel del
        abecedario LSP.
        {vocab.dynamic
          ? ' Esta letra lleva un movimiento: hazlo completo durante la grabacion.'
          : ' Manten la mano quieta mientras graba.'}
      </p>

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
                : 'Muestra la mano'
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
            La persona frente a la camara dio su consentimiento para capturar
            los landmarks.
          </span>
        </label>
        <label className="field">
          <span className="field__label">Notas (opcional)</span>
          <input
            className="input-group__field collector__notes"
            type="text"
            placeholder="persona, mano usada, luz, variacion..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </Card>

      {recState === 'review' && lastSample ? (
        <Card className="stack-sm collector__review">
          <p className="section-title">Revisar muestra</p>
          <p className="text-sm">
            <strong>{lastSample.word}</strong> · {lastSample.frames.length}{' '}
            frames · {withHands} con manos · {lastSample.capture.fps} fps
          </p>
          {!goodSample && (
            <p className="demo-note">
              Pocos frames con la mano visible. Repite acercando la mano y
              manteniendola en el encuadre.
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
                  : `Grabar "${vocab.word}"`}
        </Button>
      )}

      {lastSummary && (
        <p className="text-xs text-muted collector__summary">
          Ultimo guardado: {lastSummary}
        </p>
      )}

      <Card className="card--flat stack-sm">
        <div className="row-between">
          <p className="section-title">
            "{vocab.word}": {savedForLetter} / {TARGET_PER_LETTER}
          </p>
          <span className="text-xs text-muted">{totalSaved} en total</span>
        </div>
        <div className="collector__progress">
          <span
            style={{
              width: `${Math.min(100, (savedForLetter / TARGET_PER_LETTER) * 100)}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted">
          Mueve cada archivo descargado a{' '}
          <code>ai/data/raw/{vocab.label}/</code>. Objetivo: ~
          {TARGET_PER_LETTER} por letra, variando mano, distancia y luz.
        </p>
      </Card>
    </div>
  )
}
