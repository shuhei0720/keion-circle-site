import pg from 'pg'
const { Client } = pg

const DATABASE_URL = process.env.DATABASE_URL

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  
  try {
    await client.connect()
    console.log('🔧 スキーマの不一致を修正中...\n')
    
    // ActivityScheduleからdateカラムを削除（既にcontentがある）
    console.log('ActivitySchedule.dateを削除...')
    await client.query('ALTER TABLE "ActivitySchedule" DROP COLUMN IF EXISTS "date"')
    console.log('✅ ActivitySchedule.date削除完了\n')
    
    // Eventからlocationとdateカラムを削除（既にcontentがある）
    console.log('Event.location, Event.dateを削除...')
    await client.query('ALTER TABLE "Event" DROP COLUMN IF EXISTS "location"')
    await client.query('ALTER TABLE "Event" DROP COLUMN IF EXISTS "date"')
    await client.query('ALTER TABLE "Event" DROP COLUMN IF EXISTS "songTitle"')
    await client.query('ALTER TABLE "Event" DROP COLUMN IF EXISTS "songSheetUrl"')
    await client.query('ALTER TABLE "Event" DROP COLUMN IF EXISTS "songYoutubeUrl"')
    await client.query('ALTER TABLE "Event" DROP COLUMN IF EXISTS "parts"')
    await client.query('ALTER TABLE "Event" DROP COLUMN IF EXISTS "reportCreated"')
    console.log('✅ Event不要カラム削除完了\n')
    
    // ActivityScheduleからreportCreatedカラムを削除
    console.log('ActivitySchedule.reportCreatedを削除...')
    await client.query('ALTER TABLE "ActivitySchedule" DROP COLUMN IF EXISTS "reportCreated"')
    console.log('✅ ActivitySchedule.reportCreated削除完了\n')
    
    console.log('✅ すべての修正完了！')
  } catch (error) {
    console.error('❌ エラー:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
