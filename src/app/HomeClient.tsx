'use client'

import Link from 'next/link'
import { User, MessageCircle, FileText } from 'lucide-react'
import YouTube from 'react-youtube'
import ScrollAnimation from '@/components/ScrollAnimation'

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
    name: string | null
    email: string | null
  }
  likes: {
    userId: string
    createdAt: string
  }[]
}

interface HomeClientProps {
  posts: Post[]
  popularPosts: Post[]
}

export default function HomeClient({ posts, popularPosts }: HomeClientProps) {
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
    <>
      {/* 最新の投稿 */}
      <div className="container mx-auto px-4 py-16">
        <ScrollAnimation animation="fade-up" delay={0}>
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
              最新の活動
            </span>
          </h2>
        </ScrollAnimation>
        {posts.length === 0 ? (
          <p className="text-center text-white/60">まだ投稿がありません</p>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {posts.map((post, index) => (
              <ScrollAnimation animation="fade-up" delay={index * 100} key={post.id}>
                <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 border border-white/10 hover:border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Link href={`/users/${post.userId}`} className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
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
                                height: '400',
                                playerVars: {
                                  autoplay: 0,
                                },
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {post.images.map((image, index) => (
                        <div key={index} className="rounded-xl overflow-hidden shadow-lg">
                          <img src={image} alt={`画像${index + 1}`} className="w-full h-auto" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.likes.length} いいね</span>
                    </div>
                    <Link href={`/posts/${post.id}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                      詳細を見る →
                    </Link>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        )}
      </div>

      {/* 人気の投稿 */}
      {popularPosts.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <ScrollAnimation animation="fade-up" delay={0}>
            <h2 className="text-4xl font-bold text-white mb-12 text-center">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-yellow-400">
                人気の投稿
              </span>
            </h2>
          </ScrollAnimation>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {popularPosts.map((post, index) => (
              <ScrollAnimation animation="scale" delay={index * 100} key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20"
                >
                  <div className="absolute top-4 right-4 bg-linear-to-r from-pink-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {post.likes.length} いいね
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 pr-20 group-hover:text-pink-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <User className="w-4 h-4" />
                    <span>{post.user.name}</span>
                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
