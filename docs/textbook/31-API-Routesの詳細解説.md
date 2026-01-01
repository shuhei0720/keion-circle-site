# 第31章：API Routesの詳細解説

> **この章では、プロジェクト内の全API Routesコードを1行1行完璧に解説します**

## 📚 この章の目的

この章は、**BOLD軽音メンバーサイトプロジェクトの既存コードを完全に理解する**ためのものです。
教科書で新しく実装するのではなく、既にプロジェクトに存在する34個のAPIファイルすべてを詳細に解説します。

### この章で学べること

- ✅ プロジェクトの各API Routeの完全なソースコード
- ✅ すべてのコード行の詳細な解説（なぜそのコードが必要か）
- ✅ Next.js 16 App Routerの実践的なAPI実装パターン
- ✅ Prismaによるデータベース操作の実例
- ✅ NextAuth.js v5を使った認証・権限管理の実装
- ✅ エラーハンドリングとセキュリティ対策の具体例
- ✅ 本番環境で動作する実際のコード

### プロジェクトのAPI構成（全34ファイル）

```
src/app/api/
├─ posts/              # 投稿関連API（7ファイル）
│  ├─ route.ts         # GET一覧, POST作成
│  ├─ image/route.ts   # POST画像アップロード
│  └─ [id]/
│     ├─ route.ts      # GET詳細, PUT更新, DELETE削除
│     ├─ like/route.ts          # POSTいいね, DELETEいいね削除
│     ├─ comments/route.ts      # POSTコメント
│     ├─ participate/route.ts   # POST参加, DELETE参加削除
│     └─ details/route.ts       # GET詳細情報
│
├─ events/             # イベント関連API（6ファイル）
│  ├─ route.ts         # GET一覧, POST作成
│  └─ [id]/
│     ├─ route.ts      # PUT更新, DELETE削除
│     ├─ participate/route.ts   # POST参加
│     ├─ comments/route.ts      # POST コメント
│     ├─ details/route.ts       # GET詳細
│     └─ report/route.ts        # POST報告書作成
│
├─ activity-schedules/ # 活動スケジュール関連API（6ファイル）
│  ├─ route.ts         # GET一覧, POST作成
│  └─ [id]/
│     ├─ route.ts      # PUT更新, DELETE削除
│     ├─ participate/route.ts   # POST参加
│     ├─ comments/route.ts      # POSTコメント
│     ├─ details/route.ts       # GET詳細
│     └─ report/route.ts        # POST報告書作成
│
├─ users/              # ユーザー管理API（2ファイル）
│  ├─ route.ts         # GET一覧
│  └─ [id]/route.ts    # GET詳細, PATCH役割変更, DELETE削除
│
├─ profile/            # プロフィール関連API（2ファイル）
│  ├─ route.ts         # PATCH更新
│  └─ avatar/route.ts  # POSTアバター画像アップロード
│
├─ auth/               # 認証関連API（6ファイル）
│  ├─ [...nextauth]/route.ts    # NextAuth.js
│  ├─ signup/route.ts            # POST新規登録
│  ├─ forgot-password/route.ts   # POSTパスワードリセット依頼
│  ├─ reset-password/route.ts    # POSTパスワードリセット実行
│  ├─ verify-email/route.ts      # GETメール確認
│  ├─ resend-verification/route.ts # POST確認メール再送
│  └─ test-url/route.ts          # GETテスト用
│
└─ その他API（5ファイル）
   ├─ messages/route.ts      # POSTメッセージ送信
   ├─ templates/route.ts     # GET/POSTテンプレート管理
   ├─ upload/route.ts        # POST汎用ファイルアップロード
   └─ youtube/search/route.ts # GET YouTube検索
```

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

## 31.1 投稿API（src/app/api/posts/）

投稿関連の7つのAPIファイルを解説します。

### 31.1.1 投稿一覧取得と新規作成（src/app/api/posts/route.ts）

**完全なソースコード:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

export const runtime = 'nodejs'

// GET: 投稿一覧取得（参加情報、いいね情報含む）
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        youtubeUrls: true,
        images: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
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
        likes: {
          select: {
            userId: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

// POST: 新規投稿作成（管理者のみ）
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '投稿の作成は管理者のみ可能です' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, youtubeUrls, images } = body

    const post = await prisma.post.create({
      data: {
        title,
        content,
        youtubeUrls: (youtubeUrls || [])
          .map((url: string) => url.trim())
          .filter((url: string) => url !== ''),
        images: images || [],
        userId: session.user.id
      }
    })

    revalidatePath('/')

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json({ error: 'Failed to create post', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
```

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│ Prisma の select によるパフォーマンス最適化     │
├──────────────────────────────────────────────────┤
│                                                  │
│ select: 必要なフィールドだけを取得               │
│   → データ転送量を削減                           │
│   → クエリが高速化                               │
│                                                  │
│ リレーションの取得:                             │
│   user: { select: {...} }                       │
│   → Post.userId から User を JOIN               │
│                                                  │
│ ネストしたリレーション:                         │
│   participants: { select: { user: {...} } }     │
│   → 2段階の JOIN                                │
│                                                  │
│ _count: 関連レコード数のカウント                │
│   _count: { select: { comments: true } }        │
│   → 実際のデータは取得せず、数だけカウント       │
│   → パフォーマンスが良い                         │
│                                                  │
│ orderBy + take:                                 │
│   orderBy: { createdAt: 'desc' }                │
│   take: 50                                      │
│   → 新しい順に50件まで                          │
│   → SQL の ORDER BY ... LIMIT 50                │
│                                                  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ 認証・権限チェックのフロー（POST）               │
├──────────────────────────────────────────────────┤
│                                                  │
│ 1. auth() でセッション取得                       │
│    → ログインしていない場合は 401               │
│                                                  │
│ 2. isAdmin() で管理者権限チェック               │
│    → 管理者でない場合は 403                     │
│                                                  │
│ 3. データベース操作                             │
│    → prisma.post.create()                       │
│                                                  │
│ 4. revalidatePath('/') でキャッシュ無効化       │
│    → ホームページに新しい投稿を即座に反映       │
│                                                  │
└──────────────────────────────────────────────────┘

【YouTube URLの整形処理】

youtubeUrls: (youtubeUrls || [])
  .map((url: string) => url.trim())    // 前後の空白を削除
  .filter((url: string) => url !== '')  // 空文字を除外

→ ユーザー入力の不備を自動修正
→ データベースに空のURLを保存しない
```

---

### 31.1.2 投稿の詳細・更新・削除（src/app/api/posts/[id]/route.ts）

**完全なソースコード:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

// GET: 特定の投稿を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

// PUT: 特定の投稿を更新（管理者のみ）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '投稿の編集は管理者のみ可能です' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, youtubeUrls, images } = body

    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        youtubeUrls: (youtubeUrls || []).map((url: string) => url.trim()).filter((url: string) => url !== ''),
        images: images || []
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE: 特定の投稿を削除（管理者のみ）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '投稿の削除は管理者のみ可能です' }, { status: 403 })
    }

    const { id } = await params

    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
