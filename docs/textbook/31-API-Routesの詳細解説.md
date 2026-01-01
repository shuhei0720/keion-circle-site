# 第31章：API Routesの詳細解説

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

## 31.1 投稿APIの詳細

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

### 31.1.3 投稿のいいね機能（src/app/api/posts/[id]/like/route.ts）

いいね機能は、ユーザーが投稿に対して「いいね」をつけたり、取り消したりする機能です。

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Next.jsのランタイムを指定（Node.jsランタイムを使用）
export const runtime = 'nodejs'

/**
 * POST: いいねを登録・削除（トグル動作）
 * 
 * @param req - リクエストオブジェクト
 * @param params - URLパラメータ（投稿ID）
 * @returns いいね登録結果またはエラー
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック - ログインしているユーザーのみいいねできる
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }  // 401 Unauthorized: 認証が必要
      );
    }

    // 2. URLパラメータから投稿IDを取得
    // Next.js 15+では params が Promise になっている
    const { id: postId } = await params;
    
    // 3. セッションからユーザーIDを取得
    const userId = session.user.id!;  // ! は null でないことを保証

    // 4. 既存のいいねを検索
    // postId と userId の組み合わせで一意に特定
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {  // 複合ユニークキー
          postId,
          userId,
        },
      },
    });

    // 5. 既にいいねしている場合は削除（いいね取り消し）
    if (existingLike) {
      await prisma.postLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      
      // liked: false を返してクライアント側で状態を更新
      return NextResponse.json({
        message: 'いいねを取り消しました',
        liked: false
      });
    }

    // 6. いいねを新規作成
    const like = await prisma.postLike.create({
      data: {
        postId,   // 投稿ID
        userId,   // ユーザーID
      },
    });

    // liked: true を返してクライアント側で状態を更新
    return NextResponse.json({
      like,
      liked: true
    });
    
  } catch (error) {
    // 7. エラーハンドリング
    console.error('いいね登録エラー:', error);
    return NextResponse.json(
      { error: 'いいね登録に失敗しました' },
      { status: 500 }  // 500 Internal Server Error
    );
  }
}

/**
 * DELETE: いいねを削除
 * 
 * POSTメソッドでトグル動作を実装しているため、
 * このメソッドは通常使用されないが、明示的な削除用に実装
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 2. パラメータ取得
    const { id: postId } = await params;
    const userId = session.user.id!;

    // 3. いいねを削除
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
    return NextResponse.json(
      { error: 'いいね削除に失敗しました' },
      { status: 500 }
    );
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     いいね機能の設計パターン                      │
└──────────────────────────────────────────────────┘

【トグル動作の実装】
  POSTメソッドで「いいね」と「いいね取り消し」の両方を処理
  
  1回目のPOST: いいねを作成 → liked: true を返す
  2回目のPOST: いいねを削除 → liked: false を返す
  
  これにより、クライアント側は1つのボタンで切り替え可能


【複合ユニークキー】
  where: {
    postId_userId: { postId, userId }
  }
  
  → postId と userId の組み合わせで一意に特定
  → 同じユーザーが同じ投稿に複数回いいねできないことを保証
  → データベーススキーマで @@unique([postId, userId]) と定義


【楽観的UI更新との連携】
  return NextResponse.json({ liked: true })
  
  → クライアント側でこの値を受け取り、UIを即座に更新
  → ユーザーは待ち時間なくフィードバックを得られる


【エラーハンドリング】
  - 401 Unauthorized: ログインしていない場合
  - 500 Internal Server Error: データベースエラーなど
  
  クライアント側でエラーを検知して適切に処理
```

**クライアント側の実装例:**

```typescript
// クライアント側（Client Component）でのいいね処理
const handleLike = async (postId: string) => {
  // 1. 楽観的UI更新（先に画面を更新）
  setLiked(!liked)
  setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  
  try {
    // 2. APIリクエスト
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
    })
    
    const data = await res.json()
    
    // 3. サーバーからの応答で最終的な状態を確定
    if (res.ok) {
      setLiked(data.liked)
      // いいね数を再取得して同期
      await fetchPost()
    } else {
      // 4. エラー時は元に戻す
      setLiked(liked)
      setLikeCount(likeCount)
      alert(data.error || 'いいね処理に失敗しました')
    }
  } catch (error) {
    // 5. ネットワークエラー時も元に戻す
    setLiked(liked)
    setLikeCount(likeCount)
    console.error('いいね処理エラー:', error)
  }
}
```

---

### 31.1.4 投稿のコメント機能（src/app/api/posts/[id]/comments/route.ts）

コメント機能は、ユーザーが投稿に対してコメントを投稿する機能です。

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * POST: 投稿にコメントを投稿
 * 
 * @param request - リクエストオブジェクト（コメント内容を含む）
 * @param params - URLパラメータ（投稿ID）
 * @returns 作成されたコメント情報
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック - ログインユーザーのみコメント可能
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 2. リクエストボディからコメント内容を取得
    const { content } = await request.json()
    
    // 3. URLパラメータから投稿IDを取得
    const { id } = await params

    // 4. バリデーション - コメント内容が空でないことを確認
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'コメント内容は必須です' },
        { status: 400 }  // 400 Bad Request: クライアントエラー
      )
    }

    // 5. コメントをデータベースに保存
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),      // 前後の空白を削除
        userId: session.user.id,      // コメント投稿者のID
        postId: id                    // 投稿ID
      },
      // 6. コメント投稿者の情報も一緒に取得
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true  // アバター画像も取得
          }
        }
      }
    })

    // 7. 201 Created ステータスで成功レスポンスを返す
    return NextResponse.json(comment, { status: 201 })
    
  } catch (error) {
    // 8. エラーハンドリング
    console.error('コメント投稿エラー:', error)
    return NextResponse.json(
      { error: 'コメントの投稿に失敗しました' },
      { status: 500 }
    )
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     コメント機能の設計パターン                    │
└──────────────────────────────────────────────────┘

【バリデーション】
  1. 空文字チェック: !content || content.trim() === ''
     → 空白のみのコメントを防ぐ
  
  2. trim() で前後の空白を削除
     → データベースに余計な空白を保存しない


【include でユーザー情報を取得】
  include: {
    user: {
      select: { id, name, email, avatarUrl }
    }
  }
  
  → コメントとコメント投稿者の情報を一度に取得
  → クライアント側で別途ユーザー情報を取得する必要がない
  → パフォーマンスの向上（N+1問題の回避）


【HTTPステータスコード】
  - 201 Created: リソースの作成成功
  - 400 Bad Request: バリデーションエラー
  - 401 Unauthorized: 認証が必要
  - 500 Internal Server Error: サーバーエラー


【リレーションの自動処理】
  data: {
    content,
    userId,
    postId
  }
  
  → Prisma が自動的に Comment モデルの
     user リレーションと post リレーションを設定
```

**コメント一覧の取得（GET）も実装可能:**

```typescript
/**
 * GET: 投稿のコメント一覧を取得
 * 
 * この実装は省略されているが、実際のプロジェクトでは
 * 投稿詳細ページでコメント一覧を表示するために使用される
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // コメントを新しい順に取得
    const comments = await prisma.comment.findMany({
      where: {
        postId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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
    console.error('コメント取得エラー:', error)
    return NextResponse.json(
      { error: 'コメントの取得に失敗しました' },
      { status: 500 }
    )
  }
}
```

---

### 31.1.5 投稿への参加登録（src/app/api/posts/[id]/participate/route.ts）

参加登録機能は、ユーザーが活動報告に対して「参加した」または「参加しなかった」を記録する機能です。

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * POST: 投稿への参加/不参加を登録
 * 
 * @param req - リクエストオブジェクト（参加ステータスを含む）
 * @param params - URLパラメータ（投稿ID）
 * @returns 参加登録情報
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 2. リクエストボディから参加ステータスを取得
    const { status } = await req.json();
    
    // 3. バリデーション - ステータスが有効な値かチェック
    if (!status || !['participating', 'not_participating'].includes(status)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      );
    }

    // 4. パラメータ取得
    const { id: postId } = await params;
    const userId = session.user.id!;

    // 5. 既存の参加情報を検索
    const existingParticipation = await prisma.postParticipant.findUnique({
      where: {
        postId_userId: {  // 複合ユニークキー
          postId,
          userId,
        },
      },
    });

    // 6. 既存の参加情報がある場合は更新
    if (existingParticipation) {
      const participation = await prisma.postParticipant.update({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
        data: {
          status,  // 'participating' or 'not_participating'
        },
      });
      return NextResponse.json(participation);
    }
    
    // 7. 新規参加情報を作成
    const participation = await prisma.postParticipant.create({
      data: {
        postId,
        userId,
        status,
      },
    });
    return NextResponse.json(participation);
    
  } catch (error) {
    console.error('参加登録エラー:', error);
    return NextResponse.json(
      { error: '参加登録に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 参加をキャンセル（参加情報を削除）
 * 
 * @param req - リクエストオブジェクト
 * @param params - URLパラメータ（投稿ID）
 * @returns 削除完了メッセージ
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 2. パラメータ取得
    const { id: postId } = await params;
    const userId = session.user.id!;

    // 3. 参加情報を削除
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
    return NextResponse.json(
      { error: '参加キャンセルに失敗しました' },
      { status: 500 }
    );
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     参加登録機能の設計パターン                    │
└──────────────────────────────────────────────────┘

【参加ステータスの種類】
  - 'participating': 参加した
  - 'not_participating': 参加しなかった
  
  null: 未回答（参加情報がない状態）


【Upsert パターン】
  1. findUnique で既存の参加情報を検索
  2. 存在する場合: update で更新
  3. 存在しない場合: create で新規作成
  
  これにより、同じエンドポイントで新規登録と更新の両方に対応


【複合ユニークキー】
  postId_userId: { postId, userId }
  
  → 1人のユーザーは1つの投稿に対して1つの参加情報のみ持つ
  → 重複登録を防ぐ


【DELETE メソッドの役割】
  参加情報を完全に削除
  → 「参加」「不参加」の選択を取り消す
  → null 状態（未回答）に戻す


【使用例】
  活動報告（練習、イベント、合宿など）に対して、
  誰が参加したかを記録する
  
  → 参加者リストの表示
  → 参加率の統計
  → 次回の企画立案の参考データ
```

**クライアント側の実装例:**

```typescript
// クライアント側での参加登録処理
const handleParticipate = async (postId: string, status: string) => {
  try {
    const res = await fetch(`/api/posts/${postId}/participate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),  // 'participating' or 'not_participating'
    })
    
    if (res.ok) {
      const data = await res.json()
      alert('参加情報を更新しました')
      // 投稿詳細を再取得して参加者リストを更新
      await fetchPost()
    } else {
      const error = await res.json()
      alert(error.error || '参加登録に失敗しました')
    }
  } catch (error) {
    console.error('参加登録エラー:', error)
    alert('参加登録に失敗しました')
  }
}

// 参加キャンセル処理
const handleCancelParticipation = async (postId: string) => {
  if (!confirm('参加情報を削除しますか？')) return
  
  try {
    const res = await fetch(`/api/posts/${postId}/participate`, {
      method: 'DELETE',
    })
    
    if (res.ok) {
      alert('参加をキャンセルしました')
      await fetchPost()
    }
  } catch (error) {
    console.error('キャンセルエラー:', error)
  }
}
```

---

### 31.1.6 画像アップロード（src/app/api/posts/image/route.ts）

投稿に画像を添付するための画像アップロードAPIです。Base64エンコーディングを使用して画像をデータURIとして返します。

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Next.jsのランタイムを指定
export const runtime = 'nodejs'

/**
 * POST: 画像をアップロード
 * 
 * @param req - リクエストオブジェクト（FormDataで画像ファイルを含む）
 * @returns Base64エンコードされた画像のデータURI
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 認証チェック - ログインユーザーのみアップロード可能
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 2. FormData から画像ファイルを取得
    const formData = await req.formData();
    const file = formData.get('image') as File;

    // 3. ファイルの存在チェック
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    // 4. ファイルサイズチェック（2MB以下）
    // Base64エンコードで保存するため、サイズを小さめに制限
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは2MB以下にしてください' },
        { status: 400 }
      );
    }

    // 5. ファイルタイプチェック（画像のみ）
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '画像ファイルのみアップロード可能です' },
        { status: 400 }
      );
    }

    // 6. 画像をBase64に変換
    const bytes = await file.arrayBuffer();        // ArrayBuffer として読み込み
    const buffer = Buffer.from(bytes);             // Node.js の Buffer に変換
    const base64 = buffer.toString('base64');      // Base64 文字列に変換
    
    // 7. データURIを作成
    // data:[MIMEタイプ];base64,[Base64データ]
    const imageUrl = `data:${file.type};base64,${base64}`;

    // 8. データURIを返す
    return NextResponse.json({ imageUrl });
    
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    );
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     画像アップロードの設計パターン                │
└──────────────────────────────────────────────────┘

【Base64エンコーディング】
  画像ファイル → ArrayBuffer → Buffer → Base64文字列
  
  利点:
  - 外部ストレージ不要（データベースに直接保存）
  - セットアップが簡単
  
  欠点:
  - ファイルサイズが約1.33倍に増加
  - 大きな画像には不向き
  
  → 2MB以下に制限して運用


【データURI形式】
  data:[MIMEタイプ];base64,[Base64データ]
  
  例: data:image/jpeg;base64,/9j/4AAQSkZJRg...
  
  → HTML の <img src="..."> に直接使用可能
  → データベースの TEXT フィールドに保存可能


【FormData の扱い】
  FormData は multipart/form-data 形式のデータ
  
  クライアント側:
    const formData = new FormData()
    formData.append('image', file)
  
  サーバー側:
    const formData = await req.formData()
    const file = formData.get('image') as File


【バリデーション】
  1. ファイル存在チェック: !file
  2. サイズチェック: file.size > 2MB
  3. タイプチェック: !file.type.startsWith('image/')
  
  → セキュリティと パフォーマンスのため必須


【代替案: Supabase Storage】
  大規模アプリケーションでは Supabase Storage などの
  外部ストレージサービスの使用を推奨:
  
  - 大きなファイルに対応
  - CDN による高速配信
  - 画像の自動最適化
  
  このプロジェクトでは、アバター画像には Supabase Storage を使用
```

**クライアント側の実装例:**

```typescript
// クライアント側での画像アップロード処理
const handleImageUpload = async (file: File) => {
  try {
    // 1. FormData を作成
    const formData = new FormData()
    formData.append('image', file)
    
    // 2. API にアップロード
    const res = await fetch('/api/posts/image', {
      method: 'POST',
      body: formData,  // Content-Type は自動的に設定される
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'アップロードに失敗しました')
    }
    
    // 3. データURIを取得
    const { imageUrl } = await res.json()
    
    // 4. 画像URLを状態に保存（投稿作成時に使用）
    setImages([...images, imageUrl])
    
    return imageUrl
    
  } catch (error) {
    console.error('画像アップロードエラー:', error)
    alert('画像のアップロードに失敗しました')
  }
}

// ファイル選択時の処理
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  // ファイルサイズをクライアント側でもチェック
  if (file.size > 2 * 1024 * 1024) {
    alert('ファイルサイズは2MB以下にしてください')
    return
  }
  
  // アップロード実行
  handleImageUpload(file)
}
```

**セキュリティ上の注意点:**

```
【重要】本番環境での画像アップロードの考慮事項

1. ファイルタイプの検証
   - MIME タイプだけでなく、実際のファイルヘッダーも検証
   - 悪意のあるファイル（実行可能ファイルなど）の混入を防ぐ

2. ファイルサイズの制限
   - サーバーのメモリやストレージを圧迫しないよう制限
   - DoS攻撃の防止

3. ファイル名のサニタイズ
   - 特殊文字やパストラバーサル（../など）の除去
   - このAPIでは Base64 を使用するため不要

4. レート制限
   - 短時間に大量アップロードを防ぐ
   - API レベルでのレート制限を実装

5. ウイルススキャン
   - 本番環境ではアップロードファイルのスキャンを推奨
```

---

## 31.2 イベントAPIの詳細

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

### 31.2.1 イベントの更新と削除（src/app/api/events/[id]/route.ts）

イベントの詳細な更新と削除を行うAPIです。管理者のみが実行可能です。

```typescript
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

/**
 * PUT: イベントを更新
 * 
 * @param request - リクエストオブジェクト（更新内容を含む）
 * @param params - URLパラメータ（イベントID）
 * @returns 更新されたイベント情報
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 2. 管理者権限チェック
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }  // 403 Forbidden: 権限不足
      )
    }

    // 3. リクエストボディから更新内容を取得
    const {
      title,        // イベントタイトル
      content,      // 説明
      date,         // 開催日時
      locationName, // 場所名
      locationUrl,  // 地図URL
      songs         // 課題曲リスト
    } = await request.json()
    
    // 4. URLパラメータからイベントIDを取得
    const { id } = await params

    // 5. イベントをデータベースで更新
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        content,
        // date が指定されている場合は Date オブジェクトに変換
        date: date ? new Date(date) : null,
        // 空文字列の場合は null に変換
        locationName: locationName || null,
        locationUrl: locationUrl || null,
        // songs 配列が存在する場合は JSON 文字列に変換
        songs: songs && songs.length > 0 ? JSON.stringify(songs) : null
      },
      // 6. 関連データも含めて取得（リレーション）
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'  // コメントは古い順
          }
        }
      }
    })

    // 7. イベント一覧ページのキャッシュを無効化
    // Next.jsのキャッシュシステムで、更新後に最新データを表示
    revalidatePath('/events')

    return NextResponse.json(event)
    
  } catch (error) {
    console.error('イベント更新エラー:', error)
    return NextResponse.json(
      { error: 'イベントの更新に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: イベントを削除
 * 
 * @param request - リクエストオブジェクト
 * @param params - URLパラメータ（イベントID）
 * @returns 削除成功メッセージ
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 2. 管理者権限チェック
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    // 3. URLパラメータからイベントIDを取得
    const { id } = await params

    // 4. イベントを削除
    // Prismaのカスケード削除で関連する参加者・コメントも自動削除
    await prisma.event.delete({
      where: { id }
    })

    // 5. イベント一覧ページのキャッシュを無効化
    revalidatePath('/events')

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('イベント削除エラー:', error)
    return NextResponse.json(
      { error: 'イベントの削除に失敗しました' },
      { status: 500 }
    )
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     イベント更新・削除の設計パターン              │
└──────────────────────────────────────────────────┘

【管理者権限チェック】
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }
  
  → 管理者のみがイベントを編集・削除できる
  → 403 Forbidden: 認証はされているが権限がない


【NULL 値の扱い】
  locationName: locationName || null
  songs: songs && songs.length > 0 ? JSON.stringify(songs) : null
  
  → 空文字列や空配列を null に変換
  → データベースで NULL として保存
  → 「未設定」と「空文字列」を明確に区別


【JSONデータの保存】
  songs: JSON.stringify(songs)
  
  → 課題曲の配列を JSON 文字列に変換して保存
  → Prisma スキーマでは String 型として定義
  → 取得時は JSON.parse() でオブジェクトに戻す


【キャッシュの無効化】
  revalidatePath('/events')
  
  → Next.js の Server Component キャッシュを無効化
  → イベント一覧ページで最新データを表示
  → revalidatePath は更新・削除後に必須


【カスケード削除】
  Prisma スキーマで onDelete: Cascade を設定している場合:
  
  model Event {
    participants EventParticipant[] @relation(onDelete: Cascade)
    comments     Comment[]           @relation(onDelete: Cascade)
  }
  
  → イベント削除時、関連する参加者・コメントも自動削除
  → 孤立データ（orphaned records）を防ぐ
```

---

### 31.2.2 イベントへの参加登録（src/app/api/events/[id]/participate/route.ts）

ユーザーがイベントへの参加を登録・解除するAPIです。

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * POST: イベントへの参加を登録/解除（トグル動作）
 * 
 * @param request - リクエストオブジェクト
 * @param params - URLパラメータ（イベントID）
 * @returns 参加登録状態
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 2. URLパラメータからイベントIDを取得
    const { id } = await params

    // 3. 既存の参加情報を確認
    const existing = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: session.user.id
        }
      }
    })

    // 4. 既に参加している場合は参加を解除
    if (existing) {
      await prisma.eventParticipant.delete({
        where: {
          id: existing.id
        }
      })
      // participating: false を返してクライアントで状態更新
      return NextResponse.json({ participating: false })
    }
    
    // 5. 参加登録を作成
    await prisma.eventParticipant.create({
      data: {
        eventId: id,
        userId: session.user.id
      }
    })
    
    // participating: true を返してクライアントで状態更新
    return NextResponse.json({ participating: true })
    
  } catch (error) {
    console.error('参加登録エラー:', error)
    return NextResponse.json(
      { error: '参加登録に失敗しました' },
      { status: 500 }
    )
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     イベント参加の設計パターン                    │
└──────────────────────────────────────────────────┘

【トグル動作】
  existing の有無で動作を切り替え:
  
  - existing がある: 参加解除（DELETE）
  - existing がない: 参加登録（CREATE）
  
  → 1つのエンドポイントで登録・解除の両方を処理
  → クライアント側は同じAPIを呼ぶだけ


【投稿の参加機能との違い】
  投稿: status フィールドで 'participating' / 'not_participating' を管理
  イベント: レコードの有無で参加/不参加を表現
  
  → イベントではシンプルな参加/不参加のみ
  → 投稿では「参加しなかった」という明示的な記録が必要


【楽観的UI更新】
  { participating: true/false } を返す
  
  → クライアント側で即座にボタンの表示を切り替え
  → UXの向上
```

---

### 31.2.3 イベントへのコメント（src/app/api/events/[id]/comments/route.ts）

イベントにコメントを投稿するAPIです。投稿のコメントAPIと同じ構造です。

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * POST: イベントにコメントを投稿
 * 
 * @param request - リクエストオブジェクト（コメント内容を含む）
 * @param params - URLパラメータ（イベントID）
 * @returns 作成されたコメント情報
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 2. リクエストボディからコメント内容を取得
    const { content } = await request.json()
    
    // 3. URLパラメータからイベントIDを取得
    const { id } = await params

    // 4. バリデーション - コメント内容が空でないことを確認
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'コメント内容は必須です' },
        { status: 400 }
      )
    }

    // 5. コメントをデータベースに保存
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        eventId: id  // 投稿IDではなくイベントIDを指定
      },
      // 6. コメント投稿者の情報も取得
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // 7. 201 Created で成功レスポンス
    return NextResponse.json(comment, { status: 201 })
    
  } catch (error) {
    console.error('コメント投稿エラー:', error)
    return NextResponse.json(
      { error: 'コメントの投稿に失敗しました' },
      { status: 500 }
    )
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     コメント機能の共通設計                        │
└──────────────────────────────────────────────────┘

【ポリモーフィックリレーション】
  Comment モデルは複数のリソースにコメント可能:
  
  model Comment {
    postId              String?  // 投稿へのコメント
    eventId             String?  // イベントへのコメント
    activityScheduleId  String?  // 活動スケジュールへのコメント
  }
  
  → postId, eventId, activityScheduleId のうち
     いずれか1つだけが設定される
  → 1つの Comment テーブルで複数のリソースに対応


【コメント投稿のベストプラクティス】
  1. 認証必須: session チェック
  2. バリデーション: 空文字・trim チェック
  3. include でユーザー情報取得: N+1問題の回避
  4. 201 Created ステータス: リソース作成を明示


【クライアント側での表示】
  comment.user.name を使ってコメント投稿者名を表示
  comment.createdAt を使って投稿日時を表示
  
  → include により追加のAPIリクエスト不要
```

---

## 31.3 活動スケジュールAPIの詳細

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

### 31.3.1 活動スケジュールの更新と削除（src/app/api/activity-schedules/[id]/route.ts）

活動スケジュールの詳細な更新と削除を行うAPIです。イベントAPIとほぼ同じ構造です。

```typescript
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

/**
 * PUT: 活動スケジュールを更新
 * 
 * @param request - リクエストオブジェクト（更新内容を含む）
 * @param params - URLパラメータ（活動スケジュールID）
 * @returns 更新された活動スケジュール情報
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 2. 管理者権限チェック
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    // 3. リクエストボディから更新内容を取得
    const { title, content, date } = await request.json()
    
    // 4. URLパラメータから活動スケジュールIDを取得
    const { id } = await params

    // 5. 活動スケジュールをデータベースで更新
    const schedule = await prisma.activitySchedule.update({
      where: { id },
      data: {
        title,
        content,
        date: date ? new Date(date) : null
      },
      // 6. 関連データも含めて取得
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    // 7. 活動スケジュール一覧ページのキャッシュを無効化
    revalidatePath('/activity-schedules')

    return NextResponse.json(schedule)
    
  } catch (error) {
    console.error('活動スケジュール更新エラー:', error)
    return NextResponse.json(
      { error: '活動スケジュールの更新に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: 活動スケジュールを削除
 * 
 * @param request - リクエストオブジェクト
 * @param params - URLパラメータ（活動スケジュールID）
 * @returns 削除成功メッセージ
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 2. 管理者権限チェック
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    // 3. URLパラメータから活動スケジュールIDを取得
    const { id } = await params

    // 4. 活動スケジュールを削除
    await prisma.activitySchedule.delete({
      where: { id }
    })

    // 5. 活動スケジュール一覧ページのキャッシュを無効化
    revalidatePath('/activity-schedules')

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('活動スケジュール削除エラー:', error)
    return NextResponse.json(
      { error: '活動スケジュールの削除に失敗しました' },
      { status: 500 }
    )
  }
}
```

---

### 31.3.2 活動スケジュールへの参加登録（src/app/api/activity-schedules/[id]/participate/route.ts）

ユーザーが活動スケジュールへの参加を登録・解除するAPIです。イベントの参加機能と同じ構造です。

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * POST: 活動スケジュールへの参加を登録/解除（トグル動作）
 * 
 * @param request - リクエストオブジェクト
 * @param params - URLパラメータ（活動スケジュールID）
 * @returns 参加登録状態
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 2. URLパラメータから活動スケジュールIDを取得
    const { id } = await params

    // 3. 既存の参加情報を確認
    const existing = await prisma.activityParticipant.findUnique({
      where: {
        activityScheduleId_userId: {
          activityScheduleId: id,
          userId: session.user.id
        }
      }
    })

    // 4. 既に参加している場合は参加を解除
    if (existing) {
      await prisma.activityParticipant.delete({
        where: {
          id: existing.id
        }
      })
      return NextResponse.json({ participating: false })
    }
    
    // 5. 参加登録を作成
    await prisma.activityParticipant.create({
      data: {
        activityScheduleId: id,
        userId: session.user.id
      }
    })
    
    return NextResponse.json({ participating: true })
    
  } catch (error) {
    console.error('参加登録エラー:', error)
    return NextResponse.json(
      { error: '参加登録に失敗しました' },
      { status: 500 }
    )
  }
}
```

---

### 31.3.3 活動スケジュールへのコメント（src/app/api/activity-schedules/[id]/comments/route.ts）

活動スケジュールにコメントを投稿するAPIです。

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * POST: 活動スケジュールにコメントを投稿
 * 
 * @param request - リクエストオブジェクト（コメント内容を含む）
 * @param params - URLパラメータ（活動スケジュールID）
 * @returns 作成されたコメント情報
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 2. リクエストボディからコメント内容を取得
    const { content } = await request.json()
    
    // 3. URLパラメータから活動スケジュールIDを取得
    const { id } = await params

    // 4. バリデーション - コメント内容が空でないことを確認
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'コメント内容は必須です' },
        { status: 400 }
      )
    }

    // 5. コメントをデータベースに保存
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        activityScheduleId: id  // 活動スケジュールIDを指定
      },
      // 6. コメント投稿者の情報も取得
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // 7. 201 Created で成功レスポンス
    return NextResponse.json(comment, { status: 201 })
    
  } catch (error) {
    console.error('コメント投稿エラー:', error)
    return NextResponse.json(
      { error: 'コメントの投稿に失敗しました' },
      { status: 500 }
    )
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     活動スケジュールAPIの設計パターン             │
└──────────────────────────────────────────────────┘

【イベントAPIとの共通性】
  活動スケジュールAPIとイベントAPIは非常に類似:
  
  - 更新・削除は管理者のみ
  - 参加登録はトグル動作
  - コメントは全ユーザーが投稿可能
  - 同じバリデーションとエラーハンドリング


【リレーションフィールドの違い】
  Comment モデルのフィールド:
  - postId: 投稿へのコメント
  - eventId: イベントへのコメント
  - activityScheduleId: 活動スケジュールへのコメント
  
  → いずれか1つだけが設定される（ポリモーフィック）


【revalidatePath の使用】
  revalidatePath('/activity-schedules')
  
  → 活動スケジュール一覧ページのキャッシュを無効化
  → 更新・削除後に最新データを表示


【複合ユニークキーの命名規則】
  - イベント: eventId_userId
  - 活動スケジュール: activityScheduleId_userId
  
  → Prisma スキーマの @@unique 定義に対応
  → findUnique, delete などで使用
```

---

## 31.4 ユーザーAPIの詳細

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

---

### 31.4.1 ユーザーの削除と役割変更（src/app/api/users/[id]/route.ts）

サイト管理者がユーザーを削除したり、役割を変更したりするAPIです。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isSiteAdmin } from '@/lib/permissions'

/**
 * DELETE: ユーザーを削除（サイト管理者のみ）
 * 
 * @param request - リクエストオブジェクト
 * @param params - URLパラメータ（ユーザーID）
 * @returns 削除成功メッセージ
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. サイト管理者権限チェック
    const siteAdmin = await isSiteAdmin()
    if (!siteAdmin) {
      return NextResponse.json(
        { error: 'ユーザーの削除はサイト管理者のみ可能です' },
        { status: 403 }
      )
    }

    // 3. URLパラメータからユーザーIDを取得
    const { id } = await params

    // 4. 自分自身を削除しようとしていないかチェック
    if (id === session.user.id) {
      return NextResponse.json(
        { error: '自分自身を削除することはできません' },
        { status: 400 }
      )
    }

    // 5. ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 6. ユーザーを削除
    // Cascade設定により、関連するデータも自動削除される
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

/**
 * PATCH: ユーザー役割を更新（サイト管理者のみ）
 * 
 * @param request - リクエストオブジェクト（新しい役割を含む）
 * @param params - URLパラメータ（ユーザーID）
 * @returns 更新されたユーザー情報
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. サイト管理者権限チェック
    const siteAdmin = await isSiteAdmin()
    if (!siteAdmin) {
      return NextResponse.json(
        { error: 'ユーザー役割の変更はサイト管理者のみ可能です' },
        { status: 403 }
      )
    }

    // 3. URLパラメータからユーザーIDを取得
    const { id } = await params
    
    // 4. リクエストボディから新しい役割を取得
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'リクエストボディが不正です' },
        { status: 400 }
      )
    }
    
    const { role } = body

    // 5. 役割のバリデーション
    if (!role || !['site_admin', 'admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: '無効な役割です' },
        { status: 400 }
      )
    }

    // 6. 自分自身の役割を変更しようとしていないかチェック
    if (id === session.user.id) {
      return NextResponse.json(
        { error: '自分自身の役割を変更することはできません' },
        { status: 400 }
      )
    }

    // 7. ユーザーの役割を更新
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(user)
    
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     ユーザー管理の設計パターン                    │
└──────────────────────────────────────────────────┘

【サイト管理者権限】
  const siteAdmin = await isSiteAdmin()
  
  → site_admin 役割のみがユーザー削除・役割変更可能
  → admin 役割ではユーザー管理は不可
  → 権限の階層: site_admin > admin > member


【自己削除・自己変更の防止】
  if (id === session.user.id) {
    return NextResponse.json({ error: '...' }, { status: 400 })
  }
  
  → 自分自身を削除できない
  → 自分自身の役割を変更できない
  → アカウントロックを防ぐための安全機構


【役割のバリデーション】
  ['site_admin', 'admin', 'member'].includes(role)
  
  → 許可された役割のみ受け付ける
  → 不正な役割名を拒否


【HTTPメソッドの使い分け】
  DELETE: リソースの削除
  PATCH: リソースの部分更新（役割のみ変更）
  
  → PUTではなくPATCHを使用（部分更新）
  → RESTful APIの原則に従う


【カスケード削除】
  await prisma.user.delete({ where: { id } })
  
  → Prismaスキーマの設定により、関連データも削除:
    - 投稿
    - イベント
    - コメント
    - いいね
    - 参加情報
  
  → 孤立データを防ぐ
```

---

### 31.4.2 プロフィール更新（src/app/api/profile/route.ts）

ログイン中のユーザーが自分のプロフィールを更新するAPIです。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH: プロフィールを更新
 * 
 * @param req - リクエストオブジェクト（更新内容を含む）
 * @returns 更新されたユーザー情報
 */
