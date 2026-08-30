/**
 * Construccion y descarga de muestras del dataset (FASE 4).
 */
import {
  DATASET_SCHEMA_VERSION,
  type DatasetSample,
  type SampleFrame,
  type VocabItem,
} from '@/types/dataset'
import type { HandFrame } from '@/types/handLandmarks'

function shortId(): string {
  return Math.random().toString(16).slice(2, 10)
}

/** Convierte los frames capturados del hook en frames del esquema del dataset. */
export function toSampleFrames(
  captured: { frame: HandFrame; t: number }[],
): SampleFrame[] {
  return captured.map(({ frame, t }) => ({
    t: Math.round(t),
    hands: frame.hands.map((landmarks, i) => ({
      handedness: frame.handedness[i] ?? '',
      score: 1,
      landmarks: landmarks.map(
        (p) =>
          [
            Number(p.x.toFixed(5)),
            Number(p.y.toFixed(5)),
            Number(p.z.toFixed(5)),
          ] as [number, number, number],
      ),
    })),
  }))
}

interface BuildSampleArgs {
  vocab: VocabItem
  frames: SampleFrame[]
  durationMs: number
  fps: number
  mirrored: boolean
  imageAspect: number
  consent: boolean
  notes: string
  modelVersion?: string
}

export function buildSample({
  vocab,
  frames,
  durationMs,
  fps,
  mirrored,
  imageAspect,
  consent,
  notes,
  modelVersion = 'float16/latest',
}: BuildSampleArgs): DatasetSample {
  return {
    schemaVersion: DATASET_SCHEMA_VERSION,
    label: vocab.label,
    word: vocab.word,
    sampleId: shortId(),
    createdAt: new Date().toISOString(),
    source: 'web-collector',
    validated: false,
    consent,
    notes: notes.trim(),
    capture: {
      fps,
      durationMs: Math.round(durationMs),
      frameCount: frames.length,
      mirrored,
      model: 'hand_landmarker',
      modelVersion,
      handsMax: 2,
      imageAspect: Number(imageAspect.toFixed(4)),
    },
    frames,
  }
}

/** Nombre de archivo: <ETIQUETA>__<timestamp con guiones>__<id>.json */
export function sampleFileName(sample: DatasetSample): string {
  const ts = sample.createdAt.replace(/[:.]/g, '-')
  return `${sample.label}__${ts}__${sample.sampleId}.json`
}

/** Dispara la descarga del JSON en el navegador. */
export function downloadSample(sample: DatasetSample): void {
  const blob = new Blob([JSON.stringify(sample, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = sampleFileName(sample)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Cuenta cuantos frames de la muestra tienen al menos una mano. */
export function framesWithHands(sample: DatasetSample): number {
  return sample.frames.filter((f) => f.hands.length > 0).length
}
