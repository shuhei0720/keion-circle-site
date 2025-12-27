import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          トップページに戻る
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. 個人情報の取得について</h2>
              <p className="leading-relaxed">
                当サークルサイト（以下「本サイト」）では、ユーザー登録時にメールアドレス、氏名などの個人情報を取得します。
                Google OAuth を利用した場合は、Google アカウントから取得した情報（メールアドレス、氏名、プロフィール画像）を利用します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. 個人情報の利用目的</h2>
              <p className="leading-relaxed mb-2">取得した個人情報は以下の目的で利用します：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>本サイトのサービス提供のため</li>
                <li>ユーザー認証のため</li>
                <li>サークル活動の連絡・調整のため</li>
                <li>投稿、イベント、活動スケジュール、チャット機能の提供のため</li>
                <li>サービスの改善・向上のため</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. 個人情報の第三者提供</h2>
              <p className="leading-relaxed">
                本サイトは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. 個人情報の管理</h2>
              <p className="leading-relaxed">
                本サイトは、個人情報の紛失、破壊、改ざん、漏洩などを防止するため、適切なセキュリティ対策を実施します。
                個人情報は、データベースにて厳重に管理されます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Cookie（クッキー）について</h2>
              <p className="leading-relaxed">
                本サイトでは、ユーザーの利便性向上のため Cookie を使用しています。
                Cookie は、ユーザーのログイン状態の維持などに利用されます。
                ブラウザの設定で Cookie を無効にすることも可能ですが、一部のサービスが利用できなくなる場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. アクセス解析ツールについて</h2>
              <p className="leading-relaxed">
                本サイトでは、サービス向上のため、アクセス解析ツールを使用する場合があります。
                これらのツールは Cookie を使用してユーザーの行動を分析しますが、個人を特定する情報は含まれません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. プライバシーポリシーの変更</h2>
              <p className="leading-relaxed">
                本プライバシーポリシーは、必要に応じて変更されることがあります。
                変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. お問い合わせ</h2>
              <p className="leading-relaxed">
                本プライバシーポリシーに関するお問い合わせは、サークル管理者までご連絡ください。
              </p>
            </section>

            <div className="mt-8 pt-6 border-t text-sm text-gray-500">
              <p>制定日: 2025年12月21日</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
