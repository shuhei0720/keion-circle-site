import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 });
    }

    // ファイルサイズチェック（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは10MB以下にしてください' }, { status: 400 });
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '画像ファイルのみアップロード可能です' }, { status: 400 });
    }

    // アップロードディレクトリを確保
    const uploadsDir = path.join(process.cwd(), 'public', 'post-images');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }

    // ファイル名を生成
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // ファイルを保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const imageUrl = `/post-images/${filename}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 });
  }
}
