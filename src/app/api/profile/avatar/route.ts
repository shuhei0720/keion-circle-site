import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Supabaseクライアントのチェック
    if (!supabase) {
      console.error('Supabase client is not configured')
      return NextResponse.json({ 
        error: 'Supabase Storageが設定されていません。環境変数を確認してください。',
        details: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
      }, { status: 500 })
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('avatar') as File

    if (!file || file.size === 0) {
      // アバター削除
      await prisma.user.update({
        where: { id: session.user.id },
        data: { avatarUrl: null },
      })
      return NextResponse.json({ avatarUrl: null })
    }

    // ファイルの検証
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '画像ファイルのみアップロード可能です' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは5MB以下にしてください' }, { status: 400 })
    }

    // ファイルをバイト配列に変換
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Supabase Storageにアップロード
    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'アップロードに失敗しました: ' + uploadError.message }, { status: 500 })
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // データベース更新
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    })

    return NextResponse.json({ avatarUrl: updatedUser.avatarUrl })
  } catch (error) {
    console.error('Avatar upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'アップロードに失敗しました',
      details: errorMessage
    }, { status: 500 })
  }
}
