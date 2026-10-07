import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Button, Icon, PageHeader, PasswordInput, TextInput } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

import './AuthPage.css'
import './pages.css'

/** Debe coincidir con `MIN_PASSWORD` en `backend/app/schemas/auth.py`. */
const MIN_PASSWORD = 8

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const passwordTooShort = password !== '' && password.length < MIN_PASSWORD

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const message = await signUp(name, email, password)
    setSubmitting(false)
    if (message === null) navigate(ROUTES.home)
    else setError(message)
  }

  const canSubmit =
    accepted &&
    !submitting &&
    name.trim() !== '' &&
    email.trim() !== '' &&
    password.length >= MIN_PASSWORD

  return (
    <div className="auth">
      <PageHeader title="Crear cuenta" />

      <form className="auth__form" onSubmit={handleSubmit}>
        <TextInput
          value={name}
          onChange={setName}
          icon="user"
          placeholder="Nombre"
          autoComplete="name"
        />
        <TextInput
          value={email}
          onChange={setEmail}
          type="email"
          icon="mail"
          placeholder="Correo electronico"
          autoComplete="email"
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <p
          className={`auth__hint text-xs${
            passwordTooShort ? ' auth__hint--warn' : ''
          }`}
        >
          Minimo {MIN_PASSWORD} caracteres. Una frase larga es mas segura y mas
          facil de recordar.
        </p>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span>
            Acepto los <span className="link">terminos</span> y la{' '}
            <Link to={ROUTES.privacy} className="link">
              privacidad
            </Link>
          </span>
        </label>

        {error && (
          <p className="auth__error" role="alert">
            <Icon name="shield" size={16} />
            {error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth disabled={!canSubmit}>
          {submitting ? 'Creando cuenta...' : 'Registrarme'}
        </Button>
      </form>

      <p className="auth__switch text-sm">
        <Link to={ROUTES.login} className="link">
          Ya tengo una cuenta
        </Link>
      </p>
    </div>
  )
}
