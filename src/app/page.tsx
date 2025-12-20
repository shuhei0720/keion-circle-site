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
  createdAt: string
  user: {
    name: string
    email: string
    avatarUrl: string | null
  }
}

export default function Home() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      const data = await res.json()
      setPosts(data.slice(0, 3)) // 最新3件のみ表示
    } catch (error) {
      console.error('Failed to fetch posts:', error)
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
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Music className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="font-extrabold">BOLD</span> 軽音サークル メンバーサイト
          </h1>
          <p className="text-xl text-white/80">
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

        {/* 最新の投稿 */}
        {posts.length > 0 && (
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">最新の活動</h2>
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
          </div>
        )}

        {/* 機能カード */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link href="/posts">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow cursor-pointer transform hover:-translate-y-1 duration-200">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">投稿</h2>
              <p className="text-gray-600">
                練習動画や演奏動画をYouTubeと連携して共有
              </p>
            </div>
          </Link>

          <Link href={session ? "/schedules" : "/auth/signin"}>
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow cursor-pointer transform hover:-translate-y-1 duration-200">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">スケジュール</h2>
              <p className="text-gray-600">
                練習日程の調整と出欠確認
              </p>
              {!session && <p className="text-sm text-gray-500 mt-2">※要ログイン</p>}
            </div>
          </Link>

          <Link href={session ? "/chat" : "/auth/signin"}>
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow cursor-pointer transform hover:-translate-y-1 duration-200">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">チャット</h2>
              <p className="text-gray-600">
                メンバー同士でリアルタイムコミュニケーション
              </p>
              {!session && <p className="text-sm text-gray-500 mt-2">※要ログイン</p>}
            </div>
          </Link>
        </div>

        {/* フッター */}
        <div className="text-center mt-16 text-white/60">
          <p>&copy; 2025 軽音サークル. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
