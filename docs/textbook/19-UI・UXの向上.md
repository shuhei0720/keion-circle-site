# 第19章：UI/UXの向上

> **この章では、ユーザー体験を向上させるためのUI/UX改善を実装します**

## 📚 この章で学ぶこと

- ✅ ローディング状態の実装（loading.tsx、Suspense）
- ✅ エラーハンドリング（error.tsx、エラーバウンダリ）
- ✅ 楽観的UIの活用（即座のフィードバック）
- ✅ レスポンシブデザインの調整
- ✅ スケルトンスクリーンの実装
- ✅ ユーザーフィードバックの改善

## 💡 この章で実装する機能

```
┌──────────────────────────────────────────────────┐
│       UI/UX向上の全体像                          │
└──────────────────────────────────────────────────┘

【ローディング状態】
データ取得中の表示を改善
   ↓
【エラーハンドリング】
エラー時の表示とリカバリー
   ↓
【楽観的UI】
操作の即座のフィードバック
   ↓
【レスポンシブデザイン】
全デバイスで快適な操作


┌────────────────────────────────────┐
│   ローディング中                    │
│                                    │
│   ████████░░░░ 読み込み中...       │
│   ████░░░░░░░░                     │
│   ████████████                     │
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   エラー発生                        │
│                                    │
│   ⚠️ エラーが発生しました           │
│   データの取得に失敗しました       │
│                                    │
│   [再試行]                         │
└────────────────────────────────────┘
```

---

## 19.1 ローディング状態の実装

### ローディング状態の種類

```
┌──────────────────────────────────────────────┐
│     ローディング状態のパターン                │
├──────────────────────────────────────────────┤
│                                              │
│  1. ページ全体のローディング                 │
│     → loading.tsx                            │
│                                              │
│  2. コンポーネント単位のローディング         │
│     → Suspense                               │
│                                              │
│  3. スケルトンスクリーン                     │
│     → データ構造に似た仮表示                 │
│                                              │
│  4. ボタンのローディング                     │
│     → スピナー付きボタン                     │
│                                              │
└──────────────────────────────────────────────┘
```

### Step 1: スケルトンコンポーネントを作成

`src/components/Skeleton.tsx` を作成してください。

```typescript
// スケルトンコンポーネント - ローディング中の仮表示

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-label="読み込み中..."
    />
  );
}

// カードのスケルトン
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* コンテンツ */}
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// 投稿一覧のスケルトン
export function PostListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ユーザーカードのスケルトン
export function UserCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Skeleton className="h-20 w-full" />
      <div className="p-6 -mt-12">
        <Skeleton className="w-20 h-20 rounded-full mb-4" />
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// イベントカードのスケルトン
export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Skeleton className="h-24 w-full" />
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
```

**スケルトンコンポーネントのポイント:**

| コンポーネント | 用途 |
|---------------|------|
| `Skeleton` | 基本的なスケルトン要素 |
| `SkeletonCard` | 汎用カードのスケルトン |
| `PostListSkeleton` | 投稿一覧のスケルトン |
| `UserCardSkeleton` | ユーザーカードのスケルトン |
| `EventCardSkeleton` | イベントカードのスケルトン |

### Step 2: 投稿一覧のloading.tsxを作成

`src/app/posts/loading.tsx` を作成してください。

```typescript
import { PostListSkeleton } from '@/components/Skeleton';

// 投稿一覧ページのローディング表示
export default function PostsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-6 w-64 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* 投稿一覧スケルトン */}
        <PostListSkeleton />
      </div>
    </div>
  );
}
```

### Step 3: ユーザー一覧のloading.tsxを作成

`src/app/users/loading.tsx` を作成してください。

```typescript
import { UserCardSkeleton } from '@/components/Skeleton';

// ユーザー一覧ページのローディング表示
export default function UsersLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-6 w-64 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* ユーザーカードグリッド */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Step 4: イベント一覧のloading.tsxを作成

`src/app/events/loading.tsx` を作成してください。

```typescript
import { EventCardSkeleton } from '@/components/Skeleton';

// イベント一覧ページのローディング表示
export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-6 w-64 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* イベントカードグリッド */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Step 5: スケジュール一覧のloading.tsxを作成

