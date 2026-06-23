import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { HttpStatus } from '@/lib/httpStatus'
import { rateLimit } from '@/lib/rateLimit'
import { STEPS } from '@/features/dashboard/constants'

const PAGE_SIZE = 50

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: HttpStatus.TOO_MANY_REQUESTS })
  }

  const authHeader = req.headers.get('authorization')
  const expectedToken = process.env.DASHBOARD_SECRET

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: HttpStatus.UNAUTHORIZED })
  }

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? '1'))
  const from = (page - 1) * PAGE_SIZE

  const { data: allEvents } = await supabaseAdmin
    .from('events')
    .select('step, session_id, user_id, source')

  // use user_id when available (post-email steps), session_id for quiz_start
  const dedupeKey = (e: { step: string; session_id: string; user_id: string | null }) =>
    e.user_id ?? e.session_id

  const counts: Record<string, number> = {}
  for (const step of STEPS) {
    const unique = new Set(
      allEvents?.filter((e) => e.step === step).map(dedupeKey)
    )
    counts[step] = unique.size
  }

  // first-touch source per unique key — prevents one session inflating multiple source rows
  const sessionFirstSource: Record<string, string> = {}
  for (const row of allEvents ?? []) {
    const key = dedupeKey(row)
    if (!sessionFirstSource[key]) sessionFirstSource[key] = row.source
  }

  const sourceBreakdown: Record<string, Record<string, number>> = {}
  const sourceSessions: Record<string, Record<string, Set<string>>> = {}
  for (const row of allEvents ?? []) {
    const key = dedupeKey(row)
    const source = sessionFirstSource[key]
    if (!sourceSessions[source]) sourceSessions[source] = {}
    if (!sourceSessions[source][row.step]) sourceSessions[source][row.step] = new Set()
    sourceSessions[source][row.step].add(key)
  }
  for (const source of Object.keys(sourceSessions)) {
    sourceBreakdown[source] = {}
    for (const step of Object.keys(sourceSessions[source])) {
      sourceBreakdown[source][step] = sourceSessions[source][step].size
    }
  }

  const { data: users, count: totalUsers } = await supabaseAdmin
    .from('users')
    .select('id, email, first_touch_source, first_touch_utm_campaign, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  const userIds = (users ?? []).map((u) => u.id)
  const { data: lastEvents } = await supabaseAdmin
    .from('events')
    .select('user_id, source, created_at')
    .in('user_id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })

  const lastTouchMap: Record<string, { source: string; created_at: string }> = {}
  for (const evt of lastEvents ?? []) {
    if (evt.user_id && !lastTouchMap[evt.user_id]) {
      lastTouchMap[evt.user_id] = { source: evt.source, created_at: evt.created_at }
    }
  }

  const purchasedUserIds = new Set(
    (allEvents ?? []).filter(e => e.step === 'buy_click' && e.user_id).map(e => e.user_id!)
  )

  const attribution = (users ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    first_touch: u.first_touch_source ?? 'direct',
    first_touch_campaign: u.first_touch_utm_campaign,
    last_touch: lastTouchMap[u.id]?.source ?? u.first_touch_source ?? 'direct',
    created_at: u.created_at,
    last_seen_at: lastTouchMap[u.id]?.created_at ?? null,
    purchased: purchasedUserIds.has(u.id),
  }))

  return NextResponse.json({
    funnel: counts,
    conversions: {
      overall: counts['quiz_start']
        ? ((counts['buy_click'] / counts['quiz_start']) * 100).toFixed(1)
        : '0',
      start_to_email: counts['quiz_start']
        ? ((counts['email_view'] / counts['quiz_start']) * 100).toFixed(1)
        : '0',
      email_to_paywall: counts['email_view']
        ? ((counts['paywall_view'] / counts['email_view']) * 100).toFixed(1)
        : '0',
      paywall_to_buy: counts['paywall_view']
        ? ((counts['buy_click'] / counts['paywall_view']) * 100).toFixed(1)
        : '0',
    },
    source_breakdown: sourceBreakdown,
    attribution,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: totalUsers ?? 0,
      totalPages: Math.ceil((totalUsers ?? 0) / PAGE_SIZE),
    },
  })
}
