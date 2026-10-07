import { useCallback, useEffect, useState } from 'react'

import type { Result, Source } from '@/services/api'

interface ApiResourceState<T> {
  data: T
  source: Source
  loading: boolean
  refetch: () => void
}

/**
 * Carga un recurso de la API (con fallback a mock ya resuelto en `api.ts`).
 * `fetcher` debe devolver `{ data, source }`. Se recarga si `fetcher` cambia
 * o al llamar `refetch`.
 */
export function useApiResource<T>(
  fetcher: () => Promise<Result<T>>,
  initial: T,
): ApiResourceState<T> {
  const [data, setData] = useState<T>(initial)
  const [source, setSource] = useState<Source>('mock')
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)

  const refetch = useCallback(() => {
    setLoading(true)
    setNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((res) => {
        if (cancelled) return
        setData(res.data)
        setSource(res.source)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fetcher, nonce])

  return { data, source, loading, refetch }
}
