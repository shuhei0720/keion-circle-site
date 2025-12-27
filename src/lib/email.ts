import crypto from 'crypto'
import prisma from './prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
 * パスワードリセットトークンを生成して保存
 */
export async function generatePasswordResetToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1時間後

  // 既存のトークンを削除
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${email}` }
  })

  // 新しいトークンを作成
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires
    }
  })

  return token
}

/**
 * パスワードリセットトークンを検証
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
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

  // identifier から email を取得（"reset:" プレフィックスを削除）
  const email = verificationToken.identifier.replace('reset:', '')
  return email
}

/**
 * メールアドレス検証メールを送信
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`
  
  // 開発環境ではログに出力
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n========================================')
    console.log('📧 メールアドレス検証リンク')
    console.log('========================================')
    console.log(`宛先: ${email}`)
    console.log(`検証URL: ${verificationUrl}`)
    console.log('========================================\n')
    return
  }
  
  // 本番環境ではResendでメール送信
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'BOLD 軽音 - メールアドレスを確認してください',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">BOLD 軽音</h1>
          <p>メールアドレスの確認をお願いします。</p>
          <p>以下のボタンをクリックしてメールアドレスを確認してください：</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            メールアドレスを確認
          </a>
          <p style="color: #6b7280; font-size: 14px;">
            このリンクは24時間有効です。<br>
            心当たりがない場合は、このメールを無視してください。
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
    // エラーが発生してもユーザー登録は継続する
    // 開発環境用のログを出力
    console.log('\n========================================')
    console.log('📧 メールアドレス検証リンク (Resend送信失敗)')
    console.log('========================================')
    console.log(`宛先: ${email}`)
    console.log(`検証URL: ${verificationUrl}`)
    console.log('========================================\n')
  }
}

/**
 * パスワードリセットメールを送信
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
  
  // 開発環境ではログに出力
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n========================================')
    console.log('🔑 パスワードリセットリンク')
    console.log('========================================')
    console.log(`宛先: ${email}`)
    console.log(`リセットURL: ${resetUrl}`)
    console.log('========================================\n')
    return
  }
  
  // 本番環境ではResendでメール送信
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'BOLD 軽音 - パスワードリセット',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">BOLD 軽音</h1>
          <p>パスワードリセットのリクエストを受け付けました。</p>
          <p>以下のボタンをクリックして新しいパスワードを設定してください：</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            パスワードをリセット
          </a>
          <p style="color: #6b7280; font-size: 14px;">
            このリンクは1時間有効です。<br>
            心当たりがない場合は、このメールを無視してください。
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    console.log('\n========================================')
    console.log('🔑 パスワードリセットリンク (Resend送信失敗)')
    console.log('========================================')
    console.log(`宛先: ${email}`)
    console.log(`リセットURL: ${resetUrl}`)
    console.log('========================================\n')
  }
}
