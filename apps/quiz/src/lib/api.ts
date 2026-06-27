import type { TrackPayload, UpsertUserPayload, UpsertUserResult } from '@/features/funnel/types'
import { postJson } from '@/lib/http'

export type { TrackPayload, UpsertUserPayload, UpsertUserResult }

export async function apiTrackEvent(payload: TrackPayload): Promise<void> {
  await postJson('/api/track', payload)
}

// Use sendBeacon for exit events (reliable on page unload/visibilitychange)
export function apiTrackBeacon(payload: TrackPayload): void {
  const body = JSON.stringify(payload)
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
  } else {
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
  }
}

export async function apiUpsertUser(payload: UpsertUserPayload): Promise<UpsertUserResult> {
  const res = await postJson('/api/users', payload)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error')
  return data
}
