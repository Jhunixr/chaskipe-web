import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { Button, Icon, PageHeader, type IconName } from '@/components/ui'
import { useApiResource } from '@/hooks/useApiResource'
import { useSpeech } from '@/hooks/useSpeech'
import { getPhraseGroups } from '@/services/api'
import { QUICK_PHRASE_GROUPS } from '@/services/mockData'
import type { QuickPhraseCategory } from '@/types'

import './QuickPhrasesPage.css'
import './pages.css'

type Tone = 'red' | 'teal' | 'gold'

const CATEGORY_STYLE: Record<QuickPhraseCategory, { icon: IconName; tone: Tone }> = {
  saludos: { icon: 'smile', tone: 'gold' },
  respuestas: { icon: 'check', tone: 'teal' },
  necesidades: { icon: 'hands', tone: 'red' },
  salud: { icon: 'pulse', tone: 'red' },
  transporte: { icon: 'bus', tone: 'teal' },
  compras: { icon: 'bag', tone: 'gold' },
  emergencias: { icon: 'siren', tone: 'red' },
}

/** Estilo de un tema; uno desconocido (p. ej. nuevo en el servidor) usa el neutro. */
function styleOf(category: string): { icon: IconName; tone: Tone } {
  return CATEGORY_STYLE[category as QuickPhraseCategory] ?? { icon: 'phrases', tone: 'gold' }
}

/** La frase mas usada: siempre arriba, en grande. */
const SOS_TEXT = 'Soy una persona sorda. Por favor, escríbeme.'

/**
 * Frases rapidas: se tocan una vez y el celular las dice en voz alta. La
 * elegida se puede mostrar en señas con Chaski.
 */
export function QuickPhrasesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { speak, supported } = useSpeech()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<QuickPhraseCategory | 'todas'>(
    () => (location.state as { category?: QuickPhraseCategory } | null)?.category ?? 'todas',
  )
  const [selected, setSelected] = useState<string | null>(null)

  const fetcher = useCallback(() => getPhraseGroups(), [])
  const { data: allGroups } = useApiResource(fetcher, QUICK_PHRASE_GROUPS)

  const phrases = useMemo(() => {
    const term = query.trim().toLowerCase()
    return allGroups
      .filter((g) => category === 'todas' || g.category === category)
      .flatMap((g) => g.phrases.map((p) => ({ ...p, category: g.category })))
      .filter((p) => !term || p.text.toLowerCase().includes(term))
  }, [query, category, allGroups])

  const selectedText =
    selected === 'sos' ? SOS_TEXT : (phrases.find((p) => p.id === selected)?.text ?? null)

  const say = (id: string, text: string) => {
    setSelected(id)
    speak(text)
  }

  return (
    <div className={`page quick-phrases${selectedText ? ' quick-phrases--selected' : ''}`}>
      <PageHeader title="Frases" showBack={false} />

      <div className="input-group">
        <Icon name="search" size={22} className="input-group__icon" />
        <input
          className="input-group__field"
          type="search"
          placeholder="Buscar una frase"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar frases"
        />
      </div>

      <div className="chip-row" role="tablist" aria-label="Temas">
        <button
          type="button"
          role="tab"
          aria-selected={category === 'todas'}
          className={`chip${category === 'todas' ? ' chip--active' : ''}`}
          onClick={() => setCategory('todas')}
        >
          Todas
        </button>
        {allGroups.map((group) => {
          const style = styleOf(group.category)
          const active = category === group.category
          return (
            <button
              key={group.category}
              type="button"
              role="tab"
              aria-selected={active}
              className={`chip${active ? ' chip--active' : ''}`}
              onClick={() => setCategory(group.category)}
            >
              <span className={`quick-phrases__chip-icon quick-phrases__chip-icon--${style.tone}`}>
                <Icon name={style.icon} size={18} />
              </span>
              {group.label}
            </button>
          )
        })}
      </div>

      {!query && (
        <button
          type="button"
          className={`quick-phrases__sos${selected === 'sos' ? ' quick-phrases__sos--on' : ''}`}
          onClick={() => say('sos', SOS_TEXT)}
          disabled={!supported}
        >
          <span className="quick-phrases__sos-icon">
            <Icon name="volume" size={26} />
          </span>
          {SOS_TEXT}
        </button>
      )}

      {phrases.length === 0 ? (
        <p className="text-muted text-center">No hay frases con “{query}”.</p>
      ) : (
        <ul className="quick-phrases__grid">
          {phrases.map((phrase) => {
            const style = styleOf(phrase.category)
            return (
              <li key={phrase.id}>
                <button
                  type="button"
                  className={`tile quick-phrases__tile${
                    selected === phrase.id ? ' quick-phrases__tile--on' : ''
                  }`}
                  onClick={() => say(phrase.id, phrase.text)}
                  disabled={!supported}
                >
                  <span className={`icon-badge icon-badge--${style.tone} quick-phrases__tile-icon`}>
                    <Icon name={style.icon} size={22} />
                  </span>
                  <span className="quick-phrases__tile-text">{phrase.text}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className="demo-note">
        Toca una frase y el celular la dice en voz alta. Las señas de estas
        frases aún no están validadas con personas usuarias ni intérpretes.
      </p>

      {selectedText && (
        <div className="quick-phrases__bar">
          <Button
            size="lg"
            fullWidth
            icon="hands"
            onClick={() => navigate(ROUTES.textToSign, { state: { text: selectedText } })}
          >
            Mostrar en señas
          </Button>
        </div>
      )}
    </div>
  )
}
