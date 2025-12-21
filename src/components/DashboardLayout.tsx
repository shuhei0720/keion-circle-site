'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Home, FileText, Calendar, MessageCircle, LogOut, User, Users, Menu, X, CalendarDays, PartyPopper } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname.startsWith(path)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ログインが必要です</h2>
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ログイン画面へ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ */}
            <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-blue-600">
              <Home className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden xs:inline">BOLD 軽音</span>
              <span className="xs:hidden">BOLD</span>
            </Link>

            {/* デスクトップメニュー */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/posts"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/posts') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>活動一覧</span>
              </Link>
              <Link
                href="/activity-schedules"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/activity-schedules') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span>活動スケジュール</span>
              </Link>
              <Link
                href="/events"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/events') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <PartyPopper className="w-5 h-5" />
                <span>イベント</span>
              </Link>
              <Link
                href="/chat"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/chat') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>チャット</span>
              </Link>

              {/* 管理者のみ表示 */}
              {session.user.role === 'admin' && (
                <Link
                  href="/users"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/users') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>管理</span>
                </Link>
              )}

              <div className="flex items-center gap-2 ml-4 pl-4 border-l">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/profile') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm max-w-[120px] truncate">
                    {session.user.name || session.user.email}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ログアウト</span>
                </button>
              </div>
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="メニュー"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* モバイルメニュー */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t py-4 space-y-2">
              <Link
                href="/posts"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/posts') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">活動一覧</span>
              </Link>
              <Link
                href="/activity-schedules"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/activity-schedules') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span className="font-medium">活動スケジュール</span>
              </Link>
              <Link
                href="/events"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/events') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <PartyPopper className="w-5 h-5" />
                <span className="font-medium">イベント</span>
              </Link>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/chat') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">チャット</span>
              </Link>

              {session.user.role === 'admin' && (
                <Link
                  href="/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/users') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">ユーザー管理</span>
                </Link>
              )}

              <div className="border-t my-2 pt-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/profile') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium truncate">
                    {session.user.name || session.user.email}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">ログアウト</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="pb-8">{children}</main>
      
      {/* フッター */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p className="text-center sm:text-left">
              © 2025 BOLD 軽音. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                利用規約
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
