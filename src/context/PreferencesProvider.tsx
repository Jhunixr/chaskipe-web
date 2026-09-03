import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { getPreferences, updatePreferences } from '@/services/api'
import {
  coercePreferences,
  DEFAULT_PREFERENCES,
  TEXT_SCALE,
  type Preferences,
} from '@/types/preferences'

import { PreferencesContext, type SaveState } from './preferencesContext'

const STORAGE_KEY = 'chaskipe:preferences'

function readStored(): Preferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return coercePreferences(JSON.parse(raw))
  } catch {
    // localStorage no disponible o JSON invalido: usar valores por defecto
  }
  return { ...DEFAULT_PREFERENCES }
}

/**
 * Aplica las preferencias que afectan al documento entero.
 *
 * - `theme`    -> clase en <html> (.theme-dark / .theme-auto), leida por theme.css
 * - `textSize` -> variable CSS --text-scale
 * - `language` -> atributo lang de <html>
 */
function applyToDocument(prefs: Preferences): void {
  const root = document.documentElement

  root.classList.toggle('theme-dark', prefs.theme === 'oscuro')
  root.classList.toggle('theme-auto', prefs.theme === 'sistema')

  root.style.setProperty('--text-scale', String(TEXT_SCALE[prefs.textSize]))
  root.lang = prefs.language
}

/**
 * Preferencias de accesibilidad para toda la app.
 *
 * Fuente de verdad: **localStorage**, para que la eleccion se aplique al
 * instante y sobreviva al refresco aunque el backend este apagado. Al montar
 * se consulta el backend y, si responde, su valor gana (es el que se comparte
 * entre dispositivos). Guardar envia al backend; si falla, el cambio sigue
 * vivo en local y se avisa en la interfaz.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(readStored)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [dirty, setDirty] = useState(false)

  // Aplicar al documento en cada cambio (y en el primer render).
  useEffect(() => {
    applyToDocument(prefs)
  }, [prefs])

  // Persistir en localStorage en cada cambio.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // ignorar si no se puede persistir
    }
  }, [prefs])

  // Al montar: traer del backend. Si responde, su valor manda.
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    let cancelled = false
    void getPreferences().then((res) => {
      if (cancelled || res.source !== 'api') return
      setPrefs(res.data)
      setDirty(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const set = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPrefs((current) =>
        current[key] === value ? current : { ...current, [key]: value },
      )
      setDirty(true)
      setSaveState('idle')
    },
    [],
  )

  // `prefs` se lee dentro de save() sin declararlo dependencia: asi la funcion
  // es estable y no reinicia efectos de quien la consuma.
  const prefsRef = useRef(prefs)
  useEffect(() => {
    prefsRef.current = prefs
  }, [prefs])

  const save = useCallback(async () => {
    setSaveState('saving')
    const res = await updatePreferences(prefsRef.current)
    setSaveState(res.source === 'api' ? 'saved' : 'local')
    setDirty(false)
  }, [])

  const value = useMemo(
    () => ({ prefs, set, save, saveState, dirty }),
    [prefs, set, save, saveState, dirty],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}
