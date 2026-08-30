import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Mascot } from '@/components/brand'
import {
  Button,
  Card,
  Icon,
  type IconName,
  PageHeader,
  TextInput,
} from '@/components/ui'
import { useApiResource } from '@/hooks/useApiResource'
import { useBackendHealth } from '@/hooks/useBackendHealth'
import { getProfile, persistenceNote, updateProfile } from '@/services/api'
import { DEMO_USER } from '@/services/mockData'

import './ProfilePage.css'
import './pages.css'

interface ProfileLink {
  label: string
  to: string
  icon: IconName
}

const LINKS: ProfileLink[] = [
  { label: 'Preferencias', to: ROUTES.accessibility, icon: 'settings' },
  { label: 'Privacidad y datos', to: ROUTES.help, icon: 'shield' },
  { label: 'Ayuda y tutorial', to: ROUTES.help, icon: 'help' },
]

export function ProfilePage() {
  const navigate = useNavigate()
  const fetcher = useCallback(() => getProfile(), [])
  const { data: profile, source, refetch } = useApiResource(fetcher, DEMO_USER)
  const health = useBackendHealth()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedNote, setSavedNote] = useState<string | null>(null)

  const startEditing = () => {
    setName(profile.name)
    setEmail(profile.email)
    setSavedNote(null)
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await updateProfile({ name: name.trim(), email: email.trim() })
    setSaving(false)
    setEditing(false)
    if (res.source === 'api') {
      setSavedNote(
        health.persistence === 'postgresql'
          ? 'Perfil guardado en el servidor (PostgreSQL).'
          : 'Perfil guardado en el servidor.',
      )
      refetch()
    } else {
      setSavedNote('Sin conexion: el cambio no se guardo en el servidor.')
    }
  }

  return (
    <div className="page profile">
      <PageHeader title="Mi perfil" showBack={false} />

      <div className="profile__identity">
        <span className="profile__avatar" aria-hidden="true">
          <Mascot size={88} alt="" />
          <span className="profile__status" />
        </span>
        {!editing && (
          <>
            <p className="profile__name">{profile.name}</p>
            <p className="text-muted text-sm">{profile.email}</p>
          </>
        )}
      </div>

      {editing ? (
        <Card className="stack-sm">
          <TextInput
            value={name}
            onChange={setName}
            icon="user"
            label="Nombre"
            autoComplete="name"
          />
          <TextInput
            value={email}
            onChange={setEmail}
            type="email"
            icon="mail"
            label="Correo"
            autoComplete="email"
          />
          <div className="profile__edit-actions">
            <Button
              icon="check"
              onClick={handleSave}
              disabled={saving || name.trim() === '' || email.trim() === ''}
            >
              Guardar
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(false)
                setName(profile.name)
                setEmail(profile.email)
              }}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="secondary" fullWidth icon="edit" onClick={startEditing}>
          Editar perfil
        </Button>
      )}

      {savedNote && (
        <p className="text-xs text-muted text-center">{savedNote}</p>
      )}

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
        <Icon name="shield" size={14} />
        {persistenceNote(source, health.persistence)}
      </p>
    </div>
  )
}
