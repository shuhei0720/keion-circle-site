'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onUpload: (file: File) => Promise<void>
  disabled?: boolean
}

export default function AvatarUpload({ currentAvatar, onUpload, disabled }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // プレビュー表示
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // アップロード処理
    setUploading(true)
    try {
      await onUpload(file)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('アップロードに失敗しました')
      setPreview(currentAvatar || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setPreview(null)
    // 空のファイルを送信してアバターを削除
    const emptyFile = new File([], '')
    await onUpload(emptyFile)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {preview ? (
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <Upload className="text-gray-400" size={32} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer inline-block text-center ${
          disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
          {uploading ? 'アップロード中...' : 'アバターを選択'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || uploading}
          />
        </label>

        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || uploading}
            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} className="inline mr-1" />
            削除
          </button>
        )}
      </div>
    </div>
  )
}
