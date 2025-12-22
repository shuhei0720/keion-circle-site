import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL
})

async function addIndexes() {
  try {
    await client.connect()
    console.log('🔧 データベースインデックスを追加中...')

    // ActivityParticipant - 複合インデックス
    console.log('ActivityParticipant インデックス追加...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS "ActivityParticipant_activityScheduleId_idx" 
      ON "ActivityParticipant"("activityScheduleId");
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "ActivityParticipant_userId_idx" 
      ON "ActivityParticipant"("userId");
    `)

    // EventParticipant - 複合インデックス
    console.log('EventParticipant インデックス追加...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS "EventParticipant_eventId_idx" 
      ON "EventParticipant"("eventId");
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "EventParticipant_userId_idx" 
      ON "EventParticipant"("userId");
    `)

    // Comment - 複合インデックス
    console.log('Comment インデックス追加...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Comment_postId_idx" 
      ON "Comment"("postId");
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Comment_activityScheduleId_idx" 
      ON "Comment"("activityScheduleId");
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Comment_eventId_idx" 
      ON "Comment"("eventId");
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Comment_userId_idx" 
      ON "Comment"("userId");
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Comment_createdAt_idx" 
      ON "Comment"("createdAt");
    `)

    // ActivitySchedule - createdAt インデックス
    console.log('ActivitySchedule インデックス追加...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS "ActivitySchedule_createdAt_idx" 
      ON "ActivitySchedule"("createdAt" DESC);
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "ActivitySchedule_userId_idx" 
      ON "ActivitySchedule"("userId");
    `)

    // Event - createdAt インデックス
    console.log('Event インデックス追加...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Event_createdAt_idx" 
      ON "Event"("createdAt" DESC);
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Event_userId_idx" 
      ON "Event"("userId");
    `)

    // Post - createdAt インデックス
    console.log('Post インデックス追加...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" 
      ON "Post"("createdAt" DESC);
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Post_userId_idx" 
      ON "Post"("userId");
    `)

    // PostLike - 複合インデックス
    console.log('PostLike インデックス追加...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS "PostLike_postId_idx" 
      ON "PostLike"("postId");
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "PostLike_userId_idx" 
      ON "PostLike"("userId");
    `)

    // PostParticipant - 複合インデックス
    console.log('PostParticipant インデックス追加...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS "PostParticipant_postId_idx" 
      ON "PostParticipant"("postId");
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "PostParticipant_userId_idx" 
      ON "PostParticipant"("userId");
    `)

    console.log('✅ すべてのインデックス追加完了！')

  } catch (error) {
    console.error('❌ エラー:', error)
  } finally {
    await client.end()
  }
}

addIndexes()
