'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import YouTube from 'react-youtube'
import { useSession } from 'next-auth/react'
import { Edit, Home, LogIn, User, UserPlus, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Trash2 } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import RichTextEditor from '@/components/RichTextEditor'

interface User {
  id: string
  name: string
  email: string
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: User
}

interface PostParticipant {
  id: string
  status: string
  user: User
}

interface Post {
  id: string
  title: string
  content: string
  youtubeUrl: string | null
  createdAt: string
  userId: string
  user: User
  participants: PostParticipant[]
  likes: {
    userId: string
    createdAt: string
  }[]
  comments?: Comment[]
  _count?: {
    comments: number
  }
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
  const [fetchingPosts, setFetchingPosts] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({})
  const [loadingComments, setLoadingComments] = useState<{ [postId: string]: boolean }>({})
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const isAdmin = session?.user?.role === 'admin'

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = useCallback(async () => {
    setFetchingPosts(true)
    try {
      const res = await fetch('/api/posts')
      const data = await res.json()
      setPosts(data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setFetchingPosts(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return // 編集の場合のみ送信可能

    setLoading(true)

    try {
      const res = await fetch(`/api/posts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, youtubeUrl })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || '更新に失敗しました')
        return
      }

      setTitle('')
      setContent('')
      setYoutubeUrl('')
      setEditingId(null)
      fetchPosts()
    } catch (error) {
      console.error('Failed to save post:', error)
      alert('更新に失敗しました')
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

  const handleCancel = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setYoutubeUrl('')
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchPosts()
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  const handleMarkdownInsert = (before: string, after?: string) => {
    const textarea = contentTextareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const beforeText = content.substring(0, start)
    const afterText = content.substring(end)

    let newText: string
    let newCursorPos: number

    if (after) {
      // 前後に挿入（太字、斜体など）
      newText = beforeText + before + selectedText + after + afterText
      newCursorPos = start + before.length + selectedText.length
    } else {
      // 行頭に挿入（見出し、リストなど）
      const lines = content.split('\n')
      const currentLineStart = content.lastIndexOf('\n', start - 1) + 1
      const currentLineEnd = content.indexOf('\n', start)
      const lineEnd = currentLineEnd === -1 ? content.length : currentLineEnd
      
      newText = beforeText + before + content.substring(currentLineStart, lineEnd) + afterText.substring(lineEnd - end)
      newCursorPos = start + before.length
    }

    setContent(newText)
    
    // カーソル位置を復元
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }
  const handleCommentSubmit = async (postId: string) => {
    const commentContent = newComment[postId]?.trim()
    if (!commentContent || submittingComment) return

    setSubmittingComment(postId)

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'コメントの投稿に失敗しました')
        return
      }

      const newCommentData = await res.json()
      
      // コメントをローカルステートに追加
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), newCommentData]
          }
        }
        return post
      }))

      // 入力をクリア
      setNewComment(prev => ({ ...prev, [postId]: '' }))
    } catch (error) {
      console.error('Failed to post comment:', error)
      alert('コメントの投稿に失敗しました')
    } finally {
      setSubmittingComment(null)
    }
  }

  const getParticipatingUsers = (post: Post) => {
    return post.participants.filter(p => p.status === 'participating')
  }

  const handleLike = async (postId: string) => {
    if (!session?.user?.id) return
    
    // 楽観的UI更新
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: [...post.likes, { userId: session.user.id, createdAt: new Date().toISOString() }]
        }
      }
      return post
    }))

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })
      
      if (!res.ok) {
        fetchPosts()
        const error = await res.json()
        alert(error.error || 'いいねに失敗しました')
      }
    } catch (error) {
      fetchPosts()
      console.error('いいねエラー:', error)
      alert('いいねに失敗しました')
    }
  }

  const handleUnlike = async (postId: string) => {
    if (!session?.user?.id) return
    
    // 楽観的UI更新
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likes.filter(like => like.userId !== session.user.id)
        }
      }
      return post
    }))

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        fetchPosts()
        const error = await res.json()
        alert(error.error || 'いいね解除に失敗しました')
      }
    } catch (error) {
      fetchPosts()
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

  // ログインしているユーザーにはDashboardLayoutを表示
  if (session) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">活動一覧</h1>

          {fetchingPosts ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* 投稿一覧 */}
              <div className="space-y-4 sm:space-y-6 mb-8">
                {currentPosts.map((post) => {
                  const youtubeId = post.youtubeUrl ? extractYouTubeId(post.youtubeUrl) : null
                  const participatingUsers = getParticipatingUsers(post)

                  return (
                    <div key={post.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-4 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <Link href={`/users/${post.userId}`} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 hover:opacity-80 transition">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-2xl font-bold truncate">{post.title}</h2>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {post.user.name} / {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(post)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                              aria-label="編集"
                            >
                              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              aria-label="削除"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {post.content && (
                        <div className="text-sm sm:text-base text-gray-700 mb-4 prose prose-sm max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: post.content }} />
                      )}

                      {youtubeId && (
                        <div className="mb-4 rounded-lg overflow-hidden aspect-video">
                          <YouTube
                            videoId={youtubeId}
                            opts={{
                              width: '100%',
                              height: '100%',
                              playerVars: {
                                autoplay: 0,
                              },
                            }}
                            className="w-full h-full"
                          />
                        </div>
                      )}

                      {/* 参加者表示（読み取り専用） */}
                      {participatingUsers.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 mb-3">
                            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                            <span className="text-sm sm:text-base font-medium">参加者</span>
                            <span className="text-xs sm:text-sm text-gray-500">
                              ({participatingUsers.length}名)
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {participatingUsers.map((participant) => (
                              <Link
                                key={participant.id}
                                href={`/users/${participant.user.id}`}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                              >
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{participant.user.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* いいねボタン */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                        <button
                          onClick={() => isLikedByUser(post) ? handleUnlike(post.id) : handleLike(post.id)}
                          className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-colors ${
                            isLikedByUser(post)
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLikedByUser(post) ? 'fill-current' : ''}`} />
                          <span>{post.likes.length}</span>
                        </button>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">{(post.comments || []).length}</span>
                        </div>
                      </div>

                      {/* コメントセクション */}
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="text-sm sm:text-base font-semibold mb-3">コメント</h3>
                        
                        {/* コメント一覧 */}
                        {(post.comments || []).length > 0 ? (
                          <div className="space-y-3 mb-4">
                            {(post.comments || []).map((comment) => (
                              <div key={comment.id} className="flex gap-2 sm:gap-3">
                                <Link href={`/users/${comment.user.id}`} className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-400" />
                                  </div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-semibold">{comment.user.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleString('ja-JP', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mb-4">まだコメントがありません</p>
                        )}

                        {/* コメント入力フォーム */}
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleCommentSubmit(post.id)
                                }
                              }}
                              placeholder="コメントを入力..."
                              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                              disabled={submittingComment === post.id}
                            />
                            <button
                              onClick={() => handleCommentSubmit(post.id)}
                              disabled={!newComment[post.id]?.trim() || submittingComment === post.id}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm sm:text-base px-3 sm:px-4">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* 編集フォーム（管理者のみ） */}
          {isAdmin && editingId && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">投稿を編集</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">タイトル</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">内容</label>
                  <RichTextEditor 
                    value={content}
                    onChange={setContent}
                    placeholder="ツールバーでフォーマットを適用するか、直接入力してください..."
                    minHeight="240px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">YouTube URL</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '更新中...' : '更新'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DashboardLayout>
    )
  }

  // 未ログインユーザーには公開ビューを表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
            <Home className="w-5 h-5" />
            <span className="font-semibold hidden sm:inline">ホーム</span>
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-white">活動一覧</h1>
          <Link
            href="/auth/signin"
            className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:scale-105 transition-all shadow-lg text-sm sm:text-base"
          >
            <LogIn className="w-4 h-4" />
            <span>ログイン</span>
          </Link>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {fetchingPosts ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4 sm:space-y-6 mb-8">
              {currentPosts.map((post) => {
                const youtubeId = post.youtubeUrl ? extractYouTubeId(post.youtubeUrl) : null
                const participatingUsers = getParticipatingUsers(post)

                return (
                  <div key={post.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 border border-white/10 hover:bg-white/15 transition-all">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-white">{post.title}</h2>
                        <p className="text-xs sm:text-sm text-white/60">
                          {post.user.name} / {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>

                    {post.content && (
                      <div className="text-sm sm:text-base text-white/80 mb-4 prose prose-sm max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: post.content }} />
                    )}

                    {youtubeId && (
                      <div className="mb-4 rounded-lg overflow-hidden aspect-video">
                        <YouTube
                          videoId={youtubeId}
                          opts={{
                            width: '100%',
                            height: '100%',
                            playerVars: {
                              autoplay: 0,
                            },
                          }}
                          className="w-full h-full"
                        />
                      </div>
                    )}

                    {/* 参加者表示 */}
                    {participatingUsers.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-3">
                          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          <span className="text-sm sm:text-base font-medium">参加者</span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            ({participatingUsers.length}名)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {participatingUsers.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                            >
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{participant.user.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* いいね数とコメント数の表示 */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-gray-600">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">{post.likes.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">{(post.comments || []).length}</span>
                      </div>
                    </div>

                    {/* コメント表示（未ログインでも閲覧可能） */}
                    {(post.comments || []).length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="text-sm sm:text-base font-semibold mb-3">コメント</h3>
                        <div className="space-y-3">
                          {(post.comments || []).map((comment) => (
                            <div key={comment.id} className="flex gap-2 sm:gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold">{comment.user.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(comment.createdAt).toLocaleString('ja-JP', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm sm:text-base px-3 sm:px-4">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
