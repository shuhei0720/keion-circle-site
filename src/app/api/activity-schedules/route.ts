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
      where: {},
      select: {
        id: true,
        title: true,
        content: true,
        date: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
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

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      )
    }

    const schedule = await prisma.activitySchedule.create({
      data: {
        title,
        content,
        date: date ? new Date(date) : null,
        userId: session.user.id
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
