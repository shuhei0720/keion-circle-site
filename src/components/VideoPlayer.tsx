'use client'

import { useRef, useState, useEffect } from 'react'
import { Play } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  className?: string
}

export default function VideoPlayer({ src, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasThumbnail, setHasThumbnail] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // スマホでも強制的に読み込み
    video.load()

    const generateThumbnail = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          setHasThumbnail(true)
        }
      }
    }

    video.addEventListener('loadeddata', generateThumbnail)
    return () => video.removeEventListener('loadeddata', generateThumbnail)
  }, [])

  const handlePlay = async () => {
    if (videoRef.current) {
      const video = videoRef.current
      if (!hasThumbnail) {
        video.load()
      }
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
        preload="metadata"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        お使いのブラウザは動画タグをサポートしていません。
      </video>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full rounded-lg object-cover ${isPlaying ? 'hidden' : ''}`}
      />
      {!isPlaying && (
        <div
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center rounded-lg cursor-pointer"
        >
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Play className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  )
}
