import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Button, PageHeader, PasswordInput, TextInput } from '@/components/ui'

import './AuthPage.css'
import './pages.css'

/** FASE 1: solo interfaz. No se crea ninguna cuenta real. */
export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    navigate(ROUTES.home)
  }

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

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span>
            Acepto los <span className="link">terminos</span> y la{' '}
            <span className="link">privacidad</span>
          </span>
        </label>

        <Button type="submit" size="lg" fullWidth disabled={!accepted}>
          Registrarme
        </Button>
      </form>

      <p className="auth__switch text-sm">
        <Link to={ROUTES.login} className="link">
          Ya tengo una cuenta
        </Link>
      </p>

      <p className="demo-note auth__demo">
        Demo: el registro todavia no crea cuentas.
      </p>
    </div>
  )
}
