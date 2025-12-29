import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Geocoding API
 * 場所名から座標を取得してGoogle Mapsリンクを生成
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get('location')

    if (!location) {
      return NextResponse.json({ error: '場所名が必要です' }, { status: 400 })
    }

    console.log('🔍 Geocoding検索:', location)

    // 検索パターン: 場所名、場所名+日本、場所名+主要都市
    const searchPatterns = [
      location,
      `${location} 日本`,
      `${location} 大阪`,
      `${location} 東京`,
      `${location} Japan`
    ]

    // 各パターンで検索を試行
    for (const pattern of searchPatterns) {
      console.log('🔎 試行:', pattern)
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pattern)}&format=json&limit=1&accept-language=ja`,
        {
          headers: {
            'User-Agent': 'BOLD-Keion-Circle-Site/1.0'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        
        if (data && data.length > 0) {
          const place = data[0]
          const lat = parseFloat(place.lat)
          const lon = parseFloat(place.lon)
          const displayName = place.display_name

          // Google Mapsの座標リンク
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`

          console.log('✅ 座標URL生成 (パターン:', pattern, '):', mapsUrl)

          return NextResponse.json({
            url: mapsUrl,
            lat,
            lon,
            displayName,
            searchPattern: pattern,
            success: true
          })
        }
      }
      
      // 1秒待機（Nominatim APIのレート制限対策）
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('⚠️ すべての検索パターンで結果なし、検索URLを返す')
    
    // すべての検索で見つからない場合は、Google Maps検索URLを返す
    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    
    return NextResponse.json({
      url: searchUrl,
      success: false,
      message: '正確な場所が見つかりませんでした。Google Maps検索URLを返します。このURLをクリックすると検索結果が表示されます。'
    })

  } catch (error) {
    console.error('❌ Geocoding エラー:', error)
    
    const location = request.nextUrl.searchParams.get('location')
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || '')}`
    
    return NextResponse.json({
      url: fallbackUrl,
      success: false,
      error: 'Geocoding に失敗しました。検索URLを返します。'
    })
  }
}
