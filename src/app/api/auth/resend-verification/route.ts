import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // ユーザーを確認
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 既に検証済みの場合
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に確認済みです' },
        { status: 400 }
      )
    }

    // メールアドレス検証トークンを生成
    const token = await generateVerificationToken(email)
    
    // 検証メールを送信
    await sendVerificationEmail(email, token)

    return NextResponse.json({ 
      message: 'メールアドレスに検証リンクを再送信しました。確認してください。'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: '検証メールの再送信に失敗しました' },
      { status: 500 }
    )
  }
}
