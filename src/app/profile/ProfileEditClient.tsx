'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Edit2, Save, X, Music } from 'lucide-react'
import AvatarUpload from '@/components/AvatarUpload'

// 選択可能な楽器リスト
const AVAILABLE_INSTRUMENTS = [
  'ボーカル',
  'エレキギター',
  'アコースティックギター',
  'ベース',
  'ドラム',
  'キーボード',
  'ピアノ',
  'サックス',
  'トランペット',
  'トロンボーン',
  'バイオリン',
  'チェロ',
  'フルート',
  'クラリネット',
  'DJ',
  'その他'
]

interface ProfileEditClientProps {
  user: {
    id: string
    name: string | null
    email: string | null
    avatarUrl: string | null
    bio: string | null
    instruments: string | null
    role: string
    createdAt: Date
  }
}

export default function ProfileEditClient({ user }: ProfileEditClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [instruments, setInstruments] = useState<string[]>(
    user.instruments ? JSON.parse(user.instruments) : []
  )
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl)
  const [saving, setSaving] = useState(false)

  // ページ表示時にスクロールをトップに戻す
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleInstrumentToggle = (instrument: string) => {
    setInstruments(prev => 
      prev.includes(instrument)
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    )
  }

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)

    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      setAvatarUrl(data.avatarUrl)
    } else {
      throw new Error('Upload failed')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name,
          bio,
          instruments: JSON.stringify(instruments)
        }),
      })

      if (res.ok) {
        setIsEditing(false)
        window.location.reload()
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-white/10">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white">プロフィール情報</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1 text-blue-300 hover:bg-blue-500/20 rounded-lg transition border border-blue-400/30">
            <Edit2 size={16} />
            編集
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          {isEditing ? (
            <AvatarUpload currentAvatar={avatarUrl} onUpload={handleAvatarUpload} disabled={saving} />
          ) : avatarUrl ? (
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
              <User size={40} className="text-blue-300" />
            </div>
          )}
        </div>

        <div className="flex-1 w-full">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">自己紹介</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="自己紹介を入力してください"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">演奏できる楽器</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_INSTRUMENTS.map((instrument) => (
                    <button
                      key={instrument}
                      type="button"
                      onClick={() => handleInstrumentToggle(instrument)}
                      disabled={saving}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        instruments.includes(instrument)
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                      } disabled:opacity-50`}
                    >
                      {instrument}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all shadow-lg disabled:opacity-50">
                  <Save size={16} />
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setName(user.name || '')
                    setBio(user.bio || '')
                    setInstruments(user.instruments ? JSON.parse(user.instruments) : [])
                    setAvatarUrl(user.avatarUrl)
                  }}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-white/20 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50">
                  <X size={16} />
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2 text-white">{user.name}</h2>
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Calendar size={16} />
                <span>登録日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
              {user.bio && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/80 whitespace-pre-wrap">{user.bio}</p>
                </div>
              )}
              {instruments.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Music size={16} className="text-white/60" />
                    <span className="text-sm text-white/60">演奏できる楽器</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {instruments.map((instrument) => (
                      <span
                        key={instrument}
                        className="px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 rounded-full text-sm border border-blue-400/30"
                      >
                        {instrument}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  user.role === 'admin' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                }`}>
                  {user.role === 'admin' ? '管理者' : 'メンバー'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
