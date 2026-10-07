import { useCallback, useEffect, useState } from 'react'

import { usePreferences } from '@/hooks/usePreferences'
import { VOICE_RATE } from '@/types/preferences'

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
 *
 * El idioma y la velocidad salen de las preferencias de accesibilidad; el
 * parametro `lang` solo sirve para forzar un idioma concreto.
 */
export function useSpeech(lang?: string): UseSpeechResult {
  const { prefs } = usePreferences()
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)

  const voiceLang = lang ?? prefs.language
  const rate = VOICE_RATE[prefs.voiceSpeed]

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
      utterance.lang = voiceLang
      utterance.rate = rate
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      setSpeaking(true)
      window.speechSynthesis.speak(utterance)
    },
    [supported, voiceLang, rate],
  )

  useEffect(() => cancel, [cancel])

  return { supported, speaking, speak, cancel }
}