export async function PATCH(req: NextRequest) {
  try {
    // 1. 認証チェック
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 2. リクエストボディから更新内容を取得
    const body = await req.json()
    const { name, bio, instruments } = body

    // 3. ユーザー情報を更新
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        name,
        // bio と instruments は空文字列の場合 null に変換
        bio: bio || null,
        instruments: instruments || null
      },
    })

    // 4. 更新されたユーザー情報を返す
    return NextResponse.json(updatedUser)
    
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: '更新に失敗しました' },
      { status: 500 }
    )
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     プロフィール更新の設計パターン                │
└──────────────────────────────────────────────────┘

【自己更新のみ】
  where: { id: session.user.id }
  
  → ログイン中のユーザー自身のみ更新可能
  → 他のユーザーのプロフィールは更新できない


【空値の扱い】
  bio: bio || null
  instruments: instruments || null
  
  → 空文字列を null に変換
  → データベースで「未設定」を明確に表現
  → 空文字列と null を区別


【バリデーションなし】
  この実装ではバリデーションがない
  
  改善案:
  - name の長さ制限（1～50文字など）
  - bio の長さ制限（最大500文字など）
  - instruments の形式チェック
```

---

### 31.4.3 アバター画像アップロード（src/app/api/profile/avatar/route.ts）

ユーザーのアバター画像をSupabase StorageにアップロードするAPIです。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

/**
 * POST: アバター画像をアップロード
 * 
 * @param req - リクエストオブジェクト（FormDataで画像ファイルを含む）
 * @returns アバター画像の公開URL
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Supabaseクライアントの設定チェック
    if (!supabase) {
      console.error('Supabase client is not configured')
      return NextResponse.json({ 
        error: 'Supabase Storageが設定されていません。環境変数を確認してください。',
        details: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
      }, { status: 500 })
    }

    // 2. 認証チェック
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 3. FormData から画像ファイルを取得
    const formData = await req.formData()
    const file = formData.get('avatar') as File

    // 4. ファイルが空の場合はアバターを削除
    if (!file || file.size === 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { avatarUrl: null },
      })
      return NextResponse.json({ avatarUrl: null })
    }

    // 5. ファイル形式のバリデーション
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isImageType = file.type.startsWith('image/') || file.type === ''
    const isImageExtension = allowedExtensions.includes(fileExtension)
    
    // MIMEタイプと拡張子の両方でチェック
    if (!isImageType && !isImageExtension) {
      console.log('File validation failed:', { type: file.type, name: file.name, extension: fileExtension })
      return NextResponse.json(
        { error: '画像ファイルのみアップロード可能です（.jpg, .png, .gif, .webp等）' },
        { status: 400 }
      )
    }

    // 6. ファイルサイズのチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    // 7. ファイルをバイト配列に変換
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 8. ファイル名を生成（ユーザーIDとタイムスタンプ）
    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // 9. Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')  // バケット名
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,  // 既存ファイルがあれば上書き
      })

    // 10. アップロードエラーの処理
    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'アップロードに失敗しました: ' + uploadError.message },
        { status: 500 }
      )
    }

    // 11. 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // 12. データベースのavatarUrlを更新
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    })

    // 13. 新しいアバターURLを返す
    return NextResponse.json({ avatarUrl: updatedUser.avatarUrl })
    
  } catch (error) {
    console.error('Avatar upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'アップロードに失敗しました',
      details: errorMessage
    }, { status: 500 })
  }
}
```

