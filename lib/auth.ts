import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

/** Read at use time so API routes and middleware always use the same env value (avoids stale build-time inlining). Trim avoids .env newline/space mismatches. */
function getJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET?.trim()
  if (fromEnv) return fromEnv
  return 'your-secret-key-change-in-production'
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thecivicposts.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  // Trim and normalize email comparison (case-insensitive)
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedAdminEmail = ADMIN_EMAIL.trim().toLowerCase()
  
  if (normalizedEmail !== normalizedAdminEmail) {
    return false
  }

  // Direct password comparison (trimmed)
  // Note: In production, consider using bcrypt for password hashing
  const isValid = password.trim() === ADMIN_PASSWORD.trim()
  
  return isValid
}

export function generateToken(email: string, role: 'admin' | 'author' | 'publisher' = 'admin'): string {
  return jwt.sign({ email, role }, getJwtSecret(), {
    expiresIn: '7d',
  })
}

export function generateAuthorToken(email: string): string {
  return generateToken(email, 'author')
}

export function generatePublisherToken(email: string): string {
  return generateToken(email, 'publisher')
}

export function verifyToken(token: string): { email: string; role: string } | null {
  try {
    const secret = getJwtSecret()

    if (process.env.NODE_ENV === 'production' && secret === 'your-secret-key-change-in-production') {
      throw new Error('JWT_SECRET is not properly configured')
    }

    const decoded = jwt.verify(token, secret) as { email: string; role: string }
    return decoded
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      if (error instanceof jwt.JsonWebTokenError && error.message === 'invalid signature') {
        console.warn(
          '[auth] JWT invalid signature: JWT_SECRET must match the secret used when the cookie was issued. Fix .env JWT_SECRET (no extra spaces), then clear admin_token / publisher_token cookies and log in again.'
        )
      } else {
        console.error('Token verification error:', error)
      }
    }
    return null
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}
