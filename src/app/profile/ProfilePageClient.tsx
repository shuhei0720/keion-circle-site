'use client'

import { useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import ProfileEditClient from './ProfileEditClient'
import { User, Mail, Calendar, FileText, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface ProfilePageClientProps {
  user: {
    id: string
    name: string | null
    email: string | null
    avatarUrl: string | null
    bio: string | null
    instruments: string | null
    role: string
    createdAt: Date
    postParticipants: {
      id: string
      createdAt: Date
      post: {
        id: string
        title: string
        createdAt: Date
      }
    }[]
    _count: {
      posts: number
      postParticipants: number
    }
  }
}

export default function ProfilePageClient({ user }: ProfilePageClientProps) {
  // ページ表示時にスクロールをトップに戻す
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">マイプロフィール</h1>

        {/* プロフィール編集 */}
        <ProfileEditClient user={user} />

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">投稿数</h3>
            </div>
            <p className="text-3xl font-bold text-white">{user._count.posts}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">参加数</h3>
            </div>
            <p className="text-3xl font-bold text-white">{user._count.postParticipants}</p>
          </div>
        </div>

        {/* 最近の参加履歴 */}
        {user.postParticipants.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">最近の参加履歴</h2>
            <div className="space-y-3">
              {user.postParticipants.map((participant) => (
                <Link
                  key={participant.id}
                  href={`/posts/${participant.post.id}`}
                  className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  <h3 className="font-semibold text-white mb-1">{participant.post.title}</h3>
                  <p className="text-sm text-white/60">
                    参加日時: {new Date(participant.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