**実装のポイント:**

```
┌──────────────────────────────────────────────────┐
│     アバター画像アップロードの設計パターン        │
└──────────────────────────────────────────────────┘

【Supabase Storage の使用】
  投稿画像: Base64エンコード（小さい画像用）
  アバター画像: Supabase Storage（大きい画像用）
  
  理由:
  - アバターは5MBまで対応
  - CDNによる高速配信
  - 画像の最適化・リサイズ機能
  - データベースの容量節約


【ファイル名の生成】
  `${session.user.id}_${Date.now()}.${fileExt}`
  
  → ユーザーIDとタイムスタンプで一意性を保証
  → ファイル名の衝突を防ぐ
  → 古いアバターを自動的に上書き（upsert: true）


【厳密なバリデーション】
  1. MIMEタイプのチェック: file.type.startsWith('image/')
  2. 拡張子のチェック: allowedExtensions.includes(fileExtension)
  3. サイズチェック: file.size > 5MB
  
  → 両方のチェックで安全性向上
  → セキュリティの防御層を複数設ける


【空ファイルの処理】
  if (!file || file.size === 0) {
    // アバターを削除
    data: { avatarUrl: null }
  }
  
  → ユーザーがアバターを削除したい場合の処理
  → デフォルトアバターに戻す


【エラーハンドリングの詳細化】
  return NextResponse.json({ 
    error: 'アップロードに失敗しました',
    details: errorMessage  // 詳細なエラー情報
  })
  
  → デバッグに役立つ詳細情報を提供
  → 本番環境では details を非表示にすることを推奨


【Supabase バケットの設定】
  バケット名: 'avatars'
  公開設定: Public（誰でも読み取り可能）
  
  Supabaseダッシュボードで設定:
  1. Storage → Create bucket
  2. Bucket name: avatars
  3. Public bucket: ON
```

