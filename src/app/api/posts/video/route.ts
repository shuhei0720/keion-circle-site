import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2'

export const runtime = 'nodejs'

// Presigned URL生成（管理者のみ）
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

    const body = await request.json()
    const { fileName, fileType } = body

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'ファイル名とタイプが必要です' }, { status: 400 })
    }

    // ファイルタイプチェック
    if (!fileType.startsWith('video/')) {
      return NextResponse.json({ error: '動画ファイルのみアップロード可能です' }, { status: 400 })
    }

    // ファイル名生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = fileName.split('.').pop()
    const key = `videos/${timestamp}-${randomString}.${extension}`

    // Presigned URL生成（15分有効）
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType
    })

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 })
    const publicUrl = `${R2_PUBLIC_URL}/${key}`

    return NextResponse.json({ uploadUrl, publicUrl })
  } catch (error) {
    console.error('Failed to generate presigned URL:', error)
    return NextResponse.json(
      { error: 'Presigned URLの生成に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// 動画削除（管理者のみ）
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者チェック
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '動画の削除は管理者のみ可能です' }, { status: 403 })
    }

    const body = await request.json()
    const { videoUrl } = body

    if (!videoUrl) {
      return NextResponse.json({ error: '動画URLが必要です' }, { status: 400 })
    }

    // URLからキーを抽出
    const key = videoUrl.replace(`${R2_PUBLIC_URL}/`, '')

    // R2から削除
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key
    })

    await r2Client.send(command)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete video:', error)
    return NextResponse.json(
      { error: '動画の削除に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
