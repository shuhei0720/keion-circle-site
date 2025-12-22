'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import MarkdownToolbar from '@/components/MarkdownToolbar'
import { Calendar, Users, MessageCircle, Plus, Edit2, FileText, Loader2, MapPin, Music, FileSpreadsheet, Youtube } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import YouTube from 'react-youtube'

interface User {
  id: string
  name: string | null
  email: string | null
}

interface Participant {
  id: string
  userId: string
  user: User
  createdAt: string
}

interface Comment {
  id: string
  content: string
  user: User
  createdAt: string
}

interface Event {
  id: string
  title: string
  content: string
  date: string
  location: string | null
  songTitle: string | null
  songSheetUrl: string | null
  songYoutubeUrl: string | null
  parts: string | null
  user: User
  participants: Participant[]
  comments?: Comment[]
  _count?: {
    comments: number
  }
  createdAt: string
  updatedAt: string
}

export default function EventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({})
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({})
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false)

  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: '',
    location: '',
    songTitle: '',
    songSheetUrl: '',
    songYoutubeUrl: '',
    parts: [] as { instrument: string; player: string }[]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchEvents()
    }
  }, [status, router])

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('イベント取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchComments = async (eventId: string) => {
    if (loadingComments[eventId]) return
    
    setLoadingComments({ ...loadingComments, [eventId]: true })
    try {
      const res = await fetch(`/api/events/${eventId}/details`)
      if (res.ok) {
        const data = await res.json()
        setEvents(events.map(e => 
          e.id === eventId ? { ...e, comments: data.comments } : e
        ))
      }
    } catch (error) {
      console.error('コメント取得エラー:', error)
    } finally {
      setLoadingComments({ ...loadingComments, [eventId]: false })
    }
  }

  const toggleComments = (eventId: string) => {
    const isExpanded = expandedComments[eventId]
    setExpandedComments({ ...expandedComments, [eventId]: !isExpanded })
    
    const event = events.find(e => e.id === eventId)
    if (!isExpanded && (!event?.comments || event.comments.length === 0)) {
      fetchComments(eventId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content || !formData.date) {
      alert('タイトル、内容、日付は必須です')
      return
    }

    try {
      const url = editingId ? `/api/events/${editingId}` : '/api/events'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({
          title: '',
          content: '',
          date: '',
          location: '',
          songTitle: '',
          songSheetUrl: '',
          songYoutubeUrl: '',
          parts: []
        })
        setShowCreateForm(false)
        setEditingId(null)
        setShowMarkdownEditor(false)
        fetchEvents()
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    }
  }

  const handleParticipate = async (eventId: string) => {
    if (!session?.user?.id) return

    const userId = session.user.id
    const isCurrentlyParticipating = events.find(e => e.id === eventId)?.participants.some(p => p.userId === userId)

    // 楽観的UI更新
    setEvents(prevEvents => prevEvents.map(e => {
      if (e.id === eventId) {
        if (isCurrentlyParticipating) {
          return {
            ...e,
            participants: e.participants.filter(p => p.userId !== userId)
          }
        } else {
          return {
            ...e,
            participants: [...e.participants, {
              id: 'temp-' + Date.now(),
              userId,
              user: {
                id: userId,
                name: session.user.name || null,
                email: session.user.email || null
              },
              createdAt: new Date().toISOString()
            }]
          }
        }
      }
      return e
    }))

    try {
      const res = await fetch(`/api/events/${eventId}/participate`, {
        method: 'POST'
      })

      if (!res.ok) {
        // エラー時は元に戻す
        fetchEvents()
      }
    } catch (error) {
      console.error('参加登録エラー:', error)
      // エラー時は元に戻す
      fetchEvents()
    }
  }

  const handleCommentSubmit = async (eventId: string) => {
    const content = newComment[eventId]
    if (!content || content.trim() === '') return

    try {
      const res = await fetch(`/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (res.ok) {
        setNewComment({ ...newComment, [eventId]: '' })
        // コメントが展開されている場合のみ再取得
        if (expandedComments[eventId]) {
          fetchComments(eventId)
        } else {
          // コメント数を更新
          setEvents(events.map(e => 
            e.id === eventId && e._count
              ? { ...e, _count: { comments: e._count.comments + 1 } }
              : e
          ))
        }
      }
    } catch (error) {
      console.error('コメント投稿エラー:', error)
    }
  }

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      content: event.content,
      date: new Date(event.date).toISOString().split('T')[0],
      location: event.location || '',
      songTitle: event.songTitle || '',
      songSheetUrl: event.songSheetUrl || '',
      songYoutubeUrl: event.songYoutubeUrl || '',
      parts: event.parts ? JSON.parse(event.parts) : []
    })
    setEditingId(event.id)
    setShowCreateForm(true)
  }

  const handleMarkdownInsert = (before: string, after?: string) => {
    const textarea = contentTextareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const beforeText = formData.content.substring(0, start)
    const afterText = formData.content.substring(end)

    let newText: string
    let newCursorPos: number

    if (after) {
      // 前後に挿入（太字、斜体など）
      newText = beforeText + before + selectedText + after + afterText
      newCursorPos = start + before.length + selectedText.length
    } else {
      // 行頭に挿入（見出し、リストなど）
      const lines = formData.content.split('\n')
      const currentLineStart = formData.content.lastIndexOf('\n', start - 1) + 1
      const currentLineEnd = formData.content.indexOf('\n', start)
      const lineEnd = currentLineEnd === -1 ? formData.content.length : currentLineEnd
      
      newText = beforeText + before + formData.content.substring(currentLineStart, lineEnd) + afterText.substring(lineEnd - end)
      newCursorPos = start + before.length
    }

    setFormData({ ...formData, content: newText })
    
    // カーソル位置を復元
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleCreateReport = (event: Event) => {
    const partsText = event.parts
      ? JSON.parse(event.parts)
          .map((p: any) => `- ${p.instrument}: ${p.player}`)
          .join('\n')
      : ''

    const template = `# ${event.title}

**日時**: ${new Date(event.date).toLocaleDateString('ja-JP')}
${event.location ? `**場所**: ${event.location}` : ''}
${event.songTitle ? `**課題曲**: ${event.songTitle}` : ''}

**参加者**: ${event.participants.map(p => p.user.name || p.user.email).join('、')}

${partsText ? `## パート担当\n\n${partsText}` : ''}

## イベント内容

${event.content}

## 成果・ハイライト

（ここにイベントの成果やハイライトを記入してください）

## 写真・動画

（写真や動画のURLを追加してください）

## 次回に向けて

（次回に向けての課題や改善点を記入してください）
`

    router.push(`/events/${event.id}/report?template=${encodeURIComponent(template)}`)
  }

  const addPart = () => {
    setFormData({
      ...formData,
      parts: [...formData.parts, { instrument: '', player: '' }]
    })
  }

  const updatePart = (index: number, field: 'instrument' | 'player', value: string) => {
    const newParts = [...formData.parts]
    newParts[index][field] = value
    setFormData({ ...formData, parts: newParts })
  }

  const removePart = (index: number) => {
    setFormData({
      ...formData,
      parts: formData.parts.filter((_, i) => i !== index)
    })
  }

  const isParticipating = (event: Event) => {
    return event.participants.some(p => p.user.id === session?.user?.id)
  }

  const canCreateReport = (event: Event) => {
    const eventDate = new Date(event.date)
    const now = new Date()
    return session?.user?.role === 'admin' && eventDate <= now
  }

  const getYoutubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    return match ? match[1] : null
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">イベント</h1>
          {session?.user?.role === 'admin' && !showCreateForm && (
            <button
              onClick={() => {
                setShowCreateForm(true)
                setEditingId(null)
                setFormData({
                  title: '',
                  content: '',
                  date: '',
                  location: '',
                  songTitle: '',
                  songSheetUrl: '',
                  songYoutubeUrl: '',
                  parts: []
                })
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">新規作成</span>
            </button>
          )}
        </div>

        {/* 作成・編集フォーム */}
        {showCreateForm && session?.user?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'イベント編集' : '新規イベント'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">タイトル</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 学園祭ライブ"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">日時</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">開催場所（任意）</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 体育館"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">内容</label>
                  <button
                    type="button"
                    onClick={() => setShowMarkdownEditor(!showMarkdownEditor)}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {showMarkdownEditor ? 'プレビュー表示' : 'マークダウンで編集'}
                  </button>
                </div>
                
                {showMarkdownEditor ? (
                  <>
                    <MarkdownToolbar onInsert={handleMarkdownInsert} />
                    <textarea
                      ref={contentTextareaRef}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-2 border border-t-0 rounded-b-lg focus:ring-2 focus:ring-blue-500 min-h-[150px] font-mono text-sm"
                      placeholder="## イベント詳細&#10;&#10;- セットリスト&#10;- 準備物"
                    />
                  </>
                ) : (
                  <div 
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 min-h-[150px] prose prose-sm max-w-none cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setShowMarkdownEditor(true)}
                  >
                    {formData.content ? (
                      <ReactMarkdown>{formData.content}</ReactMarkdown>
                    ) : (
                      <p className="text-gray-400">クリックして内容を入力...</p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">課題曲情報（任意）</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">課題曲タイトル</label>
                    <input
                      type="text"
                      value={formData.songTitle}
                      onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 青と夏"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">楽譜URL</label>
                    <input
                      type="url"
                      value={formData.songSheetUrl}
                      onChange={(e) => setFormData({ ...formData, songSheetUrl: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">YouTube URL</label>
                    <input
                      type="url"
                      value={formData.songYoutubeUrl}
                      onChange={(e) => setFormData({ ...formData, songYoutubeUrl: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">パート担当（任意）</h3>
                  <button
                    type="button"
                    onClick={addPart}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + パート追加
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.parts.map((part, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={part.instrument}
                        onChange={(e) => updatePart(index, 'instrument', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        placeholder="楽器名（例: ボーカル）"
                      />
                      <input
                        type="text"
                        value={part.player}
                        onChange={(e) => updatePart(index, 'player', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        placeholder="担当者名"
                      />
                      <button
                        type="button"
                        onClick={() => removePart(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingId ? '更新' : '作成'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingId(null)
                    setFormData({
                      title: '',
                      content: '',
                      date: '',
                      location: '',
                      songTitle: '',
                      songSheetUrl: '',
                      songYoutubeUrl: '',
                      parts: []
                    })
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* イベント一覧 */}
        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              イベントがありません
            </div>
          ) : (
            events.map((event) => {
              const parts = event.parts ? JSON.parse(event.parts) : []
              const videoId = event.songYoutubeUrl ? getYoutubeVideoId(event.songYoutubeUrl) : null

              return (
                <div key={event.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h2>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString('ja-JP')}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.songTitle && (
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            <span>課題曲: {event.songTitle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {session?.user?.role === 'admin' && (
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="prose prose-sm max-w-none mb-4">
                    <ReactMarkdown>{event.content}</ReactMarkdown>
                  </div>

                  {/* 楽譜リンク */}
                  {event.songSheetUrl && (
                    <a
                      href={event.songSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="text-sm">楽譜を見る</span>
                    </a>
                  )}

                  {/* YouTube動画 */}
                  {videoId && (
                    <div className="mb-4">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <YouTube
                          videoId={videoId}
                          opts={{
                            width: '100%',
                            height: '100%',
                            playerVars: { autoplay: 0 }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* パート担当 */}
                  {parts.length > 0 && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-medium mb-2 text-sm">パート担当</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {parts.map((part: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-gray-600">{part.instrument}:</span>
                            <span className="font-medium">{part.player}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 参加者 */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">参加予定者 ({event.participants.length}名)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.participants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm">{p.user.name || p.user.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 参加ボタン */}
                  <button
                    onClick={() => handleParticipate(event.id)}
                    className={`w-full sm:w-auto px-6 py-2 rounded-lg mb-4 ${
                      isParticipating(event)
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isParticipating(event) ? '参加取り消し' : '参加する'}
                  </button>

                  {/* イベント報告作成ボタン */}
                  {canCreateReport(event) && (
                    <button
                      onClick={() => handleCreateReport(event)}
                      className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4 ml-0 sm:ml-2"
                    >
                      <FileText className="w-5 h-5 inline mr-2" />
                      イベント報告を作成
                    </button>
                  )}

                  {/* コメント */}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => toggleComments(event.id)}
                      className="flex items-center gap-2 mb-3 hover:text-blue-600 transition-colors w-full text-left"
                    >
                      <MessageCircle className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">
                        コメント ({event._count?.comments ?? event.comments?.length ?? 0})
                      </span>
                      {loadingComments[event.id] && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                    </button>

                    {expandedComments[event.id] && (
                      <>
                        <div className="space-y-3 mb-3">
                          {event.comments && event.comments.length > 0 ? (
                            event.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                      {comment.user.name || comment.user.email}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(comment.createdAt).toLocaleString('ja-JP')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">コメントはまだありません</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComment[event.id] || ''}
                            onChange={(e) =>
                              setNewComment({ ...newComment, [event.id]: e.target.value })
                            }
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCommentSubmit(event.id)
                              }
                            }}
                            placeholder="コメントを入力..."
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleCommentSubmit(event.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            送信
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
