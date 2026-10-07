import { useEffect, useState } from 'react'

import { type BackendHealth, checkBackend } from '@/services/api'

/** Consulta /health del backend una vez al montar. */
export function useBackendHealth(): BackendHealth {
  const [health, setHealth] = useState<BackendHealth>({
    online: false,
    persistence: 'unknown',
  })

  useEffect(() => {
    let cancelled = false
    checkBackend().then((h) => {
      if (!cancelled) setHealth(h)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return health
}
