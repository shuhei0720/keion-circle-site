import crypto from 'crypto'
import prisma from './prisma'

/**
 * メールアドレス検証トークンを生成して保存
 */
export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間後

  // 既存のトークンを削除
  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  })

  // 新しいトークンを作成
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  })

  return token
}

/**
 * メールアドレス検証トークンを検証
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  })

  if (!verificationToken) {
    return null
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { token }
    })
    return null
  }

  return verificationToken.identifier // email
}

/**
 * メールアドレス検証メールを送信（開発環境用ログ出力）
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`
  
  // 本番環境ではメール送信サービス（Resend, SendGrid等）を使用
  // 開発環境ではログに出力
  console.log('\n========================================')
  console.log('📧 メールアドレス検証リンク')
  console.log('========================================')
  console.log(`宛先: ${email}`)
  console.log(`検証URL: ${verificationUrl}`)
  console.log('========================================\n')
  
  // TODO: 本番環境でメール送信を実装
  // 例: Resendを使用する場合
  // await resend.emails.send({
  //   from: 'noreply@example.com',
  //   to: email,
  //   subject: 'メールアドレスを確認してください',
  //   html: `<a href="${verificationUrl}">こちらをクリックしてメールアドレスを確認</a>`
  // })
}
