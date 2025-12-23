# 第11章：Prismaによるデータベース操作

この章では、Prisma ORMを使ったデータベース操作について詳しく学びます。

## 11.1 Prismaとは

Prismaは、Node.js/TypeScript用のモダンなORM（Object-Relational Mapping）ツールです。

### ORMとは

```
データベース（SQL） ← ORM → アプリケーション（TypeScript）

ORM なし:
  const result = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  const user = result.rows[0];

ORM あり:
  const user = await prisma.user.findUnique({ where: { id } });
```

### Prismaの特徴

- **型安全**: TypeScriptの型が自動生成される
- **直感的なAPI**: SQLを書かずにデータ操作
- **マイグレーション**: データベーススキーマの変更管理
- **リレーション**: 関連データの取得が簡単

---

## 11.2 Prismaのセットアップ

### 1. インストール

```bash
npm install @prisma/client
npm install -D prisma
```

### 2. 初期化

```bash
npx prisma init
```

これで以下のファイルが作成されます：

```
prisma/
  schema.prisma    # データベーススキーマ定義
.env
  DATABASE_URL="postgresql://..."
```

### 3. スキーマの定義

**prisma/schema.prisma:**

```prisma
// データソース設定
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Prisma Clientの設定
generator client {
  provider = "prisma-client-js"
}

// Userモデル
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      String   @default("member")
  
  posts     Post[]
  comments  Comment[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4. データベースに反映

```bash
# スキーマをデータベースに反映
npx prisma db push

# Prisma Clientを生成
npx prisma generate
```

### 5. Prisma Clientの使用

**src/lib/db.ts:**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // SQLクエリをログ出力
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## 11.3 基本的なCRUD操作

### Create（作成）

```typescript
import { prisma } from '@/lib/db';

// 1件作成
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'ユーザー名',
    password: 'hashed-password',
  },
});

// 複数件作成
const users = await prisma.user.createMany({
  data: [
    { email: 'user1@example.com', name: 'User 1', password: 'pass1' },
    { email: 'user2@example.com', name: 'User 2', password: 'pass2' },
  ],
});
```

### Read（読み取り）

```typescript
// 全件取得
const allUsers = await prisma.user.findMany();

// 条件付き取得
const adminUsers = await prisma.user.findMany({
  where: {
    role: 'admin',
  },
});

// 1件取得（一意な条件）
const user = await prisma.user.findUnique({
  where: {
    email: 'user@example.com',
  },
});

// 1件取得（任意の条件）
const firstUser = await prisma.user.findFirst({
  where: {
    role: 'member',
  },
});

// 存在チェック
const userExists = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  select: { id: true },
});
```

### Update（更新）

```typescript
// 1件更新
const updatedUser = await prisma.user.update({
  where: {
    id: 'user-id',
  },
  data: {
    name: '新しい名前',
  },
});

// 複数件更新
const result = await prisma.user.updateMany({
  where: {
    role: 'member',
  },
  data: {
    role: 'verified-member',
  },
});

// Upsert（存在すれば更新、なければ作成）
const user = await prisma.user.upsert({
  where: {
    email: 'user@example.com',
  },
  update: {
    name: '更新された名前',
  },
  create: {
    email: 'user@example.com',
    name: '新しいユーザー',
    password: 'hashed-password',
  },
});
```

### Delete（削除）

```typescript
// 1件削除
await prisma.user.delete({
  where: {
    id: 'user-id',
  },
});

// 複数件削除
await prisma.user.deleteMany({
  where: {
    role: 'inactive',
  },
});

// 全件削除
await prisma.user.deleteMany();
```

---

## 11.4 フィルタリングと検索

### 比較演算子

```typescript
// 等しい
await prisma.user.findMany({
  where: {
    role: 'admin',
  },
});

// 含まない
await prisma.user.findMany({
  where: {
    role: {
      not: 'admin',
    },
  },
});

// 複数の値のいずれか
await prisma.user.findMany({
  where: {
    role: {
      in: ['admin', 'moderator'],
    },
  },
});

// 複数の値のいずれでもない
await prisma.user.findMany({
  where: {
    role: {
      notIn: ['banned', 'inactive'],
    },
  },
});
```

### 数値の比較

```typescript
// 投稿が10件以上のユーザー
await prisma.user.findMany({
  where: {
    posts: {
      some: {
        id: {
          gte: 10, // Greater Than or Equal (以上)
        },
      },
    },
  },
});

// その他の比較演算子
// gt: 大きい（Greater Than）
// gte: 以上（Greater Than or Equal）
// lt: 小さい（Less Than）
// lte: 以下（Less Than or Equal）
```

### 文字列検索

```typescript
// 部分一致（contains）
await prisma.user.findMany({
  where: {
    name: {
      contains: 'John',
    },
  },
});

