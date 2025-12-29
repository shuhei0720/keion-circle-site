import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * YouTube検索API
 * 曲名からYouTube動画URLを検索
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'クエリが必要です' }, { status: 400 })
    }

    // YouTube Data APIキーが設定されている場合はAPIを使用
    const apiKey = process.env.YOUTUBE_API_KEY

    if (apiKey) {
      // YouTube Data API v3を使用
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`
      )

      if (!response.ok) {
        throw new Error('YouTube API呼び出しに失敗しました')
      }

      const data = await response.json()
      
      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId
        const url = `https://www.youtube.com/watch?v=${videoId}`
        const title = data.items[0].snippet.title
        
        return NextResponse.json({ 
          url, 
          title,
          videoId 
        })
      }
    } else {
      // APIキーがない場合は検索URLを返す
      // ユーザーが手動で選択できるように検索結果ページを開く
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      
      return NextResponse.json({ 
        url: searchUrl,
        title: query,
        isSearchUrl: true,
        message: 'YouTube Data APIキーが設定されていません。検索結果ページのURLを返します。'
      })
    }

    return NextResponse.json({ error: '検索結果が見つかりませんでした' }, { status: 404 })
    
  } catch (error) {
    console.error('YouTube検索エラー:', error)
    return NextResponse.json(
      { error: 'YouTube検索に失敗しました' },
      { status: 500 }
    )
  }
}
