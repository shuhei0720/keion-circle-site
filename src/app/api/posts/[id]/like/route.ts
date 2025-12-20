import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// いいねを登録
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { id: postId } = await params;
    const userId = session.user.id!;

    // 既存のいいねを確認
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json({ error: '既にいいね済みです' }, { status: 400 });
    }

    // いいねを作成
    const like = await prisma.postLike.create({
      data: {
        postId,
        userId,
      },
    });

    return NextResponse.json(like);
  } catch (error) {
    console.error('いいね登録エラー:', error);
    return NextResponse.json({ error: 'いいね登録に失敗しました' }, { status: 500 });
  }
}

// いいねを削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { id: postId } = await params;
    const userId = session.user.id!;

    await prisma.postLike.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return NextResponse.json({ message: 'いいねを削除しました' });
  } catch (error) {
    console.error('いいね削除エラー:', error);
    return NextResponse.json({ error: 'いいね削除に失敗しました' }, { status: 500 });
  }
}
