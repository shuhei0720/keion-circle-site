# 第5章：Next.js入門

この章では、**Next.js**の基本を学びます。Next.jsは、Reactをベースにした強力なフレームワークで、本プロジェクトでも使用しています。

## 5.1 Next.jsとは

### Next.jsの特徴

**Next.js**は、Vercel社が開発したReactフレームワークです。

**主な特徴：**

1. **サーバーサイドレンダリング（SSR）**: 高速な初回表示とSEO対策
2. **静的サイト生成（SSG）**: ビルド時にHTMLを生成
3. **ファイルベースルーティング**: ファイル構造がそのままURLになる
4. **APIルート**: サーバーレス関数を簡単に作成
5. **画像最適化**: 自動的に画像を最適化
6. **TypeScript対応**: 最初からTypeScriptをサポート
7. **ホットリロード**: コードを変更すると自動で反映

**React vs Next.js：**

```
React（ライブラリ）:
- UI構築のみ
- ルーティングは別ライブラリ（React Router等）
- サーバー機能は別途必要

Next.js（フレームワーク）:
- UI構築 + ルーティング + サーバー機能
- すべてが統合されている
- 設定が少なく、すぐに開発開始できる
```

---

## 5.2 App Routerとは

Next.js 13以降では、**App Router**という新しいルーティングシステムが導入されました。本プロジェクトもApp Routerを使っています。

### ディレクトリ構造

```
src/
└── app/
    ├── page.tsx              # / （トップページ）
    ├── layout.tsx            # 全ページ共通レイアウト
    ├── posts/
    │   ├── page.tsx          # /posts （投稿一覧）
    │   ├── new/
    │   │   └── page.tsx      # /posts/new （新規投稿）
    │   └── [id]/
    │       ├── page.tsx      # /posts/123 （投稿詳細）
    │       └── edit/
    │           └── page.tsx  # /posts/123/edit （投稿編集）
    ├── events/
    │   ├── page.tsx          # /events （イベント一覧）
    │   └── [id]/
    │       └── page.tsx      # /events/123 （イベント詳細）
    └── api/
        └── posts/
            └── route.ts      # API: /api/posts
```

**ルールまとめ：**
- `page.tsx` → そのURLのページ
- `layout.tsx` → レイアウト（共通部分）
- `[id]` → 動的ルート（パラメータ）
- `route.ts` → APIルート

---

## 5.3 ページの作成

### 基本的なページ

**src/app/page.tsx**（トップページ）：

```tsx
export default function Home() {
  return (
    <div>
      <h1>トップページ</h1>
      <p>ようこそ！</p>
    </div>
  );
}
```

これだけで `http://localhost:3000/` にアクセスできます。

### 別のページ

**src/app/about/page.tsx**（概要ページ）：

```tsx
export default function About() {
  return (
    <div>
      <h1>概要</h1>
      <p>このサイトについて</p>
    </div>
  );
}
```

これで `http://localhost:3000/about` にアクセスできます。

### ネストしたページ

**src/app/posts/new/page.tsx**（新規投稿ページ）：

```tsx
export default function NewPost() {
  return (
    <div>
      <h1>新規投稿</h1>
      <form>
        <input type="text" placeholder="タイトル" />
        <textarea placeholder="内容" />
        <button type="submit">投稿</button>
      </form>
    </div>
  );
}
```

これで `http://localhost:3000/posts/new` にアクセスできます。

---

## 5.4 動的ルート

### 基本の動的ルート

ファイル名を `[パラメータ名]` にすると、動的ルートになります。

**src/app/posts/[id]/page.tsx**：

```tsx
export default function PostDetail({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>投稿詳細</h1>
      <p>投稿ID: {params.id}</p>
    </div>
  );
}
```

**アクセス例：**
- `http://localhost:3000/posts/1` → `params.id` は `"1"`
- `http://localhost:3000/posts/123` → `params.id` は `"123"`
- `http://localhost:3000/posts/abc` → `params.id` は `"abc"`

### 複数の動的セグメント

**src/app/posts/[id]/comments/[commentId]/page.tsx**：

