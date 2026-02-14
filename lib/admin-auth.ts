import { cookies } from 'next/headers'
import { verifyToken } from './auth'
import { redirect } from 'next/navigation'

export async function getAdminSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      console.log('getAdminSession: No token found')
      return null
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log('getAdminSession: Token verification failed')
    } else {
      console.log('getAdminSession: Token verified successfully')
    }
    return decoded
  } catch (error) {
    console.error('getAdminSession error:', error)
    return null
  }
}

export async function requireAdmin() {
  const session = await getAdminSession()

  if (!session) {
    console.log('requireAdmin: No valid session, redirecting to login')
    redirect('/admin/login')
  }

  console.log('requireAdmin: Session valid for:', session.email)
  return session
}

// For API routes - throws error instead of redirecting
export async function requireAdminApi() {
  const session = await getAdminSession()

  if (!session) {
    console.log('requireAdminApi: No valid session')
    throw new Error('Unauthorized: Admin authentication required')
  }

  console.log('requireAdminApi: Session valid for:', session.email)
  return session
}