**クライアント側の実装例:**

```typescript
// アバター画像アップロード処理
const handleAvatarUpload = async (file: File) => {
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'アップロードに失敗しました')
    }
    
    const { avatarUrl } = await res.json()
    setAvatarUrl(avatarUrl)  // 状態を更新
    alert('アバターを更新しました')
    
  } catch (error) {
    console.error('Avatar upload error:', error)
    alert('アバターのアップロードに失敗しました')
  }
}
```

---

## 31.5 その他のAPIの詳細

このセクションでは、認証、補助機能、外部API連携などのAPI Routeを解説します。

### 31.5.1 認証関連API

#### src/app/api/auth/forgot-password/route.ts

パスワードリセット申請のAPIです。ユーザーがメールアドレスを入力すると、リセット用のトークンを生成してメールで送信します。

```typescript
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 1. ユーザーの存在確認
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // セキュリティ: ユーザーが存在しない場合でも成功レスポンスを返す
      // （メールアドレスの存在を外部から判別できないようにするため）
      return NextResponse.json({ message: 'Email sent if user exists' });
    }

    // 2. リセットトークンの生成（ランダムな文字列）
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1時間後

    // 3. トークンをデータベースに保存
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // 4. リセット用URLを生成してメール送信
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

**ポイント**:
- 🔒 **セキュリティ対策**: ユーザーが存在しない場合でも同じレスポンスを返し、メールアドレスの存在を推測されないようにする
- ⏰ **トークンの有効期限**: 1時間後に自動的に無効化（セキュリティ強化）
- 🔐 **ランダムトークン**: `crypto.randomBytes()`で推測不可能なトークンを生成

#### src/app/api/auth/reset-password/route.ts

実際にパスワードをリセットするAPIです。トークンを検証してパスワードを更新します。

```typescript
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // 1. トークンの検証
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // 有効期限内
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // 2. パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. パスワード更新とトークンの無効化
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
```

**ポイント**:
- ⏰ **有効期限チェック**: `gt: new Date()`で現在時刻より後の有効期限のみ許可
- 🔐 **パスワードハッシュ化**: bcryptで安全にハッシュ化（ソルトラウンド10）
- 🗑️ **トークン無効化**: 使用後は即座にトークンを削除

#### src/app/api/auth/verify-email/route.ts

メールアドレスの認証を行うAPIです。ユーザー登録後に送信された認証リンクをクリックすると呼ばれます。

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // トークンを持つユーザーを検索
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // メール認証済みフラグを立てる
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
      },
    });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
```

