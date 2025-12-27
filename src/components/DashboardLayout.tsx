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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">ログインが必要です</h2>
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all shadow-lg inline-block"
          >
            ログイン画面へ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ナビゲーションバー */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ */}
            <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white">
              <Home className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>BOLD軽音</span>
            </Link>

            {/* デスクトップメニュー */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/posts"
                prefetch={true}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${
                  isActive('/posts') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105' 
                    : 'text-white/80 hover:bg-white/10 hover:scale-105'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>活動一覧</span>
                {isActive('/posts') && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
                )}
              </Link>
              <Link
                href="/activity-schedules"
                prefetch={true}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${
                  isActive('/activity-schedules') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105' 
                    : 'text-white/80 hover:bg-white/10 hover:scale-105'
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span>活動スケジュール</span>
                {isActive('/activity-schedules') && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
                )}
              </Link>
              <Link
                href="/events"
                prefetch={true}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${
                  isActive('/events') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105' 
                    : 'text-white/80 hover:bg-white/10 hover:scale-105'
                }`}
              >
                <PartyPopper className="w-5 h-5" />
                <span>イベント</span>
                {isActive('/events') && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
                )}
              </Link>

              {/* 管理者のみ表示 */}
              {session.user.role === 'admin' && (
                <>
                  <Link
                    href="/users"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${
                      isActive('/users') 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105' 
                        : 'text-white/80 hover:bg-white/10 hover:scale-105'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>管理</span>
                    {isActive('/users') && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
                    )}
                  </Link>
                </>
              )}

              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
                <Link
                  href="/profile"
                  scroll={false}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all relative ${
                    isActive('/profile') 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105' 
                      : 'text-white/80 hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">プロフィール</span>
                  <span className="text-sm max-w-[100px] truncate text-white/60">
                    ({session.user.name || session.user.email})
                  </span>
                  {isActive('/profile') && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
                  )}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:scale-105 transition-all shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ログアウト</span>
                </button>
              </div>
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
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
            <div className="md:hidden border-t border-white/10 py-4 space-y-2">
              <Link
                href="/posts"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive('/posts') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">活動一覧</span>
              </Link>
              <Link
                href="/activity-schedules"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive('/activity-schedules') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span className="font-medium">活動スケジュール</span>
              </Link>
              <Link
                href="/events"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive('/events') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <PartyPopper className="w-5 h-5" />
                <span className="font-medium">イベント</span>
              </Link>

              {session.user.role === 'admin' && (
                <Link
                  href="/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive('/users') 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">ユーザー管理</span>
                </Link>
              )}

              <div className="border-t border-white/10 my-2 pt-2">
                <Link
                  href="/profile"
                  scroll={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive('/profile') 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="font-medium">プロフィール</span>
                    <span className="text-xs text-white/60 truncate">
                      {session.user.name || session.user.email}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:scale-105 transition-all shadow-lg mt-2"
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
      <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <p className="text-center sm:text-left">
              © 2025 BOLD 軽音. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6">
              <Link href="/privacy" className="hover:text-white/80 transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/terms" className="hover:text-white/80 transition-colors">
                利用規約
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
