import Link from 'next/link'
import { Github, Twitter, Mail } from 'lucide-react'

interface FooterProps {
  isSiteAdmin?: boolean
  isLoggedIn?: boolean
}

export default function Footer({ isSiteAdmin = false, isLoggedIn = false }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-black/40 to-black/60 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* ブランド */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🎸</div>
              <span className="text-xl font-bold text-white">BOLD軽音</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              BOLD 大阪軽音部のメンバーサイトです。活動報告や活動スケジュール、イベント管理を行っています。
            </p>
            {/* ソーシャルアイコン */}
            <div className="flex gap-4">
              <a 
                href="https://github.com/shuhei0720/keion-circle-site" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="mailto:contact@bold-keion.example.com"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* メニュー */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">メニュー</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/posts" className="text-sm text-white/60 hover:text-white transition-colors">
                  活動報告
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-white/60 hover:text-white transition-colors">
                  イベント
                </Link>
              </li>
              <li>
                <Link href="/activity-schedules" className="text-sm text-white/60 hover:text-white transition-colors">
                  スケジュール
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">サポート</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
            </ul>
          </div>

          {/* アカウント */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">アカウント</h4>
            <ul className="space-y-3">
              {isLoggedIn ? (
                <>
                  <li>
                    <Link href="/profile" className="text-sm text-white/60 hover:text-white transition-colors">
                      マイページ
                    </Link>
                  </li>
                  {isSiteAdmin && (
                    <li>
                      <Link href="/users" className="text-sm text-white/60 hover:text-white transition-colors">
                        ユーザー管理
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link href="/auth/signin" className="text-sm text-white/60 hover:text-white transition-colors">
                      ログイン
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/signup" className="text-sm text-white/60 hover:text-white transition-colors">
                      新規登録
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-white/40">
            &copy; 2025 BOLD軽音. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
