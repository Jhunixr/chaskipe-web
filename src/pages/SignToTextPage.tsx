import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { CameraView, HandOverlay } from '@/components/camera'
import { Button, Icon, PageHeader } from '@/components/ui'
import { useCamera } from '@/hooks/useCamera'
import { useHandLandmarker } from '@/hooks/useHandLandmarker'
import { useSignRecognition, type RecognitionOutput } from '@/hooks/useSignRecognition'
import { addHistory } from '@/services/api'
import { handOffSpelled } from '@/services/conversation'
import { markLearned } from '@/services/learning'
import {
  phraseForLabel,
  saveRecognition,
  type RecognitionResult,
} from '@/services/recognition'
import type { ModelKind } from '@/services/signModel'
import type { HandFrame } from '@/types/handLandmarks'

import './SignToTextPage.css'
import './pages.css'

/**
 * Reconocimiento de **senas de la LSP** EN TIEMPO REAL.
 *
 * La camara + MediaPipe alimentan una ventana deslizante de landmarks (2.5 s);
 * el modelo (MLP) se ejecuta varias veces por segundo. La sena candidata se
 * muestra en vivo y se confirma cuando se mantiene estable ~0.7 s.
 *
 * Dos modos:
 * - "Abecedario": letras estaticas de la LSP, una pose por frame. Las letras
 *   confirmadas se van sumando a una palabra (deletreo).
 * - "Senas": senas con movimiento (HOLA, GRACIAS...), se confirma una y se
 *   muestra el resultado.
 *
 * La LSP tiene su propia gramatica y vocabulario. Las senas deben validarse
 * con personas usuarias o interpretes. Si aun no hay un modelo entrenado, la
 * pantalla lo avisa (ver `ai/README.md`).
 */
