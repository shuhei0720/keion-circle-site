import pg from 'pg'
const { Client } = pg

const NEW_DB_URL = "postgresql://postgres.ewxqfqhryknxjzvomizm:SSss07200270@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&statement_cache_size=0"

async function fixSchema() {
  const client = new Client({ connectionString: NEW_DB_URL })
  
  try {
    await client.connect()
    console.log('🔧 スキーマを修正中...\n')
    
    // PostParticipantにstatusカラムを追加
    console.log('PostParticipantテーブルにstatusカラムを追加...')
    await client.query('ALTER TABLE "PostParticipant" ADD COLUMN IF NOT EXISTS "status" TEXT')
    console.log('✅ statusカラム追加完了\n')
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

fixSchema()
