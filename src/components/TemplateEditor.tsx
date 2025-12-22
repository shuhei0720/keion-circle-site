'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import RichTextEditor from './RichTextEditor'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function TemplateEditor({ isOpen, onClose, onSave }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchTemplate()
    }
  }, [isOpen])

  const fetchTemplate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/templates')
      if (res.ok) {
        const data = await res.json()
        setContent(data.content || '')
      }
    } catch (error) {
      console.error('テンプレート取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (res.ok) {
        onSave()
        onClose()
      } else {
        alert('テンプレートの保存に失敗しました')
      }
    } catch (error) {
      console.error('テンプレート保存エラー:', error)
      alert('テンプレートの保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">報告書テンプレート編集</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                このテンプレートは、イベントと活動スケジュールから報告書を作成する際に自動的に入力されます。
              </p>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="テンプレートを入力してください..."
                minHeight="400px"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
