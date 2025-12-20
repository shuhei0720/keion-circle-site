import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mb-8">利用規約</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3">第1条（適用）</h2>
              <p className="leading-relaxed">
                本利用規約（以下「本規約」）は、軽音サークルメンバーサイト（以下「本サービス」）の利用条件を定めるものです。
                本サービスを利用するすべてのユーザーは、本規約に同意したものとみなされます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第2条（利用登録）</h2>
              <p className="leading-relaxed mb-2">
                本サービスの利用を希望する者は、本規約に同意の上、所定の方法によって利用登録を行うものとします。
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>登録情報は正確かつ最新の情報を提供すること</li>
                <li>1人につき1つのアカウントのみ作成できること</li>
                <li>他人のアカウントを利用してはならないこと</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第3条（禁止事項）</h2>
              <p className="leading-relaxed mb-2">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>他のユーザーまたは第三者の権利を侵害する行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>不正アクセスまたはこれを試みる行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>他のユーザーに成りすます行為</li>
                <li>本サービスのネットワークまたはシステムに過度な負荷をかける行為</li>
                <li>本サービスの提供を妨害する行為</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第4条（投稿コンテンツ）</h2>
              <p className="leading-relaxed">
                ユーザーが本サービスに投稿したコンテンツ（文章、画像、動画リンクなど）の著作権は、
                投稿者に帰属します。ただし、運営者は、本サービスの運営、改善、プロモーション等の目的で、
                投稿コンテンツを無償で利用できるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第5条（アカウントの管理）</h2>
              <p className="leading-relaxed">
                ユーザーは、自己の責任において、本サービスのアカウント情報を適切に管理するものとします。
                アカウント情報の管理不十分により生じた損害について、運営者は一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第6条（サービスの変更・停止）</h2>
              <p className="leading-relaxed">
                運営者は、ユーザーへの事前通知なく、本サービスの内容を変更し、
                または本サービスの提供を中止することができるものとします。
                これによってユーザーに生じた損害について、運営者は一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第7条（利用制限および登録抹消）</h2>
              <p className="leading-relaxed mb-2">
                運営者は、ユーザーが以下のいずれかに該当する場合、
                事前の通知なく、ユーザーに対して本サービスの全部もしくは一部の利用を制限し、
                またはユーザーとしての登録を抹消することができるものとします：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録情報に虚偽の事実があることが判明した場合</li>
                <li>その他、運営者が本サービスの利用を適当でないと判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第8条（免責事項）</h2>
              <p className="leading-relaxed">
                運営者は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、
                連絡または紛争等について一切責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第9条（サービス内容の変更等）</h2>
              <p className="leading-relaxed">
                運営者は、ユーザーに通知することなく、本サービスの内容を変更し、
                または本サービスの提供を中止することができるものとし、
                これによってユーザーに生じた損害について一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第10条（利用規約の変更）</h2>
              <p className="leading-relaxed">
                運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
                変更後の本規約は、本サイトに掲載した時点で効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第11条（準拠法・裁判管轄）</h2>
              <p className="leading-relaxed">
                本規約の解釈にあたっては、日本法を準拠法とします。
                本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
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
