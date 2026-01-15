import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2'

export const runtime = 'nodejs'

// 動画アップロード（管理者のみ）
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者チェック
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '動画のアップロードは管理者のみ可能です' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('video') as File

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })
    }

    // ファイルサイズチェック（500MB上限）
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'ファイルサイズが大きすぎます（上限: 500MB）' }, { status: 400 })
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: '動画ファイルのみアップロード可能です' }, { status: 400 })
    }

    // ファイル名生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const fileName = `videos/${timestamp}-${randomString}.${extension}`

    // ファイルをバイト配列に変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // R2にアップロード
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        ContentLength: file.size,
      })
    )

    // 公開URLを生成
    const videoUrl = `${R2_PUBLIC_URL}/${fileName}`

    return NextResponse.json({ url: videoUrl })
  } catch (error) {
    console.error('Failed to upload video:', error)
    return NextResponse.json(
      { error: '動画のアップロードに失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
