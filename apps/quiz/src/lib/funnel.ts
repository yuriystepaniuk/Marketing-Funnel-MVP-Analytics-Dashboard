import type { UtmParams } from '@/features/funnel/types'

export type { UtmParams }

export function getUtmFromSearch(search: string): UtmParams {
  const params = new URLSearchParams(search)
  return {
    source: params.get('utm_source') ?? params.get('ref') ?? 'direct',
    utm_campaign: params.get('utm_campaign') ?? undefined,
    utm_medium: params.get('utm_medium') ?? undefined,
    utm_content: params.get('utm_content') ?? undefined,
    utm_term: params.get('utm_term') ?? undefined,
  }
}

export function saveUtm(utm: UtmParams) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('funnel_utm', JSON.stringify(utm))
}

export function loadUtm(): UtmParams {
  if (typeof window === 'undefined') return { source: 'direct' }
  try {
    const raw = sessionStorage.getItem('funnel_utm')
    return raw ? JSON.parse(raw) : { source: 'direct' }
  } catch {
    return { source: 'direct' }
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return crypto.randomUUID()
  let sid = sessionStorage.getItem('funnel_session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem('funnel_session_id', sid)
  }
  return sid
}

export function resetSessionId(): string {
  if (typeof window === 'undefined') return crypto.randomUUID()
  const sid = crypto.randomUUID()
  sessionStorage.setItem('funnel_session_id', sid)
  return sid
}

export function getOrCreateAnonymousId(): string {
  if (typeof window === 'undefined') return crypto.randomUUID()
  let aid = localStorage.getItem('funnel_anonymous_id')
  if (!aid) {
    aid = crypto.randomUUID()
    localStorage.setItem('funnel_anonymous_id', aid)
  }
  return aid
}

export type FunnelProgress = { step: 'email' } | { step: 'paywall' }

export function saveFunnelProgress(progress: FunnelProgress) {
  if (typeof window === 'undefined') return
  localStorage.setItem('funnel_progress', JSON.stringify(progress))
}

export function loadFunnelProgress(): FunnelProgress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('funnel_progress')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearFunnelProgress() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('funnel_progress')
}
