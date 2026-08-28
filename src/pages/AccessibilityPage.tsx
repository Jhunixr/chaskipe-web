import { useState } from 'react'

import { Button, Card, Icon, PageHeader, Toggle } from '@/components/ui'
import { useTextScale } from '@/hooks/useTextScale'

import './AccessibilityPage.css'
import './pages.css'

type Speed = 'lenta' | 'normal' | 'rapida'

const SPEED_VALUE: Record<Speed, number> = { lenta: 0, normal: 1, rapida: 2 }
const SPEED_FROM_VALUE: Record<number, Speed> = { 0: 'lenta', 1: 'normal', 2: 'rapida' }

/**
 * El tamano de texto SI se aplica en toda la app (useTextScale).
 * El resto de opciones es solo interfaz en la FASE 1.
 */
export function AccessibilityPage() {
  const { size, decrease, increase } = useTextScale()
  const [voiceSpeed, setVoiceSpeed] = useState<Speed>('normal')
  const [avatarSpeed, setAvatarSpeed] = useState<Speed>('normal')
  const [darkMode, setDarkMode] = useState(false)
  const [subtitles, setSubtitles] = useState(true)

  return (
    <div className="page accessibility">
      <PageHeader title="Accesibilidad" />

      <Card className="stack-lg">
        <div className="row-between">
          <span className="field__label">Tamano del texto</span>
          <div className="accessibility__text-size">
            <button
              type="button"
              onClick={decrease}
              disabled={size === 'normal'}
              aria-label="Reducir tamano del texto"
            >
              A-
            </button>
            <button
              type="button"
              onClick={increase}
              disabled={size === 'muy-grande'}
              aria-label="Aumentar tamano del texto"
            >
              A+
            </button>
          </div>
        </div>

        <div className="accessibility__slider">
          <span className="row field__label">
            <Icon name="volume" size={18} />
            Velocidad de voz
          </span>
          <div className="accessibility__range">
            <span aria-hidden="true">🐢</span>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={SPEED_VALUE[voiceSpeed]}
              onChange={(event) => {
                const next = SPEED_FROM_VALUE[Number(event.target.value)]
                if (next) setVoiceSpeed(next)
              }}
              aria-label="Velocidad de voz"
            />
            <span aria-hidden="true">🐇</span>
          </div>
        </div>

        <div className="accessibility__slider">
          <span className="row field__label">
            <Icon name="user" size={18} />
            Velocidad del avatar
          </span>
          <div className="accessibility__range">
            <span aria-hidden="true">🐢</span>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={SPEED_VALUE[avatarSpeed]}
              onChange={(event) => {
                const next = SPEED_FROM_VALUE[Number(event.target.value)]
                if (next) setAvatarSpeed(next)
              }}
              aria-label="Velocidad del avatar"
            />
            <span aria-hidden="true">🐇</span>
          </div>
        </div>

        <div className="row-between">
          <span className="row field__label">
            <Icon name="sun" size={18} />
            Modo oscuro
          </span>
          <Toggle checked={darkMode} onChange={setDarkMode} label="Modo oscuro" />
        </div>

        <div className="row-between">
          <span className="row field__label">
            <Icon name="chat" size={18} />
            Subtitulos siempre visibles
          </span>
          <Toggle
            checked={subtitles}
            onChange={setSubtitles}
            label="Subtitulos siempre visibles"
          />
        </div>

        <div className="row-between">
          <span className="row field__label">
            <Icon name="help" size={18} />
            Idioma
          </span>
          <span className="link">Espanol</span>
        </div>
      </Card>

      <p className="demo-note">
        El modo oscuro, la velocidad de voz/avatar y los subtitulos aun no se
        guardan ni afectan a toda la app. El tamano de texto si se aplica.
      </p>

      <Button size="lg" fullWidth className="accessibility__save">
        Guardar cambios
      </Button>
      <span className="andean-rule" aria-hidden="true">
        <span className="andean-rule__diamond" />
        <span className="andean-rule__diamond" />
      </span>
    </div>
  )
}
