'use server'

import { signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'メールアドレスとパスワードを入力してください' }
  }

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      return { 
        error: 'メールアドレスまたはパスワードが正しくありません。メールアドレスが確認されていない可能性があります。' 
      }
    }

    // 認証成功時はサーバーサイドでリダイレクト
    redirect('/')
  } catch (error) {
    // redirectはthrowするので、それ以外のエラーをキャッチ
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error // redirectを再スロー
    }
    return { error: 'ログイン中にエラーが発生しました' }
  }
}
