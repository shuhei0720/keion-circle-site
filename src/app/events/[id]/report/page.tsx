'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import RichTextEditor from '@/components/RichTextEditor'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function CreateEventReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [eventId, setEventId] = useState<string>('')
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    youtubeUrl: ''
  })

  useEffect(() => {
    // paramsを解決
    params.then(p => setEventId(p.id))
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (session.user.role !== 'admin') {
        router.push('/events')
        return
      }

      // テンプレートを取得
      const template = searchParams.get('template')
      if (template) {
        const decoded = decodeURIComponent(template)
        const titleMatch = decoded.match(/^# (.+)/)
        const title = titleMatch ? titleMatch[1] : ''

        setFormData({
          title,
          content: decoded,
          youtubeUrl: ''
        })
      }
    }
  }, [status, session, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      alert('タイトルと内容は必須です')
      return
    }

    if (!eventId) {
      alert('イベントIDが見つかりません')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/events/${eventId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/posts')
      } else {
        const error = await res.json()
        alert(error.error || 'イベント報告の作成に失敗しました')
      }
    } catch (error) {
      console.error('イベント報告作成エラー:', error)
      alert('イベント報告の作成に失敗しました')
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

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">イベント報告作成</h1>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">タイトル</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="イベント報告のタイトル"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">YouTube URL（任意）</label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">内容</label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="イベントの詳細を入力してください..."
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
                <span>{loading ? '作成中...' : 'イベント報告を投稿'}</span>
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
