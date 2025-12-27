import Link from 'next/link'

interface FooterProps {
  isSiteAdmin?: boolean
  isLoggedIn?: boolean
}

export default function Footer({ isSiteAdmin = false, isLoggedIn = false }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-white/5 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* メニュー */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">メニュー</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/posts" className="text-white/60 hover:text-white transition-colors text-sm">
                  活動報告
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white/60 hover:text-white transition-colors text-sm">
                  イベント
                </Link>
              </li>
              <li>
                <Link href="/activity-schedules" className="text-white/60 hover:text-white transition-colors text-sm">
                  活動スケジュール
                </Link>
              </li>
              {isSiteAdmin && (
                <li>
                  <Link href="/users" className="text-white/60 hover:text-white transition-colors text-sm">
                    ユーザー管理
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* アカウント */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">アカウント</h4>
            <ul className="space-y-2">
              {isLoggedIn ? (
                <li>
                  <Link href="/profile" className="text-white/60 hover:text-white transition-colors text-sm">
                    マイページ
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/auth/signin" className="text-white/60 hover:text-white transition-colors text-sm">
                      ログイン
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/signup" className="text-white/60 hover:text-white transition-colors text-sm">
                      新規登録
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-sm text-white/40">&copy; 2025 BOLD 軽音. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
