import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyEmailToken } from '@/lib/email'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin?error=invalid_token', req.url))
    }

    // トークンを検証
    const email = await verifyEmailToken(token)

    if (!email) {
      return NextResponse.redirect(new URL('/auth/signin?error=expired_token', req.url))
    }

    // ユーザーのメールアドレスを検証済みに更新
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    })

    // トークンを削除
    await prisma.verificationToken.delete({
      where: { token }
    })

    return NextResponse.redirect(new URL('/auth/signin?verified=true', req.url))
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=verification_failed', req.url))
  }
}