**ポイント**:
- 🔗 **GETメソッド**: メールのリンクから直接アクセスできるようGETを使用
- ✅ **認証日時の記録**: `emailVerified`にタイムスタンプを保存
- 🗑️ **トークン削除**: 使用後は認証トークンを削除

### 31.5.2 補助機能API

#### src/app/api/geocode/route.ts

住所から緯度・経度を取得する地理情報APIです。活動スケジュールやイベントの場所を地図に表示する際に使用します。

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Google Geocoding APIを呼び出し
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'Geocoding failed' },
        { status: 400 }
      );
    }

    const location = data.results[0].geometry.location;
    return NextResponse.json({
      lat: location.lat,
      lng: location.lng,
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}
```

**ポイント**:
- 🌍 **Google Geocoding API**: 住所を緯度経度に変換
- 🔑 **APIキー管理**: 環境変数`GOOGLE_MAPS_API_KEY`で管理
- 🔗 **URLエンコーディング**: `encodeURIComponent()`で日本語住所も正しく処理

#### src/app/api/youtube/search/route.ts

YouTube Data APIを使って動画を検索するAPIです。投稿作成時に動画を簡単に追加できます。

```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // YouTube Data API v3で検索
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}&maxResults=10&type=video`
    );

    const data = await response.json();

    // 動画情報を整形して返す
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube' },
      { status: 500 }
    );
  }
}
```

