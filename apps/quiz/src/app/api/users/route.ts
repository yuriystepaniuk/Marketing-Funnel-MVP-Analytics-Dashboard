import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateEmail } from '@/features/funnel/helpers'
import { rateLimit } from '@/lib/rateLimit'
import { HttpStatus } from '@/lib/httpStatus'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: HttpStatus.TOO_MANY_REQUESTS })
  }

  const body = await req.json()
  const { email, anonymous_id, source = 'direct', utm_campaign, utm_medium } = body

  if (!email || !validateEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id, email, first_touch_source')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (existing) {
    const { count } = await supabaseAdmin
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', existing.id)
      .eq('step', 'buy_click')
    return NextResponse.json({ user: existing, isNew: false, purchased: (count ?? 0) > 0 })
  }

  const { data: newUser, error } = await supabaseAdmin
    .from('users')
    .insert({
      email: email.toLowerCase().trim(),
      anonymous_id: anonymous_id || null,
      first_touch_source: source,
      first_touch_utm_campaign: utm_campaign || null,
      first_touch_utm_medium: utm_medium || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: HttpStatus.SERVER_ERROR })
  }

  return NextResponse.json({ user: newUser, isNew: true })
}
