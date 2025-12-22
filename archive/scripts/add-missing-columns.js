import pg from 'pg'
const { Client } = pg

const DATABASE_URL = process.env.DATABASE_URL

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  
  try {
    await client.connect()
    console.log('🔧 不足しているカラムを追加中...\n')
    
    // ActivityParticipant.activityScheduleIdを追加
    console.log('ActivityParticipant.activityScheduleIdを追加...')
    await client.query('ALTER TABLE "ActivityParticipant" ADD COLUMN IF NOT EXISTS "activityScheduleId" TEXT')
    console.log('✅ ActivityParticipant.activityScheduleId追加完了\n')
    
    // EventParticipant.eventIdを追加
    console.log('EventParticipant.eventIdを追加...')
    await client.query('ALTER TABLE "EventParticipant" ADD COLUMN IF NOT EXISTS "eventId" TEXT')
    console.log('✅ EventParticipant.eventId追加完了\n')
    
    // Comment.activityScheduleIdを追加
    console.log('Comment.activityScheduleIdを追加...')
    await client.query('ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "activityScheduleId" TEXT')
    console.log('✅ Comment.activityScheduleId追加完了\n')
    
    // Comment.eventIdを追加
    console.log('Comment.eventIdを追加...')
    await client.query('ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "eventId" TEXT')
    console.log('✅ Comment.eventId追加完了\n')
    
    console.log('✅ すべて完了！')
  } catch (error) {
    console.error('❌ エラー:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
