import type { DashboardData } from '@/features/dashboard/types'
import { DashboardError } from '@/features/dashboard/constants'
import { HttpStatus } from '@/lib/httpStatus'
import { postJson } from '@/lib/http'

export type { DashboardData }

export interface AuthCredentials {
  username: string
  password: string
}

export type DateRange = '1h' | '24h' | '7d' | '30d' | 'all'

export interface FetchDashboardArgs {
  token: string
  page?: number
  source?: string | null
  dateRange?: DateRange
}

export async function apiAuthDashboard({ username, password }: AuthCredentials): Promise<string> {
  const res = await postJson('/api/auth/dashboard', { username, password })
  const data = await res.json()
  if (res.status === HttpStatus.UNAUTHORIZED) throw new Error(DashboardError.UNAUTHORIZED)
  if (!res.ok) throw new Error(DashboardError.FETCH_FAILED)
  return data.token
}

export async function apiFetchDashboard({ token, page = 1, source, dateRange = 'all' }: FetchDashboardArgs): Promise<DashboardData> {
  const params = new URLSearchParams({ page: String(page) })
  if (source) params.set('source', source)
  if (dateRange !== 'all') params.set('dateRange', dateRange)
  const res = await fetch(`/api/dashboard?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === HttpStatus.UNAUTHORIZED) throw new Error(DashboardError.UNAUTHORIZED)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? DashboardError.FETCH_FAILED)
  return data
}
