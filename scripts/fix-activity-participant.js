import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL
})

async function fixActivityParticipant() {
  try {
    await client.connect()
    console.log('🔧 ActivityParticipantテーブルを修正中...')

    // 1. 既存のデータを削除（互換性がないため）
    console.log('既存のデータを削除...')
    await client.query('DELETE FROM "ActivityParticipant"')
    console.log('✅ 既存のデータ削除完了')

    // 2. 古いカラムを削除
    console.log('古いカラムを削除...')
    await client.query('ALTER TABLE "ActivityParticipant" DROP COLUMN IF EXISTS "scheduleId"')
    await client.query('ALTER TABLE "ActivityParticipant" DROP COLUMN IF EXISTS "date"')
    await client.query('ALTER TABLE "ActivityParticipant" DROP COLUMN IF EXISTS "status"')
    await client.query('ALTER TABLE "ActivityParticipant" DROP COLUMN IF EXISTS "comment"')
    console.log('✅ 古いカラム削除完了')

    // 3. activityScheduleIdをNOT NULLに変更
    console.log('activityScheduleIdをNOT NULLに変更...')
    await client.query('ALTER TABLE "ActivityParticipant" ALTER COLUMN "activityScheduleId" SET NOT NULL')
    console.log('✅ activityScheduleId修正完了')

    console.log('✅ すべて完了！')

  } catch (error) {
    console.error('❌ エラー:', error)
  } finally {
    await client.end()
  }
}

fixActivityParticipant()