```

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│ Dynamic Routes（動的ルート）の仕組み           │
├──────────────────────────────────────────────────┤
│                                                  │
│ ディレクトリ構造:                               │
│   src/app/api/posts/[id]/route.ts              │
│                      ^^^^                       │
│                      動的セグメント             │
│                                                  │
│ URLとパラメータの対応:                         │
│   /api/posts/abc123 → params.id = "abc123"    │
│   /api/posts/xyz789 → params.id = "xyz789"    │
│                                                  │
│ Next.js 15+では params が Promise:             │
│   const { id } = await params                   │
│                                                  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ findUnique vs findMany                          │
├──────────────────────────────────────────────────┤
│                                                  │
│ findUnique:                                     │
│   - 1件だけ取得                                 │
│   - 主キーまたはユニーク制約で検索             │
│   - 存在しない場合は null                      │
│                                                  │
│ findMany:                                       │
│   - 複数件取得                                  │
│   - 条件に一致するすべてのレコード             │
│   - 存在しない場合は空配列 []                  │
│                                                  │
└──────────────────────────────────────────────────┘

【存在チェックのパターン】

// PUTやDELETEの前に存在確認
const existingPost = await prisma.post.findUnique({
  where: { id }
})

if (!existingPost) {
  return NextResponse.json(
    { error: 'Post not found' },
    { status: 404 }
  )
}

// その後、更新または削除
await prisma.post.update({ where: { id }, data: {...} })

→ 404エラーを適切に返すため
→ ユーザーに分かりやすいエラーメッセージ
```

### 31.1.4 src/app/api/posts/[id]/like/route.ts

いいね機能のトグルAPI実装です。

**完全なソースコード:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs'

// いいねを登録・削除（トグル）
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
      // 既にいいねしている場合は削除（いいね取り消し）
      await prisma.postLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return NextResponse.json({ message: 'いいねを取り消しました', liked: false });
    }

    // いいねを作成
    const like = await prisma.postLike.create({
      data: {
        postId,
        userId,
      },
    });

    return NextResponse.json({ like, liked: true });
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
```

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│       トグルパターンの実装（いいね機能）          │
├──────────────────────────────────────────────────┤
│                                                  │
│ POSTメソッドでいいね状態をトグル:              │
│                                                  │
│   1. findUniqueで既存のいいねを確認             │
│                                                  │
│   2. 存在する → delete（いいね取り消し）        │
│                   → { liked: false }            │
│                                                  │
│   3. 存在しない → create（いいね登録）          │
│                     → { liked: true }           │
│                                                  │
│ DELETEメソッドは明示的な削除用（オプション）   │
│                                                  │
│ メリット:                                       │
│   • クライアント側は1つのAPIだけ呼べばOK       │
│   • 現在の状態を気にせず使える                 │
│   • UIが楽観的更新しやすい                     │
│                                                  │
└──────────────────────────────────────────────────┘

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

### 31.1.5 src/app/api/posts/[id]/comments/route.ts

コメント投稿のAPI実装です。

**完全なソースコード:**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// 投稿へのコメント投稿
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { content } = await request.json()
    const { id } = await params

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'コメント内容は必須です' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        postId: id
      },
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

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│          コメント投稿の実装パターン              │
├──────────────────────────────────────────────────┤
│                                                  │
│ 1. 認証チェック（必須）                         │
│    → ログインユーザーのみ投稿可能               │
│                                                  │
│ 2. バリデーション（空文字チェック）             │
│    → content.trim() で前後の空白を除去          │
│                                                  │
│ 3. include で user情報も返す                    │
│    → クライアントが即座に表示できる             │
│                                                  │
│ 4. status 201（Created）で返す                  │
│    → RESTful APIの標準                          │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 31.1.6 src/app/api/posts/[id]/participate/route.ts

参加登録のトグルAPI実装です。

**完全なソースコード:**

```typescript
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
```

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│       Upsert パターン（Update or Insert）        │
├──────────────────────────────────────────────────┤
│                                                  │
│ 参加状態の管理:                                 │
│                                                  │
│   1. findUnique で既存レコード確認              │
│                                                  │
│   2. 存在する → update（ステータス変更）        │
│      participating ↔ not_participating          │
│                                                  │
│   3. 存在しない → create（新規登録）            │
│                                                  │
│ Prisma の upsert を使わない理由:                │
│   • 明示的なエラーハンドリング                 │
│   • 処理の可視性                                │
│   • デバッグのしやすさ                          │
│                                                  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│          ステータス値のバリデーション            │
├──────────────────────────────────────────────────┤
│                                                  │
│ 許可される値を限定:                             │
│                                                  │
│   const validStatuses = [                       │
│     'participating',                            │
│     'not_participating'                         │
│   ]                                             │
│                                                  │
│   if (!validStatuses.includes(status)) {        │
│     return 400 Bad Request                      │
│   }                                             │
│                                                  │
│ メリット:                                       │
│   • 不正な値の混入を防ぐ                       │
│   • TypeScript の型安全性と連携                │
│   • データベースの整合性を保つ                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 31.2 イベントAPI詳細

イベント管理に関するAPI実装を詳しく見ていきます。

### 31.2.1 src/app/api/events/route.ts

イベント一覧取得と作成のAPIです。

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

### 31.1.3 投稿詳細取得（src/app/api/posts/[id]/details/route.ts）

**完全なソースコード:**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
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
        likes: {
          select: {
            userId: true,
            createdAt: true
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

    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('投稿詳細取得エラー:', error)
    return NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    )
  }
}
```

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│ include による完全なデータ取得                  │
├──────────────────────────────────────────────────┤
│                                                  │
│ include: すべての関連データを含める             │
│   → user: 投稿者情報                            │
│   → participants: 参加者情報（ネストしたuser）  │
│   → likes: いいね情報                           │
│   → comments: コメント（ネストしたuser、昇順）  │
│                                                  │
│ → 1回のクエリで全情報取得                      │
│ → N+1問題を回避                                 │
│                                                  │
└──────────────────────────────────────────────────┘
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

## 31.2 イベントAPI詳細

イベント管理に関する6つのAPI Routeの実装を解説します。

```
┌──────────────────────────────────────────────────┐
│     イベントAPIの構成（6ファイル）                │
└──────────────────────────────────────────────────┘

src/app/api/events/
├─ route.ts                        # GET一覧, POST作成
└─ [id]/
   ├─ route.ts                     # PUT更新, DELETE削除
   ├─ participate/route.ts         # POST参加トグル
   ├─ comments/route.ts            # POSTコメント
   ├─ details/route.ts             # GET詳細
   └─ report/route.ts              # POST報告書作成
```

---

### 31.2.1 イベント一覧取得・作成（src/app/api/events/route.ts）

**役割:** イベント一覧の取得とイベント新規作成

<details>
<summary>📄 完全なコード</summary>

```typescript
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

// イベント一覧取得
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 報告書が作成済みのイベントIDを取得
    const postsWithEventId = await prisma.post.findMany({
      where: {
        eventId: { not: null }
      },
      select: {
        eventId: true
      }
    })
    const reportedEventIds = postsWithEventId.map(p => p.eventId).filter(Boolean) as string[]

    const events = await prisma.event.findMany({
      where: reportedEventIds.length > 0 ? {
        id: {
          notIn: reportedEventIds
        }
      } : {},
      select: {
        id: true,
        title: true,
        content: true,
        date: true,
        locationName: true,
        locationUrl: true,
        songs: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 50
    })

    return NextResponse.json(events)
  } catch (error: unknown) {
    console.error('イベント取得エラー:', error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    return NextResponse.json(
      { 
        error: 'イベントの取得に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// イベント作成
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const {
      title,
      content,
      date,
      locationName,
      locationUrl,
      songs
    } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        title,
        content,
        date: date ? new Date(date) : null,
        locationName: locationName || null,
        locationUrl: locationUrl || null,
        songs: songs && songs.length > 0 ? JSON.stringify(songs) : null,
        userId: session.user.id
      },
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
          }
        }
      }
    })

    // イベント一覧ページのキャッシュを即座に無効化
    revalidatePath('/events')

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('イベント作成エラー:', error)
    return NextResponse.json(
      { error: 'イベントの作成に失敗しました' },
      { status: 500 }
    )
  }
}
```

