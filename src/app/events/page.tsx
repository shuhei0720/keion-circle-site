'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import RichTextEditor from '@/components/RichTextEditor'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Calendar, Users, MessageCircle, Plus, Edit2, FileText, Loader2, MapPin, Music, FileSpreadsheet, Youtube, FilePenLine, Trash2, Heart, Copy, Check } from 'lucide-react'
import YouTube from 'react-youtube'

// 型定義
interface Song {
  title: string;
  parts?: Array<{ instrument: string; player: string }>;
  sheetUrl?: string;
  youtubeUrl?: string;
}

interface User {
  id: string
  name: string | null
  email: string | null
}

interface Participant {
  id: string
  userId: string
  user: User
  createdAt: string
}

interface Comment {
  id: string
  content: string
  user: User
  createdAt: string
}

interface Post {
  id: string
  title: string
  content: string
  youtubeUrl: string | null
  images?: string[]
  user: User
  participants: { id: string; userId: string; user: User; status: string }[]
  likes: { userId: string }[]
  _count?: { comments: number }
  createdAt: string
}

interface Event {
  id: string
  title: string
  content: string
  date: string
  locationName: string | null
  locationUrl: string | null
  songs: string | null
  user: User
  participants: Participant[]
  comments?: Comment[]
  posts?: Post[]
  _count?: {
    comments: number
  }
  createdAt: string
  updatedAt: string
}

