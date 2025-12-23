# 第13章：スケジュールAPIの実装

この章では、スケジュール調整機能のAPIを実装していきます。複数候補日の管理、投票機能、コメント機能を含みます。

## 13.1 スケジュール機能の概要

### データ構造

```
Schedule（スケジュール）
  ├── ScheduleCandidate（候補日）１
  │   ├── ScheduleVote（投票）複数
  │   └── ScheduleCandidateComment（コメント）複数
  ├── ScheduleCandidate（候補日）２
  │   ├── ScheduleVote（投票）複数
  │   └── ScheduleCandidateComment（コメント）複数
  └── ...
```

### エンドポイント一覧

```
GET    /api/schedules              - スケジュール一覧を取得
GET    /api/schedules/:id          - スケジュール詳細を取得
POST   /api/schedules              - 新しいスケジュールを作成（管理者のみ）
PUT    /api/schedules/:id          - スケジュールを更新（管理者のみ）
DELETE /api/schedules/:id          - スケジュールを削除（管理者のみ）

POST   /api/schedules/:id/vote     - 候補日に投票
POST   /api/schedules/:id/comment  - 候補日にコメント
```

---

## 13.2 スケジュール一覧API

### app/api/schedules/route.ts（GET）

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        // 候補日を含める
        candidates: {
          include: {
            // 各候補日の投票数を集計
            _count: {
              select: {
                votes: true,
                comments: true,
              },
            },
            // 投票内容（参加可能/未定/参加不可の内訳）
            votes: {
              select: {
                response: true,
              },
            },
          },
          orderBy: {
            datetime: 'asc', // 日時順
          },
        },
        // イベント情報
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // 各候補日の投票結果を集計
    const schedulesWithStats = schedules.map(schedule => ({
      ...schedule,
      candidates: schedule.candidates.map(candidate => {
        const votes = candidate.votes;
        const available = votes.filter(v => v.response === '参加可能').length;
        const maybe = votes.filter(v => v.response === '未定').length;
        const unavailable = votes.filter(v => v.response === '参加不可').length;
        
        return {
          id: candidate.id,
          datetime: candidate.datetime,
          location: candidate.location,
          stats: {
            available,
            maybe,
            unavailable,
            total: votes.length,
          },
          commentCount: candidate._count.comments,
        };
      }),
    }));
    
    return NextResponse.json(schedulesWithStats);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'スケジュールの取得に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