</details>

**重要な実装ポイント:**

```
┌──────────────────────────────────────────────────┐
│     イベント一覧取得の設計                        │
└──────────────────────────────────────────────────┘

【報告書作成済みイベントの除外】
  1. Post テーブルから eventId が null でないレコードを取得
  2. 取得した eventId を reportedEventIds に格納
  3. Event クエリで notIn 条件を使って除外
  
  → 報告書作成後はイベント一覧に表示しない
  → 未報告のイベントのみ一覧に表示


【selectによる最適化】
  include の代わりに select を使用:
  
  select: {
    id: true,
    title: true,
    // 必要なフィールドのみ取得
  }
  
  → 不要なデータを取得しない
  → パフォーマンス向上


【認証チェック】
  GET でも認証が必要:
  
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }
  
  → メンバー専用サイトのため、ログインユーザーのみアクセス可能
```

```
┌──────────────────────────────────────────────────┐
│     イベント作成の設計                            │
└──────────────────────────────────────────────────┘

【管理者権限チェック】
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }
  
  → イベント作成は管理者のみ


【JSON データの保存】
  songs: songs && songs.length > 0 ? JSON.stringify(songs) : null
  
  → 課題曲配列を JSON 文字列として保存
  → 空配列の場合は null を保存


【revalidatePath】
  revalidatePath('/events')
  
  → イベント作成後、一覧ページのキャッシュを即座に無効化
  → ユーザーが最新のイベント一覧を確認できる
```

---

### 31.2.2 イベント更新・削除（src/app/api/events/[id]/route.ts）

**役割:** 既存イベントの更新と削除

<details>
<summary>📄 完全なコード</summary>

```typescript
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

// イベント更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const {
      title,
      content,
      date,
      locationName,
      locationUrl,
      songs
    } = await request.json()
    const { id } = await params

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        content,
        date: date ? new Date(date) : null,
        locationName: locationName || null,
        locationUrl: locationUrl || null,
        songs: songs && songs.length > 0 ? JSON.stringify(songs) : null
      },
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

    // イベント一覧ページのキャッシュを無効化
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

// イベント削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { id } = await params

    await prisma.event.delete({
      where: { id }
    })

    // イベント一覧ページのキャッシュを無効化
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

</details>

**重要な実装ポイント:**

```
┌──────────────────────────────────────────────────┐
│     更新・削除の共通パターン                      │
└──────────────────────────────────────────────────┘

【管理者権限必須】
  更新も削除も管理者のみ実行可能
  
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }


【NULL 値の扱い】
  locationName: locationName || null
  songs: songs && songs.length > 0 ? JSON.stringify(songs) : null
  
  → 空文字列・空配列を null に変換
  → 「未設定」状態を明示


【カスケード削除】
  Prisma スキーマで onDelete: Cascade 設定:
  
  model Event {
    participants EventParticipant[] @relation(onDelete: Cascade)
    comments     Comment[]           @relation(onDelete: Cascade)
  }
  
  → イベント削除時、関連する参加者・コメントも自動削除
  → 孤立レコードを防ぐ
```

---

### 31.2.3 イベント参加トグル（src/app/api/events/[id]/participate/route.ts）

**役割:** イベントへの参加登録・解除

<details>
<summary>📄 完全なコード</summary>

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// 参加登録/解除
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params

    // 既存の参加を確認
    const existing = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: session.user.id
        }
      }
    })

    if (existing) {
      // 既に参加している場合は解除
      await prisma.eventParticipant.delete({
        where: {
          id: existing.id
        }
      })
      return NextResponse.json({ participating: false })
    } else {
      // 参加登録
      await prisma.eventParticipant.create({
        data: {
          eventId: id,
          userId: session.user.id
        }
      })
      return NextResponse.json({ participating: true })
    }
  } catch (error) {
    console.error('参加登録エラー:', error)
    return NextResponse.json(
      { error: '参加登録に失敗しました' },
      { status: 500 }
    )
  }
}
```

</details>

**重要な実装ポイント:**

```
┌──────────────────────────────────────────────────┐
│     トグル動作の実装パターン                      │
└──────────────────────────────────────────────────┘

【findUnique で既存参加を確認】
  const existing = await prisma.eventParticipant.findUnique({
    where: {
      eventId_userId: {
        eventId: id,
        userId: session.user.id
      }
    }
  })
  
  → 複合ユニークキー（eventId + userId）で検索
  → Prisma スキーマで @@unique([eventId, userId]) 定義済み


【トグル動作】
  if (existing) {
    // 参加解除
    await prisma.eventParticipant.delete({ ... })
    return NextResponse.json({ participating: false })
  } else {
    // 参加登録
    await prisma.eventParticipant.create({ ... })
    return NextResponse.json({ participating: true })
  }
  
  → 1つのエンドポイントで登録・解除を処理
  → クライアント側は同じAPIを呼ぶだけ


【レスポンスの設計】
  { participating: true/false }
  
  → クライアント側で楽観的UI更新に使用
  → ボタンの表示を即座に切り替え
```

---

### 31.2.4 イベントコメント投稿（src/app/api/events/[id]/comments/route.ts）

**役割:** イベントへのコメント投稿

<details>
<summary>📄 完全なコード</summary>

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// コメント投稿
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { content } = await request.json()
    const { id } = await params

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'コメント内容は必須です' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        eventId: id
      },
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

</details>

**重要な実装ポイント:**

```
┌──────────────────────────────────────────────────┐
│     コメント投稿の設計パターン                    │
└──────────────────────────────────────────────────┘

【バリデーション】
  if (!content || content.trim() === '') {
    return NextResponse.json({ error: 'コメント内容は必須です' }, { status: 400 })
  }
  
  → 空文字列・空白のみのコメントを拒否
  → 400 Bad Request でクライアントにエラーを返す


【trim() で前後の空白を削除】
  content: content.trim()
  
  → ユーザーが誤って入力した前後の空白を削除
  → データベースにクリーンなデータを保存


【include でユーザー情報を取得】
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true
      }
    }
  }
  
  → コメント作成と同時にユーザー情報を取得
  → N+1問題を回避


【201 Created ステータス】
  return NextResponse.json(comment, { status: 201 })
  
  → リソース作成を明示
  → RESTful API のベストプラクティス
```

---

### 31.2.5 イベント詳細取得（src/app/api/events/[id]/details/route.ts）

**役割:** イベント詳細情報の取得（コメント・参加者・報告書含む）

<details>
<summary>📄 完全なコード</summary>

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// イベント詳細取得（コメント含む）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
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
        },
        posts: {
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
            likes: true,
            _count: {
              select: {
                comments: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('イベント詳細取得エラー:', error)
    return NextResponse.json(
      { error: 'イベントの取得に失敗しました' },
      { status: 500 }
    )
  }
}
```

</details>

**重要な実装ポイント:**

```
┌──────────────────────────────────────────────────┐
│     詳細取得の設計パターン                        │
└──────────────────────────────────────────────────┘

【すべての関連データを取得】
  include: {
    user: { ... },           // 作成者
    participants: { ... },   // 参加者
    comments: { ... },       // コメント
    posts: { ... }           // 報告書
  }
  
  → 1回のクエリで必要なデータをすべて取得
  → 詳細ページで追加のAPIリクエスト不要


【posts（報告書）も含める】
  posts: {
    include: {
      user: { ... },
      participants: { ... },
      likes: true,
      _count: { select: { comments: true } }
    },
    orderBy: { createdAt: 'desc' }
  }
  
  → イベントから作成された報告書を取得
  → Post モデルの eventId フィールドでリレーション


【404 エラーハンドリング】
  if (!event) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 })
  }
  
  → 存在しないIDの場合は 404 Not Found
  → クライアント側でエラー表示
