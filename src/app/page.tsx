import Link from 'next/link'
import { Music, Calendar, FileText, Users } from 'lucide-react'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import ScrollAnimation from '@/components/ScrollAnimation'
import HomeClient from './HomeClient'

const prisma = new PrismaClient()

interface Post {
  id: string
  title: string
  content: string
  youtubeUrls: string[]
  images?: string[]
  userId: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  likes: {
    userId: string
    createdAt: string
  }[]
}

export default async function Home() {
  const session = await auth()
  
  // サーバーサイドでデータ取得
  const allPosts = await prisma.post.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      likes: {
        select: {
          userId: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // JSON化
  const posts = allPosts.slice(0, 3).map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    likes: post.likes.map((like) => ({
      userId: like.userId,
      createdAt: like.createdAt.toISOString(),
    })),
  }))

  // いいね数でソート
  const sorted = [...allPosts].sort((a, b) => b.likes.length - a.likes.length)
  const popularPosts = sorted.slice(0, 3).filter(p => p.likes.length > 0).map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    likes: post.likes.map((like) => ({
      userId: like.userId,
      createdAt: like.createdAt.toISOString(),
    })),
  }))

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden min-h-[60vh] flex items-center">
        {/* 背景画像 (ぼかしとモバイル対応) */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center blur-sm opacity-30 scale-110"></div>
          <div className="absolute inset-0 bg-linear-to-b from-slate-900/80 via-purple-900/70 to-slate-900/90"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 relative">
          <ScrollAnimation animation="fade-up" delay={0}>
            <div className="text-center mb-12 space-y-6">
              <div className="inline-flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 blur-2xl opacity-50 animate-pulse"></div>
                <Music className="w-20 h-20 text-white relative z-10" />
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                BOLD 軽音
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 font-light">
                メンバーサイト
              </p>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                音楽を愛する仲間たちが集う、創造と交流の場
              </p>
              {!session && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link 
                  href="/auth/signin"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
                >
                  <span className="relative z-10">ログイン</span>
                  <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link 
                  href="/auth/signup"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 backdrop-blur-sm rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:border-white/60"
                >
                  <span className="relative z-10">新規登録</span>
                </Link>
              </div>
            )}
          </div>
        </ScrollAnimation>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <ScrollAnimation animation="fade-up" delay={100}>
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
              機能
            </span>
          </h2>
        </ScrollAnimation>
        <ScrollAnimation animation="fade-up" delay={200}>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto ${session?.user?.role === 'admin' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          <Link href="/posts" className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/50">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">活動報告</h3>
              <p className="text-white/70">練習の成果や演奏動画を共有</p>
            </div>
          </Link>
          
          <Link href="/events" className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/50">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">イベント</h3>
              <p className="text-white/70">ライブや発表会の準備と管理</p>
              <h3 className="text-2xl font-bold text-white mb-3">イベント</h3>
              <p className="text-white/70">ライブや発表会の準備と管理</p>
            </div>
          </Link>

          <Link href="/activity-schedules" className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20">
            <div className="absolute inset-0 bg-linear-to-br from-green-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/50">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">活動スケジュール</h3>
              <p className="text-white/70">練習日程を簡単に調整</p>
            </div>
          </Link>

          {session?.user?.role === 'admin' && (
            <Link
              href="/users"
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-br from-orange-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/50">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">ユーザー管理</h3>
                  <p className="text-white/70">メンバー情報を管理</p>
                </div>
              </Link>
          )}
        </div>
        </ScrollAnimation>
      </div>

      <HomeClient posts={posts} popularPosts={popularPosts} />
    </div>
  )
}
