'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [envDebug, setEnvDebug] = useState<any>(null)

  useEffect(() => {
    // 環境変数のデバッグ情報を取得
    fetch('/api/debug/env')
      .then(res => res.json())
      .then(data => setEnvDebug(data))
      .catch(err => console.error('Failed to fetch env debug:', err))
  }, [])

  const errorMessages: Record<string, string> = {
    Configuration: '認証設定エラーです。NEXTAUTH_URLが正しく設定されていない可能性があります。',
    AccessDenied: 'アクセスが拒否されました。',
    Verification: '認証トークンが期限切れまたは既に使用されています。',
    OAuthSignin: 'OAuthプロバイダーとの接続開始に失敗しました。',
    OAuthCallback: 'OAuthプロバイダーからのコールバック処理に失敗しました。',
    OAuthCreateAccount: 'アカウントの作成に失敗しました。',
    EmailCreateAccount: 'メールアカウントの作成に失敗しました。',
    Callback: 'コールバック処理に失敗しました。',
    OAuthAccountNotLinked: 'このメールアドレスは既に別のアカウントで使用されています。',
    EmailSignin: 'メール送信に失敗しました。',
    CredentialsSignin: 'ログイン情報が正しくありません。',
    SessionRequired: 'このページにアクセスするにはログインが必要です。',
    Default: '認証エラーが発生しました。',
  }

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          認証エラー
        </h1>
        <p className="text-gray-600">
          {message}
        </p>
        {error && (
          <p className="text-sm text-gray-500 mt-2">
            エラーコード: {error}
          </p>
        )}
      </div>

      {envDebug && (
        <div className="mb-6 p-4 bg-gray-100 rounded text-left text-xs">
          <h3 className="font-bold mb-2">デバッグ情報:</h3>
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(envDebug, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="space-y-3">
        <Link
          href="/auth/signin"
          className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
        >
          ログインページに戻る
        </Link>
        <Link
          href="/"
          className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center font-semibold"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <Suspense fallback={
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
          <div className="text-center">読み込み中...</div>
        </div>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  )
}
