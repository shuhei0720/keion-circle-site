/**
 * 本番環境のデータを開発環境に移行するスクリプト
 * 
 * 使用方法:
 * 1. 本番環境のDATABASE_URLを設定
 *    export PROD_DATABASE_URL="postgresql://..."
 * 2. 開発環境のDATABASE_URLを設定
 *    export DEV_DATABASE_URL="postgresql://..."
 * 3. スクリプトを実行
 *    node scripts/migrate-prod-to-dev.js
 */

const { PrismaClient } = require('@prisma/client')

async function main() {
  // 環境変数チェック
  if (!process.env.PROD_DATABASE_URL) {
    console.error('❌ PROD_DATABASE_URL が設定されていません')
    process.exit(1)
  }
  if (!process.env.DEV_DATABASE_URL) {
    console.error('❌ DEV_DATABASE_URL が設定されていません')
    process.exit(1)
  }

  console.log('🚀 本番環境から開発環境へのデータ移行を開始します...\n')

  // 本番環境のPrismaクライアント
  const prodPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.PROD_DATABASE_URL,
      },
    },
  })

  // 開発環境のPrismaクライアント
  const devPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DEV_DATABASE_URL,
      },
    },
  })

  try {
    // 本番環境からデータを取得
    console.log('📥 本番環境からデータを取得中...')
    
    const users = await prodPrisma.user.findMany()
    const accounts = await prodPrisma.account.findMany()
    const posts = await prodPrisma.post.findMany()
    const postParticipants = await prodPrisma.postParticipant.findMany()
    const postLikes = await prodPrisma.postLike.findMany()
    const comments = await prodPrisma.comment.findMany()
    const activitySchedules = await prodPrisma.activitySchedule.findMany()
    const activityParticipants = await prodPrisma.activityParticipant.findMany()
    const events = await prodPrisma.event.findMany()
    const eventParticipants = await prodPrisma.eventParticipant.findMany()
    
    // Schedule関連テーブルは存在しない可能性があるのでスキップ
    let schedules = []
    let scheduleDates = []
    let scheduleResponses = []
    try {
      schedules = await prodPrisma.schedule.findMany()
      scheduleDates = await prodPrisma.scheduleDate.findMany()
      scheduleResponses = await prodPrisma.scheduleResponse.findMany()
    } catch (e) {
      console.log('  ⚠️  Schedule関連テーブルは本番環境に存在しないためスキップします')
    }

    console.log(`  ✓ Users: ${users.length}件`)
    console.log(`  ✓ Accounts: ${accounts.length}件`)
    console.log(`  ✓ Posts: ${posts.length}件`)
    console.log(`  ✓ PostParticipants: ${postParticipants.length}件`)
    console.log(`  ✓ PostLikes: ${postLikes.length}件`)
    console.log(`  ✓ Comments: ${comments.length}件`)
    console.log(`  ✓ ActivitySchedules: ${activitySchedules.length}件`)
    console.log(`  ✓ ActivityParticipants: ${activityParticipants.length}件`)
    console.log(`  ✓ Events: ${events.length}件`)
    console.log(`  ✓ EventParticipants: ${eventParticipants.length}件`)
    console.log(`  ✓ Schedules: ${schedules.length}件`)
    console.log(`  ✓ ScheduleDates: ${scheduleDates.length}件`)
    console.log(`  ✓ ScheduleResponses: ${scheduleResponses.length}件\n`)

    // 開発環境の既存データを削除
    console.log('🗑️  開発環境の既存データを削除中...')
    await devPrisma.scheduleResponse.deleteMany()
    await devPrisma.scheduleDate.deleteMany()
    await devPrisma.schedule.deleteMany()
    await devPrisma.eventParticipant.deleteMany()
    await devPrisma.event.deleteMany()
    await devPrisma.activityParticipant.deleteMany()
    await devPrisma.activitySchedule.deleteMany()
    await devPrisma.comment.deleteMany()
    await devPrisma.postLike.deleteMany()
    await devPrisma.postParticipant.deleteMany()
    await devPrisma.post.deleteMany()
    await devPrisma.account.deleteMany()
    await devPrisma.user.deleteMany()
    console.log('  ✓ 削除完了\n')

    // 開発環境にデータを挿入
    console.log('📤 開発環境にデータを挿入中...')
    
    // User
    for (const user of users) {
      await devPrisma.user.create({ data: user })
    }
    console.log(`  ✓ Users: ${users.length}件`)

    // Account
    for (const account of accounts) {
      await devPrisma.account.create({ data: account })
    }
    console.log(`  ✓ Accounts: ${accounts.length}件`)

    // ActivitySchedule (Post参照前に)
    for (const schedule of activitySchedules) {
      await devPrisma.activitySchedule.create({ data: schedule })
    }
    console.log(`  ✓ ActivitySchedules: ${activitySchedules.length}件`)

    // Event (Post参照前に)
    for (const event of events) {
      await devPrisma.event.create({ data: event })
    }
    console.log(`  ✓ Events: ${events.length}件`)

    // Post
    for (const post of posts) {
      await devPrisma.post.create({ data: post })
    }
    console.log(`  ✓ Posts: ${posts.length}件`)

    // PostParticipant
    for (const participant of postParticipants) {
      await devPrisma.postParticipant.create({ data: participant })
    }
    console.log(`  ✓ PostParticipants: ${postParticipants.length}件`)

    // PostLike
    for (const like of postLikes) {
      await devPrisma.postLike.create({ data: like })
    }
    console.log(`  ✓ PostLikes: ${postLikes.length}件`)

    // Comment
    let commentInserted = 0
    let commentSkipped = 0
    for (const comment of comments) {
      try {
        await devPrisma.comment.create({ data: comment })
        commentInserted++
      } catch (e) {
        // 外部キー制約違反の場合はスキップ
        if (e.code === 'P2003') {
          commentSkipped++
        } else {
          throw e
        }
      }
    }
    console.log(`  ✓ Comments: ${commentInserted}件挿入、${commentSkipped}件スキップ`)

    // ActivityParticipant
    let activityParticipantInserted = 0
    let activityParticipantSkipped = 0
    for (const participant of activityParticipants) {
      try {
        await devPrisma.activityParticipant.create({ data: participant })
        activityParticipantInserted++
      } catch (e) {
        // ユニーク制約違反の場合はスキップ
        if (e.code === 'P2002') {
          activityParticipantSkipped++
        } else {
          throw e
        }
      }
    }
    console.log(`  ✓ ActivityParticipants: ${activityParticipantInserted}件挿入、${activityParticipantSkipped}件スキップ`)

    // EventParticipant
    let eventParticipantInserted = 0
    let eventParticipantSkipped = 0
    for (const participant of eventParticipants) {
      try {
        await devPrisma.eventParticipant.create({ data: participant })
        eventParticipantInserted++
      } catch (e) {
        // ユニーク制約違反の場合はスキップ
        if (e.code === 'P2002') {
          eventParticipantSkipped++
        } else {
          throw e
        }
      }
    }
    console.log(`  ✓ EventParticipants: ${eventParticipantInserted}件挿入、${eventParticipantSkipped}件スキップ`)

    // Schedule
    for (const schedule of schedules) {
      await devPrisma.schedule.create({ data: schedule })
    }
    console.log(`  ✓ Schedules: ${schedules.length}件`)

    // ScheduleDate
    for (const date of scheduleDates) {
      await devPrisma.scheduleDate.create({ data: date })
    }
    console.log(`  ✓ ScheduleDates: ${scheduleDates.length}件`)

    // ScheduleResponse
    for (const response of scheduleResponses) {
      await devPrisma.scheduleResponse.create({ data: response })
    }
    console.log(`  ✓ ScheduleResponses: ${scheduleResponses.length}件\n`)

    console.log('✅ データ移行が完了しました！')
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  } finally {
    await prodPrisma.$disconnect()
    await devPrisma.$disconnect()
  }
}

main()
