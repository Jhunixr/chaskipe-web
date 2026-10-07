import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ChaskiFigure } from '@/components/brand'
import { Icon } from '@/components/ui'
import {
  getLearned,
  getStreak,
  letterOfTheDay,
  LSP_ALPHABET,
  MOVING_LETTERS,
  PRACTICE_LETTERS,
} from '@/services/learning'

import './LearnPage.css'
import './pages.css'

/**
 * Aprende LSP: el abecedario manual, letra por letra. Chaski muestra la forma
 * de la mano y la camara confirma cuando la haces bien. Pensado tambien para
 * familias oyentes que quieren aprender.
 */
export function LearnPage() {
  const learned = getLearned()
  const streak = getStreak()
  const [target, setTarget] = useState(() => letterOfTheDay(new Date(), learned))
  const done = PRACTICE_LETTERS.filter((l) => learned.has(l)).length
  const percent = Math.round((done / PRACTICE_LETTERS.length) * 100)
  const moving = MOVING_LETTERS.has(target)

  return (
    <div className="page learn">
      <header className="learn__top">
        <h1>Aprende LSP</h1>
        <span className="learn__streak" aria-label={`Racha de ${streak} días`}>
          <Icon name="flame" size={20} />
          {streak} {streak === 1 ? 'día' : 'días'}
        </span>
      </header>

      <section className="learn__progress" aria-label="Tu progreso">
        <ChaskiFigure width={96} className="learn__progress-chaski" />
        <span className="learn__progress-title">Abecedario</span>
        <span className="learn__progress-count">
          {done} de {PRACTICE_LETTERS.length} letras
        </span>
        <span
          className="learn__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Letras aprendidas"
        >
          <span style={{ width: `${percent}%` }} />
        </span>
      </section>

      <section className="learn__challenge" aria-label="Reto">
        <div className="learn__challenge-head">
          <span className="learn__big-letter" aria-hidden="true">
            {target}
          </span>
          <span className="learn__challenge-text">
            <span className="learn__kicker">
              {target === letterOfTheDay(new Date(), learned) ? 'Reto de hoy' : 'Practica'}
            </span>
            <strong>Haz la letra {target} con tu mano</strong>
          </span>
        </div>
        <div className="learn__challenge-actions">
          <Link
            to={ROUTES.textToSign}
            state={{ text: target }}
            className="btn btn--secondary btn--md learn__action"
          >
            <Icon name="play" size={18} />
            Ver a Chaski
          </Link>
          {moving ? (
            <span className="learn__moving">Lleva movimiento: aún no se puede practicar con la cámara</span>
          ) : (
            <Link
              to={ROUTES.signToText}
              state={{ practice: target }}
              className="btn btn--primary btn--md learn__action"
            >
              <Icon name="camera" size={20} />
              Probar
            </Link>
          )}
        </div>
      </section>

      <h2 className="learn__subtitle">Todas las letras</h2>
      <div className="learn__grid">
        {LSP_ALPHABET.map((letter) => {
          const state = learned.has(letter)
            ? 'done'
            : letter === target
              ? 'current'
              : MOVING_LETTERS.has(letter)
                ? 'moving'
                : 'todo'
          const label = {
            done: 'aprendida',
            current: 'elegida',
            moving: 'con movimiento',
            todo: 'por aprender',
          }[state]
          return (
            <button
              key={letter}
              type="button"
              className={`learn__tile learn__tile--${state}`}
              aria-label={`${letter}, ${label}`}
              aria-pressed={letter === target}
              onClick={() => setTarget(letter)}
            >
              {letter}
            </button>
          )
        })}
      </div>
      <p className="learn__legend text-sm text-muted">
        Toca una letra para practicarla. J, Ñ y Z llevan movimiento: Chaski las
        muestra escritas por ahora.
      </p>
    </div>
  )
}
