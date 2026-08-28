import { PageHeader } from '@/components/ui'
import { useSpeech } from '@/hooks/useSpeech'
import { QUICK_PHRASE_GROUPS } from '@/services/mockData'

import './QuickPhrasesPage.css'
import './pages.css'

export function QuickPhrasesPage() {
  const { speak, supported } = useSpeech()

  return (
    <div className="page">
      <PageHeader
        title="Frases rapidas"
        subtitle="Toca una frase para escucharla."
        showBack={false}
      />

      <p className="demo-note">
        Las senas LSP asociadas a estas frases aun no estan validadas con
        personas usuarias ni interpretes (contenido demostrativo).
      </p>

      {QUICK_PHRASE_GROUPS.map((group) => (
        <section key={group.category} className="page__section">
          <h2 className="section-title">{group.label}</h2>
          <div className="quick-phrases__grid">
            {group.phrases.map((phrase) => (
              <button
                key={phrase.id}
                type="button"
                className="quick-phrase"
                onClick={() => speak(phrase.text)}
                disabled={!supported}
              >
                {phrase.text}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
