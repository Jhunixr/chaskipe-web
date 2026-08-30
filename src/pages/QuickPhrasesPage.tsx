import { useCallback, useMemo, useState } from 'react'

import { Button, Icon, PageHeader } from '@/components/ui'
import { useApiResource } from '@/hooks/useApiResource'
import { useSpeech } from '@/hooks/useSpeech'
import { getPhraseGroups } from '@/services/api'
import { QUICK_PHRASE_GROUPS } from '@/services/mockData'
import type { QuickPhraseCategory } from '@/types'

import './QuickPhrasesPage.css'
import './pages.css'

const CATEGORY_ICON: Record<QuickPhraseCategory, 'chat' | 'hands' | 'bell'> = {
  saludos: 'chat',
  necesidades: 'hands',
  emergencias: 'bell',
}

export function QuickPhrasesPage() {
  const { speak, supported } = useSpeech()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const fetcher = useCallback(() => getPhraseGroups(), [])
  const { data: allGroups } = useApiResource(fetcher, QUICK_PHRASE_GROUPS)

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return allGroups
    return allGroups
      .map((group) => ({
        ...group,
        phrases: group.phrases.filter((phrase) =>
          phrase.text.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.phrases.length > 0)
  }, [query, allGroups])

  return (
    <div className="page quick-phrases">
      <PageHeader title="Frases rapidas" showBack={false} />

      <div className="input-group">
        <Icon name="search" size={20} className="input-group__icon" />
        <input
          className="input-group__field"
          type="text"
          placeholder="Buscar frases..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar frases"
        />
      </div>

      <p className="demo-note">
        Las senas LSP asociadas a estas frases aun no estan validadas con
        personas usuarias ni interpretes (contenido demostrativo).
      </p>

      {groups.map((group) => (
        <section key={group.category} className="page__section">
          <h2 className="quick-phrases__category">
            <Icon name={CATEGORY_ICON[group.category]} size={18} />
            {group.label}
          </h2>
          {group.category === 'saludos' ? (
            <div className="quick-phrases__chips">
              {group.phrases.map((phrase) => (
                <button
                  key={phrase.id}
                  type="button"
                  className={`chip${selected === phrase.id ? ' chip--active' : ''}`}
                  onClick={() => {
                    setSelected(phrase.id)
                    speak(phrase.text)
                  }}
                  disabled={!supported}
                >
                  {phrase.text}
                  <Icon name="chevron" size={14} />
                </button>
              ))}
            </div>
          ) : (
            <ul className="quick-phrases__list">
              {group.phrases.map((phrase) => (
                <li key={phrase.id}>
                  <button
                    type="button"
                    className={`quick-phrases__row${
                      selected === phrase.id ? ' quick-phrases__row--active' : ''
                    }`}
                    onClick={() => {
                      setSelected(phrase.id)
                      speak(phrase.text)
                    }}
                    disabled={!supported}
                  >
                    <span>{phrase.text}</span>
                    <Icon name="chevron" size={18} className="text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <Button size="lg" fullWidth icon="hands" disabled={!selected}>
        Mostrar en senas
      </Button>
    </div>
  )
}
