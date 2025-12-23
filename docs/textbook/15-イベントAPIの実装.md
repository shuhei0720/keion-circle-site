# 第15章：イベントAPIの実装

この章では、イベント管理機能のAPIを実装していきます。イベントの作成、参加管理、活動報告との連携を含みます。

## 15.1 イベントAPI設計

### エンドポイント一覧

```
GET    /api/events              - イベント一覧を取得
GET    /api/events/:id          - イベント詳細を取得
POST   /api/events              - 新しいイベントを作成（管理者のみ）
PUT    /api/events/:id          - イベントを更新（管理者のみ）
DELETE /api/events/:id          - イベントを削除（管理者のみ）

POST   /api/events/:id/participate  - イベントに参加表明
DELETE /api/events/:id/participate  - 参加をキャンセル
PUT    /api/events/:id/status       - 参加ステータスを更新
```

### イベントデータの形式

```typescript
interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  location?: string;
  participation: Participation[];
  schedules: Schedule[];
  createdAt: Date;
  updatedAt: Date;
}

interface Participation {
  id: string;
  userId: string;
  user: User;
  eventId: string;
  status: '参加予定' | '参加した' | '不参加';
  createdAt: Date;
}
```

---

## 15.2 イベント一覧API

### app/api/events/route.ts（GET）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const past = searchParams.get('past') === 'true';
    
    // 現在時刻
    const now = new Date();
    
    // 絞り込み条件
    const where: any = {};
    
    if (upcoming) {
      // 今後のイベント
      where.date = { gte: now };
    } else if (past) {
      // 過去のイベント
      where.date = { lt: now };
    }
    
    const events = await prisma.event.findMany({
      where,
      include: {
        // 参加者情報
        participation: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        // スケジュール情報
        schedules: {
          select: {
            id: true,
            title: true,
          },
        },
        // 参加者数のカウント
        _count: {
          select: {
            participation: true,
          },
        },
      },
      orderBy: {
        date: upcoming ? 'asc' : 'desc',
      },
    });
    
    // ステータス別に集計
    const eventsWithStats = events.map(event => {
      const participants = event.participation;
      const attending = participants.filter(p => p.status === '参加予定' || p.status === '参加した');
      const notAttending = participants.filter(p => p.status === '不参加');
      
      return {
        ...event,
        stats: {
          attending: attending.length,
          notAttending: notAttending.length,
          total: participants.length,
        },
        isPast: event.date < now,
      };
    });
    
    return NextResponse.json(eventsWithStats);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'イベントの取得に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
