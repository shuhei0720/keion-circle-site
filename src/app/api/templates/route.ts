import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const templates = await prisma.template.findMany({
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('テンプレート取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { name, content } = await request.json()

    if (!name || !content) {
      return NextResponse.json({ error: '名前と内容は必須です' }, { status: 400 })
    }

    const template = await prisma.template.create({
      data: {
        name,
        content
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('テンプレート作成エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
