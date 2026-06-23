import { useState, useEffect, useCallback } from 'react'
import { apiFetchDashboard } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import { STEPS, DashboardError } from '@/features/dashboard/constants'
import type { AttributionRow } from '@/features/dashboard/types'

export const useDashboardData = (token: string, onSessionExpired: () => void) => {
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [allAttribution, setAllAttribution] = useState<AttributionRow[]>([])
  const [hasMore, setHasMore] = useState(true)
  const { execute: fetchData, data, loading, error: fetchError } = useCrud(apiFetchDashboard)

  useEffect(() => {
    if (!token) return
    fetchData({ token, page }).then((result) => {
      if (!result) { onSessionExpired(); return }
      setAllAttribution((prev) => page === 1 ? result.attribution : [...prev, ...result.attribution])
      setHasMore(page < result.pagination.totalPages)
    })
  }, [token, page, refreshKey, fetchData, onSessionExpired])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPage((p) => p + 1)
  }, [loading, hasMore])

  const refresh = useCallback(() => {
    setPage(1)
    setAllAttribution([])
    setHasMore(true)
    setRefreshKey((k) => k + 1)
  }, [])

  const maxCount = data ? Math.max(...STEPS.map((s) => data.funnel[s] ?? 0), 1) : 1
  const displayError = fetchError === DashboardError.UNAUTHORIZED ? null : fetchError

  return {
    data,
    loading,
    fetchError: displayError,
    maxCount,
    allAttribution,
    hasMore,
    loadMore,
    refresh,
  }
}
