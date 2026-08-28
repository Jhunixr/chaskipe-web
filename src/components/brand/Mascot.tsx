import { mascotAssets } from './mascotAssets'

import './Mascot.css'

interface MascotProps {
  size?: number
  /** Texto alternativo. Vacio => decorativa. */
  alt?: string
}

/**
 * Mascota del chaski. Usa la imagen de `mascotAssets.mascot` (o `logo`) si
 * existe; si no, dibuja un marcador SVG con el anillo tipo globo de dialogo
 * de la identidad de Chaski Pe.
 */
export function Mascot({ size = 96, alt = '' }: MascotProps) {
  const src = mascotAssets.mascot ?? mascotAssets.logo

  if (src) {
    return (
      <img
        className="mascot mascot--image"
        src={src}
        width={size}
        height={size}
        alt={alt}
        {...(alt === '' ? { 'aria-hidden': true } : {})}
      />
    )
  }

  return (
    <svg
      className="mascot mascot--placeholder"
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role={alt ? 'img' : 'presentation'}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      focusable="false"
    >
      <path
        className="mascot__bubble"
        d="M48 6c23.2 0 42 16.6 42 37 0 20.4-18.8 37-42 37-4 0-7.9-.5-11.6-1.4L18 88l4.3-15.2C13 66 6 55.3 6 43 6 22.6 24.8 6 48 6Z"
      />
      <circle className="mascot__head" cx="45" cy="40" r="15" />
      <path className="mascot__hat" d="M28 33c3-9 10-14 17-14s14 5 17 14c-11-4-23-4-34 0Z" />
      <circle className="mascot__pom" cx="45" cy="17" r="3.4" />
      <path
        className="mascot__hand"
        d="M63 30c2.6-1 4.6.4 4.6 3v9c0 2.2-1.4 3.6-3.4 3.6S61 47.2 61 45v-9c0-2.6.8-4.8 2-6Z"
      />
    </svg>
  )
}
