import { useId } from 'react'

import { Icon, type IconName } from './Icon'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email'
  icon?: IconName
  autoComplete?: string
  label?: string
}

/** Campo de texto con icono a la izquierda. */
export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  autoComplete,
  label,
}: TextInputProps) {
  const id = useId()

  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-group">
        {icon && <Icon name={icon} size={20} className="input-group__icon" />}
        <input
          id={id}
          className="input-group__field"
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}
