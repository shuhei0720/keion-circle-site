import pg from 'pg'
const { Client } = pg

const DATABASE_URL = process.env.DATABASE_URL

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  
  try {
    await client.connect()
    console.log('🔧 Userテーブルにavatarカラムを追加中...')
    
    await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT')
    
    console.log('✅ avatarUrlカラム追加完了')
  } catch (error) {
    console.error('❌ エラー:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
