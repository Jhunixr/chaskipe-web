import { useCallback, useEffect, useRef, useState } from 'react'

import { usePreferences } from '@/hooks/usePreferences'

/**
 * Tipos minimos de la Web Speech API (SpeechRecognition). TypeScript no los
 * incluye en lib.dom y Chrome/Edge/Safari los exponen con prefijo `webkit`.
 */
interface RecognitionAlternative {
  transcript: string
}
interface RecognitionResult {
  isFinal: boolean
  0: RecognitionAlternative
}
interface RecognitionEvent {
  resultIndex: number
  results: ArrayLike<RecognitionResult>
}
interface RecognitionErrorEvent {
  error: string
}
interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type RecognitionCtor = new () => Recognition

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Permite el uso del microfono para dictar.',
  'service-not-allowed': 'El navegador no permite dictar en esta pagina.',
  'no-speech': 'No se escucho nada. Intentalo de nuevo, cerca del microfono.',
  'audio-capture': 'No se encontro un microfono.',
  network: 'El dictado necesita conexion a internet.',
}

interface UseSpeechRecognitionResult {
  /** true si el navegador permite dictar (Chrome, Edge, Safari). */
  supported: boolean
  listening: boolean
  /** Texto reconocido hasta ahora (final + provisional). */
  transcript: string
  error: string | null
  start: () => void
  stop: () => void
  reset: () => void
}

/**
 * Dictado por voz con la Web Speech API del navegador: la persona oyente
 * habla y su voz aparece como texto para la persona sorda.
 *
 * El idioma sale de las preferencias (es-PE por defecto). En Chrome el audio
 * se procesa en los servidores del navegador, por eso requiere internet.
 */
export function useSpeechRecognition(
  options: {
    /** Se llama con el texto acumulado cada vez que llega un resultado. */
    onTranscript?: (text: string) => void
  } = {},
): UseSpeechRecognitionResult {
  const { prefs } = usePreferences()
  const onTranscriptRef = useRef(options.onTranscript)
  useEffect(() => {
    onTranscriptRef.current = options.onTranscript
  }, [options.onTranscript])
  const ctor = getRecognitionCtor()
  const supported = ctor !== null

  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<Recognition | null>(null)
  const finalRef = useRef('')

  const stop = useCallback(() => {
    recRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    if (!ctor) return
    recRef.current?.abort()
    const rec = new ctor()
    rec.lang = prefs.language
    rec.continuous = true
    rec.interimResults = true
    finalRef.current = ''
    setTranscript('')
    setError(null)

    rec.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result) continue
        const text = result[0].transcript
        if (result.isFinal) finalRef.current += text
        else interim += text
      }
      const text = (finalRef.current + interim).trim()
      setTranscript(text)
      onTranscriptRef.current?.(text)
    }
    rec.onerror = (event) => {
      if (event.error === 'aborted') return
      setError(ERROR_MESSAGES[event.error] ?? 'No se pudo dictar. Intentalo de nuevo.')
    }
    rec.onend = () => setListening(false)

    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setError('No se pudo iniciar el dictado.')
    }
  }, [ctor, prefs.language])

  const reset = useCallback(() => {
    finalRef.current = ''
    setTranscript('')
    setError(null)
  }, [])

  useEffect(() => () => recRef.current?.abort(), [])

  return { supported, listening, transcript, error, start, stop, reset }
}
