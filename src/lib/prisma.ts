import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 本番環境でのクリーンアップ
if (process.env.NODE_ENV === 'production') {
  // Serverless環境でのコネクションプールの適切な管理
  prisma.$connect()
}

// デフォルトエクスポートも追加
export default prisma
