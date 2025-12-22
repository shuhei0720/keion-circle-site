import pg from 'pg'
const { Client } = pg

const DATABASE_URL = process.env.DATABASE_URL

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  
  try {
    await client.connect()
    console.log('🔧 NULL制約を修正中...\n')
    
    // Comment.postIdをNULLableに
    console.log('Comment.postIdをNULLableに変更...')
    await client.query('ALTER TABLE "Comment" ALTER COLUMN "postId" DROP NOT NULL')
    console.log('✅ Comment.postId修正完了\n')
    
    // EventParticipant.partをNULLableに
    console.log('EventParticipant.partをNULLableに変更...')
    await client.query('ALTER TABLE "EventParticipant" ALTER COLUMN "part" DROP NOT NULL')
    console.log('✅ EventParticipant.part修正完了\n')
    
    console.log('✅ すべて完了！')
  } catch (error) {
    console.error('❌ エラー:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