**ポイント**:
- 🔐 **認証必須**: ログインユーザーのみ検索可能
- 🎥 **YouTube Data API**: 動画情報を取得
- 📋 **データ整形**: 必要な情報（ID、タイトル、サムネイル等）のみ抽出

#### src/app/api/messages/route.ts

メッセージ機能のAPIです（将来的な実装のためのプレースホルダー）。

```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // メッセージ一覧を取得
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      include: {
        sender: { select: { name: true, image: true } },
        receiver: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, content } = await request.json();

    // メッセージ作成
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      },
      include: {
        sender: { select: { name: true, image: true } },
        receiver: { select: { name: true, image: true } },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
```

**ポイント**:
- 💬 **送受信者の両方を検索**: `OR`条件で自分が関わるメッセージを取得
- 👤 **ユーザー情報も含める**: `include`で送信者・受信者の情報も取得
- 📅 **新しい順に並べる**: `orderBy: { createdAt: 'desc' }`

#### src/app/api/templates/route.ts

活動報告のテンプレート管理APIです（イベントやスケジュールから投稿を作成する際に使用）。

```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isAdmin()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // テンプレート一覧を取得
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isAdmin()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, content } = await request.json();

    // テンプレート作成
    const template = await prisma.template.create({
      data: { name, content },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
```

