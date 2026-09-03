import { lazy, Suspense, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { Icon } from '@/components/ui'
import { usePreferences } from '@/hooks/usePreferences'

import type { Avatar3DHandle } from './Avatar3D'

import './AvatarView.css'

const Avatar3D = lazy(() =>
  import('./Avatar3D').then((m) => ({ default: m.Avatar3D })),
)

export interface AvatarViewHandle {
  /** Reproduce el gesto DEMO (marcador, no es una sena real). */
  play: () => void
  stop: () => void
}

interface AvatarViewProps {
  ref?: React.Ref<AvatarViewHandle>
  /** Texto que el avatar "representaria" (se muestra como subtitulo). */
  caption?: string | undefined
  /** true mientras reproduce un gesto. */
  playing?: boolean
}

/**
 * Avatar 3D de Chaski Pe (FASE 9).
 *
 * Escena Three.js con un avatar geometrico en reposo (respira, parpadea) que
 * puede reproducir un **gesto DEMO**. Ese gesto NO representa ninguna sena de
 * Lengua de Senas Peruana: es un marcador de posicion. Las animaciones de
 * senas validadas con personas usuarias de LSP o interpretes son la FASE 10.
 *
 * El componente Three.js se carga de forma diferida (React.lazy).
 */
export function AvatarView({ ref, caption, playing = false }: AvatarViewProps) {
  const inner = useRef<Avatar3DHandle | null>(null)
  const [gestureActive, setGestureActive] = useState(false)
  const autoPlayedRef = useRef(false)
  const { prefs } = usePreferences()

  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        setGestureActive(true)
        inner.current?.playDemoGesture()
      },
      stop: () => {
        setGestureActive(false)
        inner.current?.stop()
      },
    }),
    [],
  )

  // Dispara el gesto una vez cuando `playing` pasa a true (el modelo 3D
  // puede tardar en cargar; reintenta hasta que la ref exista).
  useEffect(() => {
    if (!playing || autoPlayedRef.current) return
    const id = window.setInterval(() => {
      if (inner.current) {
        autoPlayedRef.current = true
        setGestureActive(true)
        inner.current.playDemoGesture()
        window.clearInterval(id)
      }
    }, 120)
    return () => window.clearInterval(id)
  }, [playing])

  const showDemo = gestureActive || playing
  // "Subtitulos siempre visibles": con la preferencia activa el texto se queda
  // fijo; sin ella, solo acompana al gesto mientras se reproduce.
  const showCaption =
    caption !== undefined && caption !== '' && (prefs.subtitles || showDemo)

  return (
    <div className="avatar-view">
      <div className="avatar-view__stage">
        {showDemo && (
          <span className="avatar-view__tag">
            <Icon name="hands" size={14} />
            Gesto DEMO · no validado
          </span>
        )}

        <Suspense
          fallback={
            <div className="avatar-view__loading">
              <span className="avatar-view__spinner" aria-hidden="true" />
              <span className="text-xs text-muted">Cargando avatar 3D...</span>
            </div>
          }
        >
          <Avatar3D
            ref={inner}
            onGestureEnd={() => setGestureActive(false)}
          />
        </Suspense>

        {showCaption && <p className="avatar-view__caption">{caption}</p>}
      </div>

      <p className="demo-note avatar-view__note">
        <Icon name="shield" size={14} />
        El avatar aun no representa senas reales. El movimiento es un marcador de
        posicion; las animaciones de LSP deben validarse con personas usuarias o
        interpretes.
      </p>
    </div>
  )
}
