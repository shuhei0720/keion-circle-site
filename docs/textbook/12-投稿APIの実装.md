# 第12章：投稿APIの実装

この章では、活動報告（投稿）のCRUD APIを実装していきます。

## 12.1 API設計

### エンドポイント一覧

```
GET    /api/posts              - 投稿一覧を取得
GET    /api/posts/:id          - 投稿詳細を取得
POST   /api/posts              - 新しい投稿を作成（管理者のみ）
PUT    /api/posts/:id          - 投稿を更新（管理者のみ）
DELETE /api/posts/:id          - 投稿を削除（管理者のみ）

POST   /api/posts/:id/like     - いいねをトグル
POST   /api/posts/:id/comment  - コメントを投稿
DELETE /api/posts/:id/comment/:commentId - コメントを削除
```

### レスポンスの形式

```typescript
// 成功時
{
  id: "clx...",
  title: "文化祭ライブレポート",
  content: "大成功でした！",
  youtubeUrls: ["https://youtube.com/watch?v=..."],
  images: ["https://..."],
  author: {
    id: "clx...",
    name: "山田太郎",
    image: "https://..."
  },
  _count: {
    likes: 15,
    comments: 8
  },
  createdAt: "2024-12-22T10:00:00.000Z",
  updatedAt: "2024-12-22T10:00:00.000Z"
}

// エラー時
{
  error: "エラーメッセージ"
}
```

---

## 12.2 投稿一覧API

### app/api/posts/route.ts（GET）

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      // 著者情報を含める
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        // いいね数とコメント数を取得
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      // 新しい順に並び替え
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
// app/posts/page.tsx
async function getPosts() {
  const response = await fetch('/api/posts', {
    cache: 'no-store', // 常に最新データを取得
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  return response.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  
  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>by {post.author.name}</p>
          <p>❤️ {post._count.likes} 💬 {post._count.comments}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 12.3 投稿作成API

### app/api/posts/route.ts（POST）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // 管理者チェック
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '投稿作成は管理者のみ可能です' },
        { status: 403 }
      );
    }
    
    // リクエストボディを取得
    const body = await request.json();
    const { title, content, youtubeUrls, images } = body;
    
    // バリデーション
    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      );
    }
    
    if (title.length > 200) {
      return NextResponse.json(
        { error: 'タイトルは200文字以内にしてください' },
        { status: 400 }
      );
    }
    
    // YouTube URLのバリデーション
    if (youtubeUrls && Array.isArray(youtubeUrls)) {
      const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)/;
      
      for (const url of youtubeUrls) {
        if (!youtubeRegex.test(url)) {
          return NextResponse.json(
            { error: '無効なYouTube URLが含まれています' },
            { status: 400 }
          );
        }
      }
    }
    
    // 投稿を作成
    const post = await prisma.post.create({
      data: {
        title,
        content,
        youtubeUrls: youtubeUrls || [],
        images: images || [],
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: '投稿の作成に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
// app/posts/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    youtubeUrls: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          youtubeUrls: formData.youtubeUrls.filter(url => url.trim() !== ''),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '投稿の作成に失敗しました');
      }
      
      const post = await response.json();
      router.push(`/posts/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-4">
          {error}
        </div>
      )}
      
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
        {loading ? '投稿中...' : '投稿する'}
      </button>
    </form>
  );
}
```

---

## 12.4 投稿詳細API

### app/api/posts/[id]/route.ts（GET）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        // 著者情報
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            instrument: true,
          },
        },
        // いいね（ユーザーIDのみ）
        likes: {
          select: {
            userId: true,
          },
        },
        // コメント（ユーザー情報付き）
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
      },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
