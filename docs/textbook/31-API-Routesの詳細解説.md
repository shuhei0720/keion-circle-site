# 第26章：API Routesの詳細解説

> **この章では、実装したAPI Routesのコードを詳細に解説します**

## 📚 この章の目的

この章は**リファレンス**として、実装したコードの仕組みを深く理解するためのものです。

- ✅ 各API Routeの役割と構造
- ✅ コードの各行が何をしているか
- ✅ エラーハンドリングの方法
- ✅ セキュリティ対策の実装
- ✅ データベースクエリの最適化

## 💡 API Routeの基本構造

```
┌──────────────────────────────────────────────────┐
│     Next.js App Router の API Route構造          │
└──────────────────────────────────────────────────┘

src/app/api/
├─ posts/
│  ├─ route.ts           # GET（一覧）, POST（作成）
│  └─ [id]/
│     ├─ route.ts        # GET（詳細）, PATCH（更新）, DELETE（削除）
│     ├─ like/
│     │  └─ route.ts     # POST（いいね）, DELETE（いいね解除）
│     └─ comments/
│        └─ route.ts     # GET（コメント一覧）, POST（コメント作成）
│
├─ events/
│  ├─ route.ts           # GET, POST
│  └─ [id]/
│     └─ route.ts        # GET, PATCH, DELETE
│
└─ users/
   ├─ route.ts           # GET
   └─ [id]/
      └─ route.ts        # GET


【HTTPメソッドとCRUD操作の対応】

  HTTP メソッド    CRUD操作       API Route
  ─────────────────────────────────────────
  GET              Read（読取）   export async function GET()
  POST             Create（作成） export async function POST()
  PATCH/PUT        Update（更新） export async function PATCH()
  DELETE           Delete（削除） export async function DELETE()


【API Routeの標準的な構造】

export async function METHOD(request: NextRequest) {
  try {
    // 1. 認証チェック
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 権限チェック
    if (!isAdmin()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. リクエストボディの取得
    const body = await request.json();

    // 4. バリデーション
    // ...

    // 5. データベース操作
    const result = await prisma.model.create({ ... });

    // 6. レスポンス返却
    return NextResponse.json(result);
  } catch (error) {
    // 7. エラーハンドリング
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

---

## 26.1 投稿APIの詳細

### src/app/api/posts/route.ts

このファイルは投稿の**一覧取得**と**新規作成**を担当します。

#### GET: 投稿一覧の取得

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

export const runtime = 'nodejs'

// 投稿一覧取得（参加情報、いいね情報含む）
export async function GET() {
  try {
    // Prismaで投稿を取得
    const posts = await prisma.post.findMany({
      // selectで取得するフィールドを指定（不要なデータを取得しない）
      select: {
        id: true,
        title: true,
        content: true,
        youtubeUrls: true,
        images: true,
        createdAt: true,
        userId: true,
        
        // 投稿者の情報（リレーション）
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        
        // 参加者の情報（リレーション）
        participants: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        
        // いいね情報（リレーション）
        likes: {
          select: {
            userId: true,
            createdAt: true
          }
        },
        
        // コメント数をカウント
        _count: {
          select: {
            comments: true
          }
        }
      },
      
      // 新しい順に並べる
      orderBy: {
        createdAt: 'desc'
      },
      
      // 最大50件まで取得（パフォーマンス対策）
      take: 50
    })
    
    // JSON形式でレスポンスを返す
    return NextResponse.json(posts)
  } catch (error) {
    // エラーが発生した場合
    console.error('Failed to fetch posts:', error)
    
    // エラーレスポンスを返す
    return NextResponse.json(
      { 
        error: 'Failed to fetch posts',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
```

**コードの詳細解説:**

