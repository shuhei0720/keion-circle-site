'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import RichTextEditor from '@/components/RichTextEditor'
import TemplateEditor from '@/components/TemplateEditor'
import { Calendar, Users, MessageCircle, Plus, Edit2, FileText, Loader2, FilePenLine, Trash2 } from 'lucide-react'

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

interface ActivitySchedule {
  id: string
  title: string
  content: string
  date: string
  location: string | null
  locationUrl: string | null
  user: User
  participants: Participant[]
  comments?: Comment[]
  _count?: {
    comments: number
  }
  createdAt: string
  updatedAt: string
}

export default function ActivitySchedulesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({})
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({})
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: '',
    location: '',
    locationUrl: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchSchedules()
    }
  }, [status, router])

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/activity-schedules')
      if (res.ok) {
        const data = await res.json()
        setSchedules(data)
      }
    } catch (error) {
      console.error('スケジュール取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchComments = useCallback(async (scheduleId: string) => {
    if (loadingComments[scheduleId]) return
    
    setLoadingComments(prev => ({ ...prev, [scheduleId]: true }))
    try {
      const res = await fetch(`/api/activity-schedules/${scheduleId}/details`)
      if (res.ok) {
        const data = await res.json()
        setSchedules(prev => prev.map(s => 
          s.id === scheduleId ? { ...s, comments: data.comments } : s
        ))
      }
    } catch (error) {
      console.error('コメント取得エラー:', error)
    } finally {
      setLoadingComments(prev => ({ ...prev, [scheduleId]: false }))
    }
  }, [loadingComments])

  const toggleComments = (scheduleId: string) => {
    const isExpanded = expandedComments[scheduleId]
    setExpandedComments({ ...expandedComments, [scheduleId]: !isExpanded })
    
    // コメントがまだ読み込まれていない場合のみ取得
    const schedule = schedules.find(s => s.id === scheduleId)
    if (!isExpanded && (!schedule?.comments || schedule.comments.length === 0)) {
      fetchComments(scheduleId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content || !formData.date) {
      alert('すべての項目を入力してください')
      return
    }

    try {
      const url = editingId 
        ? `/api/activity-schedules/${editingId}`
        : '/api/activity-schedules'
      
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({ title: '', content: '', date: '', location: '', locationUrl: '' })
        setShowCreateForm(false)
        setEditingId(null)
        fetchSchedules()
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    }
  }

  const handleParticipate = async (scheduleId: string) => {
    if (!session?.user?.id) return

    const userId = session.user.id
    const isCurrentlyParticipating = schedules.find(s => s.id === scheduleId)?.participants.some(p => p.userId === userId)

    // 楽観的UI更新（即座に反映）
    setSchedules(prevSchedules => prevSchedules.map(s => {
      if (s.id === scheduleId) {
        if (isCurrentlyParticipating) {
          return {
            ...s,
            participants: s.participants.filter(p => p.userId !== userId)
          }
        } else {
          return {
            ...s,
            participants: [...s.participants, {
              id: 'temp-' + Date.now(),
              userId,
              user: {
                id: userId,
                name: session.user.name || session.user.email || 'ユーザー',
                email: session.user.email || null
              },
              createdAt: new Date().toISOString()
            }]
          }
        }
      }
      return s
    }))

    try {
      const res = await fetch(`/api/activity-schedules/${scheduleId}/participate`, {
        method: 'POST'
      })

      if (!res.ok) {
        // エラー時は元に戻す
        fetchSchedules()
      }
    } catch (error) {
      console.error('参加登録エラー:', error)
      // エラー時は元に戻す
      fetchSchedules()
    }
  }

  const handleCommentSubmit = async (scheduleId: string) => {
    const content = newComment[scheduleId]
    if (!content || content.trim() === '') return

    try {
      const res = await fetch(`/api/activity-schedules/${scheduleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (res.ok) {
        setNewComment({ ...newComment, [scheduleId]: '' })
        // コメントが展開されている場合のみ再取得
        if (expandedComments[scheduleId]) {
          fetchComments(scheduleId)
        } else {
          // コメント数を更新
          setSchedules(schedules.map(s => 
            s.id === scheduleId && s._count
              ? { ...s, _count: { comments: s._count.comments + 1 } }
              : s
          ))
        }
      }
    } catch (error) {
      console.error('コメント投稿エラー:', error)
    }
  }

  const handleEdit = (schedule: ActivitySchedule) => {
    setFormData({
      title: schedule.title,
      content: schedule.content,
      date: new Date(schedule.date).toISOString().split('T')[0],
      location: schedule.location || '',
      locationUrl: schedule.locationUrl || ''
    })
    setEditingId(schedule.id)
    setShowCreateForm(true)
  }

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('この活動スケジュールを削除しますか？')) return
    try {
      const res = await fetch(`/api/activity-schedules/${scheduleId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchSchedules()
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

  const handleCreateReport = (schedule: ActivitySchedule) => {
    // テンプレート作成
    const template = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${schedule.title} - 活動報告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 日時
  ${new Date(schedule.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}

👥 参加メンバー
  ${schedule.participants.map(p => p.user.name || p.user.email).join(' / ')}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 活動内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${schedule.content}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ 成果・気づき
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

（ここに活動の成果や気づきを記入してください）


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💭 次回に向けて
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

（次回に向けての課題や目標を記入してください）


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    router.push(`/activity-schedules/${schedule.id}/report?template=${encodeURIComponent(template)}`)
  }

  const isParticipating = (schedule: ActivitySchedule) => {
    return schedule.participants.some(p => p.user.id === session?.user?.id)
  }

  const canCreateReport = (schedule: ActivitySchedule) => {
    const scheduleDate = new Date(schedule.date)
    const now = new Date()
    return session?.user?.role === 'admin' && scheduleDate <= now
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">活動スケジュール</h1>
          <div className="flex gap-2">
            {session?.user?.role === 'admin' && !showCreateForm && (
              <button
                onClick={() => {
                  setShowCreateForm(true)
                  setEditingId(null)
                  setFormData({ title: '', content: '', date: '', location: '', locationUrl: '' })
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">新規作成</span>
              </button>
            )}
            {session?.user?.role === 'admin' && (
              <button
                onClick={() => setShowTemplateEditor(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <FilePenLine className="w-5 h-5" />
                <span className="hidden sm:inline">テンプレート編集</span>
              </button>
            )}
          </div>
        </div>

        {/* 作成・編集フォーム */}
        {showCreateForm && session?.user?.role === 'admin' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingId ? 'スケジュール編集' : '新規スケジュール'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">タイトル</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 定期練習"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">日時</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/5 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">場所</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500"
                  placeholder="例: スタジオ A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">場所URL（Google Mapsなど）</label>
                <input
                  type="url"
                  value={formData.locationUrl}
                  onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">内容</label>
                <RichTextEditor 
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="活動の詳細を入力してください..."
                  minHeight="200px"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:scale-105 transition-all shadow-lg"
                >
                  {editingId ? '更新' : '作成'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingId(null)
                    setFormData({ title: '', content: '', date: '', location: '', locationUrl: '' })
                  }}
                  className="px-6 py-2 border border-white/20 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* スケジュール一覧 */}
        <div className="space-y-6">
          {schedules.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center text-white/50 border border-white/10">
              活動スケジュールがありません
            </div>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-2">{schedule.title}</h2>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(schedule.date).toLocaleDateString('ja-JP')}</span>
                      </div>
                      {schedule.location && (
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {schedule.locationUrl ? (
                            <a href={schedule.locationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                              {schedule.location}
                            </a>
                          ) : (
                            <span>{schedule.location}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {session?.user?.role === 'admin' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg border border-blue-400/30 transition"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-400/30 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 内容 */}
                <div className="prose prose-sm prose-invert max-w-none mb-4 whitespace-pre-wrap text-white/80" dangerouslySetInnerHTML={{ __html: schedule.content }} />

                {/* 参加者 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-white/60" />
                    <span className="font-medium text-white">参加予定者 ({schedule.participants.length}名)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {schedule.participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30"
                      >
                        <span className="text-sm text-blue-300">{p.user.name || p.user.email}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 参加ボタン */}
                <button
                  onClick={() => handleParticipate(schedule.id)}
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg mb-4 transition ${
                    isParticipating(schedule)
                      ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 shadow-lg'
                  }`}
                >
                  {isParticipating(schedule) ? '参加取り消し' : '参加する'}
                </button>

                {/* 活動報告作成ボタン */}
                {canCreateReport(schedule) && (
                  <button
                    onClick={() => handleCreateReport(schedule)}
                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:scale-105 mb-4 ml-0 sm:ml-2 transition-all shadow-lg">
                    <FileText className="w-5 h-5 inline mr-2" />
                    活動報告を作成
                  </button>
                )}

                {/* コメント */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => toggleComments(schedule.id)}
                    className="flex items-center gap-2 mb-3 text-white hover:text-blue-300 transition-colors w-full text-left"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">
                      コメント ({schedule._count?.comments ?? schedule.comments?.length ?? 0})
                    </span>
                    {loadingComments[schedule.id] && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                  </button>
                  
                  {expandedComments[schedule.id] && (
                    <>
                      <div className="space-y-3 mb-3">
                        {schedule.comments && schedule.comments.length > 0 ? (
                          schedule.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 bg-white/5 border border-white/10 p-3 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm text-white">{comment.user.name || comment.user.email}</span>
                                  <span className="text-xs text-white/50">
                                    {new Date(comment.createdAt).toLocaleString('ja-JP')}
                                  </span>
                                </div>
                                <p className="text-sm text-white/80">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-white/50">コメントはまだありません</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment[schedule.id] || ''}
                          onChange={(e) => setNewComment({ ...newComment, [schedule.id]: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCommentSubmit(schedule.id)
                            }
                          }}
                          placeholder="コメントを入力..."
                          className="flex-1 px-4 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleCommentSubmit(schedule.id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all shadow-lg"
                        >
                          送信
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* テンプレート編集モーダル */}
      <TemplateEditor
        isOpen={showTemplateEditor}
        onClose={() => setShowTemplateEditor(false)}
        onSave={() => {}}
      />
    </DashboardLayout>
  )
}
