import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 管理者権限をチェック（adminまたはsite_admin）
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  return user?.role === 'admin' || user?.role === 'site_admin'
}

/**
 * サイト管理者権限をチェック（site_adminのみ）
 */
export async function isSiteAdmin(): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  return user?.role === 'site_admin'
}

/**
 * 管理者権限を要求（adminまたはsite_admin）
 */
export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('管理者権限が必要です')
  }
}

/**
 * サイト管理者権限を要求（site_adminのみ）
 */
export async function requireSiteAdmin() {
  const siteAdmin = await isSiteAdmin()
  if (!siteAdmin) {
    throw new Error('サイト管理者権限が必要です')
  }
}

