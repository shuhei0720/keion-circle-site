import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// イベント更新
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

    const {
      title,
      content,
      date,
      locationName,
      locationUrl,
      songs
    } = await request.json()
    const { id } = await params

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        content,
        date: date ? new Date(date) : null,
        locationName: locationName || null,
        locationUrl: locationUrl || null,
        songs: songs && songs.length > 0 ? JSON.stringify(songs) : null
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

    // イベント一覧ページのキャッシュを無効化
    revalidatePath('/events')

    return NextResponse.json(event)
  } catch (error) {
    console.error('イベント更新エラー:', error)
    return NextResponse.json(
      { error: 'イベントの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// イベント削除
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

    await prisma.event.delete({
      where: { id }
    })

    // イベント一覧ページのキャッシュを無効化
    revalidatePath('/events')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('イベント削除エラー:', error)
    return NextResponse.json(
      { error: 'イベントの削除に失敗しました' },
      { status: 500 }
    )
  }
}
