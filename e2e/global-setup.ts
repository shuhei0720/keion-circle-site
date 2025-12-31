import { chromium, FullConfig } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// .env.localを読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

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
      // 存在する場合はsite_adminに昇格し、パスワードを更新
      console.log('[Global Setup] Updating existing user to site_admin...')
      const hashedPassword = await bcrypt.hash('password123', 10)
      
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { 
          role: 'site_admin',
          password: hashedPassword, // テスト用パスワードに更新
          emailVerified: adminUser.emailVerified || new Date() // 検証済みでなければ検証する
        }
      })
      console.log('[Global Setup] Updated to site_admin with test password')
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
    
    // テスト用のadminロールユーザーも作成
    const adminRoleUser = await prisma.user.findUnique({
      where: { email: 'admin-role@example.com' }
    })
    
    if (!adminRoleUser) {
      console.log('[Global Setup] Creating admin-role@example.com...')
      const hashedPassword = await bcrypt.hash('password123', 10)
      
      await prisma.user.create({
        data: {
          email: 'admin-role@example.com',
          name: 'Admin Role User',
          password: hashedPassword,
          role: 'admin',
          emailVerified: new Date(),
        }
      })
      console.log('[Global Setup] Created admin role user: admin-role@example.com')
    }
    
    // テスト用の未検証ユーザーを作成
    const unverifiedUser = await prisma.user.findUnique({
      where: { email: 'unverified@example.com' }
    })
    
    if (!unverifiedUser) {
      console.log('[Global Setup] Creating unverified@example.com...')
      const hashedPassword = await bcrypt.hash('password123', 10)
      
      await prisma.user.create({
        data: {
          email: 'unverified@example.com',
          name: 'Unverified User',
          password: hashedPassword,
          role: 'member',
          emailVerified: null, // メール未検証
        }
      })
      console.log('[Global Setup] Created unverified user: unverified@example.com')
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
