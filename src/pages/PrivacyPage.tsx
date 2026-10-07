import { useCallback, useState } from 'react'

import { Card, Icon, type IconName, PageHeader } from '@/components/ui'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useBackendHealth } from '@/hooks/useBackendHealth'
import { getHistory } from '@/services/api'
import { HISTORY_ENTRIES } from '@/services/mockData'

import './PrivacyPage.css'
import './pages.css'

interface Section {
  icon: IconName
  title: string
  body: string
}

/**
 * Compromisos de privacidad del proyecto. El contenido refleja lo que la app
 * hace de verdad hoy (ver `ai/data/DATASET_FORMAT.md` y `ai/README.md`).
 */
const SECTIONS: Section[] = [
  {
    icon: 'camera',
    title: 'No se graban videos',
    body:
      'La camara se usa solo para detectar la posicion de las manos en vivo. ' +
      'No se graba, ni se guarda, ni se envia ninguna imagen ni ningun video.',
  },
  {
    icon: 'hands',
    title: 'Solo coordenadas de landmarks',
    body:
      'Cuando participas en una captura para el dataset, se guardan unicamente ' +
      'las coordenadas de 21 puntos de la mano. Esos numeros no permiten ' +
      'reconstruir tu rostro ni identificarte.',
  },
  {
    icon: 'shield',
    title: 'La captura requiere tu consentimiento',
    body:
      'La herramienta de captura no graba nada hasta que marcas la casilla de ' +
      'consentimiento de forma explicita. Puedes dejar de participar cuando ' +
      'quieras.',
  },
  {
    icon: 'user',
    title: 'El reconocimiento ocurre en tu dispositivo',
    body:
      'El modelo de IA se ejecuta dentro de tu navegador. Las senas que haces ' +
      'no se envian a ningun servidor para ser interpretadas.',
  },
  {
    icon: 'clock',
    title: 'Que se guarda en el servidor',
    body:
      'Tu perfil, tus preferencias de accesibilidad y el historial de ' +
      'traducciones. Puedes borrar cualquier entrada del historial desde esa ' +
      'pantalla.',
  },
]

export function PrivacyPage() {
  const [open, setOpen] = useState<number | null>(0)
  const { isAuthenticated } = useAuth()
  const health = useBackendHealth()
  const fetcher = useCallback(() => getHistory(), [])
  const { data: history } = useApiResource(fetcher, HISTORY_ENTRIES)

  const storageLabel = !isAuthenticated
    ? 'Solo en este navegador (sin cuenta)'
    : health.persistence === 'postgresql'
      ? 'Base de datos del servidor (PostgreSQL)'
      : health.online
        ? 'Memoria del servidor (se borra al reiniciarlo)'
        : 'Sin conexion con el servidor'

  return (
    <div className="page privacy">
      <PageHeader title="Privacidad y datos" />

      <p className="privacy__lead">
        Chaski Pe trabaja con la camara y con Lengua de Senas Peruana. Esto es
        exactamente que se guarda y que no.
      </p>

      <ul className="privacy__list">
        {SECTIONS.map((section, index) => {
          const isOpen = open === index
          return (
            <li key={section.title}>
              <Card className="card--flat privacy__item">
                <button
                  type="button"
                  className="privacy__head"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span className="privacy__icon">
                    <Icon name={section.icon} size={18} />
                  </span>
                  <span className="privacy__title">{section.title}</span>
                  <Icon
                    name="chevron"
                    size={18}
                    className={`privacy__chevron${
                      isOpen ? ' privacy__chevron--open' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="privacy__body text-sm text-muted">
                    {section.body}
                  </p>
                )}
              </Card>
            </li>
          )
        })}
      </ul>

      <section className="page__section">
        <span className="section-title">Tus datos ahora mismo</span>
        <Card className="privacy__facts">
          <div className="privacy__fact">
            <span className="text-sm text-muted">Donde se guardan</span>
            <strong>{storageLabel}</strong>
          </div>
          <div className="privacy__fact">
            <span className="text-sm text-muted">Traducciones guardadas</span>
            <strong>{isAuthenticated ? history.length : 0}</strong>
          </div>
          <div className="privacy__fact">
            <span className="text-sm text-muted">Videos guardados</span>
            <strong className="privacy__zero">Ninguno</strong>
          </div>
        </Card>
      </section>

      <p className="disclaimer-note">
        <Icon name="shield" size={16} />
        Las senas capturadas llevan la marca <code>validated: false</code> hasta
        ser revisadas con personas usuarias de LSP o interpretes. Chaski Pe no
        reemplaza a un interprete profesional.
      </p>
    </div>
  )
}
