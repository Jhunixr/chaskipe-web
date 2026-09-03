/**
 * Cliente de la API de Chaski Pe (FASE 7).
 *
 * Todas las funciones tienen **fallback a los datos mock**: si el backend no
 * responde (no esta encendido, error de red, 5xx), se devuelven los datos de
 * ejemplo y la app sigue funcionando.
 *
 * La URL base viene de `VITE_API_URL` (ver `.env`), por defecto
 * `http://localhost:8000`.
 */
import {
  CONVERSATION_MESSAGES,
  DEMO_USER,
  HISTORY_ENTRIES,
  QUICK_PHRASE_GROUPS,
} from '@/services/mockData'
import {
  coercePreferences,
  DEFAULT_PREFERENCES,
  type Preferences,
} from '@/types/preferences'
import type {
  HistoryEntry,
  QuickPhraseGroup,
  TranslationDirection,
  UserProfile,
} from '@/types'

const API_URL =
  (typeof import.meta.env?.VITE_API_URL === 'string' &&
    import.meta.env.VITE_API_URL) ||
  'http://localhost:8000'

const BASE = `${API_URL.replace(/\/$/, '')}/api/v1`
const TIMEOUT_MS = 4000

/** Indica si la ultima llamada uso el backend o cayo al mock. */
export type Source = 'api' | 'mock'

export interface Result<T> {
  data: T
  source: Source
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
    if (!res.ok) {
      throw new Error(`${path} -> ${res.status}`)
    }
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  } finally {
    window.clearTimeout(timer)
  }
}

// ---- Perfil ----

interface ApiProfile {
  name: string
  email: string
}

export async function getProfile(): Promise<Result<UserProfile>> {
  try {
    const p = await request<ApiProfile>('/profile')
    return { data: { name: p.name, email: p.email }, source: 'api' }
  } catch {
    return { data: DEMO_USER, source: 'mock' }
  }
}

export async function updateProfile(
  profile: UserProfile,
): Promise<Result<UserProfile>> {
  try {
    const p = await request<ApiProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    })
    return { data: { name: p.name, email: p.email }, source: 'api' }
  } catch {
    // sin backend no se persiste; devolvemos lo que se intento guardar
    return { data: profile, source: 'mock' }
  }
}

// ---- Preferencias de accesibilidad ----

/** El backend usa snake_case; el frontend camelCase. */
interface ApiPreferences {
  theme: string
  text_size: string
  voice_speed: string
  avatar_speed: string
  subtitles: boolean
  language: string
}

function fromApiPreferences(p: ApiPreferences): Preferences {
  return coercePreferences({
    theme: p.theme,
    textSize: p.text_size,
    voiceSpeed: p.voice_speed,
    avatarSpeed: p.avatar_speed,
    subtitles: p.subtitles,
    language: p.language,
  })
}

function toApiPreferences(p: Preferences): ApiPreferences {
  return {
    theme: p.theme,
    text_size: p.textSize,
    voice_speed: p.voiceSpeed,
    avatar_speed: p.avatarSpeed,
    subtitles: p.subtitles,
    language: p.language,
  }
}

export async function getPreferences(): Promise<Result<Preferences>> {
  try {
    const p = await request<ApiPreferences>('/preferences')
    return { data: fromApiPreferences(p), source: 'api' }
  } catch {
    return { data: DEFAULT_PREFERENCES, source: 'mock' }
  }
}

export async function updatePreferences(
  prefs: Preferences,
): Promise<Result<Preferences>> {
  try {
    const p = await request<ApiPreferences>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(toApiPreferences(prefs)),
    })
    return { data: fromApiPreferences(p), source: 'api' }
  } catch {
    // Sin backend la preferencia igual vale: vive en localStorage.
    return { data: prefs, source: 'mock' }
  }
}

// ---- Historial ----

interface ApiHistoryEntry {
  id: string
  direction: TranslationDirection
  text: string
  created_at: string
  is_demo: boolean
}

function fromApiHistory(e: ApiHistoryEntry): HistoryEntry {
  return {
    id: e.id,
    direction: e.direction,
    text: e.text,
    createdAt: e.created_at,
    isDemo: e.is_demo,
  }
}

export async function getHistory(): Promise<Result<HistoryEntry[]>> {
  try {
    const list = await request<ApiHistoryEntry[]>('/history')
    return { data: list.map(fromApiHistory), source: 'api' }
  } catch {
    return { data: HISTORY_ENTRIES, source: 'mock' }
  }
}

export async function addHistory(entry: {
  direction: TranslationDirection
  text: string
  isDemo?: boolean
}): Promise<Result<HistoryEntry | null>> {
  try {
    const created = await request<ApiHistoryEntry>('/history', {
      method: 'POST',
      body: JSON.stringify({
        direction: entry.direction,
        text: entry.text,
        is_demo: entry.isDemo ?? true,
      }),
    })
    return { data: fromApiHistory(created), source: 'api' }
  } catch {
    return { data: null, source: 'mock' }
  }
}

export async function deleteHistory(id: string): Promise<Result<boolean>> {
  try {
    await request<void>(`/history/${id}`, { method: 'DELETE' })
    return { data: true, source: 'api' }
  } catch {
    return { data: false, source: 'mock' }
  }
}

// ---- Frases rapidas ----

interface ApiPhrase {
  id: string
  text: string
  category: QuickPhraseGroup['category']
  is_demo: boolean
}

interface ApiPhraseGroup {
  category: QuickPhraseGroup['category']
  label: string
  phrases: ApiPhrase[]
}

export async function getPhraseGroups(): Promise<Result<QuickPhraseGroup[]>> {
  try {
    const groups = await request<ApiPhraseGroup[]>('/phrases')
    return {
      data: groups.map((g) => ({
        category: g.category,
        label: g.label,
        phrases: g.phrases.map((p) => ({
          id: p.id,
          text: p.text,
          category: p.category,
          isDemo: p.is_demo,
        })),
      })),
      source: 'api',
    }
  } catch {
    return { data: QUICK_PHRASE_GROUPS, source: 'mock' }
  }
}

// ---- Conversacion (solo mock por ahora; no hay endpoint en FASE 7) ----

export function getConversationMessages() {
  return CONVERSATION_MESSAGES
}

// ---- Salud del backend ----

export type Persistence = 'postgresql' | 'memory' | 'unknown'

export interface BackendHealth {
  online: boolean
  persistence: Persistence
}

export async function checkBackend(): Promise<BackendHealth> {
  try {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/health`, {
      signal: controller.signal,
    })
    window.clearTimeout(timer)
    if (!res.ok) return { online: false, persistence: 'unknown' }
    const body = (await res.json()) as { persistence?: string }
    const p =
      body.persistence === 'postgresql' || body.persistence === 'memory'
        ? body.persistence
        : 'unknown'
    return { online: true, persistence: p }
  } catch {
    return { online: false, persistence: 'unknown' }
  }
}

/** Frase para el aviso segun donde persisten los datos. */
export function persistenceNote(source: Source, p: Persistence): string {
  if (source === 'mock') {
    return 'Sin conexion con el servidor: se muestran datos de ejemplo.'
  }
  if (p === 'postgresql') {
    return 'Datos guardados en el servidor (PostgreSQL).'
  }
  return 'Datos guardados en el servidor (en memoria; se pierden al reiniciar el backend).'
}
