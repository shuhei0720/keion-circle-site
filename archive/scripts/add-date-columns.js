import pg from 'pg'
const { Client } = pg

const DATABASE_URL = process.env.DATABASE_URL

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  
  try {
    await client.connect()
    console.log('🔧 日付カラムを追加中...\n')
    
    console.log('ActivitySchedule.dateを追加...')
    await client.query('ALTER TABLE "ActivitySchedule" ADD COLUMN IF NOT EXISTS "date" TIMESTAMP(3)')
    console.log('✅ ActivitySchedule.date追加完了\n')
    
    console.log('Event.dateを追加...')
    await client.query('ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "date" TIMESTAMP(3)')
    console.log('✅ Event.date追加完了\n')
    
    console.log('✅ すべて完了！')
  } catch (error) {
    console.error('❌ エラー:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