// app/posts/[id]/page.tsx
async function getPost(id: string) {
  const response = await fetch(`/api/posts/${id}`, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  
  return response.json();
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div className="flex items-center gap-2 mb-4">
        {post.author.image && (
          <img
            src={post.author.image}
            alt={post.author.name}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <p className="font-medium">{post.author.name}</p>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString('ja-JP')}
          </p>
        </div>
      </div>
      
      <div className="prose max-w-none mb-8">
        {post.content}
      </div>
      
      {/* YouTube動画 */}
      {post.youtubeUrls.map((url: string) => (
        <div key={url} className="mb-4">
          <YouTubeEmbed url={url} />
        </div>
      ))}
      
      {/* いいね */}
      <div className="flex items-center gap-4 mb-8">
        <LikeButton postId={post.id} likes={post.likes} />
        <span>{post.comments.length} コメント</span>
      </div>
      
      {/* コメント一覧 */}
      <CommentList comments={post.comments} />
    </article>
  );
}
```

---

## 12.5 投稿更新API

### app/api/posts/[id]/route.ts（PUT）

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
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
        { error: '投稿の編集は管理者のみ可能です' },
        { status: 403 }
      );
    }
    
    // 投稿が存在するか確認
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }
    
    // リクエストボディを取得
    const body = await request.json();
    const { title, content, youtubeUrls, images } = body;
    
    // バリデーション
    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      );
    }
    
    // 投稿を更新
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        youtubeUrls: youtubeUrls || [],
        images: images || [],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: '投稿の更新に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 12.6 投稿削除API

### app/api/posts/[id]/route.ts（DELETE）

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
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
        { error: '投稿の削除は管理者のみ可能です' },
        { status: 403 }
      );
    }
    
    // 投稿が存在するか確認
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }
    
    // 投稿を削除（関連するいいね、コメントも自動削除）
    await prisma.post.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: '投稿の削除に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
'use client';

export default function DeleteButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }
      
      router.push('/posts');
      router.refresh();
    } catch (error) {
      alert('削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? '削除中...' : '削除'}
    </button>
  );
}
```

---

## 12.7 いいね機能API

### app/api/posts/[id]/like/route.ts

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
    const { id: postId } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // 投稿が存在するか確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }
    
    // 既にいいねしているか確認
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });
    
    if (existingLike) {
      // いいねを取り消し
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      
      return NextResponse.json({
        liked: false,
        message: 'いいねを取り消しました',
      });
    } else {
      // いいねを追加
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });
      
      return NextResponse.json({
        liked: true,
        message: 'いいねしました',
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'いいねの処理に失敗しました' },
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

interface LikeButtonProps {
  postId: string;
  initialLikes: { userId: string }[];
  currentUserId?: string;
}

export default function LikeButton({
  postId,
  initialLikes,
  currentUserId,
}: LikeButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // 現在のユーザーがいいね済みか
  const [isLiked, setIsLiked] = useState(
    initialLikes.some(like => like.userId === currentUserId)
  );
  const [likeCount, setLikeCount] = useState(initialLikes.length);
  
  const handleLike = async () => {
    if (!currentUserId) {
      alert('ログインが必要です');
      return;
    }
    
    // 楽観的UI更新
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        // エラー時は元に戻す
        setIsLiked(isLiked);
        setLikeCount(initialLikes.length);
        throw new Error('いいねに失敗しました');
      }
      
      // サーバーデータを更新
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      alert('いいねに失敗しました');
    }
  };
  
  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isLiked
          ? 'bg-red-100 text-red-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50`}
    >
      <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
      <span className="font-medium">{likeCount}</span>
    </button>
  );
}
```

---

## 12.8 コメント投稿API

### app/api/posts/[id]/comment/route.ts

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
    const { id: postId } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // リクエストボディを取得
    const body = await request.json();
    const { content } = body;
    
    // バリデーション
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'コメント内容を入力してください' },
        { status: 400 }
      );
    }
    
    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'コメントは1000文字以内にしてください' },
        { status: 400 }
      );
    }
    
    // 投稿が存在するか確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }
    
    // コメントを作成
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        postId,
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

**使い方（フロントエンド）:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'コメントの投稿に失敗しました');
      }
      
      setContent('');
      router.refresh(); // ページを更新してコメント一覧を再取得
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <h3 className="text-lg font-bold mb-4">コメントを投稿</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="コメントを入力してください"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        required
      />
      
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '投稿中...' : '投稿'}
        </button>
      </div>
    </form>
  );
}
```

---

## 12.9 エラーハンドリング

### カスタムエラークラス

```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'ログインが必要です') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'この操作を実行する権限がありません') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'リソースが見つかりません') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
```

### エラーハンドリングミドルウェア

```typescript
// lib/api-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from './errors';

type Handler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function withErrorHandler(handler: Handler): Handler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      
      // その他のエラー
      return NextResponse.json(
        { error: '内部サーバーエラーが発生しました' },
        { status: 500 }
      );
    }
  };
}
```

**使い方:**

```typescript
import { withErrorHandler } from '@/lib/api-handler';
import { UnauthorizedError, NotFoundError } from '@/lib/errors';

export const GET = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  
  if (!post) {
    throw new NotFoundError('投稿が見つかりません');
  }
  
  return NextResponse.json(post);
});
```

---

## 12.10 バリデーション

### Zodによるバリデーション

```bash
npm install zod
```

```typescript
// lib/validations/post.ts
import { z } from 'zod';

// 投稿作成のスキーマ
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内にしてください'),
  content: z
    .string()
    .min(1, '内容は必須です')
    .max(10000, '内容は10000文字以内にしてください'),
  youtubeUrls: z
    .array(
      z.string().url('有効なURLを入力してください').regex(
        /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)/,
        '有効なYouTube URLを入力してください'
      )
    )
    .optional()
    .default([]),
  images: z
    .array(z.string().url('有効なURLを入力してください'))
    .optional()
    .default([]),
});

// 投稿更新のスキーマ
export const updatePostSchema = createPostSchema.partial();

// コメント作成のスキーマ
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'コメント内容は必須です')
    .max(1000, 'コメントは1000文字以内にしてください'),
});
```

**使い方:**

```typescript
import { createPostSchema } from '@/lib/validations/post';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  
  const body = await request.json();
  
  // バリデーション
  const result = createPostSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'バリデーションエラー',
        details: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
  
  // result.data は型安全
  const post = await prisma.post.create({
    data: {
      ...result.data,
      authorId: session.user.id,
    },
  });
  
  return NextResponse.json(post, { status: 201 });
}
```

---

## まとめ

この章では、投稿APIの実装について学びました：

### CRUD API
- ✅ **GET /api/posts**: 投稿一覧取得
- ✅ **POST /api/posts**: 投稿作成（管理者のみ）
- ✅ **GET /api/posts/:id**: 投稿詳細取得
- ✅ **PUT /api/posts/:id**: 投稿更新（管理者のみ）
- ✅ **DELETE /api/posts/:id**: 投稿削除（管理者のみ）

### インタラクション
- ✅ **いいね機能**: トグル処理、楽観的UI更新
- ✅ **コメント機能**: 投稿、削除

### セキュリティとバリデーション
- ✅ **認証・認可**: NextAuth.js、役割チェック
- ✅ **エラーハンドリング**: カスタムエラークラス
- ✅ **バリデーション**: Zodスキーマ

次の章では、**スケジュールAPIの実装**について詳しく見ていきます。

---

[← 前の章：第11章 Prismaによるデータベース操作](11-Prismaによるデータベース操作.md) | [目次に戻る](00-目次.md) | [次の章へ：第13章 スケジュールAPIの実装 →](13-スケジュールAPIの実装.md)
