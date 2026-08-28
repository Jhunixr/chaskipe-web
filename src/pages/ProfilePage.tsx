import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Mascot } from '@/components/brand'
import { Card, Icon, type IconName, PageHeader } from '@/components/ui'
import { DEMO_USER } from '@/services/mockData'

import './ProfilePage.css'
import './pages.css'

interface ProfileLink {
  label: string
  to: string
  icon: IconName
  danger?: boolean
}

const LINKS: ProfileLink[] = [
  { label: 'Editar perfil', to: ROUTES.profile, icon: 'edit' },
  { label: 'Preferencias', to: ROUTES.accessibility, icon: 'settings' },
  { label: 'Privacidad y datos', to: ROUTES.help, icon: 'shield' },
  { label: 'Ayuda y tutorial', to: ROUTES.help, icon: 'help' },
]

export function ProfilePage() {
  const navigate = useNavigate()

  return (
    <div className="page profile">
      <PageHeader title="Mi perfil" showBack={false} />

      <div className="profile__identity">
        <span className="profile__avatar" aria-hidden="true">
          <Mascot size={88} alt="" />
          <span className="profile__status" />
        </span>
        <p className="profile__name">{DEMO_USER.name} Flores</p>
        <p className="text-muted text-sm">{DEMO_USER.email}</p>
      </div>

      <Card className="card--flat">
        <nav className="list-links" aria-label="Opciones de perfil">
          {LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              className="list-links__item"
              onClick={() => navigate(link.to)}
            >
              <Icon name={link.icon} size={20} className="list-links__icon" />
              <span className="list-links__label">{link.label}</span>
              <Icon name="chevron" size={18} className="list-links__chevron" />
            </button>
          ))}
        </nav>
      </Card>

      <button
        type="button"
        className="profile__logout"
        onClick={() => navigate(ROUTES.login)}
      >
        <Icon name="logout" size={20} />
        Cerrar sesion
      </button>

      <p className="demo-note">
        Perfil de ejemplo. La edicion y el cierre de sesion aun no persisten datos.
      </p>
    </div>
  )
}
