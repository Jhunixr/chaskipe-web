import { useState } from 'react'

import { Mascot } from '@/components/brand'
import { Icon, PageHeader } from '@/components/ui'
import { HISTORY_ENTRIES } from '@/services/mockData'
import { directionLabel, formatDateTime } from '@/utils/format'

import './HistoryPage.css'
import './pages.css'

type Range = 'hoy' | 'semana'

export function HistoryPage() {
  const [range, setRange] = useState<Range>('hoy')

  return (
    <div className="page history">
      <PageHeader
        title="Historial"
        action={
          <button type="button" className="history__filter" aria-label="Filtrar">
            <Icon name="filter" size={20} />
          </button>
        }
      />

      <div className="history__toolbar">
        <div className="segmented" role="tablist" aria-label="Rango de tiempo">
          <button
            type="button"
            role="tab"
            aria-selected={range === 'hoy'}
            className={`segmented__option${range === 'hoy' ? ' segmented__option--active' : ''}`}
            onClick={() => setRange('hoy')}
          >
            Hoy
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={range === 'semana'}
            className={`segmented__option${
              range === 'semana' ? ' segmented__option--active' : ''
            }`}
            onClick={() => setRange('semana')}
          >
            Esta semana
          </button>
        </div>
      </div>

      <ul className="history__list">
        {HISTORY_ENTRIES.map((entry) => (
          <li key={entry.id} className="history__item">
            <span className="history__avatar" aria-hidden="true">
              <Mascot size={40} alt="" />
            </span>
            <div className="history__body">
              <p className="history__text">{entry.text}</p>
              <span
                className={`history__tag history__tag--${
                  entry.direction === 'sign-to-text' ? 'in' : 'out'
                }`}
              >
                <Icon
                  name={entry.direction === 'sign-to-text' ? 'hands' : 'chat'}
                  size={12}
                />
                {directionLabel(entry.direction)}
              </span>
              <span className="history__meta text-xs text-muted">
                {formatDateTime(entry.createdAt)}
                {entry.isDemo ? ' · demo' : ''}
              </span>
            </div>
            <button
              type="button"
              className="history__delete"
              aria-label={`Eliminar "${entry.text}"`}
            >
              <Icon name="trash" size={18} />
            </button>
          </li>
        ))}
      </ul>

      <p className="demo-note">
        <Icon name="shield" size={14} />
        Datos de ejemplo. El historial real solo se guardara con tu permiso.
      </p>
    </div>
  )
}
