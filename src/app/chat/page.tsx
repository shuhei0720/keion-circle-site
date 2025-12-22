'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { Paperclip, Send, FileIcon, X, User } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  content: string
  createdAt: string
  userId: string
  fileUrl?: string | null
  fileName?: string | null
  fileType?: string | null
  user: {
    name: string
    email: string
  }
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fetchingMessages, setFetchingMessages] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session?.user) {
    return <DashboardLayout><div className="p-6">ログインが必要です</div></DashboardLayout>
  }

  useEffect(() => {
    fetchMessages()
    // 5秒ごとにメッセージを取得（ポーリング）
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { scrollToBottom() }, [messages])

  const fetchMessages = useCallback(async () => {
    setFetchingMessages(true)
    try {
      const res = await fetch('/api/messages')
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setFetchingMessages(false)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('ファイルサイズは10MB以下にしてください')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!inputMessage.trim() && !selectedFile) || !session?.user) return
    
    const messageContent = inputMessage || (selectedFile ? `${selectedFile.name}を送信しました` : '')
    const tempId = `temp-${Date.now()}`
    
    // 楽観的UI更新: 即座にメッセージを表示
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      userId: session.user.id,
      fileUrl: null,
      fileName: selectedFile?.name || null,
      fileType: selectedFile?.type || null,
      user: {
        name: session.user.name || '',
        email: session.user.email || ''
      }
    }
    
    setMessages((prev) => [...prev, optimisticMessage])
    setInputMessage('')
    const currentFile = selectedFile
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    scrollToBottom()
    
    setUploading(true)

    try {
      let fileUrl = null, fileName = null, fileType = null
      if (currentFile) {
        const formData = new FormData()
        formData.append('file', currentFile)
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        if (response.ok) {
          const data = await response.json()
          fileUrl = data.fileUrl
          fileName = data.fileName
          fileType = data.fileType
        }
      }

      // APIにメッセージを送信
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          fileUrl,
          fileName,
          fileType
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        // 楽観的メッセージを実際のメッセージに置き換え
        setMessages((prev) => prev.map(msg => msg.id === tempId ? newMessage : msg))
        scrollToBottom()
      } else {
        throw new Error('メッセージの送信に失敗しました')
      }
    } catch (error) {
      // エラー時は楽観的メッセージを削除
      setMessages((prev) => prev.filter(msg => msg.id !== tempId))
      console.error('Failed to send message:', error)
      alert('メッセージの送信に失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const isImage = (fileType: string | null | undefined) => fileType?.startsWith('image/') || false

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold">チャット</h1>
        </div>

        {fetchingMessages && messages.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-transparent">
              {messages.map((message) => {
            const isOwnMessage = session?.user && (session.user as any).id === message.userId
            return (
              <div key={message.id} className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                {!isOwnMessage && (
                  <Link href={`/users/${message.userId}`} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 hover:scale-110 transition-transform shadow-lg">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </Link>
                )}
                <div className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-xl shadow-lg backdrop-blur-md ${isOwnMessage ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/10 text-white border border-white/10'}`}>
                  <div className="text-xs mb-1 opacity-75">{message.user.name || message.user.email}</div>
                  <div className="text-sm sm:text-base break-words">{message.content}</div>
                  {message.fileUrl && (
                    <div className="mt-2">
                      {isImage(message.fileType) ? (
                        <img
                          src={message.fileUrl}
                          alt={message.fileName || 'Image'}
                          className="max-w-full rounded cursor-pointer hover:opacity-90"
                          onClick={() => window.open(message.fileUrl!, '_blank')}
                        />
                      ) : (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 p-2 rounded ${isOwnMessage ? 'bg-blue-700' : 'bg-gray-100'} hover:opacity-80`}
                        >
                          <FileIcon className="w-5 h-5" />
                          <span className="text-sm">{message.fileName}</span>
                        </a>
                      )}
                    </div>
                  )}
                  <div className="text-xs mt-1 opacity-75">
                    {new Date(message.createdAt).toLocaleDateString('ja-JP', { 
                      month: 'short', 
                      day: 'numeric' 
                    })} {new Date(message.createdAt).toLocaleTimeString('ja-JP', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                {isOwnMessage && (
                  <Link href={`/users/${(session.user as any).id}`} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1 hover:bg-gray-300 transition">
                    <User className="w-4 h-4 text-gray-400" />
                  </Link>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t p-3 sm:p-4 bg-white">
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
              <FileIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
              <span className="flex-1 text-xs sm:text-sm truncate">{selectedFile.name}</span>
              <button
                type="button"
                onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                className="text-red-500 hover:text-red-700 p-1 touch-manipulation"
                aria-label="ファイルを削除"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg touch-manipulation flex-shrink-0" 
              title="ファイルを添付"
              aria-label="ファイルを添付"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="メッセージ..."
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
              disabled={uploading}
            />
            <button
              type="submit"
              disabled={(!inputMessage.trim() && !selectedFile) || uploading}
              className="px-3 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 touch-manipulation flex-shrink-0 text-sm sm:text-base font-medium"
            >
              {uploading ? (
                <span className="hidden xs:inline">送信中...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden xs:inline">送信</span>
                </>
              )}
            </button>
          </div>
            </form>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
