'use client'

interface VideoPlayerProps {
  src: string
  className?: string
}

export default function VideoPlayer({ src, className = '' }: VideoPlayerProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <video
        src={src}
        controls
        className="w-full rounded-lg"
        preload="metadata"
        playsInline
      >
        お使いのブラウザは動画タグをサポートしていません。
      </video>
    </div>
  )
}