```

---

### 31.2.6 報告書作成（src/app/api/events/[id]/report/route.ts）

**役割:** イベントから活動報告（Post）を作成

<details>
<summary>📄 完全なコード</summary>

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

// イベント報告作成
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { title, content, youtubeUrls, images } = await request.json()
    const { id } = await params

    console.log('Request data:', { title, content, youtubeUrls: youtubeUrls?.length || 0, images: images?.length || 0 })

    // イベントを取得
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    // トランザクションで投稿作成
    const result = await prisma.$transaction(async (tx) => {
      // 投稿を作成
      console.log('Creating post with data:', {
        title,
        content: content?.substring(0, 50),
        youtubeUrls: youtubeUrls?.length || 0,
        images: images || [],
        userId: session.user.id,
        eventId: id
      })
      
      const post = await tx.post.create({
        data: {
          title,
          content,
          youtubeUrls: (youtubeUrls || []).map((url: string) => url.trim()).filter((url: string) => url !== ''),
          images: images || [],
          userId: session.user.id,
          eventId: id
        }
      })

      // 参加者を投稿の参加者として登録（重複を除去）
      if (event.participants.length > 0) {
        const uniqueUserIds = [...new Set(event.participants.map(p => p.userId))]
        await tx.postParticipant.createMany({
          data: uniqueUserIds.map(userId => ({
            postId: post.id,
            userId: userId,
            status: 'participating'
          }))
        })
      }

      return post
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    console.error('イベント報告作成エラー:', error)
    console.error('Error name:', error instanceof Error ? error.name : '')
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error code:', (error as any)?.code)
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    
    // Prismaエラーの詳細を返す
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : 'UNKNOWN'
    
    return NextResponse.json(
      { 
        error: 'イベント報告の作成に失敗しました',
        details: errorMessage,
        code: errorCode,
        hint: errorCode === 'P2010' ? 'データベースのimagesカラムが存在しません。DB_MIGRATION_POST_IMAGES.sqlを実行してください。' : undefined
      },
      { status: 500 }
    )
  }
}
```

</details>

**重要な実装ポイント:**

```
┌──────────────────────────────────────────────────┐
│     報告書作成の複雑なロジック                    │
└──────────────────────────────────────────────────┘

【トランザクション】
  const result = await prisma.$transaction(async (tx) => {
    // 投稿作成
    const post = await tx.post.create({ ... })
    
    // 参加者登録
    await tx.postParticipant.createMany({ ... })
    
    return post
  })
  
  → 投稿作成と参加者登録が両方成功するか、両方失敗するか
  → 中途半端な状態を防ぐ


【イベント参加者を投稿参加者として登録】
  1. イベントの participants を取得
  2. userId を抽出して重複を除去
  3. PostParticipant を createMany で一括作成
  
  → イベント参加者 → 投稿参加者への引き継ぎ
  → status: 'participating' で初期化


【YouTube URL の正規化】
  youtubeUrls: (youtubeUrls || [])
    .map((url: string) => url.trim())
    .filter((url: string) => url !== '')
  
  → 前後の空白を削除
  → 空文字列を除外
  → クリーンなデータを保存


【詳細なエラーログ】
  console.error('Error name:', error instanceof Error ? error.name : '')
  console.error('Error message:', error instanceof Error ? error.message : String(error))
  console.error('Error code:', (error as any)?.code)
  console.error('Error stack:', error instanceof Error ? error.stack : '')
  
  → デバッグに必要な情報を出力
  → Prisma エラーコード（P2010 など）も記録
```

---

## 31.3 活動スケジュールAPI（6ファイル）

活動スケジュール管理に関する6つのAPI Routeを解説します。

```
┌──────────────────────────────────────────────────┐
│     活動スケジュールAPIの構成（6ファイル）        │
└──────────────────────────────────────────────────┘

src/app/api/activity-schedules/
├─ route.ts                        # GET一覧, POST作成
└─ [id]/
   ├─ route.ts                     # PUT更新, DELETE削除
   ├─ participate/route.ts         # POST参加トグル
   ├─ comments/route.ts            # POSTコメント
   ├─ details/route.ts             # GET詳細
   └─ report/route.ts              # POST報告書作成
```

---

### 31.3.1 活動スケジュール一覧取得・作成（src/app/api/activity-schedules/route.ts）

**完全なソースコード:**

```typescript
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

// 活動スケジュール一覧取得
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 報告書が作成済みのスケジュールIDを取得
    const postsWithScheduleId = await prisma.post.findMany({
      where: {
        activityScheduleId: { not: null }
      },
      select: {
        activityScheduleId: true
      }
    })
    const reportedScheduleIds = postsWithScheduleId.map(p => p.activityScheduleId).filter(Boolean) as string[]

    const schedules = await prisma.activitySchedule.findMany({
      where: reportedScheduleIds.length > 0 ? {
        id: {
          notIn: reportedScheduleIds
        }
      } : {},
      select: {
        id: true,
        title: true,
        content: true,
        date: true,
        location: true,
        locationUrl: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 50
    })

    return NextResponse.json(schedules)
  } catch (error: unknown) {
    console.error('スケジュール取得エラー:', error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    return NextResponse.json(
      { 
        error: 'スケジュールの取得に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// 活動スケジュール作成
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { title, content, date, location, locationUrl } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      )
    }

    const schedule = await prisma.activitySchedule.create({
      data: {
        title,
        content,
        date: date ? new Date(date) : null,
        location: location || null,
        locationUrl: locationUrl || null,
        userId: session.user.id
      },
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
          }
        }
      }
    })

    // 活動スケジュール一覧ページのキャッシュを即座に無効化
    revalidatePath('/activity-schedules')

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('活動スケジュール作成エラー:', error)
    return NextResponse.json(
      { error: '活動スケジュールの作成に失敗しました' },
      { status: 500 }
    )
  }
}
```

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│     報告書作成済みスケジュールの除外              │
└──────────────────────────────────────────────────┘

【ロジックの流れ】
  1. Post テーブルから activityScheduleId != null のレコードを取得
  2. 取得した activityScheduleId を reportedScheduleIds に格納
  3. ActivitySchedule クエリで notIn 条件を使って除外
  
  → 報告書作成後はスケジュール一覧に表示しない
  → 未報告のスケジュールのみ一覧に表示


【selectによる最適化】
  include の代わりに select を使用:
  
  select: {
    id: true,
    title: true,
    // 必要なフィールドのみ取得
  }
  
  → 不要なデータを取得しない
  → パフォーマンス向上


【管理者権限チェック】
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }
  
  → スケジュール作成は管理者のみ
```

---

### 31.3.2 活動スケジュール更新・削除（src/app/api/activity-schedules/[id]/route.ts）

**完全なソースコード:**

```typescript
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

