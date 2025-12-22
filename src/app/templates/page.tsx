'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { FileText, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface Template {
  id: string
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function TemplatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    content: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchTemplates()
  }, [status, session, router])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('テンプレート取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.content) {
      alert('名前と内容は必須です')
      return
    }

    setLoading(true)

    try {
      const url = editingTemplate 
        ? `/api/templates/${editingTemplate.id}` 
        : '/api/templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowModal(false)
        setEditingTemplate(null)
        setFormData({ name: '', content: '' })
        fetchTemplates()
      } else {
        alert('エラーが発生しました')
      }
    } catch (error) {
      console.error('送信エラー:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このテンプレートを削除しますか？')) return

    setLoading(true)

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchTemplates()
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      content: template.content
    })
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingTemplate(null)
    setFormData({ name: '', content: '' })
    setShowModal(true)
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">テンプレート管理</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            新規作成
          </button>
        </div>

        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-3">
                    {template.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    更新日: {new Date(template.updatedAt).toLocaleString('ja-JP')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openEditModal(template)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              テンプレートがありません
            </div>
          )}
        </div>
      </div>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingTemplate ? 'テンプレート編集' : '新規テンプレート'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">テンプレート名</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 活動報告テンプレート"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">内容</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={15}
                    placeholder="テンプレートの内容を入力..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingTemplate(null)
                      setFormData({ name: '', content: '' })
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
