import { chromium, FullConfig } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

/**
 * E2Eテストのグローバルセットアップ
 * - site_adminユーザーの作成（存在しない場合）
 */
async function globalSetup(config: FullConfig) {
  console.log('[Global Setup] Starting...')
  
  const prisma = new PrismaClient()
  
  try {
    // admin@example.comが存在するか確認
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (!adminUser) {
      // 存在しない場合は作成
      console.log('[Global Setup] Creating admin@example.com...')
      const hashedPassword = await bcrypt.hash('password123', 10)
      
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Test Site Admin',
          password: hashedPassword,
          role: 'site_admin',
          emailVerified: new Date(), // テスト用なので検証済み
        }
      })
      console.log('[Global Setup] Created site_admin user:', adminUser.email)
    } else {
      // 存在する場合はsite_adminに昇格
      if (adminUser.role !== 'site_admin') {
        console.log('[Global Setup] Upgrading existing user to site_admin...')
        await prisma.user.update({
          where: { email: 'admin@example.com' },
          data: { 
            role: 'site_admin',
            emailVerified: adminUser.emailVerified || new Date() // 検証済みでなければ検証する
          }
        })
        console.log('[Global Setup] Upgraded to site_admin')
      } else {
        console.log('[Global Setup] site_admin user already exists')
      }
    }
    
    // テスト用の一般ユーザーも作成（オプション）
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    if (!testUser) {
      console.log('[Global Setup] Creating test@example.com...')
      const hashedPassword = await bcrypt.hash('password123', 10)
      
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: hashedPassword,
          role: 'member',
          emailVerified: new Date(),
        }
      })
      console.log('[Global Setup] Created member user: test@example.com')
    }
    
    console.log('[Global Setup] Complete!')
  } catch (error) {
    console.error('[Global Setup] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export default globalSetup
