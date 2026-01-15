'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import RichTextEditor from '@/components/RichTextEditor'
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import VideoPlayer from '@/components/VideoPlayer'
import VideoUploadModal from '@/components/VideoUploadModal'

export default function CreateReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [deletingVideoIndex, setDeletingVideoIndex] = useState<number | null>(null)
  const [scheduleId, setScheduleId] = useState<string>('')
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    images: [] as string[],
    videoUrls: [] as string[]
  })

  useEffect(() => {
    // paramsを解決
    params.then(p => setScheduleId(p.id))
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (session.user.role !== 'admin' && session.user.role !== 'site_admin') {
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
      // URLパラメータからテンプレートを取得
      const templateParam = searchParams.get('template')
      
      if (templateParam) {
        // URLパラメータにテンプレートがある場合はそれを使用
        const decodedTemplate = decodeURIComponent(templateParam)
        const lines = decodedTemplate.split('\n')
        const title = lines[0].replace(/^#\s*/, '') // 最初の行からタイトルを抽出
        
        setFormData({
          title: title || '',
          content: decodedTemplate,
          images: [],
          videoUrls: []
        })
      } else {
        // テンプレートがない場合は従来通りスケジュール情報を取得
        const scheduleRes = await fetch(`/api/activity-schedules/${scheduleId}/details`)
        let scheduleTitle = ''
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json()
          scheduleTitle = scheduleData.title || ''
        }

        // デフォルトテンプレートを取得
        const templateRes = await fetch('/api/templates')
        if (templateRes.ok) {
          const templateData = await templateRes.json()
          setFormData({
            title: scheduleTitle,
            content: templateData.content || '',
            images: [],
            videoUrls: []
          })
        } else {
          setFormData(prev => ({
            ...prev,
            title: scheduleTitle
          }))
        }
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} は5MBを超えています`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `posts/${fileName}`

        if (!supabase) {
          alert('Supabaseクライアントの初期化に失敗しました')
          continue
        }

        const { error } = await supabase.storage
          .from('avatars')
          .upload(filePath, file)

        if (error) {
          console.error('画像アップロードエラー:', error)
          alert(`${file.name} のアップロードに失敗しました`)
          continue
        }

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        uploadedUrls.push(data.publicUrl)
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
    } catch (error) {
      console.error('画像アップロードエラー:', error)
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 即座にモーダルを表示
    setUploadingVideo(true)
    setVideoUploadProgress(0)

    // 簡単なチェックのみ
    if (file.size > 1 * 1024 * 1024 * 1024) {
      alert('動画ファイルは1GB以下にしてください')
      setUploadingVideo(false)
      return
    }

    try {
      // 1. Presigned URLを取得
      const presignResponse = await fetch('/api/posts/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type
        })
      })

      if (!presignResponse.ok) {
        throw new Error('Presigned URL取得失敗')
      }

      const { uploadUrl, publicUrl } = await presignResponse.json()

      // 2. 直接R2にアップロード
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setVideoUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setFormData(prev => ({
            ...prev,
            videoUrls: [...prev.videoUrls, publicUrl]
          }))
          setUploadingVideo(false)
          setVideoUploadProgress(0)
        } else {
          throw new Error('Upload failed')
        }
      })

      xhr.addEventListener('error', () => {
        alert('動画のアップロードに失敗しました')
        setUploadingVideo(false)
        setVideoUploadProgress(0)
      })

      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    } catch (error) {
      console.error('動画アップロードエラー:', error)
      alert('動画のアップロードに失敗しました')
      setUploadingVideo(false)
      setVideoUploadProgress(0)
    }
  }

  const handleRemoveVideo = async (index: number) => {
    const videoUrl = formData.videoUrls[index]
    
    if (!confirm('この動画を削除しますか?')) {
      return
    }

    setDeletingVideoIndex(index)
    try {
      // R2から削除
      const response = await fetch('/api/posts/video', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      })

      if (!response.ok) {
        throw new Error('動画の削除に失敗しました')
      }

      // UIから削除
      setFormData(prev => ({
        ...prev,
        videoUrls: prev.videoUrls.filter((_, i) => i !== index)
      }))

      alert('動画を削除しました')
    } catch (error) {
      console.error('Video delete error:', error)
      alert('動画の削除に失敗しました')
    } finally {
      setDeletingVideoIndex(null)
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
      const { title, content, images, videoUrls } = formData
      const res = await fetch(`/api/activity-schedules/${scheduleId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, images, videoUrls })
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
      <VideoUploadModal isOpen={uploadingVideo} progress={videoUploadProgress} />
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
              <label className="block text-sm font-medium mb-2">画像（任意）</label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <Upload className="w-5 h-5" />
                    <span>{uploadingImages ? 'アップロード中...' : '画像を選択'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm text-gray-500">最大5MB、複数選択可能</span>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">動画（任意）</label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-purple-500 text-purple-600 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <Upload className="w-5 h-5" />
                    <span>{uploadingVideo ? 'アップロード中...' : '動画を選択'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm text-gray-500">最大1GB</span>
                </div>

                {formData.videoUrls.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.videoUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <VideoPlayer src={url} />
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(index)}
                          disabled={deletingVideoIndex === index}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingVideoIndex === index ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