```tsx
export default function CommentDetail({
  params
}: {
  params: { id: string; commentId: string }
}) {
  return (
    <div>
      <h1>コメント詳細</h1>
      <p>投稿ID: {params.id}</p>
      <p>コメントID: {params.commentId}</p>
    </div>
  );
}
```

**アクセス例：**
- `http://localhost:3000/posts/1/comments/5`
  - `params.id` は `"1"`
  - `params.commentId` は `"5"`

### キャッチオールセグメント

**src/app/docs/[...slug]/page.tsx**：

```tsx
export default function Docs({ params }: { params: { slug: string[] } }) {
  return (
    <div>
      <h1>ドキュメント</h1>
      <p>パス: {params.slug.join('/')}</p>
    </div>
  );
}
```

**アクセス例：**
- `http://localhost:3000/docs/guide` → `slug` は `["guide"]`
- `http://localhost:3000/docs/guide/getting-started` → `slug` は `["guide", "getting-started"]`

---

## 5.5 レイアウト

### ルートレイアウト

**src/app/layout.tsx**（全ページ共通）：

```tsx
import './globals.css';

export const metadata = {
  title: 'BOLD軽音サークル',
  description: 'メンバー専用サイト',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header>
          <nav>
            <a href="/">ホーム</a>
            <a href="/posts">投稿</a>
            <a href="/events">イベント</a>
          </nav>
        </header>
        
        <main>{children}</main>
        
        <footer>
          <p>&copy; 2025 BOLD軽音</p>
        </footer>
      </body>
    </html>
  );
}
```

**ポイント：**
- すべてのページで使われる
- `<html>`と`<body>`タグを含む
- `children`に各ページの内容が入る
- `metadata`でページのメタ情報を設定

### ネストしたレイアウト

**src/app/posts/layout.tsx**（投稿セクション用）：

```tsx
export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="posts-container">
      <aside>
        <h2>投稿メニュー</h2>
        <ul>
          <li><a href="/posts">一覧</a></li>
          <li><a href="/posts/new">新規投稿</a></li>
        </ul>
      </aside>
      
      <div className="posts-content">
        {children}
      </div>
    </div>
  );
}
```

**レイアウトの入れ子構造：**

```
RootLayout（全ページ）
└── PostsLayout（/posts配下のみ）
    └── Page（各ページ）
```

---

## 5.6 リンクとナビゲーション

### Linkコンポーネント

Next.jsでは、`<a>`タグの代わりに`<Link>`コンポーネントを使います。

```tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      {/* ❌ 通常のaタグ：ページ全体がリロード */}
      <a href="/posts">投稿</a>
      
      {/* ✅ Linkコンポーネント：高速なクライアントサイドナビゲーション */}
      <Link href="/posts">投稿</Link>
      
      {/* 動的ルート */}
      <Link href={`/posts/${postId}`}>投稿詳細</Link>
      
      {/* クエリパラメータ */}
      <Link href="/posts?sort=new">新着順</Link>
      
      {/* 外部リンク */}
      <Link href="https://example.com" target="_blank">
        外部サイト
      </Link>
    </nav>
  );
}
```

### useRouterフック

プログラムからページ遷移するには、`useRouter`フックを使います。

```tsx
'use client';

import { useRouter } from 'next/navigation';

export default function PostForm() {
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 投稿を作成
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
    
    const post = await response.json();
    
    // 詳細ページに遷移
    router.push(`/posts/${post.id}`);
  };
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

**useRouterのメソッド：**

```tsx
const router = useRouter();

// ページ遷移
router.push('/posts');           // 履歴に追加
router.replace('/posts');        // 履歴を置き換え
router.back();                   // 前のページに戻る
router.forward();                // 次のページに進む
router.refresh();                // 現在のページを再読み込み
```

---

## 5.7 サーバーコンポーネントとクライアントコンポーネント

Next.js App Routerでは、コンポーネントは**デフォルトでサーバーコンポーネント**です。

### サーバーコンポーネント（デフォルト）

```tsx
// src/app/posts/page.tsx
// サーバーで実行される

