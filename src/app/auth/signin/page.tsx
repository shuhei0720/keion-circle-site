'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // URL パラメータからメッセージを取得
    const verified = searchParams.get('verified')
    const errorParam = searchParams.get('error')
    const reset = searchParams.get('reset')

    if (verified === 'true') {
      setMessage('メールアドレスが確認されました。ログインしてください。')
    } else if (reset === 'success') {
      setMessage('パスワードがリセットされました。ログインしてください。')
    } else if (errorParam === 'invalid_token') {
      setError('無効な検証トークンです')
    } else if (errorParam === 'expired_token') {
      setError('検証トークンの有効期限が切れています')
    } else if (errorParam === 'verification_failed') {
      setError('メールアドレスの確認に失敗しました')
    }
  }, [searchParams])

  const handleResendVerification = async () => {
    if (!email) {
      setError('メールアドレスを入力してください')
      return
    }

    setError('')
    setMessage('')
    setResendLoading(true)

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message)
      } else {
        setError(data.error || '検証メールの再送信に失敗しました')
      }
    } catch (err) {
      setError('エラーが発生しました')
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      })
      
      if (result?.error) {
        setError('メールアドレスまたはパスワードが正しくありません。メールアドレスが確認されていない可能性があります。')
        return
      }
      
      if (result?.ok) {
        // 成功時：router.pushを使用してナビゲーション
        router.refresh() // セッション状態を更新
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('ログイン中にエラーが発生しました。')
    }
  }

  const handleGoogleSignIn = async () => {
    console.log('[Client SignIn] Attempting Google login...')
    try {
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: true
      })
      console.log('[Client SignIn] Google result:', result)
    } catch (error) {
      console.error('[Client SignIn] Google error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          BOLD 軽音
        </h1>
        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base touch-manipulation"
          >
            ログイン
          </button>
        </form>

        {error && error.includes('確認されていない') && (
          <button
            onClick={handleResendVerification}
            disabled={resendLoading}
            className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? '送信中...' : '確認メールを再送信'}
          </button>
        )}

        <div className="mt-4 text-center">
          <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
            パスワードをお忘れですか？
          </Link>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full mt-4 bg-white text-gray-700 py-2.5 sm:py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-semibold text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleでログイン
        </button>
        
        <div className="mt-4 text-center">
          <Link href="/auth/signup" className="text-sm text-blue-600 hover:text-blue-700">
            アカウントをお持ちでない方はこちら
          </Link>
        </div>
      </div>
    </div>
  )
}
