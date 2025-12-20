import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

// 特定の投稿を更新（管理者のみ）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者チェック
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '投稿の編集は管理者のみ可能です' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, youtubeUrl } = body

    // 投稿の存在確認
    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        youtubeUrl
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// 特定の投稿を削除（管理者のみ）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者チェック
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '投稿の削除は管理者のみ可能です' }, { status: 403 })
    }

    const { id } = await params

    // 投稿の存在確認
    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
