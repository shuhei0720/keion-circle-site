import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPasswordResetToken } from '@/lib/email'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'トークンとパスワードが必要です' },
        { status: 400 }
      )
    }

    // トークンを検証
    const email = await verifyPasswordResetToken(token)

    if (!email) {
      return NextResponse.json(
        { error: '無効または期限切れのトークンです' },
        { status: 400 }
      )
    }

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

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // パスワードを更新
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    // トークンを削除
    await prisma.verificationToken.delete({
      where: { token }
    })

    return NextResponse.json({ 
      message: 'パスワードが正常にリセットされました'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'パスワードのリセットに失敗しました' },
      { status: 500 }
    )
  }
}
