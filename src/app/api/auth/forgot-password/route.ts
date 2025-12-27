import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePasswordResetToken, sendPasswordResetEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // ユーザーを確認
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // セキュリティのため、ユーザーが存在しない場合でも成功レスポンスを返す
    if (!user || !user.password) {
      // Googleログインユーザーにはパスワードリセットは不要
      return NextResponse.json({ 
        message: 'パスワードリセットメールを送信しました。メールを確認してください。'
      })
    }

    // パスワードリセットトークンを生成
    const token = await generatePasswordResetToken(email)
    
    // リセットメールを送信
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ 
      message: 'パスワードリセットメールを送信しました。メールを確認してください。'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'パスワードリセットメールの送信に失敗しました' },
      { status: 500 }
    )
  }
}
