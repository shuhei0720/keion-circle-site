import { auth } from '@/lib/auth'

export async function isAdmin() {
  const session = await auth()
  return session?.user?.role === 'admin'
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('管理者権限が必要です')
  }
}
