'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useSession } from 'next-auth/react'
import { Calendar, MessageSquare, Users } from 'lucide-react'

interface ScheduleResponse {
  id: string
  status: string
  comment: string | null
  user: {
    name: string
    email: string
  }
}

interface ScheduleDate {
  id: string
  date: string
  responses: ScheduleResponse[]
}

interface Schedule {
  id: string
  title: string
  description: string
  dates: ScheduleDate[]
}

export default function SchedulesPage() {
  const { data: session } = useSession()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dates, setDates] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [fetchingSchedules, setFetchingSchedules] = useState(true)
  const [selectedDateComments, setSelectedDateComments] = useState<{[key: string]: string}>({})

  const isAdmin = session?.user?.role === 'admin'

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    setFetchingSchedules(true)
    try {
      const res = await fetch('/api/schedules')
      const data = await res.json()
      setSchedules(data)
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
    } finally {
      setFetchingSchedules(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validDates = dates.filter(d => d.trim() !== '')
      if (validDates.length === 0) {
        alert('少なくとも1つの候補日を入力してください')
        setLoading(false)
        return
      }

      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, dates: validDates })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'スケジュール作成に失敗しました')
        return
      }

      setTitle('')
      setDescription('')
      setDates([''])
      fetchSchedules()
    } catch (error) {
      console.error('Failed to create schedule:', error)
      alert('スケジュール作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (scheduleDateId: string, status: string) => {
    if (!session?.user) return

    const comment = selectedDateComments[scheduleDateId] || ''
    
    // 楽観的UI更新: 即座にUIを更新
    setSchedules(prevSchedules => prevSchedules.map(schedule => ({
      ...schedule,
      dates: schedule.dates.map(date => {
        if (date.id === scheduleDateId) {
          const existingResponse = date.responses.find(r => r.user.email === session.user.email)
          
          if (existingResponse) {
            // 既存の投票を更新
            return {
              ...date,
              responses: date.responses.map(r =>
                r.user.email === session.user.email
                  ? { ...r, status, comment: comment || r.comment }
                  : r
              )
            }
          } else {
            // 新規投票を追加
            return {
              ...date,
              responses: [...date.responses, {
                id: `temp-${Date.now()}`,
                status,
                comment: comment || null,
                user: {
                  name: session.user.name || '',
                  email: session.user.email || ''
                }
              }]
            }
          }
        }
        return date
      })
    })))

    // コメント入力欄をクリア
    setSelectedDateComments({...selectedDateComments, [scheduleDateId]: ''})

    try {
      const res = await fetch(`/api/schedules/${scheduleDateId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment })
      })

      if (!res.ok) {
        // エラー時は元に戻す
        fetchSchedules()
        alert('投票に失敗しました')
      }
    } catch (error) {
      // エラー時は元に戻す
      fetchSchedules()
      console.error('Failed to submit response:', error)
      alert('投票に失敗しました')
    }
  }

  const addDateField = () => {
    setDates([...dates, ''])
  }

  const removeDateField = (index: number) => {
    setDates(dates.filter((_, i) => i !== index))
  }

  const updateDate = (index: number, value: string) => {
    const newDates = [...dates]
    newDates[index] = value
    setDates(newDates)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800'
      case 'unavailable':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '○'
      case 'maybe':
        return '△'
      case 'unavailable':
        return '×'
      default:
        return '-'
    }
  }

  const getMostPopularDate = (dates: ScheduleDate[]): { mostPopular: ScheduleDate | null, maxAvailable: number } => {
    let maxAvailable = -1
    let mostPopular: ScheduleDate | null = null

    dates.forEach(date => {
      const availableCount = date.responses.filter(r => r.status === 'available').length
      if (availableCount > maxAvailable) {
        maxAvailable = availableCount
        mostPopular = date
      }
    })

    return { mostPopular, maxAvailable }
  }

  const getVoteCount = (dateItem: ScheduleDate) => {
    const available = dateItem.responses.filter(r => r.status === 'available').length
    const maybe = dateItem.responses.filter(r => r.status === 'maybe').length
    const unavailable = dateItem.responses.filter(r => r.status === 'unavailable').length
    return { available, maybe, unavailable }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">スケジュール調整</h1>

        {fetchingSchedules ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
        {/* スケジュール一覧 */}
        <div className="space-y-4 sm:space-y-6 mb-8">
          {schedules.map((schedule) => {
            const { mostPopular, maxAvailable } = getMostPopularDate(schedule.dates)
            
            return (
              <div key={schedule.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 border border-white/10">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">{schedule.title}</h3>
                <p className="text-sm sm:text-base text-white/70 mb-4">{schedule.description}</p>

                {/* 最有力候補 */}
                {mostPopular && maxAvailable > 0 && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-xl">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-green-300 text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="flex-shrink-0" />
                        <span className="font-semibold">最有力候補:</span>
                      </div>
                      <span className="truncate">{new Date(mostPopular.date as string).toLocaleString('ja-JP')}</span>
                      <span className="text-xs sm:text-sm">({maxAvailable}人)</span>
                    </div>
                  </div>
                )}

                {/* 候補日ごとの投票 */}
                <div className="space-y-3 sm:space-y-4">
                  {schedule.dates.map((dateItem) => {
                    const votes = getVoteCount(dateItem)
                    return (
                      <div key={dateItem.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-600 flex-shrink-0" />
                            <span className="font-medium text-sm sm:text-base">
                              {new Date(dateItem.date).toLocaleString('ja-JP')}
                            </span>
                          </div>
                          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
                            <span className="text-green-600">○ {votes.available}</span>
                            <span className="text-yellow-600">△ {votes.maybe}</span>
                            <span className="text-red-600">× {votes.unavailable}</span>
                          </div>
                        </div>

                        {/* 投票ボタン */}
                        <div className="mb-3">
                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2">
                            <button
                              onClick={() => handleResponse(dateItem.id, 'available')}
                              className="px-2 sm:px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-xs sm:text-sm font-medium touch-manipulation"
                            >
                              <span className="hidden xs:inline">○ 参加可能</span>
                              <span className="xs:hidden">○</span>
                            </button>
                            <button
                              onClick={() => handleResponse(dateItem.id, 'maybe')}
                              className="px-2 sm:px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs sm:text-sm font-medium touch-manipulation"
                            >
                              <span className="hidden xs:inline">△ 未定</span>
                              <span className="xs:hidden">△</span>
                            </button>
                            <button
                              onClick={() => handleResponse(dateItem.id, 'unavailable')}
                              className="px-2 sm:px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-xs sm:text-sm font-medium touch-manipulation"
                            >
                              <span className="hidden xs:inline">× 参加不可</span>
                              <span className="xs:hidden">×</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="コメント（任意）"
                            value={selectedDateComments[dateItem.id] || ''}
                            onChange={(e) => setSelectedDateComments({
                              ...selectedDateComments,
                              [dateItem.id]: e.target.value
                            })}
                            className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* 回答一覧 */}
                        {dateItem.responses.length > 0 && (
                          <div className="space-y-2">
                            {dateItem.responses.map((response) => (
                              <div key={response.id} className="flex items-start gap-2 text-sm bg-gray-50 p-2 rounded">
                                <span className={`px-2 py-0.5 rounded font-semibold ${getStatusColor(response.status)}`}>
                                  {getStatusText(response.status)}
                                </span>
                                <div className="flex-1">
                                  <span className="font-medium">{response.user.name || response.user.email}</span>
                                  {response.comment && (
                                    <div className="flex items-start gap-1 mt-1 text-gray-600">
                                      <MessageSquare size={14} className="mt-0.5" />
                                      <span>{response.comment}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* スケジュール作成フォーム（管理者のみ） - 最下部 */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">新規スケジュール</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">タイトル</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">詳細</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">候補日</label>
                {dates.map((date, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="datetime-local"
                      value={date}
                      onChange={(e) => updateDate(index, e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {dates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDateField(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        削除
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDateField}
                  className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  候補日を追加
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? '作成中...' : '作成する'}
              </button>
            </form>
          </div>
        )}
        </>
        )}
      </div>
    </DashboardLayout>
  )
}
