import { useEffect, useImperativeHandle, useRef } from 'react'

import { usePreferences } from '@/hooks/usePreferences'
import { AVATAR_RATE } from '@/types/preferences'

import { DEMO_GESTURE } from './animation'
import { SignAvatarScene } from './scene'

export interface Avatar3DHandle {
  /** Reproduce el gesto DEMO (marcador de posicion, no es una sena). */
  playDemoGesture: () => void
  stop: () => void
}

interface Avatar3DProps {
  ref?: React.Ref<Avatar3DHandle>
  onGestureEnd?: () => void
}

/**
 * Escena Three.js del avatar. Componente "pesado": se carga de forma diferida
 * desde `AvatarView` (React.lazy).
 */
export function Avatar3D({ ref, onGestureEnd }: Avatar3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sceneRef = useRef<SignAvatarScene | null>(null)
  const { prefs } = usePreferences()
  const gestureSpeed = AVATAR_RATE[prefs.avatarSpeed]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new SignAvatarScene(canvas)
    sceneRef.current = scene

    const resize = () => {
      const parent = canvas.parentElement
      if (parent) scene.resize(parent.clientWidth, parent.clientHeight)
    }
    resize()

    const observer = new ResizeObserver(resize)
    if (canvas.parentElement) observer.observe(canvas.parentElement)

    return () => {
      observer.disconnect()
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  // Aplicar la velocidad al montar y cada vez que cambie la preferencia.
  useEffect(() => {
    sceneRef.current?.setGestureSpeed(gestureSpeed)
  }, [gestureSpeed])

  useImperativeHandle(
    ref,
    () => ({
      playDemoGesture: () => {
        sceneRef.current?.playGesture(DEMO_GESTURE, onGestureEnd)
      },
      stop: () => {
        sceneRef.current?.stopGesture()
      },
    }),
    [onGestureEnd],
  )

  return (
    <canvas
      ref={canvasRef}
      className="avatar-3d__canvas"
      aria-label="Avatar 3D en reposo"
      role="img"
    />
  )
}
