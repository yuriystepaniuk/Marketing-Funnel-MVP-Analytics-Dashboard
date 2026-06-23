import type { NextRequest } from 'next/server'

const store = new Map<string, { count: number; resetAt: number }>()

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  )
}

export const rateLimit = (key: string, limit: number, windowMs: number): boolean => {
  const now = Date.now()

  if (store.size > 10_000) {
    for (const [k, v] of store) if (now > v.resetAt) store.delete(k)
  }

  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++
  return true
}
