import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザーを作成（メールアドレス未検証）
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'member', // デフォルトは通常ユーザー
        emailVerified: null, // 未検証
        emailNotifications: true // デフォルトで通知を有効化
      }
    })

    // メールアドレス検証トークンを生成
    const token = await generateVerificationToken(email)
    
    // 検証メールを送信
    await sendVerificationEmail(email, token)

    return NextResponse.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email,
      role: user.role,
      message: 'メールアドレスに検証リンクを送信しました。確認してください。'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'アカウント作成に失敗しました' },
      { status: 500 }
    )
  }
}
