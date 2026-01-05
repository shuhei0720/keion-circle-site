import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isSiteAdmin } from '@/lib/permissions'

// ユーザー削除（サイト管理者のみ）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteAdmin = await isSiteAdmin()
    if (!siteAdmin) {
      return NextResponse.json({ error: 'ユーザーの削除はサイト管理者のみ可能です' }, { status: 403 })
    }

    const { id } = await params

    // 自分自身を削除しようとしていないかチェック
    if (id === session.user.id) {
      return NextResponse.json({ error: '自分自身を削除することはできません' }, { status: 400 })
    }

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // ユーザーを削除（Cascadeで関連データも削除される）
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

// ユーザー役割の更新（サイト管理者のみ）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteAdmin = await isSiteAdmin()
    if (!siteAdmin) {
      return NextResponse.json({ error: 'ユーザー役割の変更はサイト管理者のみ可能です' }, { status: 403 })
    }

    const { id } = await params
    
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ error: 'リクエストボディが不正です' }, { status: 400 })
    }
    
    const { role, emailNotifications } = body

    // roleがemailNotificationsのいずれかが必要
    if (role === undefined && emailNotifications === undefined) {
      return NextResponse.json({ error: '更新するフィールドが指定されていません' }, { status: 400 })
    }

    // roleのバリデーション
    if (role !== undefined && !['site_admin', 'admin', 'member'].includes(role)) {
      return NextResponse.json({ error: '無効な役割です' }, { status: 400 })
    }

    // emailNotificationsのバリデーション
    if (emailNotifications !== undefined && typeof emailNotifications !== 'boolean') {
      return NextResponse.json({ error: '通知設定はtrueまたはfalseでなければなりません' }, { status: 400 })
    }

    // 自分自身の役割を変更しようとしていないかチェック
    if (role !== undefined && id === session.user.id) {
      return NextResponse.json({ error: '自分自身の役割を変更することはできません' }, { status: 400 })
    }

    // 更新データを構築
    const updateData: { role?: string; emailNotifications?: boolean } = {}
    if (role !== undefined) updateData.role = role
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailNotifications: true,
        createdAt: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
