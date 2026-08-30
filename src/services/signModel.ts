/**
 * Carga e inferencia del clasificador de senas (MLP) en el navegador (FASE 5).
 *
 * El modelo es un MLP pequeno exportado por `ai/scripts/export_tfjs.py` como
 * JSON plano (arquitectura + pesos). La inferencia es una multiplicacion de
 * matrices sencilla: no requiere TensorFlow.js.
 *
 * Assets en `public/models/sign/`:
 *   - model.json   arquitectura + pesos
 *   - scaler.json  media/escala por feature (StandardScaler de sklearn)
 *   - labels.json  clases + featureVersion
 *
 * FASE 5: la logica esta lista. La conexion con la pantalla "Senas a texto"
 * (grabar -> features -> predecir) es la FASE 6.
 */
import {
  FEATURE_LENGTH,
  FEATURE_VERSION,
  framesToFeatures,
  standardize,
} from './signFeatures'
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
const BASE = `${BASE_URL}models/sign`

interface LoadedModel {
  model: ModelJson
  scaler: ScalerJson
  labels: LabelsJson
}

let cache: LoadedModel | null = null
let loadingPromise: Promise<LoadedModel> | null = null

/** Carga los tres JSON del modelo (idempotente). Lanza si faltan o no cuadran. */
export async function loadSignModel(): Promise<LoadedModel> {
  if (cache) return cache
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const [model, scaler, labels] = await Promise.all([
      fetch(`${BASE}/model.json`).then((r) => {
        if (!r.ok) throw new Error(`model.json ${r.status}`)
        return r.json() as Promise<ModelJson>
      }),
      fetch(`${BASE}/scaler.json`).then((r) => {
        if (!r.ok) throw new Error(`scaler.json ${r.status}`)
        return r.json() as Promise<ScalerJson>
      }),
      fetch(`${BASE}/labels.json`).then((r) => {
        if (!r.ok) throw new Error(`labels.json ${r.status}`)
        return r.json() as Promise<LabelsJson>
      }),
    ])

    if (model.inputDim !== FEATURE_LENGTH) {
      throw new Error(
        `El modelo espera ${model.inputDim} features y el frontend genera ${FEATURE_LENGTH}. ` +
          'Revisa signFeatures.ts vs features.py.',
      )
    }
    if (scaler.featureVersion !== FEATURE_VERSION) {
      throw new Error(
        `featureVersion del modelo (${scaler.featureVersion}) != frontend (${FEATURE_VERSION}).`,
      )
    }

    cache = { model, scaler, labels }
    return cache
  })()

  try {
    return await loadingPromise
  } catch (error) {
    loadingPromise = null
    throw error
  }
}

function relu(v: number): number {
  return v > 0 ? v : 0
}

function forward(model: ModelJson, input: Float32Array): number[] {
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

/** Predice la sena a partir de la secuencia de frames grabada. */
export async function predictSign(frames: HandFrame[]): Promise<SignPrediction> {
  const { model, scaler, labels } = await loadSignModel()

  const features = framesToFeatures(frames)
  const standardized = standardize(features, scaler)
  const probs = forward(model, standardized)

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

/**
 * true si hay un modelo exportado disponible.
 * Intenta cargarlo del todo (queda cacheado para `predictSign`).
 */
export async function signModelAvailable(): Promise<boolean> {
  try {
    await loadSignModel()
    return true
  } catch {
    return false
  }
}
