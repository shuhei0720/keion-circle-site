import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// 活動報告作成
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { title, content, youtubeUrl } = await request.json()
    const { id } = params

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

    if (schedule.reportCreated) {
      return NextResponse.json(
        { error: 'すでに活動報告が作成されています' },
        { status: 400 }
      )
    }

    // トランザクションで投稿作成とスケジュール更新
    const result = await prisma.$transaction(async (tx) => {
      // 投稿を作成
      const post = await tx.post.create({
        data: {
          title,
          content,
          youtubeUrl,
          type: 'activity_report',
          sourceId: id,
          userId: session.user.id
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

      // 活動スケジュールを報告済みに
      await tx.activitySchedule.update({
        where: { id },
        data: { reportCreated: true }
      })

      return post
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('活動報告作成エラー:', error)
    return NextResponse.json(
      { error: '活動報告の作成に失敗しました' },
      { status: 500 }
    )
  }
}
