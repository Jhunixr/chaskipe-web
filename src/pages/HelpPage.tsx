import { useState } from 'react'

import { Mascot, Mountains } from '@/components/brand'
import { Button, Card, Icon, type IconName, PageHeader } from '@/components/ui'

import './HelpPage.css'
import './pages.css'

interface HelpTopic {
  title: string
  body: string
  icon: IconName
}

const TOPICS: HelpTopic[] = [
  {
    title: 'Como usar la camara',
    body: 'Busca un lugar con buena luz, muestra ambas manos y manten el rostro visible dentro del recuadro.',
    icon: 'camera',
  },
  {
    title: 'Como responder con el avatar',
    body: 'Escribe tu mensaje en "Texto a senas". En una version futura el avatar reproducira la secuencia en LSP.',
    icon: 'user',
  },
  {
    title: 'Consejos para mejores resultados',
    body: 'Realiza las senas a un ritmo constante, evita fondos con mucho movimiento y acerca las manos a la camara.',
    icon: 'help',
  },
  {
    title: 'Preguntas frecuentes',
    body: 'La app aun no reconoce senas ni genera avatar. La LSP no comparte la gramatica del espanol. No se graban videos sin consentimiento.',
    icon: 'chat',
  },
]

export function HelpPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="page help">
      <PageHeader title="Ayuda y tutorial" />

      <div className="help__art" aria-hidden="true">
        <Mascot size={120} alt="" />
        <Mountains />
      </div>

      <ul className="help__list">
        {TOPICS.map((topic, index) => {
          const isOpen = open === index
          return (
            <li key={topic.title}>
              <Card className="card--flat help__topic">
                <button
                  type="button"
                  className="help__topic-head"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <Icon name={topic.icon} size={20} className="help__topic-icon" />
                  <span className="help__topic-title">{topic.title}</span>
                  <Icon
                    name="chevron"
                    size={18}
                    className={`help__topic-chevron${
                      isOpen ? ' help__topic-chevron--open' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="help__topic-body text-sm text-muted">{topic.body}</p>
                )}
              </Card>
            </li>
          )
        })}
      </ul>

      <Button variant="secondary" fullWidth icon="help">
        Contactar soporte
      </Button>

      <p className="disclaimer-note">
        <Icon name="shield" size={16} />
        Chaski Pe no reemplaza a un interprete profesional de Lengua de Senas
        Peruana.
      </p>
    </div>
  )
}
