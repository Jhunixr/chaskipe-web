import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Logo } from '@/components/brand'
import { Button, PasswordInput, TextInput } from '@/components/ui'

import './AuthPage.css'
import './pages.css'

/**
 * FASE 1: solo interfaz. No hay autenticacion real; cualquier accion lleva a Inicio.
 */
export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    navigate(ROUTES.home)
  }

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

        <Link to={ROUTES.login} className="link auth__forgot">
          ¿Olvidaste tu contrasena?
        </Link>

        <Button type="submit" size="lg" fullWidth>
          Iniciar sesion
        </Button>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          icon="user"
          onClick={() => navigate(ROUTES.home)}
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
        Demo: el inicio de sesion todavia no valida credenciales.
      </p>
    </div>
  )
}
