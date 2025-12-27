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
          content: '# 活動報告\n\n📅 日時\n\n\n👥 参加メンバー\n\n\n━━━━━━━━━━━━━━━━━━━\n📝 活動内容\n\n\n\n━━━━━━━━━━━━━━━━━━━\n✨ 成果・ハイライト\n\n（ここに活動の成果や印象に残ったことを記入してください）\n\n\n━━━━━━━━━━━━━━━━━━━\n💭 次回に向けて\n\n（次回に向けての改善点や課題を記入してください）'
        }
      })
    }

    return NextResponse.json(template)
  } catch (error: unknown) {
    console.error('テンプレート取得エラー:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ 
      error: 'サーバーエラー',
      details: error instanceof Error ? error.message : String(error)
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
  } catch (error: unknown) {
    console.error('テンプレート更新エラー:', error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    return NextResponse.json({ 
      error: 'サーバーエラー',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
