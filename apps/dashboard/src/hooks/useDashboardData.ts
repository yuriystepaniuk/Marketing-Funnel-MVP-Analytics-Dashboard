import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetchDashboard } from '@/lib/api'
import type { DateRange } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import { STEPS, DashboardError } from '@/features/dashboard/constants'
import type { AttributionRow } from '@/features/dashboard/types'

export const useDashboardData = (
  token: string,
  onSessionExpired: () => void,
  source: string | null = null,
  dateRange: DateRange = 'all',
) => {
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [allAttribution, setAllAttribution] = useState<AttributionRow[]>([])
  const [hasMore, setHasMore] = useState(true)
  const { execute: fetchData, data, loading, error: fetchError } = useCrud(apiFetchDashboard)
  const sourceRef = useRef(source)
  const dateRangeRef = useRef(dateRange)

  const reset = useCallback(() => {
    setPage(1)
    setAllAttribution([])
    setHasMore(true)
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (sourceRef.current === source) return
    sourceRef.current = source
    reset()
  }, [source, reset])

  useEffect(() => {
    if (dateRangeRef.current === dateRange) return
    dateRangeRef.current = dateRange
    reset()
  }, [dateRange, reset])

  useEffect(() => {
    if (!token) return
    fetchData({ token, page, source: sourceRef.current, dateRange: dateRangeRef.current }).then((result) => {
      if (!result) return // error is shown via fetchError; don't logout on filter errors
      setAllAttribution((prev) => page === 1 ? result.attribution : [...prev, ...result.attribution])
      setHasMore(page < result.pagination.totalPages)
    })
  }, [token, page, refreshKey, fetchData, onSessionExpired])

  // Only logout on actual 401 — not on filter/network errors
  useEffect(() => {
    if (fetchError === DashboardError.UNAUTHORIZED) onSessionExpired()
  }, [fetchError, onSessionExpired])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPage((p) => p + 1)
  }, [loading, hasMore])

  const refresh = useCallback(() => { reset() }, [reset])

  const maxCount = data ? Math.max(...STEPS.map((s) => data.funnel[s] ?? 0), 1) : 1
  const displayError = fetchError === DashboardError.UNAUTHORIZED ? null : fetchError

  return { data, loading, fetchError: displayError, maxCount, allAttribution, hasMore, loadMore, refresh }
}
