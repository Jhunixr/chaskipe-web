import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Logo } from '@/components/brand'
import { Button, Icon, PasswordInput, TextInput } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

import './AuthPage.css'
import './pages.css'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, continueAsGuest } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const message = await signIn(email, password)
    setSubmitting(false)
    if (message === null) navigate(ROUTES.home)
    else setError(message)
  }

  const canSubmit = email.trim() !== '' && password !== '' && !submitting

  return (
    <div className="auth">
      <div className="auth__brand">
        <Logo layout="stack" tagline mascotSize={104} />
      </div>

      <form className="auth__form" onSubmit={handleSubmit}>
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
          autoComplete="current-password"
        />

        {error && (
          <p className="auth__error" role="alert">
            <Icon name="shield" size={16} />
            {error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth disabled={!canSubmit}>
          {submitting ? 'Entrando...' : 'Iniciar sesion'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          icon="user"
          onClick={() => {
            continueAsGuest()
            navigate(ROUTES.home)
          }}
        >
          Continuar como invitado
        </Button>
      </form>

      <p className="auth__switch text-sm">
        ¿No tienes cuenta?{' '}
        <Link to={ROUTES.register} className="link">
          Registrate
        </Link>
      </p>

      <p className="demo-note auth__demo">
        <Icon name="shield" size={14} />
        Como invitado puedes usar la app, pero el historial y las preferencias
        se quedan solo en este navegador.
      </p>
    </div>
  )
}
