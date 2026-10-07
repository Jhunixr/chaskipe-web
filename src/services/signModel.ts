/**
 * Carga e inferencia del clasificador de senas (MLP) en el navegador (FASE 5).
 *
 * El modelo es un MLP pequeno exportado por `ai/scripts/export_tfjs.py` como
 * JSON plano (arquitectura + pesos). La inferencia es una multiplicacion de
 * matrices sencilla: no requiere TensorFlow.js.
 *
 * Hay dos modelos, con los mismos tres archivos cada uno:
 *   - `public/models/sign/`     senas con movimiento (resumen de ~2.5 s)
 *                               -> `ai/scripts/train.py` + `export_tfjs.py`
 *   - `public/models/letters/`  letras estaticas del abecedario (una pose)
 *                               -> `ai/scripts/train_letters.py`
 *
 *   - model.json   arquitectura + pesos
 *   - scaler.json  media/escala por feature (StandardScaler de sklearn)
 *   - labels.json  clases + featureVersion
 */
import {
  FEATURE_LENGTH,
  FEATURE_VERSION,
  framesToFeatures,
  standardize,
} from './signFeatures'
import { handToStaticFeatures, STATIC_FEATURE_LENGTH, STATIC_FEATURE_VERSION } from './staticFeatures'
import type { HandFrame } from '@/types/handLandmarks'

interface DenseLayer {
  type: 'dense'
  units: number
  activation: 'relu' | 'softmax' | 'linear'
  kernel: number[][] // (in, units)
  bias: number[] // (units,)
}

interface ModelJson {
  format: 'chaskipe-mlp'
  version: number
  inputDim: number
  layers: DenseLayer[]
}

interface ScalerJson {
  mean: number[]
  scale: number[]
  featureVersion: number
  featureLength: number
}

interface LabelsJson {
  classes: string[]
  featureVersion: number
  includesSynthetic?: boolean
  /** 'static-hand' en el modelo de letras; ausente en el de senas. */
  featureType?: string
  /** Mano del dataset de letras; la otra se refleja antes de predecir. */
  referenceHandedness?: string
}

/** Que modelo usar: senas con movimiento o letras estaticas. */
export type ModelKind = 'sign' | 'letters'

const MODEL_SPECS: Record<ModelKind, { featureLength: number; featureVersion: number }> = {
  sign: { featureLength: FEATURE_LENGTH, featureVersion: FEATURE_VERSION },
  letters: { featureLength: STATIC_FEATURE_LENGTH, featureVersion: STATIC_FEATURE_VERSION },
}

export interface SignPrediction {
  label: string
  confidence: number
  /** Probabilidad por clase, en el orden de `classes`. */
  scores: { label: string; score: number }[]
  /** true si el modelo se entreno con datos sinteticos de prueba. */
  isSynthetic: boolean
}

const BASE_URL =
  typeof import.meta.env?.BASE_URL === 'string' ? import.meta.env.BASE_URL : '/'

interface LoadedModel {
  model: ModelJson
  scaler: ScalerJson
  labels: LabelsJson
}

const cache = new Map<ModelKind, LoadedModel>()
const loading = new Map<ModelKind, Promise<LoadedModel>>()

