'use client'

import Link from 'next/link'
import { Music, Calendar, MessageCircle, FileText, User, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import YouTube from 'react-youtube'
import { useSession } from 'next-auth/react'
import LoadingSpinner from '@/components/LoadingSpinner'

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

export default function Home() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [popularPosts, setPopularPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts')
        const data = await res.json()
        
        // コンポーネントがアンマウントされていない場合のみstateを更新
        if (isMounted) {
          setPosts(data.slice(0, 3)) // 最新3件のみ表示
          
          // いいね数でソートして人気の投稿を取得（最大3件）
          const sorted = [...data].sort((a, b) => b.likes.length - a.likes.length)
          setPopularPosts(sorted.slice(0, 3).filter(p => p.likes.length > 0))
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchPosts()

    // クリーンアップ関数
    return () => {
      isMounted = false
    }
  }, [])

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      const imgMatch = line.match(/!\[.*?\]\((.*?)\)/)
      if (imgMatch) {
        return (
          <div key={index} className="my-2">
            <img
              src={imgMatch[1]}
              alt="投稿画像"
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
          </div>
        )
      }
      return line ? <div key={index}>{line}</div> : <br key={index} />
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 relative">
          <div className="text-center mb-12 space-y-6">
            <div className="inline-flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-50 animate-pulse"></div>
              <Music className="w-20 h-20 text-white relative z-10" />
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
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
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
                >
                  <span className="relative z-10">ログイン</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            機能
          </span>
        </h2>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto ${session?.user?.role === 'admin' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          <Link href="/posts" className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/50">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">活動報告</h3>
              <p className="text-white/70">練習の成果や演奏動画を共有</p>
            </div>
          </Link>
          
          <Link href="/events" className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/50">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">イベント</h3>
              <p className="text-white/70">ライブや発表会の準備と管理</p>
            </div>
          </Link>

          <Link href="/activity-schedules" className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/50">
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
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/50">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">ユーザー管理</h3>
                <p className="text-white/70">メンバー情報を管理</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* 最新の投稿 */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            最新の活動
          </span>
        </h2>
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : posts.length > 0 ? (
          <>
            <div className="space-y-6 max-w-4xl mx-auto">
              {posts.map((post) => {
                return (
                  <div key={post.id} className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 border border-white/10 hover:border-white/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Link href={`/users/${post.userId}`} className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </Link>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">{post.title}</h3>
                        <p className="text-sm text-white/60">
                          {post.user.name || post.user.email} • {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    <div className="text-white/80 mb-4 whitespace-pre-wrap">
                      {renderContent(post.content)}
                    </div>
                    {post.youtubeUrls && post.youtubeUrls.length > 0 && (
                      <div className="space-y-4 mb-4">
                        {post.youtubeUrls.map((url, index) => {
                          const videoId = extractYouTubeId(url)
                          if (!videoId) return null
                          return (
                            <div key={index} className="rounded-xl overflow-hidden shadow-2xl">
                              <YouTube
                                videoId={videoId}
                                opts={{
                                  width: '100%',
                                  height: '390',
                                  playerVars: {
                                    autoplay: 0,
                                  },
                                }}
                                className="w-full"
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {post.likes.length > 0 && (
                      <div className="flex items-center gap-2 text-pink-400">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span className="font-semibold">{post.likes.length}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Link 
                href="/posts"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50"
              >
                すべての活動を見る
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center text-white/70 py-12">
            <p className="text-xl">まだ投稿がありません</p>
          </div>
        )}
      </div>

      {/* 人気の投稿 */}
      {!isLoading && popularPosts.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              人気の投稿
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {popularPosts.map((post) => (
              <Link
                key={post.id}
                href="/posts"
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-white/80 font-medium">{post.user.name}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-pink-300 transition-colors">{post.title}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-pink-400">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="font-bold text-lg">{post.likes.length}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* フッター */}
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
                {session?.user?.role === 'admin' && (
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
                {session ? (
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
    </div>
  )
}