// app/schedules/page.tsx
async function getSchedules() {
  const response = await fetch('/api/schedules', {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch schedules');
  }
  
  return response.json();
}

export default async function SchedulesPage() {
  const schedules = await getSchedules();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">スケジュール調整</h1>
      
      {schedules.map((schedule) => (
        <div key={schedule.id} className="border rounded-lg p-6 mb-4">
          <h2 className="text-xl font-bold mb-2">{schedule.title}</h2>
          <p className="text-gray-600 mb-4">{schedule.description}</p>
          
          <div className="space-y-2">
            {schedule.candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">
                    {new Date(candidate.datetime).toLocaleString('ja-JP')}
                  </p>
                  {candidate.location && (
                    <p className="text-sm text-gray-600">📍 {candidate.location}</p>
                  )}
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">
                    ✓ {candidate.stats.available}
                  </span>
                  <span className="text-yellow-600">
                    ? {candidate.stats.maybe}
                  </span>
                  <span className="text-red-600">
                    ✗ {candidate.stats.unavailable}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 13.3 スケジュール作成API

### app/api/schedules/route.ts（POST）

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
        { error: 'スケジュールの作成は管理者のみ可能です' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, eventId, candidates } = body;
    
    // バリデーション
    if (!title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }
    
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json(
        { error: '候補日を少なくとも1つ設定してください' },
        { status: 400 }
      );
    }
    
    // 候補日のバリデーション
    for (const candidate of candidates) {
      if (!candidate.datetime) {
        return NextResponse.json(
          { error: '候補日の日時は必須です' },
          { status: 400 }
        );
      }
      
      const date = new Date(candidate.datetime);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: '無効な日時形式です' },
          { status: 400 }
        );
      }
    }
    
    // トランザクションでスケジュールと候補日を同時に作成
    const schedule = await prisma.schedule.create({
      data: {
        title,
        description,
        eventId,
        candidates: {
          create: candidates.map((candidate: any) => ({
            datetime: new Date(candidate.datetime),
            location: candidate.location || null,
          })),
        },
      },
      include: {
        candidates: {
          orderBy: {
            datetime: 'asc',
          },
        },
      },
    });
    
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'スケジュールの作成に失敗しました' },
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

export default function NewSchedulePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    candidates: [
      { datetime: '', location: '' },
    ],
  });
  
  const addCandidate = () => {
    setFormData({
      ...formData,
      candidates: [...formData.candidates, { datetime: '', location: '' }],
    });
  };
  
  const removeCandidate = (index: number) => {
    setFormData({
      ...formData,
      candidates: formData.candidates.filter((_, i) => i !== index),
    });
  };
  
  const updateCandidate = (index: number, field: string, value: string) => {
    const newCandidates = [...formData.candidates];
    newCandidates[index] = { ...newCandidates[index], [field]: value };
    setFormData({ ...formData, candidates: newCandidates });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      
      const schedule = await response.json();
      router.push(`/schedules/${schedule.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">新しいスケジュール調整</h1>
      
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
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">説明</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          rows={3}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">候補日</label>
        
        {formData.candidates.map((candidate, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="datetime-local"
              value={candidate.datetime}
              onChange={(e) => updateCandidate(index, 'datetime', e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              value={candidate.location}
              onChange={(e) => updateCandidate(index, 'location', e.target.value)}
              placeholder="場所（任意）"
              className="flex-1 px-3 py-2 border rounded"
            />
            {formData.candidates.length > 1 && (
              <button
                type="button"
                onClick={() => removeCandidate(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
              >
                削除
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addCandidate}
          className="mt-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
        >
          + 候補日を追加
        </button>
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        作成
      </button>
    </form>
  );
}
```

---

## 13.4 スケジュール詳細API

### app/api/schedules/[id]/route.ts（GET）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        // 候補日
        candidates: {
          include: {
            // 投票
            votes: {
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
            // コメント
            comments: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            datetime: 'asc',
          },
        },
        // イベント
        event: true,
      },
    });
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'スケジュールが見つかりません' },
        { status: 404 }
      );
    }
    
    // 各候補日の投票結果を集計
    const scheduleWithStats = {
      ...schedule,
      candidates: schedule.candidates.map(candidate => {
        const votes = candidate.votes;
        const available = votes.filter(v => v.response === '参加可能');
        const maybe = votes.filter(v => v.response === '未定');
        const unavailable = votes.filter(v => v.response === '参加不可');
        
        return {
          ...candidate,
          stats: {
            available: available.length,
            maybe: maybe.length,
            unavailable: unavailable.length,
            total: votes.length,
          },
          availableUsers: available.map(v => v.user),
          maybeUsers: maybe.map(v => v.user),
          unavailableUsers: unavailable.map(v => v.user),
        };
      }),
    };
    
    return NextResponse.json(scheduleWithStats);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'スケジュールの取得に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 13.5 投票API

