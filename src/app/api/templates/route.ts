import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const TEMPLATE_ID = 'report_template'

// テンプレート取得
export async function GET() {
  try {
    let template = await prisma.template.findUnique({
      where: { id: TEMPLATE_ID }
    })

    // テンプレートが存在しない場合は初期テンプレートを作成
    if (!template) {
      template = await prisma.template.create({
        data: {
          id: TEMPLATE_ID,
          name: '活動報告テンプレート',
          content: '# イベント名\n\n## 概要\n\n## 実施内容\n\n## 成果・感想\n'
        }
      })
    }

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('テンプレート取得エラー:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({ 
      error: 'サーバーエラー',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}

// テンプレート更新（管理者のみ）
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: '内容は必須です' }, { status: 400 })
    }

    const template = await prisma.template.upsert({
      where: { id: TEMPLATE_ID },
      update: { content },
      create: {
        id: TEMPLATE_ID,
        name: '活動報告テンプレート',
        content
      }
    })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('テンプレート更新エラー:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({ 
      error: 'サーバーエラー',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}
