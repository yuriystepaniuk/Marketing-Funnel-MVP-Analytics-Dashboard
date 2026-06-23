import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { FUNNEL_STEPS } from '@/features/funnel/constants'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { HttpStatus } from '@/lib/httpStatus'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: HttpStatus.TOO_MANY_REQUESTS })
  }

  const body = await req.json()
  const {
    user_id,
    session_id,
    anonymous_id,
    step,
    source = 'direct',
    utm_campaign,
    utm_medium,
    utm_content,
    utm_term,
  } = body

  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const sanitize = (v: unknown): string | null =>
    typeof v === 'string' ? v.trim().slice(0, 255) || null : null

  if (!session_id || !step) {
    return NextResponse.json({ error: 'Missing session_id or step' }, { status: HttpStatus.BAD_REQUEST })
  }

  if (!UUID.test(session_id)) {
    return NextResponse.json({ error: 'Invalid session_id' }, { status: HttpStatus.BAD_REQUEST })
  }

  if (anonymous_id && !UUID.test(anonymous_id)) {
    return NextResponse.json({ error: 'Invalid anonymous_id' }, { status: HttpStatus.BAD_REQUEST })
  }

  if (user_id && !UUID.test(user_id)) {
    return NextResponse.json({ error: 'Invalid user_id' }, { status: HttpStatus.BAD_REQUEST })
  }

  if (!(FUNNEL_STEPS as readonly string[]).includes(step)) {
    return NextResponse.json({ error: 'Invalid step' }, { status: HttpStatus.BAD_REQUEST })
  }

  const { error } = await supabaseServer.from('events').insert({
    user_id: user_id || null,
    session_id,
    anonymous_id: anonymous_id || null,
    step,
    source: sanitize(source) ?? 'direct',
    utm_campaign: sanitize(utm_campaign),
    utm_medium: sanitize(utm_medium),
    utm_content: sanitize(utm_content),
    utm_term: sanitize(utm_term),
  })

  if (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: HttpStatus.SERVER_ERROR })
  }

  return NextResponse.json({ ok: true })
}
