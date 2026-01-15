'use client'

import { useRef, useState } from 'react'
import { Play } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  className?: string
}

export default function VideoPlayer({ src, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = async () => {
    if (videoRef.current) {
      const video = videoRef.current
      video.load()
      await video.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className={`relative w-full ${className}`}>
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full rounded-lg"
        preload="none"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        お使いのブラウザは動画タグをサポートしていません。
      </video>
      {!isPlaying && (
        <div
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg cursor-pointer"
        >
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Play className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  )
}
