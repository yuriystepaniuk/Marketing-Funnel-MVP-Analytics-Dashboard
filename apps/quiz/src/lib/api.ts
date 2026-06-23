import type { TrackPayload, UpsertUserPayload, UpsertUserResult } from '@/features/funnel/types'
import { postJson } from '@/lib/http'

export type { TrackPayload, UpsertUserPayload, UpsertUserResult }

export async function apiTrackEvent(payload: TrackPayload): Promise<void> {
  await postJson('/api/track', payload)
}

export async function apiUpsertUser(payload: UpsertUserPayload): Promise<UpsertUserResult> {
  const res = await postJson('/api/users', payload)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error')
  return data
}
