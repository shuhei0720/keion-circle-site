import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// 参加登録/解除
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params

    // 既存の参加を確認
    const existing = await prisma.activityParticipant.findUnique({
      where: {
        activityScheduleId_userId: {
          activityScheduleId: id,
          userId: session.user.id
        }
      }
    })

    if (existing) {
      // 既に参加している場合は解除
      await prisma.activityParticipant.delete({
        where: {
          id: existing.id
        }
      })
      return NextResponse.json({ participating: false })
    } else {
      // 参加登録
      await prisma.activityParticipant.create({
        data: {
          activityScheduleId: id,
          userId: session.user.id
        }
      })
      return NextResponse.json({ participating: true })
    }
  } catch (error) {
    console.error('参加登録エラー:', error)
    return NextResponse.json(
      { error: '参加登録に失敗しました' },
      { status: 500 }
    )
  }
}