**ポイント**:
- 👔 **管理者専用**: テンプレートの管理は管理者のみ
- 📝 **名前と内容**: シンプルな構造（名前、内容のみ）
- 🔄 **再利用**: 同じ形式の投稿を効率的に作成

### 31.5.3 HTTPメソッドの使い分け（PATCH vs PUT）

REST APIにおいて、更新操作には`PATCH`と`PUT`の2つのメソッドがあります。このプロジェクトでは`PATCH`を使用していますが、その理由を理解しましょう。

#### PATCHメソッド（部分更新）

```typescript
// PATCH: 指定したフィールドのみ更新
export async function PATCH(request: NextRequest, { params }: Props) {
  const body = await request.json();
  
  // 送信されたフィールドのみ更新
  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      // body に含まれるフィールドのみ更新される
      ...(body.title && { title: body.title }),
      ...(body.content && { content: body.content }),
      // 他のフィールドは変更されない
    },
  });
}
```

#### PUTメソッド（完全置換）

```typescript
// PUT: リソース全体を置換
export async function PUT(request: NextRequest, { params }: Props) {
  const body = await request.json();
  
  // すべてのフィールドを指定する必要がある
  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title: body.title,           // 必須
      content: body.content,       // 必須
      date: body.date,             // 必須
      location: body.location,     // 必須
      imageUrls: body.imageUrls,   // 必須
      youtubeUrls: body.youtubeUrls, // 必須
      // すべてのフィールドを指定しないと、
      // 指定しなかったフィールドはnullになる可能性
    },
  });
}
```

