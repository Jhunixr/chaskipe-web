import { useEffect, useRef } from 'react'

import { HAND_CONNECTIONS, type HandFrame } from '@/types/handLandmarks'

import './HandOverlay.css'

interface HandOverlayProps {
  frame: HandFrame | null
  /** true cuando el video se muestra en espejo (camara frontal). */
  mirrored: boolean
}

const POINT_COLOR = '#c8221f'
const LINE_COLOR = 'rgba(255, 255, 255, 0.9)'

/**
 * Dibuja los landmarks de las manos sobre el video.
 * El canvas se escala por CSS al tamano del contenedor; las coordenadas
 * de MediaPipe estan normalizadas (0..1), asi que trabajamos en un espacio
 * fijo y dejamos que CSS haga el resto.
 */
export function HandOverlay({ frame, mirrored }: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    if (!frame || frame.hands.length === 0) return

    ctx.save()
    if (mirrored) {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }

    for (const hand of frame.hands) {
      // Conexiones
      ctx.strokeStyle = LINE_COLOR
      ctx.lineWidth = 3
      for (const [a, b] of HAND_CONNECTIONS) {
        const pa = hand[a]
        const pb = hand[b]
        if (!pa || !pb) continue
        ctx.beginPath()
        ctx.moveTo(pa.x * width, pa.y * height)
        ctx.lineTo(pb.x * width, pb.y * height)
        ctx.stroke()
      }
      // Puntos
      ctx.fillStyle = POINT_COLOR
      for (const p of hand) {
        ctx.beginPath()
        ctx.arc(p.x * width, p.y * height, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.restore()
  }, [frame, mirrored])

  return (
    <canvas
      ref={canvasRef}
      className="hand-overlay"
      width={480}
      height={600}
      aria-hidden="true"
    />
  )
}
