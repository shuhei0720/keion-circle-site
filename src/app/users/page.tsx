'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useSession } from 'next-auth/react'
import { Users, Trash2, Shield, User, Mail, Calendar, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserData {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
  _count: {
    posts: number
    messages: number
    schedules: number
  }
}

interface RoleChangeModal {
  userId: string
  currentRole: string
  userName: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [roleChangeModal, setRoleChangeModal] = useState<RoleChangeModal | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')

  const isSiteAdmin = session?.user?.role === 'site_admin'

  // デバッグ用ログ
  useEffect(() => {
    console.log('[UsersPage] Status:', status)
    console.log('[UsersPage] Session:', session)
    console.log('[UsersPage] User role:', session?.user?.role)
    console.log('[UsersPage] isSiteAdmin:', isSiteAdmin)
  }, [session, status, isSiteAdmin])

  useEffect(() => {
    // 認証状態が確定するまで待つ
    if (status === 'loading') return
    
    if (!session || !isSiteAdmin) {
      console.log('[UsersPage] Access denied - redirecting to /')
      router.replace('/')
      return
    }
    
    fetchUsers()
  }, [session, isSiteAdmin, router, status])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        alert('ユーザー一覧の取得に失敗しました')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      alert('ユーザー一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string, userName: string | null) => {
    if (!confirm(`ユーザー「${userName || 'Unknown'}」を削除しますか？\nこの操作は取り消せません。`)) {
      return
    }

    // 楽観的UI更新: 即座にUIからユーザーを削除
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId))

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        // エラー時は元に戻す
        fetchUsers()
        const error = await res.json()
        alert(error.error || 'ユーザーの削除に失敗しました')
      }
    } catch (error) {
      // エラー時は元に戻す
      fetchUsers()
      console.error('Failed to delete user:', error)
      alert('ユーザーの削除に失敗しました')
    }
  }

  const handleRoleChange = async (userId: string, currentRole: string, userName: string) => {
    setRoleChangeModal({ userId, currentRole, userName })
    setSelectedRole(currentRole)
  }

  const confirmRoleChange = async () => {
    if (!roleChangeModal || selectedRole === roleChangeModal.currentRole) {
      setRoleChangeModal(null)
      return
    }

    const { userId } = roleChangeModal

    // 楽観的UI更新: 即座に役割を変更
    setUsers(prevUsers => prevUsers.map(u => 
      u.id === userId ? { ...u, role: selectedRole } : u
    ))
    setRoleChangeModal(null)

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      })

      if (!res.ok) {
        // エラー時は元に戻す
        fetchUsers()
        const error = await res.json()
        alert(error.error || '役割の変更に失敗しました')
      }
    } catch (error) {
      // エラー時は元に戻す
      fetchUsers()
      console.error('Failed to update role:', error)
      alert('役割の変更に失敗しました')
    }
  }

  if (!isSiteAdmin) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">ユーザー管理</h1>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <>
            {/* デスクトップ: テーブル表示 */}
            <div className="hidden md:block bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        ユーザー
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        役割
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        登録日
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        活動
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/5 divide-y divide-white/10">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-white">{user.name || 'Unknown'}</div>
                              <div className="flex items-center gap-1 text-sm text-white/60">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRoleChange(user.id, user.role, user.name || user.email || 'Unknown')}
                            disabled={user.id === session.user.id}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'site_admin'
                                ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                                : user.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                                : 'bg-white/10 text-white/80 border border-white/20'
                            } ${user.id !== session.user.id ? 'hover:opacity-75 cursor-pointer' : 'opacity-50'}`}
                          >
                            {user.role === 'site_admin' ? (
                              <>
                                <Shield className="h-3 w-3" />
                                サイト管理者
                              </>
                            ) : user.role === 'admin' ? (
                              <>
                                <Shield className="h-3 w-3" />
                                管理者
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3" />
                                通常
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70">
                          <div className="space-y-1">
                            <div>投稿: {user._count.posts}</div>
                            <div>メッセージ: {user._count.messages}</div>
                            <div>スケジュール投票: {user._count.schedules}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={user.id === session.user.id}
                            className={`p-2 rounded ${
                              user.id === session.user.id
                                ? 'text-gray-500 cursor-not-allowed'
                                : 'text-red-400 hover:bg-red-500/20'
                            }`}
                            title={user.id === session.user.id ? '自分自身は削除できません' : 'ユーザーを削除'}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <div className="text-center py-12 text-white/50">
                  ユーザーが見つかりません
                </div>
              )}
            </div>

            {/* モバイル: カード表示 */}
            <div className="md:hidden space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-12 text-white/50 bg-white/10 rounded-2xl shadow-xl border border-white/10">
                  ユーザーが見つかりません
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/10">
                    {/* ユーザー情報 */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-lg">{user.name || 'Unknown'}</div>
                        <div className="flex items-center gap-1 text-sm text-white/60 truncate">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* 役割 */}
                    <div className="mb-3">
                      <button
                        onClick={() => handleRoleChange(user.id, user.role, user.name || user.email || 'Unknown')}
                        disabled={user.id === session.user.id}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold w-full justify-center touch-manipulation ${
                          user.role === 'site_admin'
                            ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                            : user.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                            : 'bg-white/10 text-white border border-white/20'
                        } ${user.id !== session.user.id ? 'hover:opacity-75 active:scale-95' : 'opacity-50'}`}
                      >
                        {user.role === 'site_admin' ? (
                          <>
                            <Shield className="h-4 w-4" />
                            サイト管理者
                          </>
                        ) : user.role === 'admin' ? (
                          <>
                            <Shield className="h-4 w-4" />
                            管理者
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4" />
                            通常ユーザー
                          </>
                        )}
                      </button>
                    </div>

                    {/* 登録日 */}
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>登録日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}</span>
                    </div>

                    {/* 活動統計 */}
                    <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-center">
                        <div className="text-xs text-white/50">投稿</div>
                        <div className="text-lg font-semibold text-white">{user._count.posts}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/50">メッセージ</div>
                        <div className="text-lg font-semibold text-white">{user._count.messages}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/50">投票</div>
                        <div className="text-lg font-semibold text-white">{user._count.schedules}</div>
                      </div>
                    </div>

                    {/* 削除ボタン */}
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      disabled={user.id === session.user.id}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold touch-manipulation ${
                        user.id === session.user.id
                          ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                          : 'bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 active:scale-95'
                      }`}
                    >
                      <Trash2 size={18} />
                      {user.id === session.user.id ? '削除不可（自分自身）' : 'ユーザーを削除'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="mt-6 p-3 sm:p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-yellow-300 mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm text-yellow-200">
              <p className="font-semibold mb-1">注意事項</p>
              <ul className="list-disc list-inside space-y-1">
                <li>ユーザーを削除すると、そのユーザーの投稿、メッセージ、スケジュール投票もすべて削除されます</li>
                <li>自分自身を削除または役割変更することはできません</li>
                <li>役割をタップすると、サイト管理者・管理者・一般ユーザーを選択できます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 役割変更モーダル */}
      {roleChangeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full border border-white/20 overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6" />
                役割の変更
              </h3>
              <button
                onClick={() => setRoleChangeModal(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-white/80 mb-1">ユーザー:</p>
                <p className="text-white font-semibold">{roleChangeModal.userName}</p>
              </div>

              <div className="mb-6">
                <p className="text-white/80 mb-3">新しい役割を選択:</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 border border-white/10 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="site_admin"
                      checked={selectedRole === 'site_admin'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-5 h-5 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-300" />
                        <span className="font-semibold text-red-300">サイト管理者</span>
                      </div>
                      <p className="text-xs text-white/60 mt-1">すべての権限（ユーザー管理含む）</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 border border-white/10 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={selectedRole === 'admin'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-300" />
                        <span className="font-semibold text-purple-300">管理者</span>
                      </div>
                      <p className="text-xs text-white/60 mt-1">投稿・イベント・スケジュール管理</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 border border-white/10 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      checked={selectedRole === 'member'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-white/80" />
                        <span className="font-semibold text-white">一般ユーザー</span>
                      </div>
                      <p className="text-xs text-white/60 mt-1">閲覧・コメント・参加登録</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* ボタン */}
              <div className="flex gap-3">
                <button
                  onClick={() => setRoleChangeModal(null)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-semibold border border-white/20"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmRoleChange}
                  disabled={selectedRole === roleChangeModal.currentRole}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  変更する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