### app/api/schedules/[id]/vote/route.ts

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
    const { id: scheduleId } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { candidateId, response } = body;
    
    // バリデーション
    if (!candidateId || !response) {
      return NextResponse.json(
        { error: '候補日IDと回答は必須です' },
        { status: 400 }
      );
    }
    
    if (!['参加可能', '未定', '参加不可'].includes(response)) {
      return NextResponse.json(
        { error: '無効な回答です' },
        { status: 400 }
      );
    }
    
    // 候補日が存在するか確認
    const candidate = await prisma.scheduleCandidate.findUnique({
      where: { id: candidateId },
      include: { schedule: true },
    });
    
    if (!candidate || candidate.scheduleId !== scheduleId) {
      return NextResponse.json(
        { error: '候補日が見つかりません' },
        { status: 404 }
      );
    }
    
    // 既に投票しているか確認
    const existingVote = await prisma.scheduleVote.findUnique({
      where: {
        candidateId_userId: {
          candidateId,
          userId: session.user.id,
        },
      },
    });
    
    if (existingVote) {
      // 既存の投票を更新
      const updatedVote = await prisma.scheduleVote.update({
        where: { id: existingVote.id },
        data: { response },
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
      
      return NextResponse.json(updatedVote);
    } else {
      // 新しい投票を作成
      const vote = await prisma.scheduleVote.create({
        data: {
          candidateId,
          userId: session.user.id,
          response,
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
      
      return NextResponse.json(vote, { status: 201 });
    }
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: '投票に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（楽観的UI更新）:**

```typescript
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface VoteButtonsProps {
  scheduleId: string;
  candidateId: string;
  currentVote?: {
    response: string;
  };
}

export default function VoteButtons({
  scheduleId,
  candidateId,
  currentVote,
}: VoteButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState(currentVote?.response);
  
  const handleVote = async (response: string) => {
    // 楽観的UI更新
    setSelected(response);
    
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, response }),
      });
      
      if (!res.ok) {
        // エラー時は元に戻す
        setSelected(currentVote?.response);
        throw new Error('投票に失敗しました');
      }
      
      // サーバーデータを更新
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      alert('投票に失敗しました');
    }
  };
  
  const buttonClass = (response: string) => `
    px-4 py-2 rounded-lg font-medium transition-colors
    ${selected === response
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
    disabled:opacity-50
  `;
  
  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleVote('参加可能')}
        disabled={isPending}
        className={buttonClass('参加可能')}
      >
        ✓ 参加可能
      </button>
      <button
        onClick={() => handleVote('未定')}
        disabled={isPending}
        className={buttonClass('未定')}
      >
        ? 未定
      </button>
      <button
        onClick={() => handleVote('参加不可')}
        disabled={isPending}
        className={buttonClass('参加不可')}
      >
        ✗ 参加不可
      </button>
    </div>
  );
}
```

---

## 13.6 コメントAPI

### app/api/schedules/[id]/comment/route.ts

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
    const { id: scheduleId } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { candidateId, content } = body;
    
    // バリデーション
    if (!candidateId || !content || content.trim() === '') {
      return NextResponse.json(
        { error: '候補日IDとコメント内容は必須です' },
        { status: 400 }
      );
    }
    
    if (content.length > 500) {
      return NextResponse.json(
        { error: 'コメントは500文字以内にしてください' },
        { status: 400 }
      );
    }
    
    // 候補日が存在するか確認
    const candidate = await prisma.scheduleCandidate.findUnique({
      where: { id: candidateId },
      include: { schedule: true },
    });
    
    if (!candidate || candidate.scheduleId !== scheduleId) {
      return NextResponse.json(
        { error: '候補日が見つかりません' },
        { status: 404 }
      );
    }
    
    // コメントを作成
    const comment = await prisma.scheduleCandidateComment.create({
      data: {
        candidateId,
        userId: session.user.id,
        content,
      },
    });
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'コメントの投稿に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 13.7 最有力候補の判定

### ユーティリティ関数

```typescript
// lib/schedule-utils.ts

interface Candidate {
  id: string;
  datetime: Date;
  location?: string | null;
  stats: {
    available: number;
    maybe: number;
    unavailable: number;
    total: number;
  };
}

/**
 * 最有力候補を判定する
 * 1. 参加可能人数が最も多い
 * 2. 同数の場合は、未定が少ない
 * 3. それも同じなら日時が早い
 */
export function findBestCandidate(candidates: Candidate[]): Candidate | null {
  if (candidates.length === 0) return null;
  
  return candidates.reduce((best, current) => {
    // 参加可能人数で比較
    if (current.stats.available > best.stats.available) {
      return current;
    }
    if (current.stats.available < best.stats.available) {
      return best;
    }
    
    // 参加可能人数が同じ場合、未定が少ない方
    if (current.stats.maybe < best.stats.maybe) {
      return current;
    }
    if (current.stats.maybe > best.stats.maybe) {
      return best;
    }
    
    // それも同じなら日時が早い方
    if (new Date(current.datetime) < new Date(best.datetime)) {
      return current;
    }
    
    return best;
  });
}

/**
 * 候補日のスコアを計算
 * 参加可能: +1点、未定: 0点、参加不可: -1点
 */
export function calculateScore(candidate: Candidate): number {
  return (
    candidate.stats.available * 1 +
    candidate.stats.maybe * 0 +
    candidate.stats.unavailable * -1
  );
}

/**
 * 候補日を人気順にソート
 */
export function sortByPopularity(candidates: Candidate[]): Candidate[] {
  return [...candidates].sort((a, b) => {
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    
    // スコアが同じなら日時が早い順
    return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
  });
}
```

**使い方:**

```typescript
// app/schedules/[id]/page.tsx
import { findBestCandidate, sortByPopularity } from '@/lib/schedule-utils';

export default async function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const schedule = await getSchedule(id);
  
  const bestCandidate = findBestCandidate(schedule.candidates);
  const sortedCandidates = sortByPopularity(schedule.candidates);
  
  return (
    <div>
      <h1>{schedule.title}</h1>
      
      {bestCandidate && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold text-yellow-900 mb-2">
            🏆 最有力候補
          </h2>
          <p className="text-xl font-bold">
            {new Date(bestCandidate.datetime).toLocaleString('ja-JP')}
          </p>
          <p className="text-sm text-yellow-800 mt-2">
            参加可能: {bestCandidate.stats.available}人
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        {sortedCandidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            rank={index + 1}
            isBest={candidate.id === bestCandidate?.id}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 13.8 リアルタイム更新（オプション）

### Server-Sent Events（SSE）を使った実装

```typescript
// app/api/schedules/[id]/stream/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // 初期データを送信
      const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: {
          candidates: {
            include: {
              _count: {
                select: { votes: true },
              },
            },
          },
        },
      });
      
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(schedule)}\n\n`)
      );
      
      // 定期的に更新をチェック（実際はWebSocketやPubSubを使う）
      const interval = setInterval(async () => {
        const updated = await prisma.schedule.findUnique({
          where: { id },
          include: {
            candidates: {
              include: {
                _count: {
                  select: { votes: true },
                },
              },
            },
          },
        });
        
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(updated)}\n\n`)
        );
      }, 5000); // 5秒ごと
      
      // クリーンアップ
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**使い方（フロントエンド）:**

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function RealtimeSchedule({ scheduleId }: { scheduleId: string }) {
  const [schedule, setSchedule] = useState(null);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/schedules/${scheduleId}/stream`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSchedule(data);
    };
    
    return () => {
      eventSource.close();
    };
  }, [scheduleId]);
  
  if (!schedule) {
    return <div>読み込み中...</div>;
  }
  
  return <div>{/* スケジュール表示 */}</div>;
}
```

---

## まとめ

この章では、スケジュールAPIの実装について学びました：

### CRUD API
- ✅ **GET /api/schedules**: スケジュール一覧取得
- ✅ **POST /api/schedules**: スケジュール作成（管理者のみ）
- ✅ **GET /api/schedules/:id**: スケジュール詳細取得
- ✅ **PUT /api/schedules/:id**: スケジュール更新（管理者のみ）
- ✅ **DELETE /api/schedules/:id**: スケジュール削除（管理者のみ）

### インタラクション
- ✅ **投票機能**: 参加可能/未定/参加不可の3択
- ✅ **コメント機能**: 候補日へのコメント
- ✅ **楽観的UI更新**: 即座に画面に反映

### 高度な機能
- ✅ **最有力候補の判定**: 参加可能人数に基づく自動判定
- ✅ **人気順ソート**: スコア計算によるランキング
- ✅ **リアルタイム更新**: SSEによる自動更新（オプション）

次の章では、**ユーザーAPIの実装**について詳しく見ていきます。

---

[← 前の章：第12章 投稿APIの実装](12-投稿APIの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第14章 ユーザーAPIの実装 →](14-ユーザーAPIの実装.md)
