import { useCallback, useEffect, useState } from 'react'

interface UseSpeechResult {
  /** true si el navegador soporta sintesis de voz. */
  supported: boolean
  speaking: boolean
  speak: (text: string) => void
  cancel: () => void
}

/**
 * Envuelve la Web Speech API (SpeechSynthesis) para leer texto en voz alta.
 * Es una API nativa del navegador, no un servicio de IA.
 */
export function useSpeech(lang = 'es-PE'): UseSpeechResult {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)

  const cancel = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const speak = useCallback(
    (text: string) => {
      if (!supported || text.trim() === '') return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      setSpeaking(true)
      window.speechSynthesis.speak(utterance)
    },
    [supported, lang],
  )

  useEffect(() => cancel, [cancel])

  return { supported, speaking, speak, cancel }
}
