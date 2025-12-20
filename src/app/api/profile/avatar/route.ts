import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File;

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
    const uploadsDir = path.join(process.cwd(), 'public', 'avatars');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }

    // ファイル名を生成（ユーザーIDとタイムスタンプ）
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${session.user.id}-${timestamp}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // ファイルを保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // DBに保存
    const avatarUrl = `/avatars/${filename}`;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    });

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error('アバターアップロードエラー:', error);
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 });
  }
}
