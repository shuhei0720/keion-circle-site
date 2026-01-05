import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'
import { sendNewPostNotification } from '@/lib/email-notifications'

// 活動報告作成
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { title, content, youtubeUrls, images } = await request.json()
    const { id } = await params

    // 活動スケジュールを取得
    const schedule = await prisma.activitySchedule.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    if (!schedule) {
      return NextResponse.json(
        { error: '活動スケジュールが見つかりません' },
        { status: 404 }
      )
    }

    // トランザクションで投稿作成
    const result = await prisma.$transaction(async (tx) => {
      // 投稿を作成
      const post = await tx.post.create({
        data: {
          title,
          content,
          youtubeUrls: (youtubeUrls || [])
            .map((url: string) => url.trim())
            .filter((url: string) => url !== ''),
          images: images || [],
          userId: session.user.id,
          activityScheduleId: id
        }
      })

      // 参加者を投稿の参加者として登録
      if (schedule.participants.length > 0) {
        await tx.postParticipant.createMany({
          data: schedule.participants.map(p => ({
            postId: post.id,
            userId: p.userId,
            status: 'participating'
          }))
        })
      }

      return post
    })

    // 投稿一覧ページのキャッシュを即座に無効化
    revalidatePath('/posts')

    // メール通知を送信（非同期・エラーハンドリング）
    // 接続プールの占有を防ぐため、awaitせずに非同期実行
    if (result.title && result.content) {
      console.log('メール通知を送信します:', { id: result.id, title: result.title })
      sendNewPostNotification({
        id: result.id,
        title: result.title,
        content: result.content,
      }).then((notificationResult) => {
        console.log('メール通知の送信結果:', notificationResult)
      }).catch((error) => {
        console.error('メール通知の送信に失敗しました:', error)
      })
    } else {
      console.log('メール通知をスキップ:', { title: result.title, hasContent: !!result.content })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    console.error('活動報告作成エラー:', error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    return NextResponse.json(
      { 
        error: '活動報告の作成に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
