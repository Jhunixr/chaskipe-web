import { useId, useState } from 'react'

import { Icon } from './Icon'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  label?: string
}

/** Campo de contrasena con icono de candado y boton para mostrar/ocultar. */
export function PasswordInput({
  value,
  onChange,
  placeholder = 'Contrasena',
  autoComplete = 'current-password',
  label,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-group">
        <Icon name="lock" size={20} className="input-group__icon" />
        <input
          id={id}
          className="input-group__field"
          type={visible ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="input-group__toggle"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
        >
          <Icon name="eye" size={20} />
        </button>
      </div>
    </div>
  )
}
