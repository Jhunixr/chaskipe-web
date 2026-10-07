import chaski3dUrl from '@/assets/mascot/chaski-3d.webp'

import './ChaskiFigure.css'

interface ChaskiFigureProps {
  /** Ancho en px; el alto sale de la proporcion de la imagen. */
  width: number
  /** Texto alternativo. Vacio => decorativa. */
  alt?: string
  className?: string
}

/**
 * Chaski en 3D (el niño del logo, modelo generado con Hunyuan3D-2), recortado
 * con fondo transparente para ponerlo sobre los colores de la marca.
 */
export function ChaskiFigure({ width, alt = '', className }: ChaskiFigureProps) {
  return (
    <img
      className={['chaski-figure', className ?? ''].filter(Boolean).join(' ')}
      src={chaski3dUrl}
      width={width}
      height={Math.round((width * 640) / 492)}
      alt={alt}
      draggable={false}
      {...(alt === '' ? { 'aria-hidden': true } : {})}
    />
  )
}
