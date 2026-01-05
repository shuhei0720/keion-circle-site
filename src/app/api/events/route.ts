import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'
import { sendNewEventNotification } from '@/lib/email-notifications'

// イベント一覧取得
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 報告書が作成済みのイベントIDを取得
    const postsWithEventId = await prisma.post.findMany({
      where: {
        eventId: { not: null }
      },
      select: {
        eventId: true
      }
    })
    const reportedEventIds = postsWithEventId.map(p => p.eventId).filter(Boolean) as string[]

    const events = await prisma.event.findMany({
      where: reportedEventIds.length > 0 ? {
        id: {
          notIn: reportedEventIds
        }
      } : {},
      select: {
        id: true,
        title: true,
        content: true,
        date: true,
        locationName: true,
        locationUrl: true,
        songs: true,
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
        date: 'desc'
      },
      take: 50
    })

    return NextResponse.json(events)
  } catch (error: unknown) {
    console.error('イベント取得エラー:', error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    return NextResponse.json(
      { 
        error: 'イベントの取得に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// イベント作成
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const {
      title,
      content,
      date,
      locationName,
      locationUrl,
      songs
    } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        title,
        content,
        date: date ? new Date(date) : null,
        locationName: locationName || null,
        locationUrl: locationUrl || null,
        songs: songs && songs.length > 0 ? JSON.stringify(songs) : null,
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

    // イベント一覧ページのキャッシュを即座に無効化
    revalidatePath('/events')

    // メール通知を送信（非同期・エラーハンドリング）
    if (event.date && event.locationName) {
      sendNewEventNotification({
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.locationName,
      }).catch((error) => {
        console.error('メール通知の送信に失敗しました:', error)
        // メール送信失敗でもイベント作成は成功
      })
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('イベント作成エラー:', error)
    return NextResponse.json(
      { error: 'イベントの作成に失敗しました' },
      { status: 500 }
    )
  }
}
