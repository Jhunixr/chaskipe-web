/**
 * Paridad Python <-> TypeScript del modelo de letras.
 *
 * El fixture lo genera `ai/scripts/train_letters.py` con manos reales del
 * dataset: si las features o la red del navegador se desvian de las de
 * Python, el modelo exportado deja de reconocer bien sin dar ningun error.
 */
import { describe, expect, it } from 'vitest'

import type { Landmark } from '@/types/handLandmarks'

import labelsJson from '../../public/models/letters/labels.json'
import modelJson from '../../public/models/letters/model.json'
import scalerJson from '../../public/models/letters/scaler.json'
import fixture from './__fixtures__/staticFeatures.fixture.json'
import { forward } from './signModel'
import { standardize } from './signFeatures'
import { handToStaticFeatures, STATIC_FEATURE_LENGTH } from './staticFeatures'

interface FixtureCase {
  label: string
  handedness: string
  world: [number, number, number][]
  features: number[]
  probs: number[]
}

const cases = fixture as FixtureCase[]
const model = modelJson as Parameters<typeof forward>[0]
const scaler = scalerJson
const labels = labelsJson

const toLandmarks = (world: [number, number, number][]): Landmark[] =>
  world.map(([x, y, z]) => ({ x, y, z }))

describe('staticFeatures', () => {
  it('tiene la misma longitud que el modelo exportado', () => {
    expect(model.inputDim).toBe(STATIC_FEATURE_LENGTH)
    expect(scaler.featureLength).toBe(STATIC_FEATURE_LENGTH)
  })

  it.each(cases.map((c, i) => [i, c] as const))('coincide con Python (caso %i)', (_, c) => {
    const features = handToStaticFeatures(toLandmarks(c.world), c.handedness, labels.referenceHandedness)
    expect(features).not.toBeNull()
    c.features.forEach((v, i) => expect(features![i]).toBeCloseTo(v, 5))
  })

  it.each(cases.map((c, i) => [i, c] as const))('la red da las mismas probabilidades (caso %i)', (_, c) => {
    const features = handToStaticFeatures(toLandmarks(c.world), c.handedness, labels.referenceHandedness)!
    const probs = forward(model, standardize(features, scaler))
    c.probs.forEach((p, i) => expect(probs[i]).toBeCloseTo(p, 4))
  })

  it('la mano contraria reflejada da las mismas features', () => {
    const c = cases[0]!
    const other = c.handedness === 'Left' ? 'Right' : 'Left'
    const mirrored = c.world.map(([x, y, z]) => [-x, y, z] as [number, number, number])
    const a = handToStaticFeatures(toLandmarks(c.world), c.handedness)!
    const b = handToStaticFeatures(toLandmarks(mirrored), other)!
    a.forEach((v, i) => expect(b[i]).toBeCloseTo(v, 6))
  })

  it('rechaza manos incompletas', () => {
    expect(handToStaticFeatures([{ x: 0, y: 0, z: 0 }], 'Left')).toBeNull()
  })
})
