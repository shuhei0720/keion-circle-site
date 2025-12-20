import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// 投稿への参加/不参加を登録
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { status } = await req.json();
    if (!status || !['participating', 'not_participating'].includes(status)) {
      return NextResponse.json({ error: '無効なステータスです' }, { status: 400 });
    }

    const { id: postId } = await params;
    const userId = session.user.id!;

    // 既存の参加情報を確認
    const existingParticipation = await prisma.postParticipant.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingParticipation) {
      // 既存の参加情報を更新
      const participation = await prisma.postParticipant.update({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
        data: {
          status,
        },
      });
      return NextResponse.json(participation);
    } else {
      // 新規参加情報を作成
      const participation = await prisma.postParticipant.create({
        data: {
          postId,
          userId,
          status,
        },
      });
      return NextResponse.json(participation);
    }
  } catch (error) {
    console.error('参加登録エラー:', error);
    return NextResponse.json({ error: '参加登録に失敗しました' }, { status: 500 });
  }
}

// 参加をキャンセル（削除）
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

    await prisma.postParticipant.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return NextResponse.json({ message: '参加をキャンセルしました' });
  } catch (error) {
    console.error('参加キャンセルエラー:', error);
    return NextResponse.json({ error: '参加キャンセルに失敗しました' }, { status: 500 });
  }
}