// 活動スケジュール更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { title, content, date } = await request.json()
    const { id } = await params

    const schedule = await prisma.activitySchedule.update({
      where: { id },
      data: {
        title,
        content,
        date: date ? new Date(date) : null
      },
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

    // 活動スケジュール一覧ページのキャッシュを無効化
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

// 活動スケジュール削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { id } = await params

    await prisma.activitySchedule.delete({
      where: { id }
    })

    // 活動スケジュール一覧ページのキャッシュを無効化
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

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│     更新・削除の共通パターン                      │
└──────────────────────────────────────────────────┘

【管理者権限必須】
  更新も削除も管理者のみ実行可能
  
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
  }


【NULL 値の扱い】
  date: date ? new Date(date) : null
  
  → 空値を null に変換
  → 「未設定」状態を明示


【カスケード削除】
  Prisma スキーマで onDelete: Cascade 設定:
  
  model ActivitySchedule {
    participants ActivityParticipant[] @relation(onDelete: Cascade)
    comments     Comment[]              @relation(onDelete: Cascade)
  }
  
  → スケジュール削除時、関連する参加者・コメントも自動削除
  → 孤立レコードを防ぐ
```

---

### 31.3.3 活動スケジュール参加トグル（src/app/api/activity-schedules/[id]/participate/route.ts）

**完全なソースコード:**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// 参加登録/解除
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params

    // 既存の参加を確認
    const existing = await prisma.activityParticipant.findUnique({
      where: {
        activityScheduleId_userId: {
          activityScheduleId: id,
          userId: session.user.id
        }
      }
    })

    if (existing) {
      // 既に参加している場合は解除
      await prisma.activityParticipant.delete({
        where: {
          id: existing.id
        }
      })
      return NextResponse.json({ participating: false })
    } else {
      // 参加登録
      await prisma.activityParticipant.create({
        data: {
          activityScheduleId: id,
          userId: session.user.id
        }
      })
      return NextResponse.json({ participating: true })
    }
  } catch (error) {
    console.error('参加登録エラー:', error)
    return NextResponse.json(
      { error: '参加登録に失敗しました' },
      { status: 500 }
    )
  }
}
```

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│     トグル動作の実装パターン                      │
└──────────────────────────────────────────────────┘

【findUnique で既存参加を確認】
  const existing = await prisma.activityParticipant.findUnique({
    where: {
      activityScheduleId_userId: {
        activityScheduleId: id,
        userId: session.user.id
      }
    }
  })
  
  → 複合ユニークキー（activityScheduleId + userId）で検索
  → Prisma スキーマで @@unique([activityScheduleId, userId]) 定義済み


【トグル動作】
  if (existing) {
    // 参加解除
    await prisma.activityParticipant.delete({ ... })
    return NextResponse.json({ participating: false })
  } else {
    // 参加登録
    await prisma.activityParticipant.create({ ... })
    return NextResponse.json({ participating: true })
  }
  
  → 1つのエンドポイントで登録・解除を処理
  → クライアント側は同じAPIを呼ぶだけ
```

---

### 31.3.4 活動スケジュールコメント投稿（src/app/api/activity-schedules/[id]/comments/route.ts）

**完全なソースコード:**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// コメント投稿
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { content } = await request.json()
    const { id } = await params

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'コメント内容は必須です' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        activityScheduleId: id
      },
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

---

### 31.3.5 活動スケジュール詳細取得（src/app/api/activity-schedules/[id]/details/route.ts）

**完全なソースコード:**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// 活動スケジュール詳細取得（コメント含む）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params

    const schedule = await prisma.activitySchedule.findUnique({
      where: { id },
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

    if (!schedule) {
      return NextResponse.json(
        { error: 'スケジュールが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('活動スケジュール詳細取得エラー:', error)
    return NextResponse.json(
      { error: '活動スケジュールの取得に失敗しました' },
      { status: 500 }
    )
  }
}
```

---

### 31.3.6 報告書作成（src/app/api/activity-schedules/[id]/report/route.ts）

**完全なソースコード:**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

// 活動報告作成
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { title, content, youtubeUrls, images } = await request.json()
    const { id } = await params

    // 活動スケジュールを取得
    const schedule = await prisma.activitySchedule.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    if (!schedule) {
      return NextResponse.json(
        { error: '活動スケジュールが見つかりません' },
        { status: 404 }
      )
    }

    // トランザクションで投稿作成
    const result = await prisma.$transaction(async (tx) => {
      // 投稿を作成
      const post = await tx.post.create({
        data: {
          title,
          content,
          youtubeUrls: (youtubeUrls || [])
            .map((url: string) => url.trim())
            .filter((url: string) => url !== ''),
          images: images || [],
          userId: session.user.id,
          activityScheduleId: id
        }
      })

      // 参加者を投稿の参加者として登録
      if (schedule.participants.length > 0) {
        await tx.postParticipant.createMany({
          data: schedule.participants.map(p => ({
            postId: post.id,
            userId: p.userId,
            status: 'participating'
          }))
        })
      }

      return post
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    console.error('活動報告作成エラー:', error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    return NextResponse.json(
      { 
        error: '活動報告の作成に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
```

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│     報告書作成の複雑なロジック                    │
└──────────────────────────────────────────────────┘

【トランザクション】
  const result = await prisma.$transaction(async (tx) => {
    // 投稿作成
    const post = await tx.post.create({ ... })
    
    // 参加者登録
    await tx.postParticipant.createMany({ ... })
    
    return post
  })
  
  → 投稿作成と参加者登録が両方成功するか、両方失敗するか
  → 中途半端な状態を防ぐ


【スケジュール参加者を投稿参加者として登録】
  1. スケジュールの participants を取得
  2. PostParticipant を createMany で一括作成
  3. status: 'participating' で初期化
  
  → スケジュール参加者 → 投稿参加者への引き継ぎ
```

---

## 31.4 ユーザーAPI（4ファイル）

ユーザー管理とプロフィール関連の4つのAPI Routeを解説します。

```
┌──────────────────────────────────────────────────┐
│     ユーザーAPIの構成（4ファイル）                │
└──────────────────────────────────────────────────┘

src/app/api/
├─ users/
│  ├─ route.ts                 # GET一覧（管理者のみ）
│  └─ [id]/route.ts            # PATCH役割変更, DELETE削除（サイト管理者のみ）
│
└─ profile/
   ├─ route.ts                 # PATCHプロフィール更新
   └─ avatar/route.ts          # POSTアバター画像アップロード
```

---

### 31.4.1 ユーザー一覧取得（src/app/api/users/route.ts）

**完全なソースコード:**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

// ユーザー一覧取得（管理者のみ）
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'ユーザー一覧の取得は管理者のみ可能です' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            messages: true
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
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
```

**重要なポイント:**

```
┌──────────────────────────────────────────────────┐
│     ユーザー一覧取得のセキュリティ                │
└──────────────────────────────────────────────────┘

【管理者権限必須】
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: '...' }, { status: 403 })
  }
  
  → ユーザー一覧は管理者のみアクセス可能
  → 一般メンバーはアクセス不可


【selectで必要な情報のみ取得】
  select: {
    id: true,
    name: true,
    email: true,
    avatarUrl: true,
    role: true,
    createdAt: true,
    _count: { ... }
  }
  
  ❌ password は絶対に含めない！
  → ハッシュ化されていても返さない
  → セキュリティの基本原則


【_count で統計情報を取得】
  _count: {
    select: {
      posts: true,
      messages: true
    }
  }
  
  → ユーザーの投稿数、メッセージ数をカウント
  → 実際のデータは取得しない（パフォーマンス向上）
```

---

### 31.4.2 ユーザーの削除と役割変更（src/app/api/users/[id]/route.ts）

**完全なソースコード:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isSiteAdmin } from '@/lib/permissions'

// ユーザー削除（サイト管理者のみ）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteAdmin = await isSiteAdmin()
    if (!siteAdmin) {
      return NextResponse.json({ error: 'ユーザーの削除はサイト管理者のみ可能です' }, { status: 403 })
    }

    const { id } = await params

    // 自分自身を削除しようとしていないかチェック
    if (id === session.user.id) {
      return NextResponse.json({ error: '自分自身を削除することはできません' }, { status: 400 })
    }

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // ユーザーを削除（Cascadeで関連データも削除される）
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

// ユーザー役割の更新（サイト管理者のみ）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteAdmin = await isSiteAdmin()
    if (!siteAdmin) {
      return NextResponse.json({ error: 'ユーザー役割の変更はサイト管理者のみ可能です' }, { status: 403 })
    }

    const { id } = await params
    
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ error: 'リクエストボディが不正です' }, { status: 400 })
    }
    
    const { role } = body

    if (!role || !['site_admin', 'admin', 'member'].includes(role)) {
      return NextResponse.json({ error: '無効な役割です' }, { status: 400 })
    }

    // 自分自身の役割を変更しようとしていないかチェック
    if (id === session.user.id) {
      return NextResponse.json({ error: '自分自身の役割を変更することはできません' }, { status: 400 })
    }

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
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
```

**重要なポイント:**

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

### 31.4.3 プロフィール更新（src/app/api/profile/route.ts）

**完全なソースコード:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await req.json()
    const { name, bio, instruments } = body

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        name,
        bio: bio || null,
        instruments: instruments || null
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }
}
```

**重要なポイント:**

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


【シンプルな設計】
  - バリデーションなし（クライアント側で実施）
  - 権限チェック不要（自分のみ更新）
  → 実装がシンプル
```

---

### 31.4.4 アバター画像アップロード（src/app/api/profile/avatar/route.ts）

**完全なソースコード:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Supabaseクライアントのチェック
    if (!supabase) {
      console.error('Supabase client is not configured')
      return NextResponse.json({ 
        error: 'Supabase Storageが設定されていません。環境変数を確認してください。',
        details: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
      }, { status: 500 })
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('avatar') as File

    if (!file || file.size === 0) {
      // アバター削除
      await prisma.user.update({
        where: { id: session.user.id },
        data: { avatarUrl: null },
      })
      return NextResponse.json({ avatarUrl: null })
    }

    // ファイルの検証（MIMEタイプと拡張子の両方でチェック）
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isImageType = file.type.startsWith('image/') || file.type === ''
    const isImageExtension = allowedExtensions.includes(fileExtension)
    
    if (!isImageType && !isImageExtension) {
      console.log('File validation failed:', { type: file.type, name: file.name, extension: fileExtension })
      return NextResponse.json({ error: '画像ファイルのみアップロード可能です（.jpg, .png, .gif, .webp等）' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは5MB以下にしてください' }, { status: 400 })
    }

    // ファイルをバイト配列に変換
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Supabase Storageにアップロード
    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'アップロードに失敗しました: ' + uploadError.message }, { status: 500 })
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // データベース更新
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    })

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

