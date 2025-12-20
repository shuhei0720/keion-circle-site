'use client'

import { useState, useEffect, useRef } from 'react'
import YouTube from 'react-youtube'
import { useSession } from 'next-auth/react'
import { Edit, Trash2, Home, LogIn, User, UserPlus, ChevronLeft, ChevronRight, Image, Heart } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

interface PostParticipant {
  id: string
  status: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
}

interface Post {
  id: string
  title: string
  content: string
  youtubeUrl: string | null
  createdAt: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
  participants: PostParticipant[]
  likes: {
    userId: string
    createdAt: string
  }[]
}

const POSTS_PER_PAGE = 5

export default function PostsPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const isAdmin = session?.user?.role === 'admin'

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const res = await fetch('/api/posts')
    const data = await res.json()
    setPosts(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingId ? `/api/posts/${editingId}` : '/api/posts'
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, youtubeUrl })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || '操作に失敗しました')
        return
      }

      setTitle('')
      setContent('')
      setYoutubeUrl('')
      setEditingId(null)
      fetchPosts()
    } catch (error) {
      console.error('Failed to save post:', error)
      alert('操作に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (post: Post) => {
    setEditingId(post.id)
    setTitle(post.title)
    setContent(post.content || '')
    setYoutubeUrl(post.youtubeUrl || '')
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この投稿を削除しますか?')) return

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || '削除に失敗しました')
        return
      }

      fetchPosts()
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('削除に失敗しました')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setYoutubeUrl('')
  }
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください')
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/posts/image', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        // カーソル位置に画像マークダウンを挿入
        const imageMarkdown = `\n![](${data.imageUrl})\n`
        const textarea = contentTextareaRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newContent = content.substring(0, start) + imageMarkdown + content.substring(end)
          setContent(newContent)
          // カーソル位置を画像マークダウンの後に移動
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length
            textarea.focus()
          }, 0)
        } else {
          setContent(content + imageMarkdown)
        }
      } else {
        alert('画像のアップロードに失敗しました')
      }
    } catch (error) {
      console.error('画像アップロードエラー:', error)
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploadingImage(false)
      // ファイル入力をリセット
      e.target.value = ''
    }
  }
  const handleParticipate = async (postId: string, status: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!res.ok) {
        alert('参加登録に失敗しました')
        return
      }

      fetchPosts()
    } catch (error) {
      console.error('Failed to participate:', error)
      alert('参加登録に失敗しました')
    }
  }

  const getUserParticipation = (post: Post) => {
    if (!session?.user?.id) return null
    return post.participants.find(p => p.user.id === session.user.id)
  }

  const getParticipatingUsers = (post: Post) => {
    return post.participants.filter(p => p.status === 'participating')
  }

  const handleLike = async (postId: string) => {
    if (!session?.user?.id) return
    
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })
      
      if (res.ok) {
        fetchPosts()
      } else {
        const error = await res.json()
        alert(error.error || 'いいねに失敗しました')
      }
    } catch (error) {
      console.error('いいねエラー:', error)
      alert('いいねに失敗しました')
    }
  }

  const handleUnlike = async (postId: string) => {
    if (!session?.user?.id) return
    
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        fetchPosts()
      } else {
        const error = await res.json()
        alert(error.error || 'いいね解除に失敗しました')
      }
    } catch (error) {
      console.error('いいね解除エラー:', error)
      alert('いいね解除に失敗しました')
    }
  }

  const isLikedByUser = (post: Post) => {
    if (!session?.user?.id) return false
    return post.likes.some(like => like.userId === session.user.id)
  }

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  // ページネーション計算
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = posts.slice(startIndex, endIndex)

  // 本文を画像込みでレンダリング
  const renderContent = (content: string) => {
    const parts = content.split(/(!\\[\\]\\([^)]+\\))/)
    return parts.map((part, index) => {
      const imageMatch = part.match(/!\\[\\]\\(([^)]+)\\)/)
      if (imageMatch) {
        return (
          <img
            key={index}
            src={imageMatch[1]}
            alt="投稿画像"
            className="max-w-full h-auto rounded-lg my-2"
            style={{ maxHeight: '500px', objectFit: 'contain' }}
          />
        )
      }
      return part ? <span key={index}>{part}</span> : null
    })
  }

  // ログインしているユーザーにはDashboardLayoutを表示
  if (session) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">投稿一覧</h1>

        {/* 投稿一覧 */}
        <div className="space-y-6 mb-8">
          {currentPosts.map((post) => {
            const youtubeId = post.youtubeUrl ? extractYouTubeId(post.youtubeUrl) : null
            const userParticipation = getUserParticipation(post)
            const participatingUsers = getParticipatingUsers(post)

            return (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Link href={`/users/${post.userId}`} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 hover:opacity-80 transition">
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
                      <h2 className="text-2xl font-bold">{post.title}</h2>
                      <p className="text-sm text-gray-500">
                        投稿者: {post.user.name} / {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {post.content && (
                  <div className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {post.content.split('\n').map((line, index) => {
                      // 画像マークダウン ![](url) を検出
                      const imageMatch = line.match(/!\[\]\((.+?)\)/)
                      if (imageMatch) {
                        return (
                          <div key={index} className="my-4">
                            <img
                              src={imageMatch[1]}
                              alt="投稿画像"
                              className="max-w-full h-auto rounded-lg"
                              style={{ maxHeight: '500px', objectFit: 'contain' }}
                            />
                          </div>
                        )
                      }
                      return line ? <div key={index}>{line}</div> : <br key={index} />
                    })}
                  </div>
                )}

                {youtubeId && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <YouTube
                      videoId={youtubeId}
                      opts={{
                        width: '100%',
                        playerVars: {
                          autoplay: 0,
                        },
                      }}
                    />
                  </div>
                )}

                {/* 参加ボタンとリスト */}
                {session && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">参加状況</span>
                        <span className="text-sm text-gray-500">
                          ({participatingUsers.length}名参加)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleParticipate(post.id, 'participating')}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            userParticipation?.status === 'participating'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          参加する
                        </button>
                        <button
                          onClick={() => handleParticipate(post.id, 'not_participating')}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            userParticipation?.status === 'not_participating'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          不参加
                        </button>
                      </div>
                    </div>

                    {/* いいねボタン */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                      <button
                        onClick={() => isLikedByUser(post) ? handleUnlike(post.id) : handleLike(post.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isLikedByUser(post)
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Heart 
                          className={`w-5 h-5 ${isLikedByUser(post) ? 'fill-current' : ''}`}
                        />
                        <span>{post.likes.length}</span>
                      </button>
                    </div>

                    {/* 参加者リスト */}
                    {participatingUsers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {participatingUsers.map((participant) => (
                          <Link
                            key={participant.id}
                            href={`/users/${participant.userId}`}
                            className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full hover:bg-green-100 transition"
                          >
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {participant.user.avatarUrl ? (
                                <img
                                  src={participant.user.avatarUrl}
                                  alt={participant.user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                            <span className="text-sm text-green-700">
                              {participant.user.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 投稿フォーム（管理者のみ・画面下部） */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? '投稿を編集' : '新規投稿'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">タイトル</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">本文</label>
                <textarea
                  ref={contentTextareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={6}
                />
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Image className="w-4 h-4" />
                    {uploadingImage ? '画像アップロード中...' : '画像を挿入'}
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    画像をアップロードすると本文に挿入されます（最大10MB）
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">YouTube URL</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? '処理中...' : editingId ? '更新' : '投稿'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        </div>
      </DashboardLayout>
    )
  }

  // ログインしていないユーザー向けの表示
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
              <Home className="w-6 h-6" />
              軽音サークル
            </Link>
            <Link
              href="/auth/signin"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <LogIn className="w-4 h-4" />
              ログイン
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">投稿一覧</h1>

        {/* 投稿一覧（読み取り専用） */}
        <div className="space-y-6 mb-8">
          {currentPosts.map((post) => {
            const youtubeId = post.youtubeUrl ? extractYouTubeId(post.youtubeUrl) : null

            return (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {post.user.avatarUrl ? (
                        <img
                          src={post.user.avatarUrl}
                          alt={post.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{post.title}</h2>
                      <p className="text-sm text-gray-500">
                        投稿者: {post.user.name} / {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>

                {post.content && (
                  <div className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {renderContent(post.content)}
                  </div>
                )}

                {youtubeId && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <YouTube
                      videoId={youtubeId}
                      opts={{
                        width: '100%',
                        playerVars: {
                          autoplay: 0,
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
