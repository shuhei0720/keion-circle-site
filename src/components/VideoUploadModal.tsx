'use client'

import { Loader2 } from 'lucide-react'

interface VideoUploadModalProps {
  isOpen: boolean
  progress: number
}

export default function VideoUploadModal({ isOpen, progress }: VideoUploadModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              動画をアップロード中
            </h3>
            <p className="text-gray-600">
              しばらくお待ちください...
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>進捗</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            この画面は自動的に閉じます
          </p>
        </div>
      </div>
    </div>
  )
}
