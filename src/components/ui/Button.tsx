import type { ButtonHTMLAttributes, ReactNode } from 'react'

import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    fullWidth ? 'btn--full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
