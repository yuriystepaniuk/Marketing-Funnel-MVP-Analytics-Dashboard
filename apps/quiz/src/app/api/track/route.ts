import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { FUNNEL_STEPS } from '@/features/funnel/constants'
import { rateLimit } from '@/lib/rateLimit'
import { HttpStatus } from '@/lib/httpStatus'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
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

  if (!session_id || !step) {
    return NextResponse.json({ error: 'Missing session_id or step' }, { status: 400 })
  }

  if (!(FUNNEL_STEPS as readonly string[]).includes(step)) {
    return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('events').insert({
    user_id: user_id || null,
    session_id,
    anonymous_id: anonymous_id || null,
    step,
    source,
    utm_campaign: utm_campaign || null,
    utm_medium: utm_medium || null,
    utm_content: utm_content || null,
    utm_term: utm_term || null,
  })

  if (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: HttpStatus.SERVER_ERROR })
  }

  return NextResponse.json({ ok: true })
}
