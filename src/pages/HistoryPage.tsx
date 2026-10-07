import { useCallback, useMemo, useState } from 'react'

import { Mascot } from '@/components/brand'
import { Icon, PageHeader } from '@/components/ui'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useBackendHealth } from '@/hooks/useBackendHealth'
import { deleteHistory, getHistory, persistenceNote } from '@/services/api'
import { HISTORY_ENTRIES } from '@/services/mockData'
import { directionLabel, formatDateTime } from '@/utils/format'

import './HistoryPage.css'
import './pages.css'

type Range = 'hoy' | 'semana'

const DAY_MS = 24 * 60 * 60 * 1000

export function HistoryPage() {
  const [range, setRange] = useState<Range>('semana')
  const { isAuthenticated } = useAuth()
  const fetcher = useCallback(() => getHistory(), [])
  // De invitado se muestran los ejemplos: no hay historial en el servidor.
  const { data, source, loading, refetch } = useApiResource(
    fetcher,
    HISTORY_ENTRIES,
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const health = useBackendHealth()
  // Momento de referencia para el filtro por rango (estable en el render).
  const [mountedAt] = useState(() => Date.now())

  const entries = useMemo(() => {
    const windowMs = range === 'hoy' ? DAY_MS : 7 * DAY_MS
    return data.filter((e) => {
      const t = new Date(e.createdAt).getTime()
      return Number.isNaN(t) || mountedAt - t <= windowMs
    })
  }, [data, range, mountedAt])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const res = await deleteHistory(id)
    setDeletingId(null)
    if (res.source === 'api') refetch()
  }

  return (
    <div className="page history">
      <PageHeader
        title="Historial"
        action={
          <button
            type="button"
            className="history__filter"
            aria-label="Actualizar"
            onClick={refetch}
          >
            <Icon name="refresh" size={20} />
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

      {loading && entries.length === 0 ? (
        <p className="text-muted text-sm">Cargando...</p>
      ) : entries.length === 0 ? (
        <p className="text-muted text-sm">No hay traducciones en este periodo.</p>
      ) : (
        <ul className="history__list">
          {entries.map((entry) => (
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
                onClick={() => handleDelete(entry.id)}
                disabled={deletingId === entry.id}
              >
                <Icon name="trash" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="demo-note">
        <Icon name="shield" size={14} />
        {isAuthenticated
          ? persistenceNote(source, health.persistence)
          : 'Como invitado se muestran ejemplos: el historial se guarda solo si tienes cuenta.'}
      </p>
    </div>
  )
}
