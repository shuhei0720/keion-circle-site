import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL
})

async function checkColumns() {
  try {
    await client.connect()
    console.log('🔍 データベース接続成功')

    // ActivityParticipantのカラムを確認
    const activityParticipantColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ActivityParticipant'
      ORDER BY ordinal_position;
    `)
    
    console.log('\n📋 ActivityParticipant テーブルのカラム:')
    activityParticipantColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL可'}`)
    })

    // EventParticipantのカラムを確認
    const eventParticipantColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'EventParticipant'
      ORDER BY ordinal_position;
    `)
    
    console.log('\n📋 EventParticipant テーブルのカラム:')
    eventParticipantColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL可'}`)
    })

    // Commentのカラムを確認
    const commentColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Comment'
      ORDER BY ordinal_position;
    `)
    
    console.log('\n📋 Comment テーブルのカラム:')
    commentColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL可'}`)
    })

  } catch (error) {
    console.error('❌ エラー:', error)
  } finally {
    await client.end()
  }
}

checkColumns()
