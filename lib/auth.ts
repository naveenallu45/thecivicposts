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

export function generateToken(email: string, role: 'admin' | 'author' = 'admin'): string {
  return jwt.sign({ email, role }, JWT_SECRET, {
    expiresIn: '7d',
  })
}

export function generateAuthorToken(email: string): string {
  return generateToken(email, 'author')
}

export function verifyToken(token: string): { email: string; role: string } | null {
  try {
    // Use JWT_SECRET even if it's the default in development
    // Only throw error in production if it's not configured
    const secret = JWT_SECRET || 'your-secret-key-change-in-production'
    
    if (process.env.NODE_ENV === 'production' && secret === 'your-secret-key-change-in-production') {
      throw new Error('JWT_SECRET is not properly configured')
    }
    
    const decoded = jwt.verify(token, secret) as { email: string; role: string }
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