`src/app/schedules/loading.tsx` を作成してください。

```typescript
import { Skeleton } from '@/components/Skeleton';

// スケジュール一覧ページのローディング表示
export default function SchedulesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-6 w-96 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* スケジュールカード */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-6" />

              {/* 候補日 */}
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Step 6: 動作確認

**6-1.** ブラウザで http://localhost:3000/posts を開く

**6-2.** ページを再読み込みして、ローディング表示を確認

→ ✅ スケルトンスクリーンが表示されます！

---

## 19.2 エラーハンドリング

### エラーハンドリングの仕組み

```
┌──────────────────────────────────────────────┐
│     エラーハンドリングの流れ                  │
└──────────────────────────────────────────────┘

【エラー発生】
   ↓
【error.tsxがキャッチ】
   ↓
【エラー表示】
ユーザーに分かりやすいメッセージ
   ↓
【リカバリーオプション】
- 再試行ボタン
- ホームへ戻る
- 前のページへ戻る
```

### Step 1: エラーページコンポーネントを作成

`src/components/ErrorDisplay.tsx` を作成してください。

```typescript
'use client';

import { AlertTriangle, RefreshCw, Home, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorDisplayProps {
  error: Error & { digest?: string };
  reset?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

export function ErrorDisplay({
  error,
  reset,
  showHomeButton = true,
  showBackButton = true,
}: ErrorDisplayProps) {
  const router = useRouter();

  // エラーメッセージを取得
  const getErrorMessage = (error: Error) => {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return 'ページが見つかりませんでした';
    }
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return 'ログインが必要です';
    }
    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return 'アクセス権限がありません';
    }
    if (error.message.includes('500') || error.message.includes('server')) {
      return 'サーバーエラーが発生しました';
    }
    return 'エラーが発生しました';
  };

  // エラーの詳細を取得
  const getErrorDetail = (error: Error) => {
    if (error.message.includes('404')) {
      return 'お探しのページは存在しないか、削除された可能性があります。';
    }
    if (error.message.includes('401')) {
      return 'この操作を行うにはログインが必要です。';
    }
    if (error.message.includes('403')) {
      return 'この操作を行う権限がありません。';
    }
    if (error.message.includes('500')) {
      return 'サーバーで問題が発生しました。しばらく時間をおいてから再度お試しください。';
    }
    return 'データの取得または処理中に問題が発生しました。';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* エラーカード */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* アイコン */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {getErrorMessage(error)}
          </h1>

          {/* 説明 */}
          <p className="text-gray-600 mb-6">
            {getErrorDetail(error)}
          </p>

          {/* エラーID（開発モード） */}
          {error.digest && (
            <p className="text-xs text-gray-400 mb-6 font-mono">
              エラーID: {error.digest}
            </p>
          )}

          {/* ボタングループ */}
          <div className="flex flex-col gap-3">
            {/* 再試行ボタン */}
            {reset && (
              <button
                onClick={reset}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                再試行
              </button>
            )}

            {/* ホームボタン */}
            {showHomeButton && (
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={20} />
                ホームへ戻る
              </button>
            )}

            {/* 戻るボタン */}
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="w-full px-6 py-3 text-gray-600 font-semibold hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} />
                前のページへ戻る
              </button>
            )}
          </div>
        </div>

        {/* サポート情報 */}
        <p className="text-center text-sm text-gray-500 mt-6">
          問題が解決しない場合は、管理者にお問い合わせください。
        </p>
      </div>
    </div>
  );
}
```

### Step 2: 投稿一覧のerror.tsxを作成

`src/app/posts/error.tsx` を作成してください。

```typescript
'use client';

import { ErrorDisplay } from '@/components/ErrorDisplay';

// 投稿一覧ページのエラー表示
export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorDisplay error={error} reset={reset} />;
}
```

### Step 3: ユーザー一覧のerror.tsxを作成

`src/app/users/error.tsx` を作成してください。

```typescript
'use client';

import { ErrorDisplay } from '@/components/ErrorDisplay';

// ユーザー一覧ページのエラー表示
export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorDisplay error={error} reset={reset} />;
}
```

### Step 4: イベント一覧のerror.tsxを作成

`src/app/events/error.tsx` を作成してください。

```typescript
'use client';

