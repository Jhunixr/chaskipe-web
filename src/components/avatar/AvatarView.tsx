import { lazy, Suspense, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { Hills } from '@/components/brand'
import { Icon } from '@/components/ui'
import { usePreferences } from '@/hooks/usePreferences'

import type { Avatar3DHandle } from './Avatar3D'
import type { SpellToken } from './fingerspelling'

import './AvatarView.css'

const Avatar3D = lazy(() =>
  import('./Avatar3D').then((m) => ({ default: m.Avatar3D })),
)

export interface AvatarViewHandle {
  /** Deletrea `spell` (o, sin texto, reproduce el gesto DEMO). */
  play: () => void
  stop: () => void
}

interface AvatarViewProps {
  ref?: React.Ref<AvatarViewHandle>
  /** Texto que el avatar deletrea con el alfabeto manual de la LSP. */
  spell?: string | undefined
  /** Texto de subtitulo cuando no se deletrea. */
  caption?: string | undefined
  /** true para empezar en cuanto el avatar este cargado. */
  playing?: boolean
  /** Sin la nota aclaratoria (pantallas con poco espacio, p. ej. Cara a cara). */
  compact?: boolean
}

/**
 * Avatar 3D de Chaski Pe.
 *
 * Con `spell`, el avatar **deletrea en LSP**: su mano derecha forma cada letra
 * del abecedario manual con la pose real de una foto del dataset publico
 * (ver `fingerspelling.ts`). J, N con tilde y Z llevan movimiento y aun no
 * tienen datos: se muestran escritas.
 *
 * Sin `spell` reproduce el gesto DEMO (marcador de posicion, no es una sena).
 * Las senas de palabras completas necesitan animaciones validadas con personas
 * usuarias de LSP o interpretes.
 *
 * El componente Three.js se carga de forma diferida (React.lazy).
 */
export function AvatarView({
  ref,
  spell,
  caption,
  playing = false,
  compact = false,
}: AvatarViewProps) {
  const inner = useRef<Avatar3DHandle | null>(null)
  const [mode, setMode] = useState<'idle' | 'demo' | 'spelling'>('idle')
  const [tokens, setTokens] = useState<SpellToken[]>([])
  const [current, setCurrent] = useState(-1)
  // Ultimo texto reproducido solo: si `spell` cambia, se vuelve a reproducir.
  const autoPlayedRef = useRef<string | null>(null)
  const { prefs } = usePreferences()

  const start = useCallback(() => {
    const avatar = inner.current
    if (!avatar) return false
    const text = spell?.trim()
    if (text) {
      setMode('spelling')
      setCurrent(-1)
      const seq = avatar.spell(text, {
        onToken: (index) => setCurrent(index),
        onEnd: () => {
          setMode('idle')
          setCurrent(-1)
        },
      })
      setTokens(seq)
    } else {
      setMode('demo')
      avatar.playDemoGesture()
    }
    return true
  }, [spell])

  useImperativeHandle(
    ref,
    () => ({
      play: () => void start(),
      stop: () => {
        setMode('idle')
        setCurrent(-1)
        inner.current?.stop()
      },
    }),
    [start],
  )

  // Empieza cuando `playing` pasa a true y otra vez cada vez que cambia el
  // texto (el modelo 3D puede tardar en cargar; reintenta hasta que la ref
  // exista).
  useEffect(() => {
    const key = spell?.trim() ?? ''
    if (!playing || autoPlayedRef.current === key) return
    const id = window.setInterval(() => {
      if (start()) {
        autoPlayedRef.current = key
        window.clearInterval(id)
      }
    }, 120)
    return () => window.clearInterval(id)
  }, [playing, spell, start])

  const spelling = tokens.length > 0 && (mode === 'spelling' || prefs.subtitles)
  const missing = [
    ...new Set(
      tokens.filter((t) => t.kind === 'letter' && !t.pose).map((t) => t.char),
    ),
  ]
  const showCaption =
    !spelling && caption !== undefined && caption !== '' && (prefs.subtitles || mode !== 'idle')

  return (
    <div className={`avatar-view${compact ? ' avatar-view--compact' : ''}`}>
      <div className="avatar-view__stage">
        <Hills sun />
        {mode === 'spelling' && (
          <span className="avatar-view__tag avatar-view__tag--lsp">
            <Icon name="hands" size={14} />
            {tokens[current]?.kind === 'sign' ? 'Sena LSP grabada' : 'Deletreo LSP'}
          </span>
        )}
        {mode === 'demo' && (
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
          <Avatar3D ref={inner} onGestureEnd={() => setMode('idle')} />
        </Suspense>

        {spelling && (
          <p className="avatar-view__caption avatar-view__spelling" aria-label={spell}>
            {tokens.map((t, i) =>
              t.kind === 'space' ? (
                <span key={i} className="avatar-view__space" aria-hidden="true" />
              ) : t.kind === 'sign' ? (
                <span
                  key={i}
                  aria-hidden="true"
                  className={[
                    'avatar-view__sign',
                    i === current ? 'avatar-view__sign--active' : '',
                  ].join(' ')}
                >
                  {t.char}
                </span>
              ) : (
                <span
                  key={i}
                  aria-hidden="true"
                  className={[
                    'avatar-view__letter',
                    i === current ? 'avatar-view__letter--active' : '',
                    i < current ? 'avatar-view__letter--done' : '',
                    t.pose ? '' : 'avatar-view__letter--nopose',
                  ].join(' ')}
                >
                  {t.char}
                </span>
              ),
            )}
          </p>
        )}
        {showCaption && <p className="avatar-view__caption">{caption}</p>}
      </div>

      {!compact && (
      <p className="demo-note avatar-view__note">
        <Icon name="shield" size={14} />
        {spell
          ? `El avatar deletrea con el abecedario manual de la LSP (formas de mano de un dataset publico, aun sin validar con personas usuarias).${
              missing.length > 0
                ? ` ${missing.join(', ')} ${missing.length === 1 ? 'lleva' : 'llevan'} movimiento o no tiene${missing.length === 1 ? '' : 'n'} forma todavia: se muestra${missing.length === 1 ? '' : 'n'} escrita${missing.length === 1 ? '' : 's'}.`
                : ''
            } Las senas de palabras completas aun no estan disponibles.`
          : 'El avatar aun no representa senas reales. El movimiento es un marcador de posicion; las animaciones de LSP deben validarse con personas usuarias o interpretes.'}
      </p>
      )}
    </div>
  )
}
