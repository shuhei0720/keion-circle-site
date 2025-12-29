import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// 活動スケジュール更新
export async function PUT(
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

    const { title, content, date } = await request.json()
    const { id } = await params

    const schedule = await prisma.activitySchedule.update({
      where: { id },
      data: {
        title,
        content,
        date: date ? new Date(date) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    // 活動スケジュール一覧ページのキャッシュを無効化
    revalidatePath('/activity-schedules')

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('活動スケジュール更新エラー:', error)
    return NextResponse.json(
      { error: '活動スケジュールの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// 活動スケジュール削除
export async function DELETE(
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

    const { id } = await params

    await prisma.activitySchedule.delete({
      where: { id }
    })

    // 活動スケジュール一覧ページのキャッシュを無効化
    revalidatePath('/activity-schedules')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('活動スケジュール削除エラー:', error)
    return NextResponse.json(
      { error: '活動スケジュールの削除に失敗しました' },
      { status: 500 }
    )
  }
}
