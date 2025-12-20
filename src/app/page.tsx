'use client'

import Link from 'next/link'
import { Music, Calendar, MessageCircle, FileText, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import YouTube from 'react-youtube'
import { useSession } from 'next-auth/react'

interface Post {
  id: string
  title: string
  content: string
  youtubeUrl: string | null
  userId: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
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
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      const data = await res.json()
      setPosts(data.slice(0, 3)) // 最新3件のみ表示
      
      // いいね数でソートして人気の投稿を取得（最大3件）
      const sorted = [...data].sort((a, b) => b.likes.length - a.likes.length)
      setPopularPosts(sorted.slice(0, 3).filter(p => p.likes.length > 0))
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダー */}
        <div className="text-center mb-16 animate-slide-down">
          <div className="flex items-center justify-center mb-4 animate-bounce-slow">
            <Music className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
            <span className="font-extrabold">BOLD</span> 軽音サークル メンバーサイト
          </h1>
          <p className="text-xl text-white/80 animate-fade-in-delay">
            音楽を楽しむ仲間たちのコミュニティ
          </p>
          {!session && (
            <div className="mt-6">
              <Link 
                href="/auth/signin"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                ログイン
              </Link>
              <Link 
                href="/auth/signup"
                className="inline-block ml-4 bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                新規登録
              </Link>
            </div>
          )}
        </div>

        {/* 機能カード（投稿、スケジュール、チャット） */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">サービス</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/posts" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">投稿</h3>
                <p className="text-gray-600">活動報告やYouTube動画を共有</p>
              </div>
            </Link>
            <Link href="/schedules" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">スケジュール</h3>
                <p className="text-gray-600">練習や演奏会の日程調整</p>
              </div>
            </Link>
            <Link href="/chat" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">チャット</h3>
                <p className="text-gray-600">メンバー同士でリアルタイム会話</p>
              </div>
            </Link>
          </div>
        </div>

        {/* 最新の投稿 */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">最新の活動</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="space-y-6">
                {posts.map((post) => {
                  const videoId = post.youtubeUrl ? extractYouTubeId(post.youtubeUrl) : null
                  return (
                    <div key={post.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Link href={`/users/${post.userId}`} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden hover:opacity-80 transition">
                          {post.user.avatarUrl ? (
                            <img
                              src={post.user.avatarUrl}
                              alt={post.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </Link>
                        <div>
                          <h3 className="text-xl font-semibold">{post.title}</h3>
                          <p className="text-sm text-gray-500">
                            {post.user.name || post.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-600 mb-4 whitespace-pre-wrap">
                        {renderContent(post.content)}
                      </div>
                      {videoId && (
                        <div className="mb-4">
                          <YouTube
                            videoId={videoId}
                            opts={{
                              width: '100%',
                              height: '390',
                              playerVars: {
                                autoplay: 0,
                              },
                            }}
                          />
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="text-center mt-6">
                <Link 
                  href="/posts"
                  className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  すべての投稿を見る
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-white">
              <p>まだ投稿がありません</p>
            </div>
          )}
        </div>

        {/* 人気の投稿 */}
        {!isLoading && popularPosts.length > 0 && (
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">人気の投稿</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {popularPosts.map((post) => (
                <Link
                  key={post.id}
                  href="/posts"
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {post.user.avatarUrl ? (
                        <img
                          src={post.user.avatarUrl}
                          alt={post.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{post.user.name}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-2 text-red-600">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="font-semibold">{post.likes.length}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="text-center mt-16 text-white/60">
          <p>&copy; 2025 軽音サークル. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