import { ErrorDisplay } from '@/components/ErrorDisplay';

// イベント一覧ページのエラー表示
export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorDisplay error={error} reset={reset} />;
}
```

### Step 5: not-found.tsxを作成

`src/app/not-found.tsx` を作成してください。

```typescript
import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

// 404ページ
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* アイコン */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <FileQuestion className="text-gray-600" size={32} />
            </div>
          </div>

          {/* 404 */}
          <h1 className="text-6xl font-bold text-gray-900 mb-3">404</h1>

          {/* タイトル */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            ページが見つかりません
          </h2>

          {/* 説明 */}
          <p className="text-gray-600 mb-8">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>

          {/* ホームボタン */}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home size={20} />
            ホームへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Step 6: 動作確認

**6-1.** 存在しないページ（例: http://localhost:3000/posts/invalid-id）を開く

→ ✅ エラーページが表示されます！

**6-2.** 「再試行」ボタンをクリック

→ ✅ ページが再読み込みされます！

---

## 19.3 楽観的UIの活用

### 楽観的UIとは？

```
┌──────────────────────────────────────────────┐
│     楽観的UI（Optimistic UI）                │
└──────────────────────────────────────────────┘

【従来のUI】
ユーザーアクション
   ↓
サーバーに送信
   ↓
レスポンス待ち ⏳
   ↓
UIを更新

【楽観的UI】
ユーザーアクション
   ↓
即座にUIを更新 ⚡（成功を仮定）
   ↓
サーバーに送信
   ↓
エラーなら元に戻す ↩️


メリット:
✓ 即座のフィードバック
✓ サクサク動く感覚
✓ ユーザー体験の向上
```

### Step 1: いいねボタンの楽観的UI実装

`src/components/LikeButton.tsx` を開いて、以下のコードで**完全に上書き**してください。

> 💡 **説明**: `useOptimistic` フックを使って、クリック時に即座にUIが更新される楽観的UIを実装します。

```typescript
'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  currentUserId?: string;
}

export function LikeButton({
  postId,
  initialLiked,
  initialLikeCount,
  currentUserId,
}: LikeButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 楽観的更新の状態
  const [optimisticState, setOptimisticState] = useOptimistic(
    { liked: initialLiked, count: initialLikeCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: state.count + (newLiked ? 1 : -1),
    })
  );

  // いいねの切り替え
  const handleToggleLike = async () => {
    if (!currentUserId) {
      alert('ログインが必要です');
      return;
    }

    // 楽観的更新: 即座にUIを更新
    const newLiked = !optimisticState.liked;
    setOptimisticState(newLiked);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        // エラー時はロールバック
        setOptimisticState(optimisticState.liked);
        throw new Error('いいねに失敗しました');
      }

      // サーバーの状態を反映
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('いいねエラー:', error);
      alert('いいねに失敗しました');
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isPending || !currentUserId}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
        ${
          optimisticState.liked
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      aria-label={optimisticState.liked ? 'いいねを取り消す' : 'いいね'}
    >
      <Heart
        size={20}
        fill={optimisticState.liked ? 'currentColor' : 'none'}
        className={isPending ? 'animate-pulse' : ''}
      />
      <span>{optimisticState.count}</span>
    </button>
  );
}
```

### Step 2: 投票ボタンの楽観的UI実装

`src/components/CandidateVoteSection.tsx` を開いて、以下のコードで**完全に上書き**してください。

> 💡 **説明**: 投票ボタンにも楽観的UIを追加します。

```typescript
'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, MapPin, MessageCircle } from 'lucide-react';

interface CandidateVoteSectionProps {
  candidate: any;
  currentUserId?: string;
  isAdmin?: boolean;
  isBest?: boolean;
}

export function CandidateVoteSection({
  candidate,
  currentUserId,
  isAdmin,
  isBest,
}: CandidateVoteSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 楽観的更新の状態
  type VoteStatus = 'AVAILABLE' | 'MAYBE' | 'UNAVAILABLE' | null;
  
  const initialUserVote = currentUserId
    ? candidate.votes.find((v: any) => v.userId === currentUserId)
    : null;

  const [optimisticVote, setOptimisticVote] = useOptimistic<VoteStatus>(
    initialUserVote?.status || null,
    (_, newStatus: VoteStatus) => newStatus
  );

  // 投票状況の集計（楽観的UIを考慮）
  const getVoteCounts = () => {
    const votes = candidate.votes.filter((v: any) => 
      !currentUserId || v.userId !== currentUserId
    );

    let available = votes.filter((v: any) => v.status === 'AVAILABLE').length;
    let maybe = votes.filter((v: any) => v.status === 'MAYBE').length;
    let unavailable = votes.filter((v: any) => v.status === 'UNAVAILABLE').length;

    // 現在のユーザーの楽観的投票を追加
    if (optimisticVote === 'AVAILABLE') available++;
    if (optimisticVote === 'MAYBE') maybe++;
    if (optimisticVote === 'UNAVAILABLE') unavailable++;

    return { available, maybe, unavailable };
  };

  const voteCounts = getVoteCounts();

  // 投票処理
  const handleVote = async (status: 'AVAILABLE' | 'MAYBE' | 'UNAVAILABLE') => {
    if (!currentUserId) {
      alert('ログインが必要です');
      return;
    }

    // 楽観的更新: 即座にUIを更新
    const newStatus = optimisticVote === status ? null : status;
    setOptimisticVote(newStatus);

    try {
      const response = await fetch(
        `/api/schedules/candidates/${candidate.id}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        // エラー時はロールバック
        setOptimisticVote(optimisticVote);
        throw new Error('投票に失敗しました');
      }

      // サーバーの状態を反映
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('投票エラー:', error);
      alert('投票に失敗しました');
    }
  };

  return (
    <div
      className={`
        border-2 rounded-lg p-6
        ${isBest ? 'border-green-500 bg-green-50' : 'border-gray-200'}
      `}
    >
      {/* 日時と場所 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={20} className="text-gray-600" />
          <span className="text-xl font-bold text-gray-900">
            {new Date(candidate.date).toLocaleDateString('ja-JP', {
              month: 'long',
              day: 'numeric',
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isBest && (
            <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
              ★ 最有力候補
            </span>
          )}
        </div>

        {candidate.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} />
            <span>{candidate.location}</span>
          </div>
        )}
      </div>

      {/* 投票ボタン */}
      {currentUserId && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            あなたの参加状況:
          </p>
          <div className="flex gap-3">
            {/* ◯ 参加可能 */}
            <button
              onClick={() => handleVote('AVAILABLE')}
              disabled={isPending}
              className={`
                flex-1 px-4 py-3 rounded-lg font-semibold transition-all
                ${
                  optimisticVote === 'AVAILABLE'
                    ? 'bg-green-500 text-white ring-4 ring-green-200'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span className="text-2xl mb-1">◯</span>
              <div className="text-sm">参加可能</div>
            </button>

            {/* △ 未定 */}
            <button
              onClick={() => handleVote('MAYBE')}
              disabled={isPending}
              className={`
                flex-1 px-4 py-3 rounded-lg font-semibold transition-all
                ${
                  optimisticVote === 'MAYBE'
                    ? 'bg-yellow-500 text-white ring-4 ring-yellow-200'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-yellow-500 hover:bg-yellow-50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span className="text-2xl mb-1">△</span>
              <div className="text-sm">未定</div>
            </button>

            {/* ✕ 参加不可 */}
            <button
              onClick={() => handleVote('UNAVAILABLE')}
              disabled={isPending}
              className={`
                flex-1 px-4 py-3 rounded-lg font-semibold transition-all
                ${
                  optimisticVote === 'UNAVAILABLE'
                    ? 'bg-red-500 text-white ring-4 ring-red-200'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-500 hover:bg-red-50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span className="text-2xl mb-1">✕</span>
              <div className="text-sm">参加不可</div>
            </button>
          </div>
        </div>
      )}

      {/* 投票状況サマリー */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className={`text-3xl font-bold text-green-600 ${isPending ? 'animate-pulse' : ''}`}>
              {voteCounts.available}
            </div>
            <div className="text-sm text-gray-600">◯ 参加可能</div>
          </div>
          <div>
            <div className={`text-3xl font-bold text-yellow-600 ${isPending ? 'animate-pulse' : ''}`}>
              {voteCounts.maybe}
            </div>
            <div className="text-sm text-gray-600">△ 未定</div>
          </div>
          <div>
            <div className={`text-3xl font-bold text-red-600 ${isPending ? 'animate-pulse' : ''}`}>
              {voteCounts.unavailable}
            </div>
            <div className="text-sm text-gray-600">✕ 参加不可</div>
          </div>
        </div>
      </div>

      {/* コメント数 */}
      {candidate.comments.length > 0 && (
        <div className="flex items-center gap-2 text-gray-600">
          <MessageCircle size={18} />
          <span className="text-sm">
            コメント {candidate.comments.length}件
          </span>
        </div>
      )}
    </div>
  );
}
```

### Step 3: 動作確認

**3-1.** 投稿詳細ページでいいねボタンをクリック

→ ✅ 即座にハートが塗りつぶされ、カウントが増えます！

**3-2.** スケジュール詳細ページで投票ボタンをクリック

→ ✅ 即座にボタンの色が変わり、投票数が更新されます！

---

## 19.4 レスポンシブデザインの調整

### レスポンシブデザインのブレークポイント

```
┌──────────────────────────────────────────────┐
│     Tailwind CSSのブレークポイント            │
├──────────────────────────────────────────────┤
│                                              │
│  sm:  640px以上   （スマホ横）               │
│  md:  768px以上   （タブレット）             │
│  lg:  1024px以上  （ノートPC）               │
│  xl:  1280px以上  （デスクトップ）           │
│  2xl: 1536px以上  （大画面）                 │
│                                              │
└──────────────────────────────────────────────┘
```

### Step 1: ヘッダーのレスポンシブ対応

`src/components/Header.tsx` を開いて、以下のコードで**完全に上書き**してください。

> 💡 **説明**: モバイルメニューを追加し、スマホでも使いやすいヘッダーにします。

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, User, LogOut, Music } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface HeaderProps {
  session: any;
}

export function Header({ session }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ナビゲーションリンク
  const navLinks = [
    { href: '/posts', label: '活動報告' },
    { href: '/events', label: 'イベント' },
    { href: '/schedules', label: 'スケジュール' },
    { href: '/users', label: 'メンバー' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700"
          >
            <Music size={28} />
            <span className="hidden sm:inline">BOLD軽音</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  font-medium transition-colors
                  ${
                    pathname?.startsWith(link.href)
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ユーザーメニュー */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                {/* デスクトップ */}
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <User size={20} />
                    )}
                    <span className="hidden lg:inline">{session.user.name}</span>
                  </Link>

                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <LogOut size={20} />
                    <span className="hidden lg:inline">ログアウト</span>
                  </button>
                </div>

                {/* モバイルメニューボタン */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {mobileMenuOpen && session?.user && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {/* ユーザー情報 */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <User size={20} />
                </div>
              )}
              <div>
                <div className="font-semibold">{session.user.name}</div>
                <div className="text-sm text-gray-600">{session.user.email}</div>
              </div>
            </div>

            {/* ナビゲーションリンク */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block py-2 px-3 rounded-lg font-medium transition-colors
                  ${
                    pathname?.startsWith(link.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}

            {/* プロフィール */}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              プロフィール編集
            </Link>

            {/* ログアウト */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                signOut();
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
```

### Step 2: カードグリッドのレスポンシブ対応

投稿一覧、ユーザー一覧、イベント一覧などのグリッドレイアウトを確認してください。

以下のようなクラスが使われていることを確認：

```typescript
// モバイル: 1列、タブレット: 2列、デスクトップ: 3列
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* カード */}
</div>

// モバイル: 1列、デスクトップ: 2列
<div className="grid gap-6 lg:grid-cols-2">
  {/* カード */}
</div>
```

### Step 3: フォームのレスポンシブ対応

フォームの入力欄が小さい画面でも使いやすいことを確認：

```typescript
// フォームコンテナ
<div className="w-full max-w-2xl mx-auto px-4">
  {/* フォーム */}
</div>

// ボタングループ
<div className="flex flex-col sm:flex-row gap-4">
  <button className="flex-1">保存</button>
  <button>キャンセル</button>
</div>
```

### Step 4: 動作確認

**4-1.** ブラウザの開発者ツールを開く（F12）

**4-2.** デバイスツールバーを表示（Ctrl+Shift+M または Cmd+Shift+M）

**4-3.** 以下のデバイスサイズで確認：

- **iPhone SE (375px)**: モバイル表示
- **iPad Mini (768px)**: タブレット表示
- **Desktop (1920px)**: デスクトップ表示

→ ✅ 各画面サイズで適切にレイアウトが変化します！

---

## 19.5 確認チェックリスト

Chapter 19の内容を理解できたか確認しましょう。

### ローディング状態

- [ ] Skeletonコンポーネントを実装できる
- [ ] loading.tsxを作成できる
- [ ] スケルトンスクリーンを実装できる
- [ ] ローディング中のフィードバックを提供できる

### エラーハンドリング

- [ ] ErrorDisplayコンポーネントを実装できる
- [ ] error.tsxを作成できる
- [ ] not-found.tsxを作成できる
- [ ] エラーメッセージを分かりやすく表示できる
- [ ] リカバリーオプションを提供できる

### 楽観的UI

- [ ] useOptimisticフックを使える
- [ ] いいね機能で楽観的UIを実装できる
- [ ] 投票機能で楽観的UIを実装できる
- [ ] エラー時のロールバックができる

### レスポンシブデザイン

- [ ] Tailwind CSSのブレークポイントを理解できる
- [ ] モバイルメニューを実装できる
- [ ] グリッドレイアウトをレスポンシブにできる
- [ ] 各デバイスサイズで動作確認できる

---

## まとめ

この章では、UI/UXを向上させるための様々な改善を実装しました。

### 🎓 この章で学んだこと

#### ローディング状態
- ✅ loading.tsxによるページレベルのローディング
- ✅ Skeletonコンポーネントによるスケルトンスクリーン
- ✅ データ構造に似た仮表示
- ✅ ユーザーへの待機時間のフィードバック

#### エラーハンドリング
- ✅ error.tsxによるエラーバウンダリ
- ✅ ErrorDisplayコンポーネント
- ✅ 分かりやすいエラーメッセージ
- ✅ リカバリーオプション（再試行、ホームへ戻る）
- ✅ 404ページのカスタマイズ

#### 楽観的UI
- ✅ useOptimisticフックの活用
- ✅ 即座のUIフィードバック
- ✅ エラー時のロールバック
- ✅ サクサク動く感覚の実現

#### レスポンシブデザイン
- ✅ モバイルファーストの設計
- ✅ ブレークポイントの活用
- ✅ モバイルメニューの実装
- ✅ グリッドレイアウトの最適化

### 💡 重要なポイント

#### 楽観的UIの実装

```typescript
const [optimisticState, setOptimisticState] = useOptimistic(
  initialState,
  (state, newValue) => newValue
);

// 即座にUI更新
setOptimisticState(newValue);

// API呼び出し
try {
  await fetch(...);
} catch {
  // エラー時はロールバック
  setOptimisticState(initialState);
}
```

#### レスポンシブグリッド

```typescript
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* モバイル: 1列 */}
  {/* タブレット: 2列 */}
  {/* デスクトップ: 3列 */}
</div>
```

### 🚀 次の章への準備

次の章（Chapter 20: 共通コンポーネントの実装）では、以下を学びます：

1. **Markdownエディタ**
   - リッチテキストエディタ
   - Markdownツールバー
   - プレビュー機能

2. **共通コンポーネント**
   - ボタンコンポーネント
   - カードコンポーネント
   - モーダルコンポーネント

**準備すること:**
- ✅ ローディング状態が適切に表示されることを確認
- ✅ エラーハンドリングが動作することを確認
- ✅ 楽観的UIが正しく機能することを確認
- ✅ レスポンシブデザインが各デバイスで動作することを確認

---

[← 前の章：第18章 画像アップロード機能](18-画像アップロード機能.md) | [目次に戻る](00-目次.md) | [次の章へ：第20章 共通コンポーネントの実装 →](20-共通コンポーネントの実装.md)