// 前方一致（starts with）
await prisma.user.findMany({
  where: {
    email: {
      startsWith: 'admin',
    },
  },
});

// 後方一致（ends with）
await prisma.user.findMany({
  where: {
    email: {
      endsWith: '@example.com',
    },
  },
});

// 大文字小文字を区別しない
await prisma.user.findMany({
  where: {
    name: {
      contains: 'john',
      mode: 'insensitive',
    },
  },
});
```

### 複数条件（AND/OR）

```typescript
// AND（すべての条件を満たす）
await prisma.user.findMany({
  where: {
    AND: [
      { role: 'member' },
      { email: { endsWith: '@example.com' } },
    ],
  },
});

// OR（いずれかの条件を満たす）
await prisma.user.findMany({
  where: {
    OR: [
      { role: 'admin' },
      { role: 'moderator' },
    ],
  },
});

// NOT（条件を満たさない）
await prisma.user.findMany({
  where: {
    NOT: {
      role: 'banned',
    },
  },
});

// 複雑な条件
await prisma.user.findMany({
  where: {
    AND: [
      { role: 'member' },
      {
        OR: [
          { email: { endsWith: '@example.com' } },
          { email: { endsWith: '@test.com' } },
        ],
      },
    ],
  },
});
```

---

## 11.5 並び替えとページネーション

### 並び替え（orderBy）

```typescript
// 1つのフィールドで並び替え
await prisma.post.findMany({
  orderBy: {
    createdAt: 'desc', // 降順（新しい順）
  },
});

// 複数のフィールドで並び替え
await prisma.post.findMany({
  orderBy: [
    { createdAt: 'desc' },
    { title: 'asc' }, // 昇順（A-Z順）
  ],
});

// リレーション先のフィールドで並び替え
await prisma.post.findMany({
  orderBy: {
    author: {
      name: 'asc',
    },
  },
});
```

### ページネーション

```typescript
// skip: 最初の何件をスキップするか
// take: 何件取得するか

// 1ページ目（1-10件目）
const page1 = await prisma.post.findMany({
  skip: 0,
  take: 10,
  orderBy: { createdAt: 'desc' },
});

// 2ページ目（11-20件目）
const page2 = await prisma.post.findMany({
  skip: 10,
  take: 10,
  orderBy: { createdAt: 'desc' },
});

// ページネーション関数
async function getPaginatedPosts(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count(), // 総件数
  ]);
  
  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

const result = await getPaginatedPosts(1, 10);
```

---

## 11.6 リレーション

### リレーションの定義

```prisma
model User {
  id    String @id @default(cuid())
  name  String
  posts Post[]     // 1対多
}

model Post {
  id       String @id @default(cuid())
  title    String
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
  
  tags     Tag[]  // 多対多
}

model Tag {
  id    String @id @default(cuid())
  name  String
  posts Post[] // 多対多
}
```

### リレーションデータの取得（include）

```typescript
// 投稿と著者を一緒に取得
const posts = await prisma.post.findMany({
  include: {
    author: true,
  },
});

// 結果
// posts[0].author.name にアクセス可能

// ネストされたリレーション
const posts = await prisma.post.findMany({
  include: {
    author: true,
    comments: {
      include: {
        user: true,
      },
    },
  },
});

// 条件付きでリレーションを取得
const posts = await prisma.post.findMany({
  include: {
    comments: {
      where: {
        createdAt: {
          gte: new Date('2024-01-01'),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5, // 最新の5件のみ
    },
  },
});
```

### 特定のフィールドのみ取得（select）

```typescript
// 特定のフィールドのみ
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // password は取得しない
  },
});

// リレーション先も select
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    author: {
      select: {
        name: true,
        image: true,
      },
    },
  },
});
```

**include vs select:**

- `include`: すべてのフィールド + リレーション
- `select`: 指定したフィールドのみ

```typescript
// include（すべてのフィールド + author）
const post = await prisma.post.findUnique({
  where: { id },
  include: { author: true },
});
// post.id, post.title, post.content, post.author すべて取得

// select（指定したフィールドのみ）
const post = await prisma.post.findUnique({
  where: { id },
  select: {
    title: true,
    author: { select: { name: true } },
  },
});
// post.title, post.author.name のみ取得
```

### カウント（_count）

```typescript
// リレーション先の件数を取得
const users = await prisma.user.findMany({
  include: {
    _count: {
      select: {
        posts: true,
        comments: true,
      },
    },
  },
});

// users[0]._count.posts → 投稿数
// users[0]._count.comments → コメント数
```

---

## 11.7 集計関数

### count（件数）

```typescript
// 全件数
const count = await prisma.user.count();

// 条件付き件数
const adminCount = await prisma.user.count({
  where: {
    role: 'admin',
  },
});
```

### aggregate（集計）

```typescript
// 数値フィールドの集計
const result = await prisma.post.aggregate({
  _count: true,  // 件数
  _avg: {
    viewCount: true,  // 平均
  },
  _sum: {
    viewCount: true,  // 合計
  },
  _min: {
    createdAt: true,  // 最小値
  },
  _max: {
    createdAt: true,  // 最大値
  },
});

