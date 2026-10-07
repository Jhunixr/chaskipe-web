import { Button, Card, Icon, PageHeader, Toggle } from '@/components/ui'
import { usePreferences } from '@/hooks/usePreferences'
import { useSpeech } from '@/hooks/useSpeech'
import {
  LANGUAGES,
  type Speed,
  type ThemePreference,
} from '@/types/preferences'

import './AccessibilityPage.css'
import './pages.css'

const SPEEDS: Speed[] = ['lenta', 'normal', 'rapida']
const SPEED_LABEL: Record<Speed, string> = {
  lenta: 'Lenta',
  normal: 'Normal',
  rapida: 'Rapida',
}

const THEMES: { value: ThemePreference; label: string; icon: 'sun' | 'user' }[] = [
  { value: 'claro', label: 'Claro', icon: 'sun' },
  { value: 'oscuro', label: 'Oscuro', icon: 'sun' },
  { value: 'sistema', label: 'Sistema', icon: 'user' },
]

/**
 * Preferencias de accesibilidad. Todas se aplican de inmediato y se guardan
 * en el navegador; "Guardar cambios" ademas las envia al servidor para que
 * viajen entre dispositivos.
 */
export function AccessibilityPage() {
  const { prefs, set, save, saveState, dirty } = usePreferences()
  const { speak, supported } = useSpeech()

  const canDecrease = prefs.textSize !== 'normal'
  const canIncrease = prefs.textSize !== 'muy-grande'

  const stepText = (delta: -1 | 1) => {
    const order = ['normal', 'grande', 'muy-grande'] as const
    const index = order.indexOf(prefs.textSize)
    const next = order[index + delta]
    if (next) set('textSize', next)
  }

  return (
    <div className="page accessibility">
      <PageHeader title="Accesibilidad" />

      <Card className="stack-lg">
        <div className="row-between">
          <span className="field__label">Tamano del texto</span>
          <div className="accessibility__text-size">
            <button
              type="button"
              onClick={() => stepText(-1)}
              disabled={!canDecrease}
              aria-label="Reducir tamano del texto"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => stepText(1)}
              disabled={!canIncrease}
              aria-label="Aumentar tamano del texto"
            >
              A+
            </button>
          </div>
        </div>

        <div className="accessibility__slider">
          <span className="row-between">
            <span className="row field__label">
              <Icon name="sun" size={18} />
              Tema
            </span>
          </span>
          <div className="segmented accessibility__segmented" role="radiogroup" aria-label="Tema">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={prefs.theme === t.value}
                className={`segmented__option${
                  prefs.theme === t.value ? ' segmented__option--active' : ''
                }`}
                onClick={() => set('theme', t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="accessibility__slider">
          <span className="row-between">
            <span className="row field__label">
              <Icon name="volume" size={18} />
              Velocidad de voz
            </span>
            <button
              type="button"
              className="chip accessibility__try"
              onClick={() => speak('Hola, asi se escucha la voz.')}
              disabled={!supported}
            >
              <Icon name="volume" size={14} />
              Probar
            </button>
          </span>
          <div className="accessibility__range">
            <span aria-hidden="true">🐢</span>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={SPEEDS.indexOf(prefs.voiceSpeed)}
              onChange={(event) => {
                const next = SPEEDS[Number(event.target.value)]
                if (next) set('voiceSpeed', next)
              }}
              aria-label="Velocidad de voz"
              aria-valuetext={SPEED_LABEL[prefs.voiceSpeed]}
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
              value={SPEEDS.indexOf(prefs.avatarSpeed)}
              onChange={(event) => {
                const next = SPEEDS[Number(event.target.value)]
                if (next) set('avatarSpeed', next)
              }}
              aria-label="Velocidad del avatar"
              aria-valuetext={SPEED_LABEL[prefs.avatarSpeed]}
            />
            <span aria-hidden="true">🐇</span>
          </div>
        </div>

        <div className="row-between">
          <span className="row field__label">
            <Icon name="chat" size={18} />
            Subtitulos siempre visibles
          </span>
          <Toggle
            checked={prefs.subtitles}
            onChange={(value) => set('subtitles', value)}
            label="Subtitulos siempre visibles"
          />
        </div>

        <div className="row-between">
          <label className="row field__label" htmlFor="accessibility-language">
            <Icon name="help" size={18} />
            Idioma de la voz
          </label>
          <select
            id="accessibility-language"
            className="field__select accessibility__language"
            value={prefs.language}
            onChange={(event) => set('language', event.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <p className="demo-note">
        <Icon name="shield" size={14} />
        Los cambios se aplican al instante y se recuerdan en este navegador.
        "Guardar cambios" los envia ademas al servidor.
      </p>

      <Button
        size="lg"
        fullWidth
        icon={saveState === 'saved' ? 'check' : 'refresh'}
        className="accessibility__save"
        onClick={() => void save()}
        disabled={saveState === 'saving' || !dirty}
      >
        {saveState === 'saving' ? 'Guardando...' : 'Guardar cambios'}
      </Button>

      {saveState === 'saved' && (
        <p className="text-xs text-center accessibility__saved">
          Preferencias guardadas en el servidor.
        </p>
      )}
      {saveState === 'local' && (
        <p className="text-xs text-muted text-center">
          Sin conexion con el servidor: se guardaron solo en este navegador.
        </p>
      )}

      <span className="andean-rule" aria-hidden="true">
        <span className="andean-rule__diamond" />
      </span>
    </div>
  )
}
