import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// プロフィール取得
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        instrument: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return NextResponse.json({ error: 'プロフィール取得に失敗しました' }, { status: 500 });
  }
}

// プロフィール更新
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { name, avatarUrl, bio, instrument } = await req.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        avatarUrl: avatarUrl || undefined,
        bio: bio || undefined,
        instrument: instrument || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        instrument: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json({ error: 'プロフィール更新に失敗しました' }, { status: 500 });
  }
}
