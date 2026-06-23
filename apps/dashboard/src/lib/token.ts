import { createHmac, timingSafeEqual } from 'crypto'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

export function generateToken(secret: string): string {
  const ts = Date.now().toString()
  const sig = createHmac('sha256', secret).update(ts).digest('hex')
  return `${Buffer.from(ts).toString('base64url')}.${sig}`
}

export function verifyToken(token: string, secret: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [b64ts, sig] = parts
  try {
    const ts = Buffer.from(b64ts, 'base64url').toString()
    if (Date.now() - Number(ts) > TOKEN_TTL_MS) return false
    const expected = createHmac('sha256', secret).update(ts).digest('hex')
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