export default async function PostsList() {
  // サーバーで直接データを取得
  const posts = await fetch('http://localhost:3000/api/posts');
  const data = await posts.json();
  
  return (
    <div>
      <h1>投稿一覧</h1>
      <ul>
        {data.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

**サーバーコンポーネントの特徴：**
- ✅ サーバーで実行される
- ✅ データベースに直接アクセス可能
- ✅ JavaScriptがクライアントに送られない（軽量）
- ❌ `useState`、`useEffect`などのフックが使えない
- ❌ イベントハンドラ（`onClick`等）が使えない

### クライアントコンポーネント

ファイルの先頭に`'use client'`を書くと、クライアントコンポーネントになります。

```tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}
```

**クライアントコンポーネントの特徴：**
- ✅ ブラウザで実行される
- ✅ `useState`、`useEffect`などのフックが使える
- ✅ イベントハンドラが使える
- ❌ JavaScriptがクライアントに送られる（重い）

### 使い分け

```
サーバーコンポーネント（デフォルト）:
- データ取得
- 静的コンテンツ
- SEOが重要なコンテンツ

クライアントコンポーネント（'use client'）:
- ユーザーのインタラクション
- useState、useEffectなどのフック
- ブラウザAPIの使用
```

**例：混在させる**

```tsx
// src/app/posts/page.tsx（サーバーコンポーネント）
import LikeButton from '@/components/LikeButton';

export default async function PostsList() {
  const posts = await fetchPosts();  // サーバーでデータ取得
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          {/* クライアントコンポーネント */}
          <LikeButton postId={post.id} />
        </div>
      ))}
    </div>
  );
}
```

```tsx
// src/components/LikeButton.tsx（クライアントコンポーネント）
'use client';

import { useState } from 'react';

export default function LikeButton({ postId }: { postId: number }) {
  const [liked, setLiked] = useState(false);
  
  const handleLike = async () => {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    setLiked(true);
  };
  
  return (
    <button onClick={handleLike}>
      {liked ? '♥' : '♡'} いいね
    </button>
  );
}
```

---

## 5.8 データ取得

### サーバーコンポーネントでのデータ取得

```tsx
// src/app/posts/[id]/page.tsx

export default async function PostDetail({ params }: { params: { id: string } }) {
  // サーバーで直接データ取得
  const response = await fetch(`http://localhost:3000/api/posts/${params.id}`);
  const post = await response.json();
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>投稿者: {post.author.name}</p>
    </article>
  );
}
```

### クライアントコンポーネントでのデータ取得

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <p>読み込み中...</p>;
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### キャッシュの制御

```tsx
// キャッシュしない（常に最新データ）
const response = await fetch('http://localhost:3000/api/posts', {
  cache: 'no-store'
});

// 一定時間キャッシュ（10秒ごとに更新）
const response = await fetch('http://localhost:3000/api/posts', {
  next: { revalidate: 10 }
});
```

---

## 5.9 APIルート

Next.jsでは、`route.ts`ファイルでAPIエンドポイントを作成できます。

### GETリクエスト

**src/app/api/posts/route.ts**：

```ts
import { NextResponse } from 'next/server';

export async function GET() {
  // データベースから投稿を取得（仮のデータ）
  const posts = [
    { id: 1, title: '投稿1' },
    { id: 2, title: '投稿2' },
  ];
  
  return NextResponse.json(posts);
}
```

**アクセス：** `GET http://localhost:3000/api/posts`

### POSTリクエスト

```ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // リクエストボディを取得
  const body = await request.json();
  const { title, content } = body;
  
  // データベースに保存（仮の処理）
  const newPost = {
    id: Date.now(),
    title,
    content,
    createdAt: new Date(),
  };
  
  return NextResponse.json(newPost, { status: 201 });
}
```

**アクセス：**
```bash
POST http://localhost:3000/api/posts
Content-Type: application/json

{
  "title": "新しい投稿",
  "content": "内容"
}
```

### 動的ルートのAPI

**src/app/api/posts/[id]/route.ts**：

```ts
import { NextResponse } from 'next/server';

// GET /api/posts/123
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // データベースから投稿を取得
  const post = { id, title: '投稿タイトル', content: '内容' };
  
  return NextResponse.json(post);
}

// PUT /api/posts/123
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  
  // 更新処理
  const updatedPost = { id, ...body };
  
  return NextResponse.json(updatedPost);
}

// DELETE /api/posts/123
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // 削除処理
  
  return NextResponse.json({ message: '削除しました' });
}
```

### エラーハンドリング

```ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await getPostById(params.id);
    
    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラー' },
      { status: 500 }
    );
  }
}
```

---

## 5.10 メタデータとSEO

### 静的メタデータ

```tsx
// src/app/posts/page.tsx

export const metadata = {
  title: '投稿一覧 | BOLD軽音',
  description: 'メンバーの投稿一覧ページ',
};

export default function PostsList() {
  return <div>{/* ... */}</div>;
}
```

### 動的メタデータ

```tsx
// src/app/posts/[id]/page.tsx

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  
  return {
    title: `${post.title} | BOLD軽音`,
    description: post.content.substring(0, 100),
  };
}

export default async function PostDetail({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

---

## 5.11 画像の最適化

### Imageコンポーネント

Next.jsの`Image`コンポーネントは、画像を自動的に最適化します。

```tsx
import Image from 'next/image';

export default function UserAvatar() {
  return (
    <div>
      {/* ❌ 通常のimgタグ：最適化されない */}
      <img src="/avatar.jpg" alt="アバター" width={100} height={100} />
      
      {/* ✅ Imageコンポーネント：自動最適化 */}
      <Image
        src="/avatar.jpg"
        alt="アバター"
        width={100}
        height={100}
      />
    </div>
  );
}
```

**Imageコンポーネントの利点：**
- ✅ 自動的にWebPなど最適なフォーマットに変換
- ✅ レスポンシブ画像（画面サイズに応じて最適なサイズ）
- ✅ 遅延読み込み（Lazy Loading）
- ✅ ぼかしプレースホルダー

### 外部画像の使用

外部URLの画像を使う場合、`next.config.ts`で許可する必要があります。

**next.config.ts：**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

**使用：**

```tsx
<Image
  src="https://example.supabase.co/storage/v1/object/public/avatars/user.jpg"
  alt="アバター"
  width={100}
  height={100}
/>
```

### レスポンシブ画像

```tsx
// 親要素のサイズに合わせる
<div style={{ position: 'relative', width: '100%', height: '400px' }}>
  <Image
    src="/banner.jpg"
    alt="バナー"
    fill
    style={{ objectFit: 'cover' }}
  />
</div>

// 複数サイズ
<Image
  src="/image.jpg"
  alt="画像"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

## 5.12 環境変数

### 環境変数の設定

**.env.local**（開発環境）：

```env
# 公開される環境変数（NEXT_PUBLIC_で始まる）
NEXT_PUBLIC_API_URL=http://localhost:3000

# サーバーのみで使える環境変数
DATABASE_URL=postgresql://user:password@localhost:5432/db
AUTH_SECRET=your-secret-key
```

### 環境変数の使用

```tsx
// クライアントサイド（ブラウザ）で使える
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// サーバーサイドのみで使える
const dbUrl = process.env.DATABASE_URL;
const authSecret = process.env.AUTH_SECRET;
```

> ⚠️ **重要**: 機密情報（パスワード等）は`NEXT_PUBLIC_`を付けないこと！

---

## 5.13 実践例：ブログアプリ

ここまでの知識を使って、簡単なブログアプリを作ってみましょう。

### ディレクトリ構造

```
src/app/
├── layout.tsx              # ルートレイアウト
├── page.tsx                # トップページ
├── blog/
│   ├── page.tsx            # /blog（記事一覧）
│   ├── [slug]/
│   │   └── page.tsx        # /blog/my-post（記事詳細）
│   └── new/
│       └── page.tsx        # /blog/new（新規作成）
└── api/
    └── posts/
        ├── route.ts        # GET, POST /api/posts
        └── [id]/
            └── route.ts    # GET, PUT, DELETE /api/posts/[id]
```

### 1. ルートレイアウト

**src/app/layout.tsx：**

```tsx
import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'My Blog',
  description: 'シンプルなブログ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="header">
          <nav>
            <Link href="/">ホーム</Link>
            <Link href="/blog">ブログ</Link>
            <Link href="/blog/new">新規作成</Link>
          </nav>
        </header>
        
        <main className="main">{children}</main>
        
        <footer className="footer">
          <p>&copy; 2025 My Blog</p>
        </footer>
      </body>
    </html>
  );
}
```

### 2. トップページ

**src/app/page.tsx：**

```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>My Blogへようこそ</h1>
      <p>シンプルなブログサイトです。</p>
      <Link href="/blog">記事を読む →</Link>
    </div>
  );
}
```

### 3. 記事一覧

**src/app/blog/page.tsx：**

```tsx
import Link from 'next/link';

// サーバーコンポーネント（データ取得）
export default async function BlogList() {
  const response = await fetch('http://localhost:3000/api/posts', {
    cache: 'no-store'  // 常に最新データ
  });
  const posts = await response.json();
  
  return (
    <div>
      <h1>記事一覧</h1>
      <div className="posts-grid">
        {posts.map(post => (
          <article key={post.id} className="post-card">
            <h2>
              <Link href={`/blog/${post.slug}`}>
                {post.title}
              </Link>
            </h2>
            <p>{post.excerpt}</p>
            <time>{new Date(post.createdAt).toLocaleDateString('ja-JP')}</time>
          </article>
        ))}
      </div>
    </div>
  );
}
```

### 4. 記事詳細

**src/app/blog/[slug]/page.tsx：**

```tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const response = await fetch(`http://localhost:3000/api/posts/${params.slug}`);
  const post = await response.json();
  
  return {
    title: `${post.title} | My Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const response = await fetch(`http://localhost:3000/api/posts/${params.slug}`);
  const post = await response.json();
  
  return (
    <article>
      <h1>{post.title}</h1>
      <time>{new Date(post.createdAt).toLocaleDateString('ja-JP')}</time>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### 5. 新規作成

**src/app/blog/new/page.tsx：**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      
      const post = await response.json();
      router.push(`/blog/${post.slug}`);
    } catch (error) {
      console.error('エラー:', error);
      alert('投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>新規記事作成</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">タイトル</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? '投稿中...' : '投稿'}
        </button>
      </form>
    </div>
  );
}
```

### 6. APIルート

**src/app/api/posts/route.ts：**

```ts
import { NextResponse } from 'next/server';

// 仮のデータストア（実際はデータベースを使用）
let posts = [
  {
    id: 1,
    slug: 'first-post',
    title: '最初の投稿',
    excerpt: 'これは最初の投稿です。',
    content: '<p>これは最初の投稿の内容です。</p>',
    createdAt: new Date('2025-01-01'),
  },
];

// GET /api/posts
export async function GET() {
  return NextResponse.json(posts);
}

// POST /api/posts
export async function POST(request: Request) {
  const body = await request.json();
  const { title, content } = body;
  
  const newPost = {
    id: posts.length + 1,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    excerpt: content.substring(0, 100),
    content,
    createdAt: new Date(),
  };
  
  posts.push(newPost);
  
  return NextResponse.json(newPost, { status: 201 });
}
```

---

## まとめ

この章では、Next.jsの基本を学びました：

### 主要な概念
- ✅ **App Router**: ファイルベースルーティング
- ✅ **page.tsx**: ページの作成
- ✅ **layout.tsx**: レイアウトの作成
- ✅ **動的ルート**: `[id]`でパラメータを受け取る

### サーバーとクライアント
- ✅ **サーバーコンポーネント**: デフォルト、データ取得に最適
- ✅ **クライアントコンポーネント**: `'use client'`、インタラクティブなUI

### データとAPI
- ✅ **データ取得**: `fetch`でサーバーサイドデータ取得
- ✅ **APIルート**: `route.ts`でAPIエンドポイント作成

### 最適化
- ✅ **Image**: 画像の自動最適化
- ✅ **Metadata**: SEO対策

次の章では、**TypeScript**について学びます。本プロジェクトもTypeScriptを使っているので、型システムを理解することが重要です。

---

[← 前の章：第4章 React入門](04-React入門.md) | [目次に戻る](00-目次.md) | [次の章へ：第6章 TypeScript入門 →](06-TypeScript入門.md)
