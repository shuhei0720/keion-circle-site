'use client'

import { useRef, useState, useEffect } from 'react'

interface VideoPlayerProps {
  src: string
  className?: string
}

export default function VideoPlayer({ src, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [showThumbnail, setShowThumbnail] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const generateThumbnail = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        setThumbnail(canvas.toDataURL())
      }
    }

    video.addEventListener('loadeddata', generateThumbnail)
    return () => video.removeEventListener('loadeddata', generateThumbnail)
  }, [])

  return (
    <div className={`relative w-full ${className}`}>
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full rounded-lg"
        preload="metadata"
        playsInline
        onPlay={() => setShowThumbnail(false)}
      >
        お使いのブラウザは動画タグをサポートしていません。
      </video>
      {thumbnail && showThumbnail && (
        <img
          src={thumbnail}
          alt="Video thumbnail"
          className="absolute inset-0 w-full h-full rounded-lg object-cover pointer-events-none"
        />
      )}
    </div>
  )
}
