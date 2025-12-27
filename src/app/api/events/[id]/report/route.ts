import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// イベント報告作成
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { title, content, youtubeUrls, images } = await request.json()
    const { id } = await params

    console.log('Request data:', { title, content, youtubeUrls: youtubeUrls?.length || 0, images: images?.length || 0 })

    // イベントを取得
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    // トランザクションで投稿作成
    const result = await prisma.$transaction(async (tx) => {
      // 投稿を作成
      console.log('Creating post with data:', {
        title,
        content: content?.substring(0, 50),
        youtubeUrls: youtubeUrls?.length || 0,
        images: images || [],
        userId: session.user.id,
        eventId: id
      })
      
      const post = await tx.post.create({
        data: {
          title,
          content,
          youtubeUrls: (youtubeUrls || []).map((url: string) => url.trim()).filter((url: string) => url !== ''),
          images: images || [],
          userId: session.user.id,
          eventId: id
        }
      })

      // 参加者を投稿の参加者として登録（重複を除去）
      if (event.participants.length > 0) {
        const uniqueUserIds = [...new Set(event.participants.map(p => p.userId))]
        await tx.postParticipant.createMany({
          data: uniqueUserIds.map(userId => ({
            postId: post.id,
            userId: userId,
            status: 'participating'
          }))
        })
      }

      return post
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    console.error('イベント報告作成エラー:', error)
    console.error('Error name:', error instanceof Error ? error.name : '')
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Error code:', (error as any)?.code)
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    
    // Prismaエラーの詳細を返す
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : 'UNKNOWN'
    
    return NextResponse.json(
      { 
        error: 'イベント報告の作成に失敗しました',
        details: errorMessage,
        code: errorCode,
        hint: errorCode === 'P2010' ? 'データベースのimagesカラムが存在しません。DB_MIGRATION_POST_IMAGES.sqlを実行してください。' : undefined
      },
      { status: 500 }
    )
  }
}
