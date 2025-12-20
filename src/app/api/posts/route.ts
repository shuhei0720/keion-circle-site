import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

// 投稿一覧取得（参加情報といいね情報含む）
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
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
        likes: {
          select: {
            userId: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// 新規投稿作成（管理者のみ）
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者チェック
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '投稿の作成は管理者のみ可能です' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, youtubeUrl } = body

    const post = await prisma.post.create({
      data: {
        title,
        content,
        youtubeUrl,
        userId: session.user.id
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
