import { PrismaClient } from '@prisma/client'

const OLD_DB_URL = "postgresql://postgres.pfaolimihelypucpcerr:SSss07200270@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&statement_cache_size=0"
const NEW_DB_URL = "postgresql://postgres.ewxqfqhryknxjzvomizm:SSss07200270@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&statement_cache_size=0"

const oldDb = new PrismaClient({
  datasources: { db: { url: OLD_DB_URL } }
})

const newDb = new PrismaClient({
  datasources: { db: { url: NEW_DB_URL } }
})

async function migrate() {
  try {
    console.log('🔄 主要データ移行開始...\n')

    // 1. Userテーブル
    console.log('📋 Userデータを移行中...')
    const users = await oldDb.$queryRaw`SELECT id, email, name, password, role, "createdAt" FROM "User"`
    console.log(`  ${users.length}件のユーザーを検出`)
    
    for (const user of users) {
      const existingUser = await newDb.user.findUnique({ where: { email: user.email } })
      if (existingUser && existingUser.id !== user.id) {
        await newDb.user.delete({ where: { id: existingUser.id } })
      }
      
      await newDb.$executeRaw`
        INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
        VALUES (${user.id}, ${user.email}, ${user.name}, ${user.password}, ${user.role}, ${user.createdAt}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          password = EXCLUDED.password,
          role = EXCLUDED.role
      `
    }
    console.log(`  ✅ User移行完了: ${users.length}件\n`)

    // 2. Postテーブル
    console.log('📋 Postデータを移行中...')
    const posts = await oldDb.$queryRaw`SELECT id, title, content, "youtubeUrl", "userId", "createdAt", "updatedAt" FROM "Post"`
    console.log(`  ${posts.length}件の投稿を検出`)
    
    for (const post of posts) {
      await newDb.$executeRaw`
        INSERT INTO "Post" (id, title, content, "youtubeUrl", "userId", "createdAt", "updatedAt")
        VALUES (${post.id}, ${post.title}, ${post.content}, ${post.youtubeUrl}, ${post.userId}, ${post.createdAt}, ${post.updatedAt})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          "youtubeUrl" = EXCLUDED."youtubeUrl"
      `
    }
    console.log(`  ✅ Post移行完了: ${posts.length}件\n`)

    // 3. PostParticipantテーブル
    console.log('📋 PostParticipantデータを移行中...')
    const participants = await oldDb.$queryRaw`SELECT id, "postId", "userId", status, "createdAt" FROM "PostParticipant"`
    console.log(`  ${participants.length}件の参加記録を検出`)
    
    let ppCount = 0
    for (const pp of participants) {
      try {
        await newDb.$executeRaw`
          INSERT INTO "PostParticipant" (id, "postId", "userId", status, "createdAt")
          VALUES (${pp.id}, ${pp.postId}, ${pp.userId}, ${pp.status}, ${pp.createdAt})
          ON CONFLICT (id) DO NOTHING
        `
        ppCount++
      } catch (error) {
        // スキップ
      }
    }
    console.log(`  ✅ PostParticipant移行完了: ${ppCount}件\n`)

    // 4. PostLikeテーブル
    console.log('📋 PostLikeデータを移行中...')
    const likes = await oldDb.$queryRaw`SELECT id, "postId", "userId", "createdAt" FROM "PostLike"`
    console.log(`  ${likes.length}件のいいねを検出`)
    
    let likeCount = 0
    for (const like of likes) {
      try {
        await newDb.$executeRaw`
          INSERT INTO "PostLike" (id, "postId", "userId", "createdAt")
          VALUES (${like.id}, ${like.postId}, ${like.userId}, ${like.createdAt})
          ON CONFLICT (id) DO NOTHING
        `
        likeCount++
      } catch (error) {
        // スキップ
      }
    }
    console.log(`  ✅ PostLike移行完了: ${likeCount}件\n`)

    // 5. Messageテーブル
    console.log('📋 Messageデータを移行中...')
    const messages = await oldDb.$queryRaw`SELECT id, content, "userId", "createdAt" FROM "Message"`
    console.log(`  ${messages.length}件のメッセージを検出`)
    
    let msgCount = 0
    for (const msg of messages) {
      try {
        await newDb.$executeRaw`
          INSERT INTO "Message" (id, content, "userId", "createdAt")
          VALUES (${msg.id}, ${msg.content}, ${msg.userId}, ${msg.createdAt})
          ON CONFLICT (id) DO NOTHING
        `
        msgCount++
      } catch (error) {
        // スキップ
      }
    }
    console.log(`  ✅ Message移行完了: ${msgCount}件\n`)

    console.log('✅ すべてのデータ移行が完了しました！')

  } catch (error) {
    console.error('❌ エラー:', error)
    throw error
  } finally {
    await oldDb.$disconnect()
    await newDb.$disconnect()
  }
}

migrate()