export default function EventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({})
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({})
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: '',
    locationName: '',
    locationUrl: '',
    songs: [] as {
      title: string
      sheetUrl: string
      youtubeUrl: string
      parts: { instrument: string; player: string }[]
    }[]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchEvents()
    }
  }, [status, router])

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('イベント取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchComments = async (eventId: string) => {
    if (loadingComments[eventId]) return
    
    setLoadingComments({ ...loadingComments, [eventId]: true })
    try {
      const res = await fetch(`/api/events/${eventId}/details`)
      if (res.ok) {
        const data = await res.json()
        setEvents(events.map(e => 
          e.id === eventId ? { ...e, comments: data.comments } : e
        ))
      }
    } catch (error) {
      console.error('コメント取得エラー:', error)
    } finally {
      setLoadingComments({ ...loadingComments, [eventId]: false })
    }
  }

  const toggleComments = (eventId: string) => {
    const isExpanded = expandedComments[eventId]
    setExpandedComments({ ...expandedComments, [eventId]: !isExpanded })
    
    const event = events.find(e => e.id === eventId)
    if (!isExpanded && (!event?.comments || event.comments.length === 0)) {
      fetchComments(eventId)
    }
  }

  const handleCopyEvent = async (event: Event) => {
    try {
      // HTMLタグを除去してテキストのみを抽出
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = event.content
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      
      // 課題曲を解析
      let songsData: Array<{
        title: string
        artist: string
        youtubeUrl: string
        sheetMusicUrl: string
        parts: { [key: string]: string }
      }> = []
      
      try {
        songsData = event.songs ? JSON.parse(event.songs) : []
      } catch (e) {
        console.error('課題曲の解析エラー:', e)
      }
      
      // コピーする内容を構築
      let copyText = `━━━━━━━━━━━━━━━━━━\n`
      copyText += `🎵 ${event.title}\n`
      copyText += `━━━━━━━━━━━━━━━━━━\n\n`
      
      copyText += `📅 開催日時\n${new Date(event.date).toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })}\n\n`
      
      if (event.locationName) {
        copyText += `📍 会場\n${event.locationName}\n`
        if (event.locationUrl) {
          copyText += `🔗 地図: ${event.locationUrl}\n`
        }
        copyText += '\n'
      }
      
      copyText += `📝 内容\n${textContent}\n\n`
      
      // 課題曲情報
      if (songsData.length > 0) {
        copyText += `🎼 課題曲一覧\n`
        copyText += `━━━━━━━━━━━━━━━━━━\n`
        
        songsData.forEach((song, index) => {
          copyText += `\n【曲 ${index + 1}】${song.title}\n`
          if (song.artist) {
            copyText += `アーティスト: ${song.artist}\n`
          }
          
          // パート担当
          const partNames: { [key: string]: string } = {
            vocal: 'ボーカル',
            guitar: 'ギター',
            bass: 'ベース',
            drums: 'ドラム',
            keyboard: 'キーボード',
            other: 'その他'
          }
          
          if (song.parts && Array.isArray(song.parts) && song.parts.length > 0) {
            const assignedParts = song.parts
              .filter((part: { instrument: string; player: string }) => 
                part.instrument && part.player && part.player.trim() !== ''
              )
              .map((part: { instrument: string; player: string }) => 
                `  ${partNames[part.instrument] || part.instrument}: ${part.player}`
              )
            
            if (assignedParts.length > 0) {
              copyText += '\nパート担当:\n'
              copyText += assignedParts.join('\n') + '\n'
            }
          }
          
          if (song.youtubeUrl) {
            copyText += `🎥 動画: ${song.youtubeUrl}\n`
          }
          if (song.sheetMusicUrl) {
            copyText += `📄 楽譜: ${song.sheetMusicUrl}\n`
          }
        })
        
        copyText += '\n'
      }
      
      copyText += `━━━━━━━━━━━━━━━━━━\n`
      copyText += `【大阪軽音部WebサイトURL】\n${window.location.origin}/events`
      
      await navigator.clipboard.writeText(copyText)
      setCopiedEventId(event.id)
      setTimeout(() => setCopiedEventId(null), 2000)
    } catch (error) {
      console.error('コピーに失敗しました:', error)
      alert('コピーに失敗しました')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content || !formData.date) {
      alert('タイトル、内容、日付は必須です')
      return
    }

    try {
      const url = editingId ? `/api/events/${editingId}` : '/api/events'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({
          title: '',
          content: '',
          date: '',
          locationName: '',
          locationUrl: '',
          songs: []
        })
        setShowCreateForm(false)
        setEditingId(null)
        fetchEvents()
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    }
  }

  const handleParticipate = async (eventId: string) => {
    if (!session?.user?.id) return

    const userId = session.user.id
    const isCurrentlyParticipating = events.find(e => e.id === eventId)?.participants.some(p => p.userId === userId)

    // 楽観的UI更新
    setEvents(prevEvents => prevEvents.map(e => {
      if (e.id === eventId) {
        if (isCurrentlyParticipating) {
          return {
            ...e,
            participants: e.participants.filter(p => p.userId !== userId)
          }
        } else {
          return {
            ...e,
            participants: [...e.participants, {
              id: 'temp-' + Date.now(),
              userId,
              user: {
                id: userId,
                name: session.user.name || session.user.email || 'ユーザー',
                email: session.user.email || null
              },
              createdAt: new Date().toISOString()
            }]
          }
        }
      }
      return e
    }))

    try {
      const res = await fetch(`/api/events/${eventId}/participate`, {
        method: 'POST'
      })

      if (!res.ok) {
        // エラー時は元に戻す
        fetchEvents()
      }
    } catch (error) {
      console.error('参加登録エラー:', error)
      // エラー時は元に戻す
      fetchEvents()
    }
  }

  const handleCommentSubmit = async (eventId: string) => {
    const content = newComment[eventId]
    if (!content || content.trim() === '') return

    const tempComment = {
      id: 'temp-' + Date.now(),
      content,
      user: {
        id: session?.user?.id || '',
        name: session?.user?.name || session?.user?.email || 'Unknown',
        email: session?.user?.email || ''
      },
      createdAt: new Date().toISOString()
    }

    // 即座にUIを更新
    if (expandedComments[eventId]) {
      setEvents(prev => prev.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            comments: [...(e.comments || []), tempComment],
            _count: e._count ? { comments: e._count.comments + 1 } : { comments: 1 }
          }
        }
        return e
      }))
    } else {
      setEvents(prev => prev.map(e => 
        e.id === eventId && e._count
          ? { ...e, _count: { comments: e._count.comments + 1 } }
          : e
      ))
    }
    setNewComment({ ...newComment, [eventId]: '' })

    try {
      const res = await fetch(`/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!res.ok) {
        // エラー時はロールバック
        if (expandedComments[eventId]) {
          fetchComments(eventId)
        } else {
          setEvents(events.map(e => 
            e.id === eventId && e._count
              ? { ...e, _count: { comments: e._count.comments - 1 } }
              : e
          ))
        }
      } else if (expandedComments[eventId]) {
        // 成功時は実データで再取得
        fetchComments(eventId)
      }
    } catch (error) {
      console.error('コメント投稿エラー:', error)
    }
  }

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      content: event.content,
      date: new Date(event.date).toISOString().split('T')[0],
      locationName: event.locationName || '',
      locationUrl: event.locationUrl || '',
      songs: event.songs ? JSON.parse(event.songs) : []
    })
    setEditingId(event.id)
    setShowCreateForm(true)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('このイベントを削除しますか？')) return
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchEvents()
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
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

  const handleCreateReport = (event: Event) => {
    const songs = event.songs ? JSON.parse(event.songs) : []
    
    const instrumentNames: { [key: string]: string } = {
      vocal: 'ボーカル',
      electric_guitar: 'エレキギター',
      acoustic_guitar: 'アコースティックギター',
      guitar: 'ギター', // 旧データ対応
      bass: 'ベース',
      drums: 'ドラム',
      keyboard: 'キーボード',
      other: 'その他'
    }
    
    const songsText = songs.map((song: Song, index: number) => {
      const parts = song.parts && song.parts.length > 0
        ? '\n    ' + song.parts.map((p) => `${instrumentNames[p.instrument] || p.instrument}: ${p.player}`).join(' / ')
        : ''
      
      let songSection = `\n♪ 課題曲 ${index + 1}\n\n  曲名: ${song.title}`
      
      if (parts) {
        songSection += `\n  パート担当:${parts}`
      }
      
      return songSection
    }).join('\n\n')

    const template = `# 活動報告

📅 日時
  ${new Date(event.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
${event.locationName || event.locationUrl ? `
📍 場所
  ${event.locationName || ''}${event.locationUrl ? `\n  ${event.locationUrl}` : ''}` : ''}

👥 参加メンバー
  ${event.participants.map(p => p.user.name || p.user.email).join(' / ')}
${songsText}

━━━━━━━━━━━━━━━━━━━
📝 活動内容

${event.content}


━━━━━━━━━━━━━━━━━━━
✨ 成果・ハイライト

（ここに活動の成果や印象に残ったことを記入してください）


━━━━━━━━━━━━━━━━━━━
💭 次回に向けて

（次回に向けての改善点や課題を記入してください）
`

    router.push(`/events/${event.id}/report?template=${encodeURIComponent(template)}`)
  }

  // 課題曲管理
  const addSong = () => {
    setFormData({
      ...formData,
      songs: [...formData.songs, { title: '', sheetUrl: '', youtubeUrl: '', parts: [] }]
    })
  }

  const updateSong = (index: number, field: 'title' | 'sheetUrl' | 'youtubeUrl', value: string) => {
    const newSongs = [...formData.songs]
    newSongs[index][field] = value
    setFormData({ ...formData, songs: newSongs })
  }

  const removeSong = (index: number) => {
    setFormData({
      ...formData,
      songs: formData.songs.filter((_, i) => i !== index)
    })
  }

  // パート管理
  const addPart = (songIndex: number) => {
    const newSongs = [...formData.songs]
    newSongs[songIndex].parts.push({ instrument: 'vocal', player: '' })
    setFormData({ ...formData, songs: newSongs })
  }

  const updatePart = (songIndex: number, partIndex: number, field: 'instrument' | 'player', value: string) => {
    const newSongs = [...formData.songs]
    newSongs[songIndex].parts[partIndex][field] = value
    setFormData({ ...formData, songs: newSongs })
  }

  const removePart = (songIndex: number, partIndex: number) => {
    const newSongs = [...formData.songs]
    newSongs[songIndex].parts = newSongs[songIndex].parts.filter((_, i) => i !== partIndex)
    setFormData({ ...formData, songs: newSongs })
  }

  const isParticipating = (event: Event) => {
    return event.participants.some(p => p.user.id === session?.user?.id)
  }

  const canCreateReport = (event: Event) => {
    const eventDate = new Date(event.date)
    const now = new Date()
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'site_admin'
    return isAdmin && eventDate <= now
  }

  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'site_admin'

  const getYoutubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="lg" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">イベント</h1>
          <div className="flex gap-2">
            {isAdmin && !showCreateForm && (
              <button
                onClick={() => {
                  setShowCreateForm(true)
                  setEditingId(null)
                  setFormData({
                    title: '',
                    content: '',
                    date: '',
                    locationName: '',
                    locationUrl: '',
                    songs: []
                  })
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">新規作成</span>
              </button>
            )}
          </div>
        </div>

        {/* 作成・編集フォーム */}
        {showCreateForm && isAdmin && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-white/10 overflow-x-hidden">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingId ? 'イベント編集' : '新規イベント'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 overflow-x-hidden">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">タイトル</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 学園祭ライブ"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80">日時</label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white focus:ring-2 focus:ring-blue-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-sm font-medium mb-2 text-white/80">開催場所名（任意）</label>
                  <input
                    type="text"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    onBlur={(e) => {
                      const location = e.target.value.trim()
                      if (location && !formData.locationUrl) {
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
                        setFormData(prev => ({ ...prev, locationUrl: mapsUrl }))
                      }
                    }}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 第一体育館"
                  />
                  <p className="text-xs text-white/50 mt-1">💡 場所名を入力すると自動でGoogle Maps URLが生成されます</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">開催場所URL（任意）</label>
                <input
                  type="url"
                  value={formData.locationUrl}
                  onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500"
                  placeholder="例: https://maps.app.goo.gl/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">内容</label>
                <RichTextEditor 
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="イベントの詳細を入力してください..."
                  minHeight="150px"
                />
              </div>

              {/* 課題曲セクション */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-white">課題曲（任意）</h3>
                  <button
                    type="button"
                    onClick={addSong}
                    className="text-sm px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:scale-105 transition-all shadow-lg"
                  >
                    + 課題曲追加
                  </button>
                </div>
                
                {formData.songs.length === 0 ? (
                  <p className="text-sm text-white/60">課題曲を追加してください</p>
                ) : (
                  <div className="space-y-4">
                    {formData.songs.map((song, songIndex) => (
                      <div key={songIndex} className="border border-white/10 rounded-xl p-4 bg-white/5">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-white">課題曲 {songIndex + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeSong(songIndex)}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            削除
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-white/80">曲名</label>
                            <input
                              type="text"
                              value={song.title}
                              onChange={(e) => updateSong(songIndex, 'title', e.target.value)}
                              onBlur={async (e) => {
                                const title = e.target.value.trim()
                                if (title && !song.youtubeUrl) {
                                  try {
                                    const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(title)}`)
                                    if (response.ok) {
                                      const data = await response.json()
                                      if (data.url) {
                                        updateSong(songIndex, 'youtubeUrl', data.url)
                                      }
                                    }
                                  } catch (error) {
                                    console.error('YouTube検索エラー:', error)
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/5 text-white placeholder-white/40"
                              placeholder="例: 青と夏"
                            />
                            <p className="text-xs text-white/50 mt-1">💡 曲名を入力すると自動でYouTube URLが検索されます</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-white/80">楽譜URL</label>
                              <input
                                type="url"
                                value={song.sheetUrl}
                                onChange={(e) => updateSong(songIndex, 'sheetUrl', e.target.value)}
                                className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/5 text-white placeholder-white/40"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-white/80">YouTube URL</label>
                              <input
                                type="url"
                                value={song.youtubeUrl}
                                onChange={(e) => updateSong(songIndex, 'youtubeUrl', e.target.value)}
                                className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/5 text-white placeholder-white/40"
                                placeholder="https://youtube.com/..."
                              />
                            </div>
                          </div>
                          
                          {/* パート担当 */}
                          <div className="border-t border-white/10 pt-3 mt-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium text-white/80">パート担当</label>
                              <button
                                type="button"
                                onClick={() => addPart(songIndex)}
                                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
                              >
                                + パート追加
                              </button>
                            </div>
                            {song.parts.length === 0 ? (
                              <p className="text-xs text-white/60">パートを追加してください</p>
                            ) : (
                              <div className="space-y-2">
                                {song.parts.map((part, partIndex) => (
                                  <div key={partIndex} className="flex flex-col sm:flex-row gap-2">
                                    <select
                                      value={part.instrument}
                                      onChange={(e) => updatePart(songIndex, partIndex, 'instrument', e.target.value)}
                                      className="w-full sm:w-auto px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/5 text-white"
                                      style={{ colorScheme: 'dark' }}
                                    >
                                      <option value="vocal" className="bg-slate-800 text-white">ボーカル</option>
                                      <option value="electric_guitar" className="bg-slate-800 text-white">エレキギター</option>
                                      <option value="acoustic_guitar" className="bg-slate-800 text-white">アコースティックギター</option>
                                      <option value="bass" className="bg-slate-800 text-white">ベース</option>
                                      <option value="drums" className="bg-slate-800 text-white">ドラム</option>
                                      <option value="keyboard" className="bg-slate-800 text-white">キーボード</option>
                                      <option value="other" className="bg-slate-800 text-white">その他</option>
                                    </select>
                                    <input
                                      type="text"
                                      value={part.player}
                                      onChange={(e) => updatePart(songIndex, partIndex, 'player', e.target.value)}
                                      className="flex-1 px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/5 text-white placeholder-white/40"
                                      placeholder="担当者名"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removePart(songIndex, partIndex)}
                                      className="w-full sm:w-auto px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-all shrink-0"
                                    >
                                      削除
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:scale-105 transition-all shadow-lg"
                >
                  {editingId ? '更新' : '作成'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingId(null)
                    setFormData({
                      title: '',
                      content: '',
                      date: '',
                      locationName: '',
                      locationUrl: '',
                      songs: []
                    })
                  }}
                  className="px-6 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-white transition-all"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* イベント一覧 */}
        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center text-white/70 border border-white/10">
              イベントがありません
            </div>
          ) : (
            events.map((event) => {
              const songs = event.songs ? JSON.parse(event.songs) : []

              return (
                <div key={event.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 border border-white/10 hover:bg-white/15 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-2">{event.title}</h2>
                      <div className="space-y-1 text-sm text-white/70">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString('ja-JP')}</span>
                        </div>
                        {(event.locationName || event.locationUrl) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {event.locationUrl ? (
                              <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {event.locationName || '開催場所を見る'}
                              </a>
                            ) : (
                              <span>{event.locationName}</span>
                            )}
                          </div>
                        )}
                        {songs.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            <span>課題曲: {songs.map((s: Song) => s.title).join('、')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyEvent(event)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg border border-white/20 transition"
                        title="イベント情報をコピー"
                      >
                        {copiedEventId === event.id ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 内容 */}
                  <div className="prose prose-sm prose-invert max-w-none mb-4 whitespace-pre-wrap text-white/80" dangerouslySetInnerHTML={{ __html: event.content }} />

                  {/* 課題曲 */}
                  {songs.length > 0 && (
                    <div className="mb-4 space-y-4">
                      {songs.map((song: Song, songIndex: number) => {
                        const videoId = song.youtubeUrl ? getYoutubeVideoId(song.youtubeUrl) : null
                        const instrumentNames: { [key: string]: string } = {
                          vocal: 'ボーカル',
                          electric_guitar: 'エレキギター',
                          acoustic_guitar: 'アコースティックギター',
                          guitar: 'ギター', // 旧データ対応
                          bass: 'ベース',
                          drums: 'ドラム',
                          keyboard: 'キーボード',
                          other: 'その他'
                        }
                        
                        return (
                          <div key={songIndex} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <h3 className="font-medium mb-2 flex items-center gap-2 text-white">
                              <Music className="w-4 h-4" />
                              {song.title}
                            </h3>
                            
                            {/* 楽譜・YouTube リンク */}
                            <div className="flex gap-3 mb-3">
                              {song.sheetUrl && (
                                <a
                                  href={song.sheetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <FileSpreadsheet className="w-4 h-4" />
                                  楽譜
                                </a>
                              )}
                              {song.youtubeUrl && (
                                <a
                                  href={song.youtubeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <Youtube className="w-4 h-4" />
                                  YouTube
                                </a>
                              )}
                            </div>

                            {/* YouTube埋め込み */}
                            {videoId && (
                              <div className="mb-3">
                                <div className="aspect-video rounded-xl overflow-hidden bg-black/30 shadow-2xl">
                                  <YouTube
                                    videoId={videoId}
                                    opts={{
                                      width: '100%',
                                      height: '100%',
                                      playerVars: { autoplay: 0 }
                                    }}
                                    className="w-full h-full"
                                  />
                                </div>
                              </div>
                            )}

                            {/* パート担当 */}
                            {song.parts && song.parts.length > 0 && (
                              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-400/20">
                                <h4 className="text-sm font-semibold mb-3 text-purple-300 flex items-center gap-2">
                                  <Music className="w-4 h-4" />
                                  パート担当
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {song.parts.map((part, partIndex: number) => (
                                    <div key={partIndex} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                      <span className="text-xs font-medium text-purple-300 min-w-[80px]">
                                        {instrumentNames[part.instrument] || part.instrument}
                                      </span>
                                      <span className="text-sm font-semibold text-white">{part.player}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* 参加者 */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-white/70" />
                      <span className="font-medium text-white">参加予定者 ({event.participants.length}名)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.participants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30"
                        >
                          <span className="text-sm text-white">{p.user.name || p.user.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 参加ボタン */}
                  <button
                    onClick={() => handleParticipate(event.id)}
                    className={`w-full sm:w-auto px-6 py-2 rounded-lg mb-4 transition-all ${
                      isParticipating(event)
                        ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 shadow-lg'
                    }`}
                  >
                    {isParticipating(event) ? '参加取り消し' : '参加する'}
                  </button>

                  {/* イベント報告作成ボタン */}
                  {canCreateReport(event) && (
                    <button
                      onClick={() => handleCreateReport(event)}
                      className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:scale-105 mb-4 ml-0 sm:ml-2 transition-all shadow-lg"
                    >
                      <FileText className="w-5 h-5 inline mr-2" />
                      イベント報告を作成
                    </button>
                  )}

                  {/* イベント報告一覧 */}
                  {event.posts && event.posts.length > 0 && (
                    <div className="mb-4 border-t border-white/10 pt-4">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        活動報告
                      </h3>
                      <div className="space-y-4">
                        {event.posts.map((post) => {
                          const videoId = post.youtubeUrl ? getYoutubeVideoId(post.youtubeUrl) : null
                          return (
                            <div key={post.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-medium text-white mb-1">{post.title}</h4>
                                  <p className="text-xs text-white/50">
                                    {post.user.name || post.user.email} • {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                                  </p>
                                </div>
                                {isAdmin && (
                                  <button
                                    onClick={() => router.push(`/posts/${post.id}/edit`)}
                                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="prose prose-sm prose-invert max-w-none mb-3 text-white/80 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: post.content }} />
                              
                              {/* YouTube埋め込み */}
                              {videoId && (
                                <div className="mb-3">
                                  <div className="aspect-video rounded-lg overflow-hidden bg-black/30">
                                    <YouTube
                                      videoId={videoId}
                                      opts={{
                                        width: '100%',
                                        height: '100%',
                                        playerVars: { autoplay: 0 }
                                      }}
                                      className="w-full h-full"
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {/* 画像表示 */}
                              {post.images && post.images.length > 0 && (
                                <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {post.images.map((imageUrl, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                      <img
                                        src={imageUrl}
                                        alt={`${post.title} - Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* いいね・コメント数 */}
                              <div className="flex items-center gap-4 text-sm text-white/60">
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  <span>{post.likes.length}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{post._count?.comments || 0}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* コメント */}
                  <div className="border-t border-white/10 pt-4">
                    <button
                      onClick={() => toggleComments(event.id)}
                      className="flex items-center gap-2 mb-3 text-white hover:text-blue-300 transition-colors w-full text-left"
                    >
                      <MessageCircle className="w-5 h-5 text-white/60" />
                      <span className="font-medium">
                        コメント ({event._count?.comments ?? event.comments?.length ?? 0})
                      </span>
                      {loadingComments[event.id] && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      )}
                    </button>

                    {expandedComments[event.id] && (
                      <>
                        <div className="space-y-3 mb-3">
                          {event.comments && event.comments.length > 0 ? (
                            event.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-white">
                                      {comment.user.name || comment.user.email}
                                    </span>
                                    <span className="text-xs text-white/50">
                                      {new Date(comment.createdAt).toLocaleString('ja-JP')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-white/80">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-white/50">コメントはまだありません</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComment[event.id] || ''}
                            onChange={(e) =>
                              setNewComment({ ...newComment, [event.id]: e.target.value })
                            }
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCommentSubmit(event.id)
                              }
                            }}
                            placeholder="コメントを入力..."
                            className="flex-1 px-4 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleCommentSubmit(event.id)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all shadow-lg"
                          >
                            送信
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
