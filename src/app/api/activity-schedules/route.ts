import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// 活動スケジュール一覧取得
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const schedules = await prisma.activitySchedule.findMany({
      where: {
        reportCreated: false // 報告が作成されていないもののみ
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
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
                email: true,
                avatarUrl: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('活動スケジュール取得エラー:', error)
    return NextResponse.json(
      { error: '活動スケジュールの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 活動スケジュール作成
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { title, content, date } = await request.json()

    if (!title || !content || !date) {
      return NextResponse.json(
        { error: 'タイトル、内容、日付は必須です' },
        { status: 400 }
      )
    }

    const schedule = await prisma.activitySchedule.create({
      data: {
        title,
        content,
        date: new Date(date),
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
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
                email: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('活動スケジュール作成エラー:', error)
    return NextResponse.json(
      { error: '活動スケジュールの作成に失敗しました' },
      { status: 500 }
    )
  }
}
