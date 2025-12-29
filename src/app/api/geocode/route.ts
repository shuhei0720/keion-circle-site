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

    // OpenStreetMap Nominatim APIを使用（無料、APIキー不要）
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&accept-language=ja`,
      {
        headers: {
          'User-Agent': 'BOLD-Keion-Circle-Site/1.0'
        }
      }
    )

    if (!response.ok) {
      console.error('❌ Nominatim API呼び出し失敗:', response.status)
      throw new Error('Geocoding API呼び出しに失敗しました')
    }

    const data = await response.json()
    console.log('📍 Nominatim結果:', data)

    if (data && data.length > 0) {
      const place = data[0]
      const lat = parseFloat(place.lat)
      const lon = parseFloat(place.lon)
      const displayName = place.display_name

      // Google Mapsの座標リンク（@マーカー形式）
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`

      console.log('✅ 座標URL生成:', mapsUrl)

      return NextResponse.json({
        url: mapsUrl,
        lat,
        lon,
        displayName,
        success: true
      })
    }

    console.log('⚠️ 検索結果なし、フォールバック')
    // 結果が見つからない場合は検索URLを返す
    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    
    return NextResponse.json({
      url: searchUrl,
      success: false,
      message: '正確な場所が見つかりませんでした。検索URLを返します。'
    })

  } catch (error) {
    console.error('❌ Geocoding エラー:', error)
    
    // エラー時は検索URLを返す
    const location = request.nextUrl.searchParams.get('location')
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || '')}`
    
    return NextResponse.json({
      url: fallbackUrl,
      success: false,
      error: 'Geocoding に失敗しました。検索URLを返します。'
    })
  }
}
