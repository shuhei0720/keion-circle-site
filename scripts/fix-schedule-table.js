import pg from 'pg'
const { Client } = pg

const NEW_DB_URL = "postgresql://postgres.ewxqfqhryknxjzvomizm:SSss07200270@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&statement_cache_size=0"

async function fixSchedule() {
  const client = new Client({ connectionString: NEW_DB_URL })
  
  try {
    await client.connect()
    console.log('🔧 ScheduleテーブルにupdatedAtカラムを追加中...')
    
    await client.query('ALTER TABLE "Schedule" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP')
    console.log('✅ updatedAtカラム追加完了')
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

fixSchedule()
