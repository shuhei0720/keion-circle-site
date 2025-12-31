import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || 'Admin User'

  if (!email || !password) {
    console.error('使い方: node scripts/create-admin.js <email> <password> [name]')
    process.exit(1)
  }

  // 既存ユーザーをチェック
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    // 既存ユーザーを管理者に更新
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'site_admin',
        emailVerified: new Date() // メール確認済みとして設定
      }
    })
    console.log(`✅ ユーザー ${email} をsite_admin(サイト管理者)に更新しました`)
  } else {
    // 新規管理者を作成
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'site_admin',
        emailVerified: new Date() // メール確認済みとして設定
      }
    })
    console.log(`✅ site_admin(サイト管理者)ユーザー ${email} を作成しました`)
  }
}

main()
  .catch((e) => {
    console.error('エラー:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
