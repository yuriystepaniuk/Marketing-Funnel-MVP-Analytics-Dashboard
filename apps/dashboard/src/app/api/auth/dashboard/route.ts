import { NextRequest, NextResponse } from 'next/server'
import { HttpStatus } from '@/lib/httpStatus'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: HttpStatus.TOO_MANY_REQUESTS })
  }

  const { username, password } = await req.json()

  const validUser = process.env.DASHBOARD_ADMIN_USER
  const validPass = process.env.DASHBOARD_ADMIN_PASSWORD
  const token = process.env.DASHBOARD_SECRET

  if (!username || !password || username !== validUser || password !== validPass) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: HttpStatus.UNAUTHORIZED })
  }

  return NextResponse.json({ token })
}