```
┌──────────────────────────────────────────────────┐
│     prisma.post.findMany() の仕組み             │
└──────────────────────────────────────────────────┘

【select の役割】
  必要なフィールドだけを取得することで、
  データ転送量を削減し、パフォーマンスを向上

  ❌ 全フィールド取得（遅い）:
  const posts = await prisma.post.findMany();
  → 全てのフィールドを取得（password等の不要なデータも）

  ✅ 必要なフィールドのみ（速い）:
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      // 必要なものだけ
    }
  });


【リレーションの取得】
  user: {
    select: { ... }
  }
  → Post モデルの userId から User モデルを取得
  → SQLでは JOIN に相当

  participants: {
    select: { ... }
  }
  → Participant モデルを取得
  → さらに user も取得（ネストしたリレーション）


【_count の役割】
  関連レコードの数をカウント

  _count: {
    select: {
      comments: true
    }
  }
  → この投稿に対するコメント数を取得
  → SQLでは COUNT(*) に相当


【orderBy の役割】
  結果の並び順を指定

  orderBy: {
    createdAt: 'desc'  // 降順（新しい順）
  }
  // 'asc' なら昇順（古い順）


【take の役割】
  取得する最大件数を制限

  take: 50
  → 最大50件まで取得
  → SQLでは LIMIT に相当
  → パフォーマンス対策として重要


┌────────────────────────────────────┐
│  生成されるSQL（イメージ）          │
├────────────────────────────────────┤
│                                    │
│  SELECT                            │
│    p.id,                          │
│    p.title,                       │
│    p.content,                     │
│    u.name as user_name,           │
│    COUNT(c.id) as comment_count   │
│  FROM posts p                     │
│  LEFT JOIN users u                │
│    ON p.userId = u.id             │
│  LEFT JOIN comments c             │
│    ON p.id = c.postId             │
│  GROUP BY p.id                    │
│  ORDER BY p.createdAt DESC        │
│  LIMIT 50;                        │
│                                    │
└────────────────────────────────────┘
```

#### POST: 新規投稿の作成

```typescript
// 新規投稿作成（管理者のみ）
export async function POST(request: NextRequest) {
  try {
    // ステップ1: セッションを取得（認証チェック）
    const session = await auth()
    if (!session?.user) {
      // ログインしていない場合は401エラー
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ステップ2: 管理者権限チェック
    const admin = await isAdmin()
    if (!admin) {
      // 管理者でない場合は403エラー
      return NextResponse.json(
        { error: '投稿の作成は管理者のみ可能です' },
        { status: 403 }
      )
    }

    // ステップ3: リクエストボディを取得
    const body = await request.json()
    const { title, content, youtubeUrls, images } = body

    // ステップ4: データベースに投稿を作成
    const post = await prisma.post.create({
      data: {
        title,
        content,
        // YouTube URLの配列を整形（空白を削除、空文字を除外）
        youtubeUrls: (youtubeUrls || [])
          .map((url: string) => url.trim())
          .filter((url: string) => url !== ''),
        images: images || [],
        userId: session.user.id  // ログインユーザーのIDを設定
      }
    })

    // ステップ5: 作成した投稿をレスポンスとして返す
    return NextResponse.json(post)
  } catch (error) {
    // エラーハンドリング
    console.error('Failed to create post:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create post',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
```

**セキュリティチェックの流れ:**

```
┌──────────────────────────────────────────────────┐
│     投稿作成のセキュリティチェックフロー         │
└──────────────────────────────────────────────────┘

1. リクエスト受信
   POST /api/posts
     ↓
2. 認証チェック
   const session = await auth()
     ↓ ログインしていない
   ❌ 401 Unauthorized
     ↓ ログイン済み
3. 権限チェック
   const admin = await isAdmin()
     ↓ 管理者でない
   ❌ 403 Forbidden
     ↓ 管理者
4. データ取得
   const body = await request.json()
     ↓
5. データベース操作
   await prisma.post.create({ ... })
     ↓
6. レスポンス返却
   return NextResponse.json(post)


【HTTPステータスコードの使い分け】

  200 OK: 成功（GET, PATCH, DELETE）
  201 Created: 作成成功（POST）
  400 Bad Request: リクエストが不正
  401 Unauthorized: 認証が必要
  403 Forbidden: 権限がない
  404 Not Found: リソースが見つからない
  500 Internal Server Error: サーバーエラー
```

### src/app/api/posts/[id]/route.ts

このファイルは特定の投稿の**詳細取得**、**更新**、**削除**を担当します。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

