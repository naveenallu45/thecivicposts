import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
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

export function generateToken(email: string): string {
  return jwt.sign({ email, role: 'admin' }, JWT_SECRET, {
    expiresIn: '7d',
  })
}

export function verifyToken(token: string): { email: string; role: string } | null {
  try {
    if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
      // In production, this should throw an error, not just return null
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is not properly configured')
      }
      return null
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string }
    return decoded
  } catch (error) {
    // Log error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Token verification error:', error)
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
