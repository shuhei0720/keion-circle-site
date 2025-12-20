import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ファイルサイズ制限 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB' }, { status: 400 })
    }

    // アップロードディレクトリの作成
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }

    // ファイル名の生成（タイムスタンプ + オリジナル名）
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${sanitizedFileName}`
    const filePath = join(uploadDir, fileName)

    // ファイルの保存
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URLを返す
    const fileUrl = `/uploads/${fileName}`
    
    return NextResponse.json({
      fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
