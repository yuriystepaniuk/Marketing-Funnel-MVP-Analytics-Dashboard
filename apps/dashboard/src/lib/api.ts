import type { DashboardData } from '@/features/dashboard/types'
import { DashboardError } from '@/features/dashboard/constants'
import { HttpStatus } from '@/lib/httpStatus'
import { postJson } from '@/lib/http'

export type { DashboardData }

export interface AuthCredentials {
  username: string
  password: string
}

export interface FetchDashboardArgs {
  token: string
  page?: number
}

export async function apiAuthDashboard({ username, password }: AuthCredentials): Promise<string> {
  const res = await postJson('/api/auth/dashboard', { username, password })
  const data = await res.json()
  if (res.status === HttpStatus.UNAUTHORIZED) throw new Error(DashboardError.UNAUTHORIZED)
  if (!res.ok) throw new Error(DashboardError.FETCH_FAILED)
  return data.token
}

export async function apiFetchDashboard({ token, page = 1 }: FetchDashboardArgs): Promise<DashboardData> {
  const res = await fetch(`/api/dashboard?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === HttpStatus.UNAUTHORIZED) throw new Error(DashboardError.UNAUTHORIZED)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? DashboardError.FETCH_FAILED)
  return data
}
