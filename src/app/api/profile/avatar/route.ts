import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('avatar') as File

    if (!file || file.size === 0) {
      // アバター削除
      await prisma.user.update({
        where: { id: session.user.id },
        data: { avatarUrl: null },
      })
      return NextResponse.json({ avatarUrl: null })
    }

    // ファイルの検証
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '画像ファイルのみアップロード可能です' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは5MB以下にしてください' }, { status: 400 })
    }

    // ファイル保存
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Vercel環境では /tmp を使用、開発環境では public/uploads を使用
    const isProduction = process.env.VERCEL === '1'
    
    const ext = path.extname(file.name)
    const filename = `${session.user.id.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}${ext}`
    
    let avatarUrl: string

    if (isProduction) {
      // 本番環境: Base64エンコードしてDBに保存（一時的な対応）
      const base64 = buffer.toString('base64')
      const mimeType = file.type
      avatarUrl = `data:${mimeType};base64,${base64}`
    } else {
      // 開発環境: ファイルシステムに保存
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
      await mkdir(uploadsDir, { recursive: true })
      const filepath = path.join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      avatarUrl = `/uploads/avatars/${filename}`
    }

    // データベース更新
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    })

    return NextResponse.json({ avatarUrl: updatedUser.avatarUrl })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 })
  }
}
