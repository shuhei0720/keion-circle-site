'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import RichTextEditor from '@/components/RichTextEditor'
import { ArrowLeft, Loader2, X } from 'lucide-react'

export default function CreateReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [scheduleId, setScheduleId] = useState<string>('')
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    youtubeUrls: [] as string[],
    images: [] as string[]
  })

  useEffect(() => {
    // paramsを解決
    params.then(p => setScheduleId(p.id))
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (session.user.role !== 'admin') {
        router.push('/activity-schedules')
        return
      }
      
      // スケジュール情報とテンプレートを取得
      if (scheduleId) {
        fetchScheduleAndTemplate()
      }
    }
  }, [status, session, router, scheduleId])

  const fetchScheduleAndTemplate = async () => {
    try {
      // スケジュール情報を取得
      const scheduleRes = await fetch(`/api/activity-schedules/${scheduleId}/details`)
      let scheduleTitle = ''
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json()
        scheduleTitle = scheduleData.title || ''
      }

      // テンプレートを取得
      const templateRes = await fetch('/api/templates')
      if (templateRes.ok) {
        const templateData = await templateRes.json()
        setFormData({
          title: scheduleTitle,
          content: templateData.content || '',
          youtubeUrls: [],
          images: []
        })
      } else {
        setFormData(prev => ({
          ...prev,
          title: scheduleTitle
        }))
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      alert('タイトルと内容は必須です')
      return
    }

    if (!scheduleId) {
      alert('スケジュールIDが見つかりません')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/activity-schedules/${scheduleId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/posts')
      } else {
        const error = await res.json()
        alert(error.error || '活動報告の作成に失敗しました')
      }
    } catch (error) {
      console.error('活動報告作成エラー:', error)
      alert('活動報告の作成に失敗しました')
    } finally {
      setLoading(false)
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

  if (status === 'loading') {
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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>戻る</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">活動報告作成</h1>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">タイトル</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="活動報告のタイトル"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">YouTube URL（任意）</label>
              <div className="space-y-3">
                {formData.youtubeUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...formData.youtubeUrls]
                        newUrls[index] = e.target.value
                        setFormData({ ...formData, youtubeUrls: newUrls })
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = formData.youtubeUrls.filter((_, i) => i !== index)
                        setFormData({ ...formData, youtubeUrls: newUrls })
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, youtubeUrls: [...formData.youtubeUrls, ''] })}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
                >
                  + YouTube URLを追加
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">内容</label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="活動の詳細を入力してください..."
                minHeight="400px"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{loading ? '作成中...' : '活動報告を投稿'}</span>
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