**重要なポイント:**

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
    data: { avatarUrl: null }
  }
  
  → ユーザーがアバターを削除したい場合の処理
  → デフォルトアバターに戻す
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

## 31.5 認証関連とその他APIの詳細

このセクションでは、認証関連API（6ファイル）とその他補助機能API（4ファイル）の実装を詳しく解説します。

```
┌──────────────────────────────────────────────────┐
│          31.5 APIグループの構成                   │
└──────────────────────────────────────────────────┘

31.5.1 認証関連API（6ファイル）
  ├─ NextAuth.js本体
  ├─ ユーザー登録
  ├─ パスワードリセット依頼
  ├─ パスワードリセット実行
  ├─ メール確認
  └─ 確認メール再送

31.5.2 その他API（4ファイル）
  ├─ メッセージ機能
  ├─ テンプレート管理
  ├─ ファイルアップロード
  └─ YouTube検索
```

---

### 31.5.1 認証関連API

#### 1. NextAuth.js認証ハンドラー

**src/app/api/auth/[...nextauth]/route.ts**

NextAuth.js v5の認証エンドポイントです。シンプルに`auth.ts`からハンドラーをエクスポートします。

```typescript
import { handlers } from "@/lib/auth"

export const runtime = 'nodejs'

export const { GET, POST } = handlers
```

```
┌──────────────────────────────────────────────────┐
│        NextAuth.js認証フロー                      │
└──────────────────────────────────────────────────┘

1. クライアント → /api/auth/signin
                   ↓
2. NextAuth.js    認証処理（Google OAuth / Credentials）
                   ↓
3. データベース   ユーザー情報取得・検証
                   ↓
4. セッション生成  JWT or Database Session
                   ↓
5. クライアント ← Cookie にセッション保存
```

**ポイント**:
- ✅ **handlers**: `lib/auth.ts`で定義されたGETとPOSTハンドラーを使用
- 🔐 **認証プロバイダー**: Google OAuthとCredentials（メール+パスワード）に対応
- 🚀 **runtime指定**: Node.js環境で実行（Edge Runtimeではない）

**実際の認証設定（lib/auth.ts）**:
```typescript
// NextAuth.js設定のコアロジック
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      // メール+パスワード認証
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return user
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    }
  }
})
```

---

#### 2. ユーザー登録API

**src/app/api/auth/signup/route.ts**

新規ユーザー登録を処理します。メール検証機能も含みます。

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザーを作成（メールアドレス未検証）
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'member', // デフォルトは通常ユーザー
        emailVerified: null // 未検証
      }
    })

    // メールアドレス検証トークンを生成
    const token = await generateVerificationToken(email)
    
    // 検証メールを送信
    await sendVerificationEmail(email, token)

    return NextResponse.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email,
      role: user.role,
      message: 'メールアドレスに検証リンクを送信しました。確認してください。'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'アカウント作成に失敗しました' },
      { status: 500 }
    )
  }
}
```

```
┌──────────────────────────────────────────────────┐
│        ユーザー登録フロー                         │
└──────────────────────────────────────────────────┘

1. クライアント    name, email, password 送信
                   ↓
2. 重複チェック    既存メールアドレスを確認
                   ↓
3. ハッシュ化      bcrypt でパスワードをハッシュ化
                   ↓
4. DB登録          user作成（emailVerified: null）
                   ↓
5. トークン生成    ランダムな検証トークン生成
                   ↓
6. メール送信      検証リンクをメールで送信
                   ↓
7. レスポンス      ユーザー情報 + メッセージ返却
```

**ポイント**:
- 🔐 **パスワードハッシュ化**: bcryptjs でソルトラウンド10（2^10回のハッシュ処理）
- ✉️ **メール検証**: emailVerified を null に設定し、トークン生成＋メール送信
- 🛡️ **重複防止**: 既存メールアドレスは400エラーで拒否
- 👤 **デフォルト役割**: 新規ユーザーは全員 'member' 役割

---

#### 3. パスワードリセット依頼API

**src/app/api/auth/forgot-password/route.ts**

パスワードを忘れたユーザーがリセットを依頼するAPIです。

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePasswordResetToken, sendPasswordResetEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // ユーザーを確認
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // セキュリティのため、ユーザーが存在しない場合でも成功レスポンスを返す
    if (!user || !user.password) {
      // Googleログインユーザーにはパスワードリセットは不要
      return NextResponse.json({ 
        message: 'パスワードリセットメールを送信しました。メールを確認してください。'
      })
    }

    // パスワードリセットトークンを生成
    const token = await generatePasswordResetToken(email)
    
    // リセットメールを送信
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ 
      message: 'パスワードリセットメールを送信しました。メールを確認してください。'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'パスワードリセットメールの送信に失敗しました' },
      { status: 500 }
    )
  }
}
```

```
┌──────────────────────────────────────────────────┐
│    パスワードリセットのセキュリティ設計          │
└──────────────────────────────────────────────────┘

❌ 悪い例: ユーザーの存在を漏らす
   → "このメールアドレスは登録されていません"
   → 攻撃者がメールアドレスの有効性を確認できる

✅ 良い例: 常に同じメッセージを返す
   → "メールを送信しました（存在する場合）"
   → 攻撃者はメールアドレスの有効性を確認できない

Googleログインユーザーのケース:
   → passwordフィールドがnull
   → リセット不要のため早期リターン
```

