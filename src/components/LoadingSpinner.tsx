import { Music } from 'lucide-react'

interface LoadingSpinnerProps {
  variant?: 'default' | 'profile'
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ variant = 'default', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  if (variant === 'profile') {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          {/* 回転する円 */}
          <div className={`${sizeClasses[size]} border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin`}></div>
          {/* 中央のユーザーアイコン */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center animate-pulse">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        {/* 外側の回転リング */}
        <div className={`${sizeClasses[size]} border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin`}></div>
        
        {/* 中央の音符アイコン */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Music className={`${iconSizes[size]} text-purple-500 animate-pulse`} />
        </div>
        
        {/* 内側の逆回転リング */}
        <div className="absolute inset-2 border-2 border-purple-500/20 border-b-purple-500 rounded-full animate-spin-reverse"></div>
      </div>
    </div>
  )
}
