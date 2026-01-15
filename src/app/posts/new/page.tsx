'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import RichTextEditor from '@/components/RichTextEditor'
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function getSupabaseClient() {
  return supabase
}

export default function NewPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const supabase = getSupabaseClient()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    youtubeUrls: [''] as string[],
    videoUrls: [] as string[],
    images: [] as string[]
  })

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  if (session?.user?.role !== 'admin' && session?.user?.role !== 'site_admin') {
    router.push('/posts')
    return null
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (!supabase) {
      alert('画像アップロード機能が利用できません。Supabaseの設定を確認してください。')
      return
    }

    setUploadingImages(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} は5MBを超えています`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `event-reports/${fileName}`

        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, file)

        if (error) {
          console.error('Upload error:', error)
          alert(`${file.name} のアップロードに失敗しました`)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))

      alert(`${uploadedUrls.length}枚の画像をアップロードしました`)
    } catch (error) {
      console.error('Image upload error:', error)
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
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // 500MBまで
    if (file.size > 500 * 1024 * 1024) {
      alert('動画ファイルは500MB以下にしてください')
      return
    }

    // 動画ファイルのみ
    if (!file.type.startsWith('video/')) {
      alert('動画ファイルを選択してください')
      return
    }

    setUploadingVideo(true)
    setVideoUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setVideoUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setFormData(prev => ({
            ...prev,
            videoUrls: [...prev.videoUrls, response.url]
          }))
          alert('動画をアップロードしました')
          setVideoUploadProgress(0)
        } else {
          alert('動画のアップロードに失敗しました')
        }
        setUploadingVideo(false)
      })

      xhr.addEventListener('error', () => {
        alert('動画のアップロードに失敗しました')
        setUploadingVideo(false)
        setVideoUploadProgress(0)
      })

      xhr.open('POST', '/api/posts/video')
      xhr.send(formData)
    } catch (error) {
      console.error('Video upload error:', error)
      alert('動画のアップロードに失敗しました')
      setUploadingVideo(false)
      setVideoUploadProgress(0)
    }
  }

  const handleRemoveVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      alert('タイトルと内容は必須です')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || '投稿の作成に失敗しました')
        return
      }

      alert('投稿を作成しました')
      router.push('/posts')
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('投稿の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>戻る</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">新規投稿</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">タイトル（必須）</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="投稿のタイトルを入力してください"
                required
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
              <label className="block text-sm font-medium mb-2">動画（任意）</label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${
                    uploadingVideo 
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                      : 'border-blue-500 text-blue-600 hover:bg-blue-50'
                  }`}>
                    <Upload className="w-5 h-5" />
                    <span>{uploadingVideo ? `アップロード中... ${videoUploadProgress}%` : '動画を選択'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm text-gray-500">最大500MB</span>
                </div>

                {uploadingVideo && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${videoUploadProgress}%` }}
                    ></div>
                  </div>
                )}

                {formData.videoUrls.length > 0 && (
                  <div className="space-y-3">
                    {formData.videoUrls.map((url, index) => (
                      <div key={index} className="relative group border rounded-lg p-3 flex items-center gap-3">
                        <video
                          src={url}
                          className="w-32 h-20 object-cover rounded"
                          controls={false}
                        />
                        <div className="flex-1 text-sm text-gray-600 truncate">
                          {url.split('/').pop()}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              <label className="block text-sm font-medium mb-2">内容（必須）</label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="投稿の詳細を入力してください..."
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
                <span>{loading ? '作成中...' : '投稿を作成'}</span>
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