// app/events/page.tsx
async function getEvents(upcoming: boolean = true) {
  const response = await fetch(`/api/events?upcoming=${upcoming}`, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  
  return response.json();
}

export default async function EventsPage() {
  const upcomingEvents = await getEvents(true);
  const pastEvents = await getEvents(false);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">イベント</h1>
      
      {/* 今後のイベント */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🎉 今後のイベント</h2>
        
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-600">予定されているイベントはありません</p>
        ) : (
          <div className="grid gap-4">
            {upcomingEvents.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
      
      {/* 過去のイベント */}
      <section>
        <h2 className="text-2xl font-bold mb-4">📅 過去のイベント</h2>
        
        {pastEvents.length === 0 ? (
          <p className="text-gray-600">過去のイベントはありません</p>
        ) : (
          <div className="grid gap-4">
            {pastEvents.map((event: any) => (
              <EventCard key={event.id} event={event} isPast />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({ event, isPast = false }: { event: any; isPast?: boolean }) {
  return (
    <a
      href={`/events/${event.id}`}
      className="block border rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold">{event.title}</h3>
        {isPast && (
          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-sm rounded">
            終了
          </span>
        )}
      </div>
      
      <div className="space-y-2 text-gray-600 mb-4">
        <p className="flex items-center gap-2">
          📅 {new Date(event.date).toLocaleString('ja-JP')}
        </p>
        {event.location && (
          <p className="flex items-center gap-2">
            📍 {event.location}
          </p>
        )}
      </div>
      
      {event.description && (
        <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
      )}
      
      <div className="flex items-center gap-4 text-sm">
        <span className="text-green-600">
          ✓ {event.stats.attending} 参加
        </span>
        <span className="text-red-600">
          ✗ {event.stats.notAttending} 不参加
        </span>
      </div>
    </a>
  );
}
```

---

## 15.3 イベント作成API

### app/api/events/route.ts（POST）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // 管理者チェック
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'イベントの作成は管理者のみ可能です' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, date, location } = body;
    
    // バリデーション
    if (!title || !date) {
      return NextResponse.json(
        { error: 'タイトルと日時は必須です' },
        { status: 400 }
      );
    }
    
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: '無効な日時形式です' },
        { status: 400 }
      );
    }
    
    // 過去の日時はエラー
    if (eventDate < new Date()) {
      return NextResponse.json(
        { error: '過去の日時は設定できません' },
        { status: 400 }
      );
    }
    
    // イベントを作成
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: eventDate,
        location,
      },
      include: {
        _count: {
          select: {
            participation: true,
          },
        },
      },
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'イベントの作成に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 15.4 イベント詳細API

### app/api/events/[id]/route.ts（GET）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        // 参加者
        participation: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                instrument: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        // スケジュール
        schedules: {
          include: {
            candidates: {
              select: {
                id: true,
                datetime: true,
                location: true,
              },
            },
          },
        },
      },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }
    
    // ステータス別に参加者を分類
    const attending = event.participation.filter(
      p => p.status === '参加予定' || p.status === '参加した'
    );
    const notAttending = event.participation.filter(
      p => p.status === '不参加'
    );
    
    return NextResponse.json({
      ...event,
      isPast: event.date < new Date(),
      stats: {
        attending: attending.length,
        notAttending: notAttending.length,
        total: event.participation.length,
      },
      attendingUsers: attending.map(p => p.user),
      notAttendingUsers: notAttending.map(p => p.user),
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'イベントの取得に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 15.5 参加表明API

### app/api/events/[id]/participate/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 参加表明
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: eventId } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // イベントが存在するか確認
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }
    
    // 既に参加表明しているか確認
    const existing = await prisma.participation.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });
    
    if (existing) {
      return NextResponse.json(
        { error: '既に参加表明しています' },
        { status: 400 }
      );
    }
    
    // 参加表明を作成
    const participation = await prisma.participation.create({
      data: {
        userId: session.user.id,
        eventId,
        status: '参加予定',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    console.error('Error creating participation:', error);
    return NextResponse.json(
      { error: '参加表明に失敗しました' },
      { status: 500 }
    );
  }
}

// 参加キャンセル
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: eventId } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // 参加表明を検索
    const participation = await prisma.participation.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });
    
    if (!participation) {
      return NextResponse.json(
        { error: '参加表明が見つかりません' },
        { status: 404 }
      );
    }
    
    // 参加表明を削除
    await prisma.participation.delete({
      where: { id: participation.id },
    });
    
    return NextResponse.json({
      success: true,
      message: '参加をキャンセルしました',
    });
  } catch (error) {
    console.error('Error deleting participation:', error);
    return NextResponse.json(
      { error: '参加キャンセルに失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ParticipateButtonProps {
  eventId: string;
  isParticipating: boolean;
}

export default function ParticipateButton({
  eventId,
  isParticipating: initialState,
}: ParticipateButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isParticipating, setIsParticipating] = useState(initialState);
  
  const handleToggle = async () => {
    // 楽観的UI更新
    setIsParticipating(!isParticipating);
    
    try {
      const method = isParticipating ? 'DELETE' : 'POST';
      const response = await fetch(`/api/events/${eventId}/participate`, {
        method,
      });
      
      if (!response.ok) {
        // エラー時は元に戻す
        setIsParticipating(isParticipating);
        const data = await response.json();
        throw new Error(data.error);
      }
      
      // サーバーデータを更新
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : '処理に失敗しました');
    }
  };
  
  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
        isParticipating
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {isParticipating ? '参加をキャンセル' : '参加する'}
    </button>
  );
}
```

---

## 15.6 参加ステータス更新API

### app/api/events/[id]/status/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: eventId } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { status } = body;
    
    // バリデーション
    if (!['参加予定', '参加した', '不参加'].includes(status)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      );
    }
    
    // 参加表明を検索
    const participation = await prisma.participation.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });
    
    if (!participation) {
      return NextResponse.json(
        { error: '参加表明が見つかりません' },
        { status: 404 }
      );
    }
    
    // ステータスを更新
    const updated = await prisma.participation.update({
      where: { id: participation.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'ステータスの更新に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 15.7 イベントから活動報告を作成

### app/api/events/[id]/create-post/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: eventId } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // 管理者チェック
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '投稿の作成は管理者のみ可能です' },
        { status: 403 }
      );
    }
    
    // イベントを取得
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participation: {
          where: {
            status: '参加した',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { title, content, youtubeUrls, images } = body;
    
    // バリデーション
    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      );
    }
    
    // トランザクションで投稿と参加情報を作成
    const result = await prisma.$transaction(async (tx) => {
      // 投稿を作成
      const post = await tx.post.create({
        data: {
          title,
          content,
          youtubeUrls: youtubeUrls || [],
          images: images || [],
          authorId: session.user.id,
        },
      });
      
      // 参加者を投稿に紐付け
      const participations = await Promise.all(
        event.participation.map(p =>
          tx.participation.create({
            data: {
              userId: p.userId,
              postId: post.id,
              status: '参加した',
            },
          })
        )
      );
      
      return { post, participations };
    });
    
    return NextResponse.json(result.post, { status: 201 });
  } catch (error) {
    console.error('Error creating post from event:', error);
    return NextResponse.json(
      { error: '投稿の作成に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreatePostFromEventProps {
  event: {
    id: string;
    title: string;
    date: Date;
    location?: string;
  };
}

export default function CreatePostFromEvent({ event }: CreatePostFromEventProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: `${event.title}の活動報告`,
    content: `${new Date(event.date).toLocaleDateString('ja-JP')}に${event.location || ''}で開催された「${event.title}」の活動報告です。\n\n`,
    youtubeUrls: [''],
  });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/events/${event.id}/create-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          youtubeUrls: formData.youtubeUrls.filter(url => url.trim() !== ''),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      
      const post = await response.json();
      router.push(`/posts/${post.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '投稿の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">活動報告を作成</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">タイトル</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">内容</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          rows={10}
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '作成中...' : '活動報告を作成'}
      </button>
    </form>
  );
}
```

---

## 15.8 イベント更新・削除API

### app/api/events/[id]/route.ts（PUT, DELETE）

```typescript
// 更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者のみ実行可能です' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, date, location } = body;
    
    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(location !== undefined && { location }),
      },
      include: {
        _count: {
          select: {
            participation: true,
          },
        },
      },
    });
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'イベントの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者のみ実行可能です' },
        { status: 403 }
      );
    }
    
    await prisma.event.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'イベントを削除しました',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'イベントの削除に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## まとめ

この章では、イベントAPIの実装について学びました：

### CRUD API
- ✅ **GET /api/events**: イベント一覧取得（今後/過去でフィルタ）
- ✅ **POST /api/events**: イベント作成（管理者のみ）
- ✅ **GET /api/events/:id**: イベント詳細取得
- ✅ **PUT /api/events/:id**: イベント更新（管理者のみ）
- ✅ **DELETE /api/events/:id**: イベント削除（管理者のみ）

### 参加管理
- ✅ **POST /api/events/:id/participate**: 参加表明
- ✅ **DELETE /api/events/:id/participate**: 参加キャンセル
- ✅ **PUT /api/events/:id/status**: 参加ステータス更新

### 高度な機能
- ✅ **活動報告作成**: イベントから投稿を自動生成
- ✅ **参加者統計**: 参加/不参加の集計
- ✅ **楽観的UI更新**: 即座に画面に反映

次の章では、**画像アップロードAPIの実装**について詳しく見ていきます。

---

[← 前の章：第14章 ユーザーAPIの実装](14-ユーザーAPIの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第16章 画像アップロードAPIの実装 →](16-画像アップロードAPIの実装.md)
