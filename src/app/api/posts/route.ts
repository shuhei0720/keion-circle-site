import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { sendNewPostNotification } from '@/lib/email-notifications'

export const runtime = 'nodejs'

// 投稿一覧取得（参加情報、いいね情報含む）
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        youtubeUrls: true,
        images: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        participants: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        likes: {
          select: {
            userId: true,
            createdAt: true
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
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
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
    const { title, content, youtubeUrls, images } = body

    const post = await prisma.post.create({
      data: {
        title,
        content,
        youtubeUrls: (youtubeUrls || [])
          .map((url: string) => url.trim())
          .filter((url: string) => url !== ''),
        images: images || [],
        userId: session.user.id
      }
    })

    // ホームページのキャッシュを即座に無効化
    revalidatePath('/')

    // メール通知を送信（非同期・エラーハンドリング）
    sendNewPostNotification({
      id: post.id,
      title: post.title,
      content: post.content,
    }).catch((error) => {
      console.error('メール通知の送信に失敗しました:', error)
      // メール送信失敗でも投稿作成は成功
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json({ error: 'Failed to create post', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
