'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Calendar, Users, MessageCircle, Plus, Edit2, FileText, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface User {
  id: string
  name: string | null
  email: string | null
  avatarUrl: string | null
}

interface Participant {
  id: string
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
  user: User
  participants: Participant[]
  comments: Comment[]
  reportCreated: boolean
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

  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchSchedules()
    }
  }, [status, router])

  const fetchSchedules = async () => {
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
        setFormData({ title: '', content: '', date: '' })
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
    try {
      const res = await fetch(`/api/activity-schedules/${scheduleId}/participate`, {
        method: 'POST'
      })

      if (res.ok) {
        fetchSchedules()
      }
    } catch (error) {
      console.error('参加登録エラー:', error)
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
        fetchSchedules()
      }
    } catch (error) {
      console.error('コメント投稿エラー:', error)
    }
  }

  const handleEdit = (schedule: ActivitySchedule) => {
    setFormData({
      title: schedule.title,
      content: schedule.content,
      date: new Date(schedule.date).toISOString().split('T')[0]
    })
    setEditingId(schedule.id)
    setShowCreateForm(true)
  }

  const handleCreateReport = (schedule: ActivitySchedule) => {
    // テンプレート作成
    const template = `# ${schedule.title}

**日時**: ${new Date(schedule.date).toLocaleDateString('ja-JP')}

**参加者**: ${schedule.participants.map(p => p.user.name || p.user.email).join('、')}

## 活動内容

${schedule.content}

## 成果・気づき

（ここに活動の成果や気づきを記入してください）

## 次回に向けて

（次回に向けての課題や目標を記入してください）
`

    router.push(`/activity-schedules/${schedule.id}/report?template=${encodeURIComponent(template)}`)
  }

  const isParticipating = (schedule: ActivitySchedule) => {
    return schedule.participants.some(p => p.user.email === session?.user?.email)
  }

  const canCreateReport = (schedule: ActivitySchedule) => {
    const scheduleDate = new Date(schedule.date)
    const now = new Date()
    return session?.user?.role === 'admin' && scheduleDate <= now && !schedule.reportCreated
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">活動スケジュール</h1>
          {session?.user?.role === 'admin' && !showCreateForm && (
            <button
              onClick={() => {
                setShowCreateForm(true)
                setEditingId(null)
                setFormData({ title: '', content: '', date: '' })
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
              {editingId ? 'スケジュール編集' : '新規スケジュール'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">タイトル</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 定期練習"
                />
              </div>
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
                <label className="block text-sm font-medium mb-2">内容（マークダウン形式）</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[200px] font-mono text-sm"
                  placeholder="## 今日の練習内容&#10;&#10;- 課題曲の練習&#10;- パート別練習&#10;- 通し練習"
                />
              </div>
              <div className="flex gap-2">
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
                    setFormData({ title: '', content: '', date: '' })
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
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
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              活動スケジュールがありません
            </div>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{schedule.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(schedule.date).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                  {session?.user?.role === 'admin' && !schedule.reportCreated && (
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                </div>

                {/* 内容 */}
                <div className="prose prose-sm max-w-none mb-4">
                  <ReactMarkdown>{schedule.content}</ReactMarkdown>
                </div>

                {/* 参加者 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">参加予定者 ({schedule.participants.length}名)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {schedule.participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full"
                      >
                        {p.user.avatarUrl && (
                          <img
                            src={p.user.avatarUrl}
                            alt={p.user.name || ''}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-sm">{p.user.name || p.user.email}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 参加ボタン */}
                <button
                  onClick={() => handleParticipate(schedule.id)}
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg mb-4 ${
                    isParticipating(schedule)
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isParticipating(schedule) ? '参加取り消し' : '参加する'}
                </button>

                {/* 活動報告作成ボタン */}
                {canCreateReport(schedule) && (
                  <button
                    onClick={() => handleCreateReport(schedule)}
                    className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4 ml-0 sm:ml-2"
                  >
                    <FileText className="w-5 h-5 inline mr-2" />
                    活動報告を作成
                  </button>
                )}

                {/* コメント */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">コメント ({schedule.comments.length})</span>
                  </div>
                  
                  <div className="space-y-3 mb-3">
                    {schedule.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                        {comment.user.avatarUrl && (
                          <img
                            src={comment.user.avatarUrl}
                            alt={comment.user.name || ''}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.user.name || comment.user.email}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString('ja-JP')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
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
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleCommentSubmit(schedule.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      送信
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
