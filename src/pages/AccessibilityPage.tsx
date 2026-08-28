import { useState } from 'react'

import { Card, PageHeader } from '@/components/ui'
import type { AccessibilitySettings } from '@/types'

import './pages.css'

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 'normal',
  voiceSpeed: 'normal',
  avatarSpeed: 'normal',
  subtitles: true,
  language: 'es-PE',
}

/** FASE 1: solo interfaz. Las preferencias no se persisten todavia. */
export function AccessibilityPage() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS)

  return (
    <div className="page">
      <PageHeader title="Accesibilidad" subtitle="Ajusta la app a tus necesidades." />

      <Card className="stack">
        <label className="field">
          <span className="field__label">Tamano de texto</span>
          <select
            className="field__select"
            value={settings.textSize}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                textSize: event.target.value as AccessibilitySettings['textSize'],
              }))
            }
          >
            <option value="normal">Normal</option>
            <option value="grande">Grande</option>
            <option value="muy-grande">Muy grande</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Velocidad de voz</span>
          <select
            className="field__select"
            value={settings.voiceSpeed}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                voiceSpeed: event.target.value as AccessibilitySettings['voiceSpeed'],
              }))
            }
          >
            <option value="lenta">Lenta</option>
            <option value="normal">Normal</option>
            <option value="rapida">Rapida</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Velocidad del avatar</span>
          <select
            className="field__select"
            value={settings.avatarSpeed}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                avatarSpeed: event.target.value as AccessibilitySettings['avatarSpeed'],
              }))
            }
          >
            <option value="lenta">Lenta</option>
            <option value="normal">Normal</option>
            <option value="rapida">Rapida</option>
          </select>
        </label>

        <label className="row" style={{ justifyContent: 'space-between' }}>
          <span className="field__label">Subtitulos</span>
          <input
            type="checkbox"
            checked={settings.subtitles}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, subtitles: event.target.checked }))
            }
          />
        </label>

        <label className="field">
          <span className="field__label">Idioma</span>
          <select className="field__select" value={settings.language} disabled>
            <option value="es-PE">Espanol (Peru)</option>
          </select>
        </label>
      </Card>

      <p className="demo-note">
        Estas opciones aun no se guardan ni afectan a toda la app.
      </p>
    </div>
  )
}
