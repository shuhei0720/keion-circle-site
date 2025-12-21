import pg from 'pg'
const { Client } = pg

const NEW_DB_URL = "postgresql://postgres.ewxqfqhryknxjzvomizm:SSss07200270@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&statement_cache_size=0"

async function fixAllTables() {
  const client = new Client({ connectionString: NEW_DB_URL })
  
  try {
    await client.connect()
    console.log('🔧 不足しているカラムを追加中...\n')
    
    // Messageテーブル
    console.log('Messageテーブル...')
    await client.query('ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "fileUrl" TEXT')
    await client.query('ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "fileName" TEXT')
    await client.query('ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "fileType" TEXT')
    console.log('✅ Message完了\n')
    
    // ActivityScheduleテーブル
    console.log('ActivityScheduleテーブル...')
    await client.query('ALTER TABLE "ActivitySchedule" ADD COLUMN IF NOT EXISTS "content" TEXT')
    await client.query('ALTER TABLE "ActivitySchedule" ADD COLUMN IF NOT EXISTS "userId" TEXT')
    console.log('✅ ActivitySchedule完了\n')
    
    // Eventテーブル
    console.log('Eventテーブル...')
    await client.query('ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "content" TEXT')
    await client.query('ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "userId" TEXT')
    console.log('✅ Event完了\n')
    
    console.log('✅ すべてのカラム追加完了！')
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

fixAllTables()
