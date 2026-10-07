import { useCallback, useEffect, useRef, useState } from 'react'

/** Camara preferida: 'user' = frontal, 'environment' = trasera. */
export type CameraFacing = 'user' | 'environment'

export type CameraStatus =
  | 'idle' // aun no se ha pedido la camara
  | 'requesting' // esperando el permiso / la apertura del stream
  | 'active' // stream en curso
  | 'denied' // el usuario nego el permiso
  | 'unavailable' // no hay camara o esta ocupada
  | 'unsupported' // el navegador no soporta getUserMedia
  | 'error' // otro fallo

interface UseCameraResult {
  status: CameraStatus
  /** Mensaje legible del ultimo error (o null). */
  errorMessage: string | null
  facing: CameraFacing
  /** true si el dispositivo tiene mas de una camara (permite alternar). */
  canSwitch: boolean
  /** Ref que debe asignarse al elemento <video>. */
  videoRef: React.RefObject<HTMLVideoElement | null>
  start: () => void
  stop: () => void
  toggleFacing: () => void
}

const SUPPORTS_MEDIA =
  typeof navigator !== 'undefined' &&
  typeof navigator.mediaDevices !== 'undefined' &&
  typeof navigator.mediaDevices.getUserMedia === 'function'

/**
 * Encapsula el acceso a la camara del dispositivo con getUserMedia.
 *
 * FASE 2: solo captura y muestra el video. Sin MediaPipe, landmarks ni IA.
 * El stream se detiene al desmontar o al llamar stop().
 */
export function useCamera(initialFacing: CameraFacing = 'user'): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>(
    SUPPORTS_MEDIA ? 'idle' : 'unsupported',
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [facing, setFacing] = useState<CameraFacing>(initialFacing)
  const [canSwitch, setCanSwitch] = useState(false)

  const stopStream = useCallback(() => {
    const stream = streamRef.current
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop()
      }
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const openStream = useCallback(
    async (nextFacing: CameraFacing) => {
      if (!SUPPORTS_MEDIA) {
        setStatus('unsupported')
        return
      }

      stopStream()
      setStatus('requesting')
      setErrorMessage(null)

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: nextFacing },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setStatus('active')

        // Detectar si hay mas de una camara para permitir alternar.
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const cameras = devices.filter((d) => d.kind === 'videoinput')
          setCanSwitch(cameras.length > 1)
        } catch {
          setCanSwitch(false)
        }
      } catch (error) {
        const name = error instanceof DOMException ? error.name : ''
        if (name === 'NotAllowedError' || name === 'SecurityError') {
          setStatus('denied')
          setErrorMessage(
            'Permiso de camara denegado. Habilitalo en los ajustes del navegador.',
          )
        } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
          setStatus('unavailable')
          setErrorMessage('No se encontro ninguna camara disponible.')
        } else if (name === 'NotReadableError') {
          setStatus('unavailable')
          setErrorMessage('La camara esta siendo usada por otra aplicacion.')
        } else {
          setStatus('error')
          setErrorMessage('No se pudo abrir la camara. Intenta de nuevo.')
        }
      }
    },
    [stopStream],
  )

  const start = useCallback(() => {
    void openStream(facing)
  }, [openStream, facing])

  const stop = useCallback(() => {
    stopStream()
    setStatus(SUPPORTS_MEDIA ? 'idle' : 'unsupported')
  }, [stopStream])

  const toggleFacing = useCallback(() => {
    setFacing((current) => {
      const next: CameraFacing = current === 'user' ? 'environment' : 'user'
      if (streamRef.current) {
        void openStream(next)
      }
      return next
    })
  }, [openStream])

  // Detener el stream al desmontar.
  useEffect(() => stopStream, [stopStream])

  return {
    status,
    errorMessage,
    facing,
    canSwitch,
    videoRef,
    start,
    stop,
    toggleFacing,
  }
}
