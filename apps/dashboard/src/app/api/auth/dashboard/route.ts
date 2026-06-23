import { NextRequest, NextResponse } from 'next/server'
import { HttpStatus } from '@/lib/httpStatus'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { generateToken } from '@/lib/token'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: HttpStatus.TOO_MANY_REQUESTS })
  }

  const { username, password } = await req.json()

  const validUser = process.env.DASHBOARD_ADMIN_USER
  const validPass = process.env.DASHBOARD_ADMIN_PASSWORD
  const secret = process.env.DASHBOARD_SECRET

  if (!username || !password || !secret || username !== validUser || password !== validPass) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: HttpStatus.UNAUTHORIZED })
  }

  return NextResponse.json({ token: generateToken(secret) })
}
