import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ChaskiFigure, Hills } from '@/components/brand'
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
import { usePreferences } from '@/hooks/usePreferences'
import { getProfile, persistenceNote, updateProfile } from '@/services/api'
import type { UserProfile } from '@/types'
import type { Speed, TextSize } from '@/types/preferences'

import './ProfilePage.css'
import './pages.css'

interface ProfileLink {
  label: string
  to: string
  icon: IconName
}

const LINKS: ProfileLink[] = [
  { label: 'Historial', to: ROUTES.history, icon: 'clock' },
  { label: 'Más preferencias', to: ROUTES.accessibility, icon: 'settings' },
  { label: 'Privacidad y datos', to: ROUTES.privacy, icon: 'shield' },
  { label: 'Ayuda y tutorial', to: ROUTES.help, icon: 'help' },
]

const SIZES: { value: TextSize; label: string; px: number }[] = [
  { value: 'normal', label: 'Normal', px: 15 },
  { value: 'grande', label: 'Grande', px: 19 },
  { value: 'muy-grande', label: 'Muy grande', px: 23 },
]

const SPEEDS: { value: Speed; label: string }[] = [
  { value: 'lenta', label: 'Lenta' },
  { value: 'normal', label: 'Normal' },
  { value: 'rapida', label: 'Rápida' },
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
  const { prefs, set } = usePreferences()

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
      <PageHeader title="Perfil" showBack={false} />

      <section className="profile__hero" aria-label="Tu perfil">
        <Hills sun />
        <ChaskiFigure width={116} className="profile__chaski" />
        <span className="profile__hero-text">
          <span className="profile__name">Hola, {profile.name.split(' ')[0]}</span>
          <span className="profile__sub">
            {isAuthenticated ? profile.email : 'Crea tu cuenta para guardar tu historial'}
          </span>
        </span>
        {isAuthenticated ? (
          !editing && (
            <button type="button" className="profile__hero-btn" onClick={startEditing}>
              <Icon name="edit" size={18} />
              Editar perfil
            </button>
          )
        ) : (
          <button
            type="button"
            className="profile__hero-btn"
            onClick={() => navigate(ROUTES.register)}
          >
            Crear cuenta
          </button>
        )}
      </section>

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
        ) : null
      ) : (
        <button type="button" className="link profile__login" onClick={() => navigate(ROUTES.login)}>
          Ya tengo cuenta · Iniciar sesión
        </button>
      )}

      {savedNote && <p className="text-xs text-muted text-center">{savedNote}</p>}

      <h2 className="profile__group">Ver y leer</h2>
      <Card className="profile__settings">
        <div className="profile__setting">
          <span className="icon-badge icon-badge--gold profile__setting-icon" aria-hidden="true">
            Aa
          </span>
          <span className="profile__setting-label">Letra</span>
          <div className="segmented" role="radiogroup" aria-label="Tamaño de letra">
            {SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                role="radio"
                aria-checked={prefs.textSize === size.value}
                aria-label={size.label}
                className={`segmented__option profile__size${
                  prefs.textSize === size.value ? ' segmented__option--active' : ''
                }`}
                style={{ fontSize: size.px }}
                onClick={() => set('textSize', size.value)}
              >
                A
              </button>
            ))}
          </div>
        </div>
      </Card>

      <h2 className="profile__group">Voz y señas</h2>
      <Card className="profile__settings">
        <div className="profile__setting profile__setting--stack">
          <span className="profile__setting-head">
            <span className="icon-badge icon-badge--teal profile__setting-icon" aria-hidden="true">
              <Icon name="clock" size={22} />
            </span>
            <span className="profile__setting-label">Velocidad de Chaski</span>
          </span>
          <div className="segmented profile__speeds" role="radiogroup" aria-label="Velocidad de Chaski">
            {SPEEDS.map((speed) => (
              <button
                key={speed.value}
                type="button"
                role="radio"
                aria-checked={prefs.avatarSpeed === speed.value}
                className={`segmented__option${
                  prefs.avatarSpeed === speed.value ? ' segmented__option--active' : ''
                }`}
                onClick={() => set('avatarSpeed', speed.value)}
              >
                {speed.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

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
