import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// コメント投稿
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { content } = await request.json()
    const { id } = await params

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'コメント内容は必須です' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        activityScheduleId: id
      },
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
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('コメント投稿エラー:', error)
    return NextResponse.json(
      { error: 'コメントの投稿に失敗しました' },
      { status: 500 }
    )
  }
}