async function fetchJson<T>(url: string, name: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${name} ${r.status}`)
  // Vite devuelve index.html (200) para rutas que no existen: no es un modelo.
  const type = r.headers.get('content-type') ?? ''
  if (type.includes('text/html')) throw new Error(`${name} 404`)
  return r.json() as Promise<T>
}

/** Carga los tres JSON del modelo (idempotente). Lanza si faltan o no cuadran. */
export async function loadSignModel(kind: ModelKind = 'sign'): Promise<LoadedModel> {
  const cached = cache.get(kind)
  if (cached) return cached
  const pending = loading.get(kind)
  if (pending) return pending

  const base = `${BASE_URL}models/${kind}`
  const spec = MODEL_SPECS[kind]
  const promise = (async () => {
    const [model, scaler, labels] = await Promise.all([
      fetchJson<ModelJson>(`${base}/model.json`, 'model.json'),
      fetchJson<ScalerJson>(`${base}/scaler.json`, 'scaler.json'),
      fetchJson<LabelsJson>(`${base}/labels.json`, 'labels.json'),
    ])

    if (model.inputDim !== spec.featureLength) {
      throw new Error(
        `El modelo "${kind}" espera ${model.inputDim} features y el frontend genera ${spec.featureLength}.`,
      )
    }
    if (scaler.featureVersion !== spec.featureVersion) {
      throw new Error(
        `featureVersion del modelo "${kind}" (${scaler.featureVersion}) != frontend (${spec.featureVersion}).`,
      )
    }

    const loaded = { model, scaler, labels }
    cache.set(kind, loaded)
    return loaded
  })()
  loading.set(kind, promise)

  try {
    return await promise
  } catch (error) {
    loading.delete(kind)
    throw error
  }
}

function relu(v: number): number {
  return v > 0 ? v : 0
}

export function forward(model: ModelJson, input: Float32Array): number[] {
  let activations: number[] = Array.from(input)
  for (const layer of model.layers) {
    const out = new Array<number>(layer.units).fill(0)
    for (let j = 0; j < layer.units; j++) {
      let sum = layer.bias[j] ?? 0
      for (let i = 0; i < activations.length; i++) {
        sum += (activations[i] ?? 0) * (layer.kernel[i]?.[j] ?? 0)
      }
      out[j] = sum
    }
    if (layer.activation === 'relu') {
      activations = out.map(relu)
    } else if (layer.activation === 'softmax') {
      const max = Math.max(...out)
      const exps = out.map((v) => Math.exp(v - max))
      const total = exps.reduce((s, v) => s + v, 0) || 1
      activations = exps.map((v) => v / total)
    } else {
      activations = out
    }
  }
  return activations
}

function toPrediction(probs: number[], labels: LabelsJson): SignPrediction {
  const scores = labels.classes.map((label, i) => ({
    label,
    score: probs[i] ?? 0,
  }))
  scores.sort((a, b) => b.score - a.score)
  const top = scores[0] ?? { label: '', score: 0 }

  return {
    label: top.label,
    confidence: top.score,
    scores,
    isSynthetic: labels.includesSynthetic ?? false,
  }
}

/** Predice la sena a partir de la secuencia de frames grabada. */
export async function predictSign(frames: HandFrame[]): Promise<SignPrediction> {
  const { model, scaler, labels } = await loadSignModel('sign')
  const features = framesToFeatures(frames)
  return toPrediction(forward(model, standardize(features, scaler)), labels)
}

/**
 * Predice la letra estatica de los frames recientes: clasifica la pose de la
 * mano en cada frame y promedia las probabilidades. Promediar suaviza el
 * temblor del detector y los frames de transicion entre letras.
 *
 * Usa la primera mano detectada en cada frame. Devuelve null si ningun frame
 * trae world landmarks.
 */
export async function predictLetter(frames: HandFrame[]): Promise<SignPrediction | null> {
  const { model, scaler, labels } = await loadSignModel('letters')
  const reference = labels.referenceHandedness ?? 'Left'
  const sum = new Array<number>(labels.classes.length).fill(0)
  let used = 0

  for (const frame of frames) {
    const world = frame.worldHands?.[0]
    if (!world) continue
    const features = handToStaticFeatures(world, frame.handedness[0] ?? '', reference)
    if (!features) continue
    const probs = forward(model, standardize(features, scaler))
    probs.forEach((p, i) => (sum[i] = (sum[i] ?? 0) + p))
    used++
  }
  if (used === 0) return null
  return toPrediction(
    sum.map((v) => v / used),
    labels,
  )
}

/**
 * true si hay un modelo exportado disponible.
 * Intenta cargarlo del todo (queda cacheado para `predictSign`).
 */
export async function signModelAvailable(kind: ModelKind = 'sign'): Promise<boolean> {
  try {
    await loadSignModel(kind)
    return true
  } catch {
    return false
  }
}