**ポイント**:
- 🔒 **セキュリティ**: ユーザーの存在有無に関わらず同じメッセージを返す
- 🔐 **Googleユーザー対応**: パスワードがないユーザー（OAuth）は早期リターン
- ⏰ **トークン有効期限**: トークン生成時に有効期限を設定（通常1時間）
- ✉️ **メール送信**: リセットリンク付きメールを送信

---

#### 4. パスワードリセット実行API

**src/app/api/auth/reset-password/route.ts**

トークンを検証して実際にパスワードを更新します。

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPasswordResetToken } from '@/lib/email'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'トークンとパスワードが必要です' },
        { status: 400 }
      )
    }

    // トークンを検証
    const email = await verifyPasswordResetToken(token)

    if (!email) {
      return NextResponse.json(
        { error: '無効または期限切れのトークンです' },
        { status: 400 }
      )
    }

    // ユーザーを確認
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // パスワードを更新
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    // トークンを削除
    await prisma.verificationToken.delete({
      where: { token }
    })

    return NextResponse.json({ 
      message: 'パスワードが正常にリセットされました'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'パスワードのリセットに失敗しました' },
      { status: 500 }
    )
  }
}
```

```
┌──────────────────────────────────────────────────┐
│      パスワードリセット実行フロー                 │
└──────────────────────────────────────────────────┘

1. クライアント    token + 新しいpassword送信
                   ↓
2. トークン検証    有効期限内かチェック
                   ↓  （期限切れの場合400エラー）
3. ユーザー取得    メールアドレスからユーザー検索
                   ↓
4. ハッシュ化      新しいパスワードをbcryptでハッシュ
                   ↓
5. DB更新          パスワード更新
                   ↓
6. トークン削除    使用済みトークンを削除
                   ↓
7. 完了            成功メッセージ返却
```

**ポイント**:
- ✅ **トークン検証**: `verifyPasswordResetToken()` で有効期限と存在をチェック
- 🔐 **ハッシュ化**: 新しいパスワードもbcryptでハッシュ化（ソルトラウンド10）
- 🗑️ **使い捨て**: トークンは使用後に削除（再利用防止）
- 🛡️ **エラーメッセージ**: 適切なHTTPステータスコードで返却（400, 404, 500）

---

#### 5. メール確認API

**src/app/api/auth/verify-email/route.ts**

新規登録後のメール確認リンクをクリックした際の処理です。

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyEmailToken } from '@/lib/email'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin?error=invalid_token', req.url))
    }

    // トークンを検証
    const email = await verifyEmailToken(token)

    if (!email) {
      return NextResponse.redirect(new URL('/auth/signin?error=expired_token', req.url))
    }

    // ユーザーのメールアドレスを検証済みに更新
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    })

    // トークンを削除
    await prisma.verificationToken.delete({
      where: { token }
    })

    return NextResponse.redirect(new URL('/auth/signin?verified=true', req.url))
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=verification_failed', req.url))
  }
}
```

```
┌──────────────────────────────────────────────────┐
│        メール確認フロー                           │
└──────────────────────────────────────────────────┘

メール内リンク
 ↓ GET /api/auth/verify-email?token=xxxxx
 ↓
トークン検証（有効期限チェック）
 ↓ 有効な場合
emailVerified = new Date() に更新
 ↓
トークン削除
 ↓
リダイレクト → /auth/signin?verified=true
```

**ポイント**:
- 🔗 **GETメソッド**: メールのリンクから直接アクセス可能
- 🔄 **リダイレクト**: 検証後はサインインページにリダイレクト
- ✅ **検証日時**: `emailVerified`に現在時刻を保存
- 🗑️ **トークン削除**: 使用後は即座に削除
- 📧 **クエリパラメータ**: エラー内容をURLクエリで伝達

---

#### 6. 確認メール再送API

**src/app/api/auth/resend-verification/route.ts**

メール確認リンクが届かなかった場合に再送します。

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // ユーザーを確認
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 既に検証済みの場合
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に確認済みです' },
        { status: 400 }
      )
    }

    // メールアドレス検証トークンを生成
    const token = await generateVerificationToken(email)
    
    // 検証メールを送信
    await sendVerificationEmail(email, token)

    return NextResponse.json({ 
      message: 'メールアドレスに検証リンクを再送信しました。確認してください。'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: '検証メールの再送信に失敗しました' },
      { status: 500 }
    )
  }
}
```

**ポイント**:
- 🔄 **再送機能**: トークンを再生成してメール再送
- ✅ **検証済みチェック**: 既に検証済みの場合は400エラー
- 📧 **新しいトークン**: 古いトークンは無効化され、新しいトークンを生成
- 🛡️ **存在確認**: ユーザーが存在しない場合は404エラー

---

### 31.5.2 その他API

#### 1. メッセージAPI

**src/app/api/messages/route.ts**

メッセージの送受信を管理します（現在はシンプルな実装）。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

// メッセージ一覧取得
export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 100 // 最新100件まで取得
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// メッセージ送信
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    const message = await prisma.message.create({
      data: {
        content,
        userId: session.user.id!
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
```

**ポイント**:
- 💬 **チャット風**: シンプルなメッセージ送受信機能
- 👤 **ユーザー情報含む**: `include`でユーザー名とメールを取得
- 📅 **古い順**: `orderBy: { createdAt: 'asc' }` で古いメッセージから表示
- 🔢 **制限**: 最新100件のみ取得（パフォーマンス考慮）

---

#### 2. テンプレート管理API

**src/app/api/templates/route.ts**

活動報告のテンプレートを管理します（イベント・スケジュールから投稿作成時に使用）。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

const TEMPLATE_ID = 'report_template'

