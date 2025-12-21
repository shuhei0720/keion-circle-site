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
    console.log('🔄 データ移行開始...\n')

    // 1. Userテーブル
    console.log('📋 Userデータを移行中...')
    const users = await oldDb.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        createdAt: true,
      }
    })
    console.log(`  ${users.length}件のユーザーを検出`)
    
    let usersMigrated = 0
    let usersSkipped = 0
    for (const user of users) {
      try {
        // emailが既に存在する場合はIDで上書き
        const existingUser = await newDb.user.findUnique({ where: { email: user.email } })
        if (existingUser) {
          console.log(`  ⚠️  更新: ${user.email} (ID: ${existingUser.id} → ${user.id})`)
          // 既存ユーザーを削除して旧IDで再作成
          await newDb.user.delete({ where: { id: existingUser.id } })
        }
        
        await newDb.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: new Date(),
          }
        })
        usersMigrated++
      } catch (error) {
        console.log(`  ❌ スキップ: ${user.email} (${error.message})`)
        usersSkipped++
      }
    }
    console.log(`  ✅ User移行完了 (移行: ${usersMigrated}件, スキップ: ${usersSkipped}件)\n`)

    // 2. Postテーブル
    console.log('📋 Postデータを移行中...')
    const posts = await oldDb.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        youtubeUrl: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    console.log(`  ${posts.length}件の投稿を検出`)
    
    // 新DBに存在するユーザーIDを取得
    const newDbUsers = await newDb.user.findMany({ select: { id: true } })
    const existingUserIds = new Set(newDbUsers.map(u => u.id))
    
    for (const post of posts) {
      if (!existingUserIds.has(post.userId)) {
        console.log(`  ⚠️  スキップ: 投稿 "${post.title}" (ユーザーID ${post.userId} が存在しない)`)
        continue
      }
      
      try {
        await newDb.post.upsert({
          where: { id: post.id },
          update: {
            title: post.title,
            content: post.content,
            youtubeUrl: post.youtubeUrl,
            userId: post.userId,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
          },
          create: {
            id: post.id,
            title: post.title,
            content: post.content,
            youtubeUrl: post.youtubeUrl,
            userId: post.userId,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
          }
        })
      } catch (error) {
        console.error(`  ❌ 投稿 "${post.title}" の移行失敗:`, error.message)
      }
    }
    console.log('  ✅ Post移行完了\n')

    // 3. PostParticipantテーブル
    console.log('📋 PostParticipantデータを移行中...')
    const postParticipants = await oldDb.postParticipant.findMany()
    console.log(`  ${postParticipants.length}件の参加記録を検出`)
    
    let ppMigrated = 0
    let ppSkipped = 0
    for (const pp of postParticipants) {
      try {
        await newDb.postParticipant.upsert({
          where: { id: pp.id },
          update: pp,
          create: pp
        })
        ppMigrated++
      } catch (error) {
        if (error.code === 'P2002' || error.code === 'P2003') {
          ppSkipped++
        } else {
          throw error
        }
      }
    }
    console.log(`  ✅ PostParticipant移行完了 (移行: ${ppMigrated}件, スキップ: ${ppSkipped}件)\n`)

    // 4. PostLikeテーブル
    console.log('📋 PostLikeデータを移行中...')
    const postLikes = await oldDb.postLike.findMany()
    console.log(`  ${postLikes.length}件のいいねを検出`)
    
    let likesMigrated = 0
    let likesSkipped = 0
    for (const like of postLikes) {
      try {
        await newDb.postLike.upsert({
          where: { id: like.id },
          update: like,
          create: like
        })
        likesMigrated++
      } catch (error) {
        if (error.code === 'P2002' || error.code === 'P2003') {
          likesSkipped++
        } else {
          throw error
        }
      }
    }
    console.log(`  ✅ PostLike移行完了 (移行: ${likesMigrated}件, スキップ: ${likesSkipped}件)\n`)

    // 5. Scheduleテーブル（スキップ - 構造が異なる）
    console.log('📋 Scheduleデータ: スキップ（新しいスキーマに変更されたため）\n')

    // 6. ScheduleResponseテーブル（スキップ - Scheduleがないため）
    console.log('📋 ScheduleResponseデータ: スキップ\n')

    // 7. Messageテーブル
    console.log('📋 Messageデータを移行中...')
    const messages = await oldDb.message.findMany({
      select: {
        id: true,
        content: true,
        userId: true,
        createdAt: true,
      }
    })
    console.log(`  ${messages.length}件のメッセージを検出`)
    
    let msgMigrated = 0
    let msgSkipped = 0
    for (const message of messages) {
      try {
        await newDb.message.upsert({
          where: { id: message.id },
          update: message,
          create: message
        })
        msgMigrated++
      } catch (error) {
        if (error.code === 'P2003') {
          msgSkipped++
        } else {
          throw error
        }
      }
    }
    console.log(`  ✅ Message移行完了 (移行: ${msgMigrated}件, スキップ: ${msgSkipped}件)\n`)

    // 8. Accountテーブル（NextAuth）
    console.log('📋 Accountデータを移行中...')
    const accounts = await oldDb.account.findMany()
    console.log(`  ${accounts.length}件のアカウント連携を検出`)
    
    let accMigrated = 0
    let accSkipped = 0
    for (const account of accounts) {
      try {
        await newDb.account.upsert({
          where: { id: account.id },
          update: account,
          create: account
        })
        accMigrated++
      } catch (error) {
        if (error.code === 'P2002' || error.code === 'P2003') {
          accSkipped++
        } else {
          throw error
        }
      }
    }
    console.log(`  ✅ Account移行完了 (移行: ${accMigrated}件, スキップ: ${accSkipped}件)\n`)

    console.log('✅ すべてのデータ移行が完了しました！')
    console.log('\n📊 移行サマリー:')
    console.log(`  - ユーザー: ${users.length}件`)
    console.log(`  - 投稿: ${posts.length}件`)
    console.log(`  - 投稿参加: ${postParticipants.length}件`)
    console.log(`  - いいね: ${postLikes.length}件`)
    console.log(`  - スケジュール: ${schedules.length}件`)
    console.log(`  - スケジュール回答: ${responses.length}件`)
    console.log(`  - メッセージ: ${messages.length}件`)
    console.log(`  - アカウント連携: ${accounts.length}件`)

  } catch (error) {
    console.error('❌ エラー:', error)
    throw error
  } finally {
    await oldDb.$disconnect()
    await newDb.$disconnect()
  }
}

migrate()