// 結果
// result._count
// result._avg.viewCount
// result._sum.viewCount
// result._min.createdAt
// result._max.createdAt
```

### groupBy（グループ化）

```typescript
// 役割ごとにユーザー数を集計
const result = await prisma.user.groupBy({
  by: ['role'],
  _count: {
    id: true,
  },
});

// 結果
// [
//   { role: 'admin', _count: { id: 5 } },
//   { role: 'member', _count: { id: 50 } },
// ]

// 複数フィールドでグループ化
const result = await prisma.post.groupBy({
  by: ['authorId', 'published'],
  _count: {
    id: true,
  },
  having: {
    published: {
      equals: true,
    },
  },
});
```

---

## 11.8 トランザクション

複数のデータベース操作を、すべて成功するか、すべて失敗するかのどちらかにする仕組みです。

### シーケンシャルトランザクション

```typescript
// 投稿を作成して、著者の投稿数を更新
const result = await prisma.$transaction(async (tx) => {
  // 1. 投稿を作成
  const post = await tx.post.create({
    data: {
      title: '新しい投稿',
      content: '内容',
      authorId: userId,
    },
  });
  
  // 2. 著者の投稿数を更新
  await tx.user.update({
    where: { id: userId },
    data: {
      postCount: {
        increment: 1,
      },
    },
  });
  
  return post;
});
```

### 並列トランザクション

```typescript
// 複数の操作を同時に実行（すべて成功するか、すべて失敗）
const [user, post] = await prisma.$transaction([
  prisma.user.create({
    data: { email: 'user@example.com', name: 'User', password: 'pass' },
  }),
  prisma.post.create({
    data: { title: 'Post', content: 'Content', authorId: 'author-id' },
  }),
]);
```

### 楽観的ロック

```typescript
// バージョン番号を使った競合検出
const post = await prisma.post.findUnique({
  where: { id: postId },
});

await prisma.post.update({
  where: {
    id: postId,
    version: post.version, // バージョンが一致するときのみ更新
  },
  data: {
    title: '更新されたタイトル',
    version: {
      increment: 1,
    },
  },
});
```

---

## 11.9 実践例：投稿機能の実装

### 投稿一覧の取得

```typescript
// app/api/posts/route.ts
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
```

### 投稿詳細の取得

```typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
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
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
```

### 投稿の作成

```typescript
export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { title, content, youtubeUrls, images } = body;
    
    // バリデーション
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
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
      },
    });
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
```

### いいね機能

```typescript
// app/api/posts/[id]/like/route.ts
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: postId } = await params;
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
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
      
      return NextResponse.json({ liked: false });
    } else {
      // いいねを追加
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });
      
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
```

---

## 11.10 パフォーマンス最適化

### N+1問題の回避

```typescript
// ❌ 悪い例：N+1問題（ループ内でクエリ）
const posts = await prisma.post.findMany();
for (const post of posts) {
  // 投稿ごとにクエリ（N回）
  const author = await prisma.user.findUnique({
    where: { id: post.authorId },
  });
  console.log(author.name);
}

// ✅ 良い例：includeで一度に取得
const posts = await prisma.post.findMany({
  include: {
    author: true,
  },
});
for (const post of posts) {
  console.log(post.author.name);
}
```

### インデックスの活用

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  createdAt DateTime @default(now())
  
  // インデックスを追加（検索が速くなる）
  @@index([createdAt])
  @@index([authorId, createdAt])
}
```

### バッチ処理

```typescript
// 複数のユーザーを一度に取得
const userIds = ['id1', 'id2', 'id3'];
const users = await prisma.user.findMany({
  where: {
    id: {
      in: userIds,
    },
  },
});
```

---

## まとめ

この章では、Prismaを使ったデータベース操作について学びました：

### 基本操作
- ✅ **CRUD**: Create、Read、Update、Delete
- ✅ **フィルタリング**: where条件、比較演算子、文字列検索
- ✅ **並び替え**: orderBy、ページネーション

### 高度な機能
- ✅ **リレーション**: include、select、_count
- ✅ **集計**: count、aggregate、groupBy
- ✅ **トランザクション**: 複数操作の一括処理

### 実践
- ✅ **投稿機能**: 一覧、詳細、作成、いいね
- ✅ **最適化**: N+1問題の回避、インデックス

次の章では、**投稿API**の実装を詳しく見ていきます。

---

[← 前の章：第10章 NextAuth.jsによる認証](10-NextAuth.jsによる認証.md) | [目次に戻る](00-目次.md) | [次の章へ：第12章 投稿APIの実装 →](12-投稿APIの実装.md)