// GET: 投稿詳細の取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }  // URLパラメータから id を取得
) {
  try {
    // params.id を使って特定の投稿を取得
    const post = await prisma.post.findUnique({
      where: { id: params.id },  // WHERE id = params.id
      include: {
        // 投稿者情報を含める
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        // 参加者情報を含める
        participants: {
          include: {
            user: true
          }
        },
        // いいね情報を含める
        likes: {
          include: {
            user: true
          }
        },
        // コメント情報を含める
        comments: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    // 投稿が見つからない場合
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // 投稿を返す
    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to fetch post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// PATCH: 投稿の更新（管理者のみ）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証・権限チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // リクエストボディを取得
    const body = await request.json()
    const { title, content, youtubeUrls, images } = body

    // 投稿を更新
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        content,
        youtubeUrls: (youtubeUrls || [])
          .map((url: string) => url.trim())
          .filter((url: string) => url !== ''),
        images: images || []
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to update post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE: 投稿の削除（管理者のみ）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証・権限チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 投稿を削除
    await prisma.post.delete({
      where: { id: params.id }
    })

    // 削除成功メッセージを返す
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
```

**URLパラメータの取得:**

```
┌──────────────────────────────────────────────────┐
│     URLパラメータ（Dynamic Routes）の仕組み      │
└──────────────────────────────────────────────────┘

【ディレクトリ構造】
  src/app/api/posts/[id]/route.ts
                      ^^^^
                      動的セグメント

【URLとパラメータの対応】
  URL: /api/posts/abc123
       → params.id = "abc123"

  URL: /api/posts/def456
       → params.id = "def456"


【関数シグネチャ】
  export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
                          ^^^^^^^^^^^^^^^^^^
                          パラメータの型定義
  ) {
    // params.id でアクセス
    const post = await prisma.post.findUnique({
      where: { id: params.id }
    });
  }


【findUnique vs findMany】
  findUnique: 1件だけ取得（主キーやユニーク制約で検索）
    await prisma.post.findUnique({
      where: { id: params.id }
    });

  findMany: 複数件取得（条件に一致する全て）
    await prisma.post.findMany({
      where: { userId: session.user.id }
    });
```

### src/app/api/posts/[id]/like/route.ts

いいね機能のAPI実装です。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST: いいねを追加
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // いいねを作成（重複チェックあり）
    const like = await prisma.like.create({
      data: {
        postId: params.id,        // 投稿ID
        userId: session.user.id   // ユーザーID
      }
    })

    return NextResponse.json(like)
  } catch (error) {
    // ユニーク制約違反（既にいいね済み）の場合
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      )
    }

    console.error('Failed to create like:', error)
    return NextResponse.json(
      { error: 'Failed to create like' },
      { status: 500 }
    )
  }
}

// DELETE: いいねを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // いいねを削除
    // postId と userId の複合キーで検索
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: params.id,
          userId: session.user.id
        }
      }
    })

    return NextResponse.json({ message: 'Like removed successfully' })
  } catch (error) {
    console.error('Failed to remove like:', error)
    return NextResponse.json(
      { error: 'Failed to remove like' },
      { status: 500 }
    )
  }
}
```

**複合ユニークキーの使い方:**

```
┌──────────────────────────────────────────────────┐
│     複合ユニークキー（Composite Unique Key）     │
└──────────────────────────────────────────────────┘

【Prismaスキーマでの定義】
  model Like {
    id        String   @id @default(cuid())
    postId    String
    userId    String
    createdAt DateTime @default(now())

    post Post @relation(fields: [postId], references: [id])
    user User @relation(fields: [userId], references: [id])

    @@unique([postId, userId])
    ^^^^^^^^^^^^^^^^^^^^^^^^
    postId と userId の組み合わせが一意
    → 同じユーザーが同じ投稿に2回いいねできない
  }


【削除時の使い方】
  await prisma.like.delete({
    where: {
      postId_userId: {
        ^^^^^^^^^^^^^^
        複合キー名（キャメルケースで自動生成）
        
        postId: params.id,
        userId: session.user.id
      }
    }
  });


【エラーハンドリング】
  try {
    await prisma.like.create({ ... });
  } catch (error) {
    // ユニーク制約違反をキャッチ
    if (error.message.includes('Unique constraint')) {
      // 既にいいね済み
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      );
    }
  }


【データベースレベルの整合性】
  @@unique([postId, userId])
  ↓
  CREATE UNIQUE INDEX ON likes(postId, userId);
  
  → データベースが重複を防ぐ
  → アプリケーションレベルで重複チェック不要
  → レースコンディションを防ぐ
```

### src/app/api/posts/[id]/comments/route.ts

コメント機能のAPI実装です。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET: コメント一覧の取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 特定の投稿のコメントを取得
    const comments = await prisma.comment.findMany({
      where: { postId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'  // 新しい順
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST: コメントの作成
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // リクエストボディを取得
    const body = await request.json()
    const { content } = body

    // バリデーション
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // コメントを作成
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: params.id,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
```

**バリデーションの実装:**

```
┌──────────────────────────────────────────────────┐
│     入力バリデーションのベストプラクティス       │
└──────────────────────────────────────────────────┘

【基本的なバリデーション】
  1. 必須チェック
  if (!content) {
    return NextResponse.json(
      { error: 'Content is required' },
      { status: 400 }
    );
  }

  2. 空文字チェック
  if (content.trim() === '') {
    return NextResponse.json(
      { error: 'Content cannot be empty' },
      { status: 400 }
    );
  }

  3. 文字数チェック
  if (content.length > 1000) {
    return NextResponse.json(
      { error: 'Content is too long' },
      { status: 400 }
    );
  }


【Zodを使った高度なバリデーション】
  import { z } from 'zod';

  const commentSchema = z.object({
    content: z
      .string()
      .min(1, 'Content is required')
      .max(1000, 'Content is too long')
      .trim()
  });

  try {
    const validatedData = commentSchema.parse(body);
    // validatedData.content は検証済み
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
  }


【クライアント側でもバリデーション】
  サーバー側だけでなく、クライアント側でも
  バリデーションを行うことで、ユーザー体験を向上

  Client: 即座にエラー表示
    ↓
  Server: 最終的なセキュリティチェック
```

---

## 26.2 イベントAPIの詳細

イベントAPIも投稿APIと同じ構造です。

### src/app/api/events/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

// GET: イベント一覧の取得
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        participants: {
          include: {
            user: true
          }
        },
        challengeSongs: true,  // 課題曲も含める
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        date: 'asc'  // 日付の昇順（近い順）
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST: イベントの作成（管理者のみ）
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, date, location, challengeSongs } = body

    // イベントと課題曲を一度に作成（トランザクション）
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),  // 文字列をDateに変換
        location,
        userId: session.user.id,
        // 課題曲も同時に作成
        challengeSongs: {
          create: challengeSongs || []
        }
      },
      include: {
        challengeSongs: true
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Failed to create event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
```

**ネストした作成（Nested Create）:**

```
┌──────────────────────────────────────────────────┐
│     Prismaのネストした作成（Nested Create）      │
└──────────────────────────────────────────────────┘

【概念】
  親レコードと子レコードを同時に作成

  Event（親）
  ├─ ChallengeSong（子1）
  ├─ ChallengeSong（子2）
  └─ ChallengeSong（子3）


【実装例】
  const event = await prisma.event.create({
    data: {
      title: 'ライブイベント',
      date: new Date('2025-01-01'),
      
      // 子レコードを同時に作成
      challengeSongs: {
        create: [
          {
            title: '曲1',
            artist: 'アーティスト1',
            youtubeUrl: 'https://...'
          },
          {
            title: '曲2',
            artist: 'アーティスト2',
            youtubeUrl: 'https://...'
          }
        ]
      }
    },
    include: {
      challengeSongs: true  // 作成した子レコードも返す
    }
  });


【メリット】
  1. トランザクション
     → 親と子が両方作成されるか、両方失敗するか
     → 中途半端な状態にならない

  2. コード量削減
     → 1回のクエリで完結

  3. パフォーマンス向上
     → データベースへのアクセス回数が減る


【従来の方法（非推奨）】
  // ❌ トランザクション管理が大変
  const event = await prisma.event.create({ ... });
  
  for (const song of challengeSongs) {
    await prisma.challengeSong.create({
      data: {
        ...song,
        eventId: event.id  // 親IDを手動で設定
      }
    });
  }
```

---

## 26.3 活動スケジュールAPIの詳細

活動スケジュールのAPI実装です。

### src/app/api/activity-schedules/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

// GET: 活動スケジュール一覧の取得
export async function GET() {
  try {
    const schedules = await prisma.activitySchedule.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        participants: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        date: 'asc'  // 日付の昇順
      }
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Failed to fetch schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

// POST: 活動スケジュールの作成（管理者のみ）
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, date, location, locationUrl } = body

    const schedule = await prisma.activitySchedule.create({
      data: {
        title,
        content,
        date: new Date(date),
        location,
        locationUrl,
        userId: session.user.id
      }
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Failed to create schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}
```

### src/app/api/activity-schedules/[id]/participate/route.ts

参加登録機能のAPI実装です。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST: 参加登録
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 参加登録を作成
    const participant = await prisma.activityParticipant.create({
      data: {
        activityScheduleId: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json(participant)
  } catch (error) {
    // 既に参加登録済みの場合
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Already participating' },
        { status: 400 }
      )
    }

    console.error('Failed to participate:', error)
    return NextResponse.json(
      { error: 'Failed to participate' },
      { status: 500 }
    )
  }
}

// DELETE: 参加登録の取り消し
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 参加登録を削除
    await prisma.activityParticipant.delete({
      where: {
        activityScheduleId_userId: {
          activityScheduleId: params.id,
          userId: session.user.id
        }
      }
    })

    return NextResponse.json({ message: 'Participation cancelled' })
  } catch (error) {
    console.error('Failed to cancel participation:', error)
    return NextResponse.json(
      { error: 'Failed to cancel participation' },
      { status: 500 }
    )
  }
}
```

---

## 26.4 ユーザーAPIの詳細

### src/app/api/users/route.ts

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: ユーザー一覧の取得
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        bio: true,
        instrument: true,
        createdAt: true,
        // パスワードは絶対に含めない！
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
```

**セキュリティ上の注意:**

```
┌──────────────────────────────────────────────────┐
│     ユーザー情報取得時のセキュリティ             │
└──────────────────────────────────────────────────┘

【絶対に返してはいけない情報】
  ❌ password: ハッシュ化されていても返さない
  ❌ email: プライバシー保護のため慎重に扱う
  ❌ sessionToken: セッション乗っ取りのリスク


【selectで明示的に指定】
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      // password は含めない！
    }
  });

  ❌ include や select なしで全フィールド取得は危険
  const users = await prisma.user.findMany();
  → password も含まれてしまう


【役割による情報の出し分け】
  // 自分の情報
  if (session.user.id === userId) {
    return {
      ...user,
      email: user.email  // 自分のメールは表示OK
    };
  }

  // 他人の情報
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl
    // email は返さない
  };
```

---

## まとめ

この章では、API Routesの実装を詳しく解説しました。

### 🎓 この章で学んだこと

#### API Routeの基本
- ✅ HTTPメソッドとCRUD操作の対応
- ✅ NextRequest と NextResponse の使い方
- ✅ URLパラメータの取得方法

#### Prismaクエリ
- ✅ findMany / findUnique の使い分け
- ✅ select と include の違い
- ✅ ネストした作成（Nested Create）
- ✅ 複合ユニークキーの使い方

#### セキュリティ
- ✅ 認証チェックの実装
- ✅ 権限チェックの実装
- ✅ バリデーションの実装
- ✅ エラーハンドリング

### 💡 重要なポイント

#### API Routeの標準パターン

```typescript
export async function METHOD(request: NextRequest) {
  try {
    // 1. 認証
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 権限
    if (!isAdmin()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. バリデーション
    const body = await request.json();
    // ...

    // 4. データベース操作
    const result = await prisma.model.create({ ... });

    // 5. レスポンス
    return NextResponse.json(result);
  } catch (error) {
    // 6. エラーハンドリング
    return NextResponse.json({ error: '...' }, { status: 500 });
  }
}
```

### 🚀 次のステップ

次の章では、ページコンポーネントの詳細を解説します：

- **Chapter 27**: ページコンポーネントの詳細解説

---

[← 前の章：第30章 CI/CDの実装](30-CI-CDの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第32章 ページコンポーネントの詳細解説 →](32-ページコンポーネントの詳細解説.md)
