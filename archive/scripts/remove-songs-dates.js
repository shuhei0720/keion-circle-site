import pg from 'pg'
const { Client } = pg

const DATABASE_URL = process.env.DATABASE_URL

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  
  try {
    await client.connect()
    console.log('🔧 songs/datesカラムを削除中...\n')
    
    console.log('ActivitySchedule.datesを削除...')
    await client.query('ALTER TABLE "ActivitySchedule" DROP COLUMN IF EXISTS "dates"')
    console.log('✅ ActivitySchedule.dates削除完了\n')
    
    console.log('Event.songsを削除...')
    await client.query('ALTER TABLE "Event" DROP COLUMN IF EXISTS "songs"')
    console.log('✅ Event.songs削除完了\n')
    
    console.log('✅ すべて完了！')
  } catch (error) {
    console.error('❌ エラー:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
