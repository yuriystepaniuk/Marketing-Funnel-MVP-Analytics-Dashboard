import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { validateEmail } from '@/features/funnel/helpers'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { HttpStatus } from '@/lib/httpStatus'

const sanitize = (v: unknown): string | null =>
  typeof v === 'string' ? v.trim().slice(0, 255) || null : null

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: HttpStatus.TOO_MANY_REQUESTS })
  }

  const body = await req.json()
  const { email, anonymous_id, source, utm_campaign, utm_medium } = body

  if (!email || !validateEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: HttpStatus.BAD_REQUEST })
  }

  const normalizedEmail = email.toLowerCase().trim()

  const { data: existing } = await supabaseServer
    .from('users')
    .select('id, email, first_touch_source')
    .eq('email', normalizedEmail)
    .single()

  if (existing) {
    const { count } = await supabaseServer
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', existing.id)
      .eq('step', 'buy_click')
    return NextResponse.json({ user: existing, isNew: false, purchased: (count ?? 0) > 0 })
  }

  const { data: newUser, error } = await supabaseServer
    .from('users')
    .insert({
      email: normalizedEmail,
      anonymous_id: anonymous_id || null,
      first_touch_source: sanitize(source) ?? 'direct',
      first_touch_utm_campaign: sanitize(utm_campaign),
      first_touch_utm_medium: sanitize(utm_medium),
    })
    .select()
    .single()

  if (error) {
    // 23505 = unique_violation: race condition — another request created this user first
    if (error.code === '23505') {
      const { data: raceUser } = await supabaseServer
        .from('users')
        .select('id, email, first_touch_source')
        .eq('email', normalizedEmail)
        .single()
      if (raceUser) {
        return NextResponse.json({ user: raceUser, isNew: false, purchased: false })
      }
    }
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: HttpStatus.SERVER_ERROR })
  }

  return NextResponse.json({ user: newUser, isNew: true })
}
