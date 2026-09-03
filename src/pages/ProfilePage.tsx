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
import { useAuth } from '@/hooks/useAuth'
import { useBackendHealth } from '@/hooks/useBackendHealth'
import { getProfile, persistenceNote, updateProfile } from '@/services/api'
import type { UserProfile } from '@/types'

import './ProfilePage.css'
import './pages.css'

interface ProfileLink {
  label: string
  to: string
  icon: IconName
}

const LINKS: ProfileLink[] = [
  { label: 'Preferencias', to: ROUTES.accessibility, icon: 'settings' },
  { label: 'Privacidad y datos', to: ROUTES.privacy, icon: 'shield' },
  { label: 'Ayuda y tutorial', to: ROUTES.help, icon: 'help' },
]

/** Perfil vacio para el modo invitado: no hay cuenta que mostrar. */
const GUEST_PROFILE: UserProfile = { name: 'Invitado', email: '' }

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, signOut, updateUser } = useAuth()

  const fetcher = useCallback(() => getProfile(), [])
  // De invitado no se consulta el perfil del servidor: no hay cuenta.
  const initial: UserProfile = user
    ? { name: user.name, email: user.email }
    : GUEST_PROFILE
  const { data: fetched, source, refetch } = useApiResource(fetcher, initial)
  const profile = isAuthenticated ? fetched : GUEST_PROFILE
  const health = useBackendHealth()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedNote, setSavedNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startEditing = () => {
    setName(profile.name)
    setEmail(profile.email)
    setSavedNote(null)
    setError(null)
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const res = await updateProfile({ name: name.trim(), email: email.trim() })
    setSaving(false)

    if (!res.ok) {
      // Rechazo real del servidor (p. ej. correo de otra cuenta): se queda
      // en edicion para poder corregirlo.
      setError(res.error)
      return
    }

    setEditing(false)
    if (res.source === 'api') {
      // Reflejar el cambio en la sesion para que Inicio lo muestre al momento.
      updateUser({ name: res.data.name, email: res.data.email })
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
          {isAuthenticated && <span className="profile__status" />}
        </span>
        {!editing && (
          <>
            <p className="profile__name">{profile.name}</p>
            {isAuthenticated ? (
              <p className="text-muted text-sm">{profile.email}</p>
            ) : (
              <p className="text-muted text-sm">Sin cuenta</p>
            )}
          </>
        )}
      </div>

      {isAuthenticated ? (
        editing ? (
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
            {error && <p className="profile__error text-sm">{error}</p>}
            <div className="profile__edit-actions">
              <Button
                icon="check"
                onClick={handleSave}
                disabled={saving || name.trim() === '' || email.trim() === ''}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(false)
                  setError(null)
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
        )
      ) : (
        <Card className="profile__guest">
          <p className="profile__guest-text text-sm">
            Estas usando Chaski Pe sin cuenta. Crea una para guardar tu
            historial y tus preferencias, y recuperarlos en otro dispositivo.
          </p>
          <div className="stack-sm">
            <Button
              fullWidth
              icon="user"
              onClick={() => navigate(ROUTES.register)}
            >
              Crear cuenta
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate(ROUTES.login)}
            >
              Iniciar sesion
            </Button>
          </div>
        </Card>
      )}

      {savedNote && <p className="text-xs text-muted text-center">{savedNote}</p>}

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

      {isAuthenticated && (
        <button
          type="button"
          className="profile__logout"
          onClick={() => {
            signOut()
            navigate(ROUTES.login)
          }}
        >
          <Icon name="logout" size={20} />
          Cerrar sesion
        </button>
      )}

      <p className="demo-note">
        <Icon name="shield" size={14} />
        {isAuthenticated
          ? persistenceNote(source, health.persistence)
          : 'Como invitado, nada se guarda en el servidor: el historial y las preferencias viven solo en este navegador.'}
      </p>
    </div>
  )
}
