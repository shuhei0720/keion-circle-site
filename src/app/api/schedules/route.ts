import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

export const runtime = 'nodejs'

// スケジュール一覧取得
export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        dates: {
          include: {
            responses: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(schedules)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

// 新規スケジュール作成（管理者のみ）
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者チェック
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'スケジュールの作成は管理者のみ可能です' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, dates } = body

    // 候補日を含むスケジュールを作成
    const schedule = await prisma.schedule.create({
      data: {
        title,
        description,
        dates: {
          create: dates.map((date: string) => ({
            date: new Date(date)
          }))
        }
      },
      include: {
        dates: true
      }
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Schedule creation error:', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}
