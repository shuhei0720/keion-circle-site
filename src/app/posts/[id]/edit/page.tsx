'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import RichTextEditor from '@/components/RichTextEditor'
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import VideoUploadModal from '@/components/VideoUploadModal'

function getSupabaseClient() {
  return supabase
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [postId, setPostId] = useState<string>('')
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = getSupabaseClient()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrls: [] as string[],
    images: [] as string[]
  })

  useEffect(() => {
    params.then(p => setPostId(p.id))
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (session.user.role !== 'admin' && session.user.role !== 'site_admin') {
        router.push('/posts')
        return
      }

      if (postId) {
        fetchPost()
      }
    }
  }, [status, session, router, postId])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          title: data.title,
          content: data.content || '',
          videoUrls: data.videoUrls || [],
          images: data.images || []
        })
      } else {
        alert('投稿の取得に失敗しました')
        router.push('/posts')
      }
    } catch (error) {
      console.error('投稿取得エラー:', error)
      alert('投稿の取得に失敗しました')
      router.push('/posts')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (!supabase) {
      alert('画像アップロード機能が利用できません。Supabaseの設定を確認してください。')
      return
    }

    setUploadingImages(true)

    if (!supabase) {
      alert('Supabaseクライアントの初期化に失敗しました')
      return
    }

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

  const handleVideoInputClick = () => {
    // ファイルピッカーが開いた
    const input = document.activeElement as HTMLInputElement
    
    const checkForSelection = () => {
      setTimeout(() => {
        if (document.hasFocus()) {
          // フォーカスが戻ってきた = ファイルピッカーが閉じた
          setTimeout(() => {
            // ファイルが選択されたかチェック
            if (input && input.files && input.files.length > 0) {
              // ファイルが選択された場合のみモーダル表示
              setUploadingVideo(true)
              setVideoUploadProgress(0)
            }
          }, 100)
        } else {
          checkForSelection()
        }
      }, 100)
    }
    
    checkForSelection()
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      setUploadingVideo(false)
      return
    }

    const file = files[0]

    // 即座にモーダルを表示
    setUploadingVideo(true)
    setVideoUploadProgress(0)

    // 簡単なチェックのみ
    if (file.size > 1 * 1024 * 1024 * 1024) {
      alert('動画ファイルは1GB以下にしてください')
      setUploadingVideo(false)
      return
    }

    if (!file.type.startsWith('video/')) {
      alert('動画ファイルを選択してください')
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

      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
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

    if (!postId) {
      alert('投稿IDが見つかりません')
      return
    }

    setLoading(true)

    try {
      const { title, content, images, videoUrls } = formData
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, images, videoUrls })
      })

      if (res.ok) {
        router.push('/posts')
      } else {
        const error = await res.json()
        alert(error.error || '投稿の更新に失敗しました')
      }
    } catch (error) {
      console.error('投稿更新エラー:', error)
      alert('投稿の更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !postId) {
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

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">投稿を編集</h1>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">タイトル</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="投稿のタイトル"
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
                  <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${
                    uploadingVideo 
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                      : 'border-blue-500 text-blue-600 hover:bg-blue-50'
                  }`}>
                    <Upload className="w-5 h-5" />
                    <span>{uploadingVideo ? 'アップロード中...' : '動画を選択'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      onClick={handleVideoInputClick}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm text-gray-500">最大1GB</span>
                </div>

                {formData.videoUrls.length > 0 && (
                  <div className="space-y-3">
                    {formData.videoUrls.map((url, index) => (
                      <div key={index} className="relative group border rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 text-sm font-medium text-gray-700">
                            動画 {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <video
                          src={url}
                          className="w-full max-h-64 rounded-lg"
                          controls
                          preload="metadata"
                        />
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
                <span>{loading ? '更新中...' : '投稿を更新'}</span>
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
