import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { HttpStatus } from '@/lib/httpStatus'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { verifyToken } from '@/lib/token'

const PAGE_SIZE = 50
const FALLBACK_ID = '00000000-0000-0000-0000-000000000000'

function getFromDate(range: string): string | null {
  const ms: Record<string, number> = {
    '1h':  1 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d':  7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  }
  return ms[range] ? new Date(Date.now() - ms[range]).toISOString() : null
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: HttpStatus.TOO_MANY_REQUESTS })
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const secret = process.env.DASHBOARD_SECRET

  if (!secret || !verifyToken(token, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: HttpStatus.UNAUTHORIZED })
  }

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? '1'))
  const source = req.nextUrl.searchParams.get('source') || null
  const dateRange = req.nextUrl.searchParams.get('dateRange') ?? 'all'
  const fromDate = getFromDate(dateRange)
  const groupBy = ['1h', '24h'].includes(dateRange) ? 'hour' : 'day'
  const from = (page - 1) * PAGE_SIZE

  const usersQuery = supabaseServer
    .from('users')
    .select('id, email, first_touch_source, first_touch_utm_campaign, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (source) usersQuery.eq('first_touch_source', source)
  if (fromDate) usersQuery.gte('created_at', fromDate)

  const [
    { data: funnelData },
    { data: sourceData },
    { data: dailyData },
    { data: timeData },
    { data: users, count: totalUsers },
  ] = await Promise.all([
    supabaseServer.rpc('get_funnel_counts', { p_source: source, p_from: fromDate }),
    supabaseServer.rpc('get_source_breakdown', { p_from: fromDate }),
    supabaseServer.rpc('get_funnel_by_day', { p_source: source, p_from: fromDate, p_group_by: groupBy }),
    supabaseServer.rpc('get_funnel_time_stats', { p_source: source, p_from: fromDate }),
    usersQuery,
  ])

  const counts = (funnelData as Record<string, number> | null) ?? {}
  const sourceBreakdown = (sourceData as Record<string, Record<string, number>> | null) ?? {}
  const funnelByDay = Array.isArray(dailyData) ? dailyData : []
  const timeStats = timeData ?? null

  const userIds = (users ?? []).map((u) => u.id)
  const ids = userIds.length > 0 ? userIds : [FALLBACK_ID]

  const [{ data: lastEvents }, { data: buyEvents }] = await Promise.all([
    supabaseServer
      .from('events')
      .select('user_id, source, created_at')
      .in('user_id', ids)
      .order('created_at', { ascending: false }),
    supabaseServer
      .from('events')
      .select('user_id')
      .in('user_id', ids)
      .eq('step', 'buy_click'),
  ])

  const lastTouchMap: Record<string, { source: string; created_at: string }> = {}
  for (const evt of lastEvents ?? []) {
    if (evt.user_id && !lastTouchMap[evt.user_id]) {
      lastTouchMap[evt.user_id] = { source: evt.source, created_at: evt.created_at }
    }
  }

  const purchasedUserIds = new Set((buyEvents ?? []).map((e) => e.user_id))

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
    funnel_by_day: funnelByDay,
    time_stats: timeStats,
    attribution,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: totalUsers ?? 0,
      totalPages: Math.ceil((totalUsers ?? 0) / PAGE_SIZE),
    },
  })
}