export function SignToTextPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: string; practice?: string } | null
  // Se llego desde Conversacion o Cara a cara: "Enviar" devuelve la palabra alli.
  const returnTo =
    state?.from === 'conversation'
      ? ROUTES.conversation
      : state?.from === 'face-to-face'
        ? ROUTES.faceToFace
        : null
  const fromConversation = returnTo !== null
  // Practica de Aprende LSP: la letra que hay que hacer.
  const practice = state?.practice ?? null
  const [practiceDone, setPracticeDone] = useState(false)
  const camera = useCamera('user')
  const [mode, setMode] = useState<ModelKind>('letters')
  const [spelled, setSpelled] = useState('')

  const handleConfirm = useCallback(
    (out: RecognitionOutput) => {
      if (mode !== 'letters') return
      const letter = phraseForLabel(out.label)
      setSpelled((text) => text + letter)
      if (practice && letter === practice) {
        markLearned(practice)
        setPracticeDone(true)
      }
    },
    [mode, practice],
  )
  const recog = useSignRecognition({ mode, onConfirm: handleConfirm })
  const letters = mode === 'letters'

  const handleFrame = useCallback(
    (frame: HandFrame) => recog.pushFrame(frame),
    [recog],
  )
  const hands = useHandLandmarker({ onFrame: handleFrame })

  // Activar camara + detector una sola vez.
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    camera.start()
    hands.load()
  }, [camera, hands])

  // Cargar el modelo del modo actual (al entrar y al cambiar de modo).
  useEffect(() => {
    if (recog.phase === 'idle') recog.loadModel()
  }, [recog])

  // Iniciar deteccion de manos cuando la camara esta activa.
  const detStartedRef = useRef(false)
  useEffect(() => {
    if (camera.status !== 'active' || detStartedRef.current) return
    const video = camera.videoRef.current
    if (!video) return
    detStartedRef.current = true
    hands.start(video)
  }, [camera.status, camera.videoRef, hands])

  // Arrancar el analisis en vivo cuando camara + detector + modelo estan listos.
  useEffect(() => {
    const ready =
      camera.status === 'active' &&
      hands.status === 'running' &&
      (recog.phase === 'watching' || recog.phase === 'candidate')
    if (ready && !recog.active) recog.startWatching()
  }, [camera.status, hands.status, recog])

  const modelMissing = recog.phase === 'model-missing'
  const confirmed = recog.confirmed
  const candidate = recog.candidate

  const showResult = (payload: RecognitionResult, autoSpeak = false) => {
    saveRecognition(payload)
    // Guardar en el historial (si el backend no responde, se ignora).
    void addHistory({ direction: 'sign-to-text', text: payload.text, isDemo: true })
    navigate(ROUTES.translationResult, { state: { ...payload, autoSpeak } })
  }

  const goToResult = () => {
    if (!confirmed) return
    showResult({
      label: confirmed.label,
      text: phraseForLabel(confirmed.label),
      confidence: confirmed.confidence,
      isSynthetic: confirmed.isSynthetic,
      at: Date.now(),
    })
  }

  const submitSpelled = () => {
    const text = spelled.trim()
    if (!text) return
    if (returnTo) {
      handOffSpelled(text)
      navigate(returnTo)
      return
    }
    showResult({
      label: 'DELETREO',
      text,
      confidence: confirmed?.confidence ?? 1,
      isSynthetic: false,
      at: Date.now(),
    }, true)
  }

  const changeMode = (next: ModelKind) => {
    if (next === mode) return
    setMode(next)
  }

  let overlayStatus: string | undefined
  if (letters && recog.phase === 'candidate' && candidate) {
    overlayStatus = `${phraseForLabel(candidate.label)}...`
  } else if (recog.phase === 'confirmed' && confirmed) {
    overlayStatus = `Reconocido: ${phraseForLabel(confirmed.label)}`
  } else if (recog.phase === 'candidate' && candidate) {
    overlayStatus = `${phraseForLabel(candidate.label)}...`
  } else if (recog.phase === 'watching') {
    overlayStatus = hands.handCount > 0 ? 'Analizando...' : 'Muestra las manos'
  } else if (recog.phase === 'paused') {
    overlayStatus = 'En pausa'
  } else if (recog.phase === 'loading-model') {
    overlayStatus = 'Cargando modelo...'
  } else if (camera.status === 'active' && hands.status === 'loading') {
    overlayStatus = 'Cargando detector...'
  }

  return (
    <div className="page sign-to-text">
      <PageHeader title="Señas a texto" />

      {practice && (
        <section
          className={`sign-to-text__practice${practiceDone ? ' sign-to-text__practice--done' : ''}`}
          aria-live="polite"
        >
          <span className="sign-to-text__practice-letter">{practice}</span>
          <span className="sign-to-text__practice-text">
            {practiceDone ? (
              <>
                <strong>¡Bien hecho!</strong>
                <span>Ya sabes hacer la {practice}.</span>
              </>
            ) : (
              <>
                <strong>Haz la letra {practice}</strong>
                <span>Mantén la mano quieta frente a la cámara.</span>
              </>
            )}
          </span>
          {practiceDone && (
            <Link to={ROUTES.learn} className="sign-to-text__practice-back">
              Seguir
            </Link>
          )}
        </section>
      )}

      <div className="segmented sign-to-text__modes" role="tablist" aria-label="Que reconocer">
        <button
          type="button"
          role="tab"
          aria-selected={letters}
          className={`segmented__option${letters ? ' segmented__option--active' : ''}`}
          onClick={() => changeMode('letters')}
        >
          Letras
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!letters}
          className={`segmented__option${!letters ? ' segmented__option--active' : ''}`}
          onClick={() => changeMode('sign')}
        >
          Señas
        </button>
      </div>

      <CameraView
        status={camera.status}
        errorMessage={camera.errorMessage}
        facing={camera.facing}
        canSwitch={camera.canSwitch}
        videoRef={camera.videoRef}
        onStart={camera.start}
        onRetry={camera.start}
        onToggleFacing={camera.toggleFacing}
        overlayStatus={overlayStatus}
        overlay={
          <HandOverlay frame={hands.frame} mirrored={camera.facing === 'user'} />
        }
      />

      {hands.status === 'error' && (
        <p className="disclaimer-note">
          <Icon name="shield" size={16} />
          {hands.errorMessage ?? 'No se pudo cargar el detector de manos.'}
        </p>
      )}

      {modelMissing && (
        <p className="disclaimer-note">
          <Icon name="shield" size={16} />
          No hay un modelo de reconocimiento. Genera uno con los scripts de{' '}
          <code>ai/</code> (ver <code>ai/README.md</code>).
        </p>
      )}

      {recog.phase === 'error' && (
        <p className="disclaimer-note">
          <Icon name="shield" size={16} />
          {recog.errorMessage}
        </p>
      )}

      {letters ? (
        <section className="sign-to-text__panel">
          <span className="section-title">Estás diciendo</span>
          <p className="sign-to-text__text sign-to-text__spelled" aria-live="polite">
            {spelled}
            {recog.phase === 'candidate' && candidate && (
              <span className="sign-to-text__candidate">
                {phraseForLabel(candidate.label)}
              </span>
            )}
            {!spelled && !(recog.phase === 'candidate' && candidate) && (
              <span className="text-muted">
                {recog.phase === 'paused'
                  ? 'Analisis en pausa'
                  : recog.phase === 'watching'
                    ? hands.handCount > 0
                      ? 'Manten la letra quieta...'
                      : 'Muestra una mano a la camara'
                    : 'Preparando...'}
              </span>
            )}
          </p>

          {recog.phase === 'candidate' && candidate && (
            <>
              <div
                className="sign-to-text__hold"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(recog.holdProgress * 100)}
                aria-label="Confirmando letra"
              >
                <span style={{ width: `${recog.holdProgress * 100}%` }} />
              </div>
              <p className="sign-to-text__confidence text-xs text-muted">
                Manten la letra · {Math.round(candidate.confidence * 100)}%
              </p>
            </>
          )}

          <div className="sign-to-text__spell-actions">
            <Button
              variant="secondary"
              onClick={() => setSpelled((t) => (t.endsWith(' ') || !t ? t : `${t} `))}
              disabled={!spelled}
            >
              Espacio
            </Button>
            <Button
              variant="secondary"
              icon="backspace"
              onClick={() => setSpelled((t) => t.slice(0, -1))}
              disabled={!spelled}
            >
              Borrar
            </Button>
            <Button
              variant="ghost"
              icon="trash"
              onClick={() => setSpelled('')}
              disabled={!spelled}
            >
              Limpiar
            </Button>
          </div>
        </section>
      ) : (
        <section className="sign-to-text__panel">
        <span className="section-title">Texto detectado</span>
        <p className="sign-to-text__text">
          {recog.phase === 'confirmed' && confirmed ? (
            phraseForLabel(confirmed.label)
          ) : recog.phase === 'candidate' && candidate ? (
            <span className="sign-to-text__candidate">
              {phraseForLabel(candidate.label)}
            </span>
          ) : (
            <span className="text-muted">
              {recog.phase === 'paused'
                ? 'Analisis en pausa'
                : recog.phase === 'watching'
                  ? hands.handCount > 0
                    ? 'Analizando...'
                    : 'Muestra las manos a la camara'
                  : 'Preparando...'}
            </span>
          )}
        </p>

        {recog.phase === 'candidate' && candidate && (
          <>
            <div
              className="sign-to-text__hold"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(recog.holdProgress * 100)}
              aria-label="Confirmando sena"
            >
              <span style={{ width: `${recog.holdProgress * 100}%` }} />
            </div>
            <p className="sign-to-text__confidence text-xs text-muted">
              Manten la sena · {Math.round(candidate.confidence * 100)}%
            </p>
          </>
        )}

        {recog.phase === 'confirmed' && confirmed && (
          <p className="sign-to-text__confidence text-xs text-muted">
            Confianza {Math.round(confirmed.confidence * 100)}%
            {confirmed.isSynthetic ? ' · modelo de prueba (datos sinteticos)' : ''}
          </p>
        )}
      </section>
      )}

      {letters ? (
        <p className="demo-note">
          Reconoce las <strong>24 letras estaticas</strong> del abecedario de la
          LSP (sin J, N con tilde ni Z, que llevan movimiento). Entrenado con un
          dataset publico de imagenes; aun debe validarse con personas usuarias
          de LSP o interpretes.
        </p>
      ) : (
        <p className="demo-note">
          Reconoce un vocabulario limitado de <strong>senas de la LSP</strong>.
          La LSP tiene su propia gramatica y vocabulario; las senas deben
          validarse con personas usuarias o interpretes.
        </p>
      )}

      {letters ? (
        <div className="stack-sm">
          <Button
            size="lg"
            fullWidth
            icon={fromConversation ? 'send' : 'volume'}
            onClick={submitSpelled}
            disabled={!spelled.trim()}
          >
            {fromConversation ? 'Enviar a la conversación' : 'Decir en voz alta'}
          </Button>
          {recog.phase === 'paused' ? (
            <Button variant="ghost" fullWidth icon="camera" onClick={recog.resume}>
              Reanudar analisis
            </Button>
          ) : (
            <Button
              variant="ghost"
              fullWidth
              icon="pause"
              onClick={recog.pause}
              disabled={modelMissing || !recog.active}
            >
              Pausar analisis
            </Button>
          )}
        </div>
      ) : recog.phase === 'confirmed' && confirmed ? (
        <div className="stack-sm">
          <Button size="lg" fullWidth icon="check" onClick={goToResult}>
            Ver resultado
          </Button>
          <Button variant="ghost" fullWidth icon="refresh" onClick={recog.resume}>
            Reconocer otra sena
          </Button>
        </div>
      ) : recog.phase === 'paused' ? (
        <Button size="lg" fullWidth icon="camera" onClick={recog.resume}>
          Reanudar analisis
        </Button>
      ) : (
        <Button
          variant="secondary"
          fullWidth
          icon="pause"
          onClick={recog.pause}
          disabled={
            modelMissing ||
            !(recog.phase === 'watching' || recog.phase === 'candidate')
          }
        >
          Pausar analisis
        </Button>
      )}
    </div>
  )
}