// テンプレート取得
export async function GET() {
  try {
    let template = await prisma.template.findUnique({
      where: { id: TEMPLATE_ID }
    })

    // テンプレートが存在しない場合は初期テンプレートを作成
    if (!template) {
      template = await prisma.template.create({
        data: {
          id: TEMPLATE_ID,
          name: '活動報告テンプレート',
          content: '# 活動報告\n\n📅 日時\n\n\n👥 参加メンバー\n\n\n━━━━━━━━━━━━━━━━━━━\n📝 活動内容\n\n\n\n━━━━━━━━━━━━━━━━━━━\n✨ 成果・ハイライト\n\n（ここに活動の成果や印象に残ったことを記入してください）\n\n\n━━━━━━━━━━━━━━━━━━━\n💭 次回に向けて\n\n（次回に向けての改善点や課題を記入してください）'
        }
      })
    }

    return NextResponse.json(template)
  } catch (error: unknown) {
    console.error('テンプレート取得エラー:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ 
      error: 'サーバーエラー',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// テンプレート更新（管理者のみ）
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: '内容は必須です' }, { status: 400 })
    }

    const template = await prisma.template.upsert({
      where: { id: TEMPLATE_ID },
      update: { content },
      create: {
        id: TEMPLATE_ID,
        name: '活動報告テンプレート',
        content
      }
    })

    return NextResponse.json(template)
  } catch (error: unknown) {
    console.error('テンプレート更新エラー:', error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    return NextResponse.json({ 
      error: 'サーバーエラー',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
```

**ポイント**:
- 📝 **固定ID**: `TEMPLATE_ID = 'report_template'` で1つのテンプレートを管理
- 🔄 **初期化**: テンプレートが存在しない場合は自動作成
- 👔 **管理者権限**: 更新は管理者のみ可能
- 🔧 **upsert**: 存在すれば更新、なければ作成

---

#### 3. ファイルアップロードAPI

**src/app/api/upload/route.ts**

画像やファイルをBase64形式でアップロードします。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ファイルサイズ制限 (2MB - Base64で保存するため)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 2MB' }, { status: 400 })
    }

    // ファイルをBase64に変換
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const fileUrl = `data:${file.type};base64,${base64}`
    
    return NextResponse.json({
      fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
```

```
┌──────────────────────────────────────────────────┐
│        ファイルアップロードフロー                 │
└──────────────────────────────────────────────────┘

1. クライアント    FormData で file 送信
                   ↓
2. 認証チェック    ログインユーザーのみ許可
                   ↓
3. サイズチェック  2MB以下のみ許可
                   ↓
4. Base64変換      ArrayBuffer → Buffer → Base64
                   ↓
5. Data URI生成    data:image/png;base64,xxxxx
                   ↓
6. レスポンス      fileUrl, fileName等を返却
```

**ポイント**:
- 🔐 **認証必須**: ログインユーザーのみアップロード可能
- 📦 **Base64形式**: データベースやローカルストレージに保存しやすい
- 🚫 **サイズ制限**: 2MB以下（Base64で約33%増えるため）
- 📄 **メタデータ返却**: ファイル名、タイプ、サイズも返す

---

#### 4. YouTube検索API

**src/app/api/youtube/search/route.ts**

YouTube Data APIを使って動画を検索します（APIキーがない場合は検索URLを返す）。

```typescript
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * YouTube検索API
 * 曲名からYouTube動画URLを検索
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'クエリが必要です' }, { status: 400 })
    }

    // YouTube Data APIキーが設定されている場合はAPIを使用
    const apiKey = process.env.YOUTUBE_API_KEY

    if (apiKey) {
      // YouTube Data API v3を使用
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`
      )

      if (!response.ok) {
        throw new Error('YouTube API呼び出しに失敗しました')
      }

      const data = await response.json()
      
      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId
        const url = `https://www.youtube.com/watch?v=${videoId}`
        const title = data.items[0].snippet.title
        
        return NextResponse.json({ 
          url, 
          title,
          videoId 
        })
      }
    } else {
      // APIキーがない場合は検索URLを返す
      // ユーザーが手動で選択できるように検索結果ページを開く
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      
      return NextResponse.json({ 
        url: searchUrl,
        title: query,
        isSearchUrl: true,
        message: 'YouTube Data APIキーが設定されていません。検索結果ページのURLを返します。'
      })
    }

    return NextResponse.json({ error: '検索結果が見つかりませんでした' }, { status: 404 })
    
  } catch (error) {
    console.error('YouTube検索エラー:', error)
    return NextResponse.json(
      { error: 'YouTube検索に失敗しました' },
      { status: 500 }
    )
  }
}
```

```
┌──────────────────────────────────────────────────┐
│        YouTube検索の2つのモード                   │
└──────────────────────────────────────────────────┘

【APIキーあり】
 クエリ → YouTube Data API → 動画ID取得
                              ↓
                     https://youtube.com/watch?v=xxxxx

【APIキーなし】
 クエリ → 検索URL生成 → https://youtube.com/results?search_query=曲名
                        （ユーザーが手動で選択）
```

**ポイント**:
- 🔑 **APIキー判定**: 環境変数`YOUTUBE_API_KEY`の有無で動作を切り替え
- 🎥 **YouTube Data API v3**: 動画情報を取得（タイトル、ID等）
- 🔄 **フォールバック**: APIキーなしでも検索URLを返す
- 📺 **maxResults=1**: 最初の1件のみ取得（課題曲の自動取得用）

---

### 31.5.3 HTTPメソッドの使い分け（PATCH vs PUT）

REST APIにおいて、更新操作には`PATCH`と`PUT`の2つのメソッドがあります。このプロジェクトでは一貫して`PATCH`を使用しています。

```
┌──────────────────────────────────────────────────┐
│        PATCH vs PUT の違い                        │
└──────────────────────────────────────────────────┘

PATCH（部分更新）
  ├─ 変更したいフィールドのみ送信
  ├─ 他のフィールドはそのまま維持
  ├─ ネットワーク負荷が軽い
  └─ ✅ このプロジェクトで採用

PUT（完全置換）
  ├─ すべてのフィールドを送信
  ├─ リソース全体を置き換える
  ├─ 送信漏れがあるとnullになる危険
  └─ ❌ 使用していない
```

#### PATCHの実装例

```typescript
// ✅ PATCH: タイトルだけ更新
export async function PATCH(req: NextRequest, { params }: Props) {
  const body = await req.json()
  
  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      // body に含まれるフィールドのみ更新
      ...(body.title && { title: body.title }),
      ...(body.content && { content: body.content }),
      // 他のフィールドは変更されない
    },
  })
  
  return NextResponse.json(post)
}

// クライアント側: タイトルだけ送信
await fetch(`/api/posts/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({ title: '新しいタイトル' })
  // contentやimageUrlsは送らなくてOK
})
```

#### PUTの場合（使用していない）

```typescript
// ❌ PUT: すべてのフィールドが必要
export async function PUT(req: NextRequest, { params }: Props) {
  const body = await req.json()
  
  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title: body.title,           // 必須
      content: body.content,       // 必須
      date: body.date,             // 必須
      location: body.location,     // 必須
      imageUrls: body.imageUrls,   // 必須
      youtubeUrls: body.youtubeUrls, // 必須
      // すべて指定しないとnullになる可能性
    },
  })
}

// クライアント側: すべてのフィールドを送信
await fetch(`/api/posts/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
    title: '新しいタイトル',
    content: '既存の内容...',  // 必要
    date: '2026-01-01',        // 必要
    location: '既存の場所',    // 必要
    imageUrls: [...],          // 必要
    youtubeUrls: [...],        // 必要
  })
})
```

#### このプロジェクトでPATCHを選んだ理由

| 観点 | PATCH | PUT |
|------|-------|-----|
| **更新範囲** | 部分的 | 完全置換 |
| **クライアント側** | 変更フィールドのみ | 全フィールド送信 |
| **ネットワーク負荷** | 軽い | 重い |
| **実装の柔軟性** | 高い | 低い |
| **安全性** | 他フィールドを誤って消さない | 送信漏れでnullになる危険 |
| **UX** | スムーズ | データ入力が面倒 |

**実例: 投稿の場所だけを変更**

```typescript
// ✅ PATCH: 1つのフィールドだけ更新
await fetch('/api/posts/123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: '新しいスタジオ'
  })
})

// ❌ PUT: すべてのフィールドが必要
await fetch('/api/posts/123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: '既存のタイトル',
    content: '既存の内容（1000文字）',
    date: '2026-01-01',
    location: '新しいスタジオ',  // 変更したいのはここだけ
    imageUrls: ['既存の画像1', '既存の画像2'],
    youtubeUrls: ['既存の動画1']
    // すべて送る必要がある
  })
})
```

**ポイント**:
- 🎯 **効率的**: 必要な部分だけ更新
- 📦 **軽量**: 送信データ量が少ない
- 🛡️ **安全**: 他のデータを誤って消さない
- 👍 **UX向上**: ユーザーは変更したい部分だけ入力

---

### 🚀 次のステップ

次の章では、ページコンポーネントの詳細を解説します：

- **Chapter 32**: ページコンポーネントの詳細解説

---

[← 前の章：第30章 CI/CDの実装](30-CI-CDの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第32章 ページコンポーネントの詳細解説 →](32-ページコンポーネントの詳細解説.md)