#### このプロジェクトでPATCHを選んだ理由

| 観点 | PATCH | PUT |
|------|-------|-----|
| **更新範囲** | 部分的 | 完全置換 |
| **クライアント側** | 変更したいフィールドのみ送信 | すべてのフィールドを送信 |
| **ネットワーク負荷** | 軽い（変更部分のみ） | 重い（全データ送信） |
| **実装の柔軟性** | 高い | 低い |
| **ユーザー体験** | スムーズ | データ送信量が多い |

**例: 投稿のタイトルだけを変更する場合**

```typescript
// ❌ PUT: すべてのフィールドが必要
await fetch(`/api/posts/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
    title: '新しいタイトル',
    content: '既存の内容...',
    date: '2026-01-01',
    location: '既存の場所',
    imageUrls: [...existing],
    youtubeUrls: [...existing],
    // 他のフィールドも全部必要
  }),
});

// ✅ PATCH: 変更したいフィールドのみ
await fetch(`/api/posts/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({
    title: '新しいタイトル',
    // これだけでOK！
  }),
});
```

**ポイント**:
- 🎯 **部分更新**: `PATCH`は必要なフィールドだけ更新
- 📦 **データ効率**: 送信データ量が少ない
- 🛡️ **安全性**: 他のフィールドを誤って消すリスクがない
- 👍 **UX向上**: ユーザーは変更したい部分だけ入力すればOK

---

### 🚀 次のステップ

次の章では、ページコンポーネントの詳細を解説します：

- **Chapter 32**: ページコンポーネントの詳細解説

---

[← 前の章：第30章 CI/CDの実装](30-CI-CDの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第32章 ページコンポーネントの詳細解説 →](32-ページコンポーネントの詳細解説.md)
