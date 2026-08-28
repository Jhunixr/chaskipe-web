import { PageHeader } from '@/components/ui'
import { HISTORY_ENTRIES } from '@/services/mockData'
import { directionLabel, formatDateTime } from '@/utils/format'

import './HistoryPage.css'
import './pages.css'

export function HistoryPage() {
  return (
    <div className="page">
      <PageHeader title="Historial" subtitle="Traducciones recientes." />

      <p className="demo-note">Datos de ejemplo. Todavia no se guarda historial real.</p>

      <ul className="history__list">
        {HISTORY_ENTRIES.map((entry) => (
          <li key={entry.id} className="history__item">
            <span
              className={[
                'history__tag',
                entry.direction === 'sign-to-text'
                  ? 'history__tag--in'
                  : 'history__tag--out',
              ].join(' ')}
            >
              {directionLabel(entry.direction)}
            </span>
            <p className="history__text">{entry.text}</p>
            <span className="history__meta">
              {formatDateTime(entry.createdAt)}
              {entry.isDemo ? ' · demo' : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
