import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Card, PageHeader } from '@/components/ui'
import { DEMO_USER } from '@/services/mockData'

import './ProfilePage.css'
import './pages.css'

interface ProfileLink {
  label: string
  to: string
}

const LINKS: ProfileLink[] = [
  { label: 'Editar perfil', to: ROUTES.profile },
  { label: 'Preferencias y accesibilidad', to: ROUTES.accessibility },
  { label: 'Privacidad y datos', to: ROUTES.help },
  { label: 'Ayuda y tutorial', to: ROUTES.help },
]

export function ProfilePage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <PageHeader title="Perfil" showBack={false} />

      <Card className="profile__identity">
        <span className="profile__avatar" aria-hidden="true">
          {DEMO_USER.name.charAt(0)}
        </span>
        <div>
          <p className="profile__name">{DEMO_USER.name}</p>
          <p className="text-muted text-sm">{DEMO_USER.email}</p>
        </div>
      </Card>

      <Card>
        <nav className="list-links" aria-label="Opciones de perfil">
          {LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              className="list-links__item"
              onClick={() => navigate(link.to)}
            >
              <span>{link.label}</span>
              <span className="list-links__chevron" aria-hidden="true">
                ›
              </span>
            </button>
          ))}
        </nav>
      </Card>
    </div>
  )
}
