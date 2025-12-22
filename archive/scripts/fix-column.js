import pg from 'pg'
const { Client } = pg

const NEW_DB_URL = "postgresql://postgres.ewxqfqhryknxjzvomizm:SSss07200270@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&statement_cache_size=0"

async function fixColumn() {
  const client = new Client({ connectionString: NEW_DB_URL })
  
  try {
    await client.connect()
    console.log('🔧 Postテーブルの外部キー制約を削除中...')
    
    // 古い外部キー制約を削除
    await client.query('ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_authorId_fkey"')
    console.log('✅ 古い外部キー削除完了')
    
    // 新しい外部キー制約を追加
    await client.query('ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE')
    console.log('✅ 新しい外部キー追加完了')
    
    // インデックスも修正
    await client.query('DROP INDEX IF EXISTS "Post_authorId_idx"')
    await client.query('CREATE INDEX IF NOT EXISTS "Post_userId_idx" ON "Post"("userId")')
    console.log('✅ インデックス更新完了')
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

fixColumn()
