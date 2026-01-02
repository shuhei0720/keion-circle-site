# 第5章：Next.js入門

この章では、**Next.js**の基本を学びます。Next.jsは、Reactをベースにした強力なフレームワークで、本プロジェクトでも使用しています。

# 第5章：Next.js入門

この章では、**Next.js**の基本を学びます。Next.jsは、Reactをベースにした強力なフレームワークで、本プロジェクトでも使用しています。

## 5.1 Next.jsとは

### Next.jsの特徴

**Next.js**は、Vercel社が開発した**Reactフレームワーク**です。

**なぜNext.jsが必要なのか？**

Reactだけでは以下の機能が不足しています：

```
React単体の問題点:
├─ ルーティング → 別途 React Router が必要
├─ SEO対策    → SSRの仕組みが必要
├─ 画像最適化  → 自分で実装が必要
├─ APIサーバー → 別途 Express 等が必要
└─ 設定        → Webpack等の複雑な設定が必要

Next.jsが解決:
├─ ルーティング → ファイル構造がそのままURL
├─ SEO対策    → SSR/SSGが標準搭載
├─ 画像最適化  → Image コンポーネントで自動
├─ APIサーバー → API Routes で簡単に作成
└─ 設定        → ゼロコンフィグで開始可能
```

---

### 主な特徴

**1. サーバーサイドレンダリング（SSR）**

```
従来のReact（CSR: Client-Side Rendering）:
1. ブラウザが空のHTMLを受け取る
2. JavaScriptをダウンロード
3. Reactが起動してDOM生成
4. やっとコンテンツが表示される
   → 初回表示が遅い
   → SEOに不利（検索エンジンが読めない）

Next.js（SSR）:
1. サーバーが完全なHTMLを生成
2. ブラウザが完成したHTMLを受け取る
3. すぐにコンテンツが表示される
4. その後JavaScriptが読み込まれて動的に
   → 初回表示が速い
   → SEOに有利（検索エンジンが読める）
```

**具体例：**

```tsx
// React単体（CSR）
export default function ProductPage() {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    // クライアントでデータ取得（遅い）
    fetch('/api/product/123')
      .then(res => res.json())
      .then(setProduct);
  }, []);
  
  if (!product) return <div>読み込み中...</div>;  // 最初は空
  
  return <div>{product.name}</div>;
}
```

```tsx
// Next.js（SSR）
export default async function ProductPage() {
  // サーバーでデータ取得（速い）
  const product = await fetch('https://api.example.com/product/123')
    .then(res => res.json());
  
  // 最初から完全なHTMLが送られる
  return <div>{product.name}</div>;
}
```

**表示速度の比較：**

```
React（CSR）:
ブラウザ → 空HTML受信 → JS読込 → React起動 → データ取得 → 表示
0ms      100ms        500ms     700ms      1200ms    1500ms
                                                     ↑ やっと表示

Next.js（SSR）:
ブラウザ → 完全HTML受信 → 表示 → JS読込（バックグラウンド）
0ms      100ms          100ms   500ms
         ↑ すぐ表示
```

---

**2. 静的サイト生成（SSG）**

```
SSG（Static Site Generation）:
ビルド時にHTMLを生成して保存
    ↓
毎回同じHTMLを返す
    ↓
超高速（CDNから配信可能）
```

**いつ使う？**

```
SSR（サーバーサイドレンダリング）:
- リクエストごとに異なるデータ
- ユーザー専用のページ
例: ダッシュボード、マイページ

SSG（静的サイト生成）:
- すべてのユーザーに同じコンテンツ
- 変更頻度が低い
例: ブログ記事、ドキュメント、商品ページ

CSR（クライアントサイドレンダリング）:
- 高頻度で変わるデータ
- リアルタイム性が重要
例: チャット、株価、ダッシュボードの一部
```

---

**3. ファイルベースルーティング**

```
従来のReact Router:
src/App.tsx に全ルートを定義

<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/posts" element={<Posts />} />
  <Route path="/posts/:id" element={<PostDetail />} />
</Routes>

問題点:
- ルートが増えると管理が大変
- ファイル構造とURLが一致しない

Next.js:
ファイル構造 = URL

src/app/
├── page.tsx              → /
├── posts/
│   ├── page.tsx          → /posts
│   └── [id]/
│       └── page.tsx      → /posts/123

メリット:
- 直感的
- 自動でルーティング
- コード分割も自動
```

---

**4. APIルート（サーバーレス関数）**

```
従来:
別途 Express サーバーが必要

const express = require('express');
const app = express();

app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.listen(3001);

Next.js:
同じプロジェクト内でAPIを作成

src/app/api/posts/route.ts
export async function GET() {
  return NextResponse.json(posts);
}

→ /api/posts でアクセス可能
```

---

**5. 画像最適化**

```
通常の <img> タグ:
❌ すべての画像が元のサイズでダウンロード
❌ フォーマット変換なし
❌ 遅延読み込みなし

Next.js <Image>:
✅ 画面サイズに合わせて自動リサイズ
✅ WebP/AVIFに自動変換（対応ブラウザのみ）
✅ 自動で遅延読み込み
✅ ぼかしプレースホルダー
```

**サイズ比較例：**

```
元の画像: 2MB (2000x1500px)

<img src="/photo.jpg" />
→ 2MB全部ダウンロード（遅い）

<Image src="/photo.jpg" width={400} height={300} />
→ モバイル: 50KB（400x300px、WebP）
→ デスクトップ: 150KB（800x600px、WebP）
→ 超高速！
```

---

**6. TypeScript対応**

```
React単体:
自分でTypeScript設定が必要

Next.js:
.tsxファイルを作るだけで自動的にTypeScript有効化
```

---

**7. ホットリロード（高速リフレッシュ）**

```
コードを変更
    ↓
保存
    ↓
1秒以内にブラウザに反映
    ↓
Stateは保持されたまま
```

**例：カウンターアプリ開発中**

```
const [count, setCount] = useState(0);

現在 count = 5 の状態でコードを変更
    ↓
保存
    ↓
画面が更新されるけど count = 5 のまま
（従来は count = 0 にリセットされてた）
```

---

### React vs Next.js

| 機能 | React | Next.js |
|------|-------|---------|
| UI構築 | ✅ | ✅ |
| ルーティング | React Router必要 | ✅ ファイルベース |
| SEO | ❌ 難しい | ✅ SSR/SSG |
| 画像最適化 | ❌ 自分で実装 | ✅ 自動 |
| APIサーバー | ❌ 別途必要 | ✅ 統合 |
| TypeScript | 手動設定 | ✅ 自動 |
| 初期表示 | 遅い | ✅ 速い |

---

### Next.jsのレンダリング方式

```
┌─────────────────────────────────────────┐
│ Next.jsの3つのレンダリング方式          │
├─────────────────────────────────────────┤
│                                         │
│ 1. SSR（Server-Side Rendering）        │
│    リクエストごとにサーバーでHTML生成   │
│    → 常に最新データ                     │
│    → サーバー負荷あり                   │
│                                         │
│ 2. SSG（Static Site Generation）       │
│    ビルド時にHTML生成                   │
│    → 超高速                             │
│    → 古いデータになる可能性             │
│                                         │
│ 3. CSR（Client-Side Rendering）        │
│    ブラウザでReactが実行                │
│    → リアルタイム更新                   │
│    → 初回表示が遅い                     │
│                                         │
│ ✨ これらを1つのアプリで混在可能！      │
└─────────────────────────────────────────┘
```

---

### 初心者への補足

> 💡 **Next.jsは「React + 便利機能」**
> 
> Reactの知識がそのまま使えます：
> - コンポーネント ✅
> - JSX ✅
> - useState ✅
> - useEffect ✅
> - Props ✅
> 
> プラス、Next.js独自の機能：
> - ファイルベースルーティング
> - サーバーコンポーネント
> - APIルート
> - 画像最適化
> 
> **学習のステップ：**
> 1. まずReactを学ぶ（第4章で学習済み✅）
> 2. Next.jsの独自機能を学ぶ（この章）
> 3. 両方を組み合わせて使う
> 
> **覚えておくこと：**
> - Next.jsはReactの拡張版
> - Reactができることは全部できる
> - プラス、ルーティングやSSRなどが簡単に使える

---

## 5.2 App Routerとは

Next.js 13以降では、**App Router**という新しいルーティングシステムが導入されました。本プロジェクトもApp Routerを使っています。

### Pages Router vs App Router

```
Pages Router（古い方式）:
src/pages/
├── index.tsx        → /
├── about.tsx        → /about
└── posts/
    └── [id].tsx     → /posts/123

App Router（新しい方式）:
src/app/
├── page.tsx         → /
├── about/
│   └── page.tsx     → /about
└── posts/
    └── [id]/
        └── page.tsx → /posts/123
```

**App Routerの利点：**

```
✅ レイアウトの再利用が簡単
   → layout.tsx でレイアウト定義

✅ サーバーコンポーネントがデフォルト
   → パフォーマンス向上

✅ ローディング・エラー状態の管理が簡単
   → loading.tsx, error.tsx

✅ より柔軟なルーティング
   → パラレルルート、インターセプトルート

✅ データ取得が簡単
   → async/await が使える
```

---

### ディレクトリ構造の理解

**基本構造：**

```
src/app/
├── page.tsx              # /（トップページ）
├── layout.tsx            # 全ページ共通レイアウト
├── loading.tsx           # ローディング画面
├── error.tsx             # エラー画面
├── not-found.tsx         # 404ページ
└── posts/
    ├── page.tsx          # /posts（投稿一覧）
    ├── layout.tsx        # 投稿セクション用レイアウト
    ├── loading.tsx       # 投稿セクション用ローディング
    ├── new/
    │   └── page.tsx      # /posts/new（新規投稿）
    └── [id]/
        ├── page.tsx      # /posts/123（投稿詳細）
        └── edit/
            └── page.tsx  # /posts/123/edit（投稿編集）
```

---

### 特殊ファイルの役割

**1. page.tsx - ページの定義**

```tsx
// src/app/posts/page.tsx
export default function PostsPage() {
  return <div>投稿一覧</div>;
}
// → /posts でアクセス可能
```

**ルール：**
- フォルダに `page.tsx` がないとアクセスできない
- URL になるのは `page.tsx` があるフォルダのみ

```
src/app/
├── posts/
│   ├── page.tsx         → /posts ✅ アクセス可
│   └── components/      → /posts/components ❌ アクセス不可
│       └── PostCard.tsx （page.tsx がないため）
```

---

**2. layout.tsx - レイアウトの定義**

```tsx
// src/app/layout.tsx（ルートレイアウト）
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <header>ヘッダー</header>
        <main>{children}</main>
        <footer>フッター</footer>
      </body>
    </html>
  );
}
```

**レイアウトの入れ子：**

```
URL: /posts/123

実際の構造:
RootLayout（app/layout.tsx）
  └─ PostsLayout（app/posts/layout.tsx）
      └─ PostDetailPage（app/posts/[id]/page.tsx）

レンダリング結果:
<html>
  <body>
    <header>ヘッダー</header>           ← RootLayout
    <main>
      <aside>投稿メニュー</aside>       ← PostsLayout
      <div>
        <h1>投稿詳細</h1>                ← PostDetailPage
      </div>
    </main>
    <footer>フッター</footer>           ← RootLayout
  </body>
</html>
```

---

**3. loading.tsx - ローディング画面**

```tsx
// src/app/posts/loading.tsx
export default function Loading() {
  return <div>読み込み中...</div>;
}
```

**動作：**

```
ユーザーが /posts にアクセス
    ↓
Next.js が loading.tsx を表示
    ↓
page.tsx のデータ取得中...
    ↓
データ取得完了
    ↓
page.tsx に切り替え
```

**Suspenseと連携：**

```tsx
// loading.tsx は自動的に以下のように機能する
<Suspense fallback={<Loading />}>
  <PostsPage />
</Suspense>
```

---

**4. error.tsx - エラー画面**

```tsx
// src/app/posts/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h1>エラーが発生しました</h1>
      <p>{error.message}</p>
      <button onClick={reset}>再試行</button>
    </div>
  );
}
```

**エラー発生時：**

```
page.tsx でエラー発生
    ↓
自動的に error.tsx が表示される
    ↓
reset() で再読み込み可能
```

> ⚠️ **注意**: error.tsx は必ず `'use client'` が必要！

---

**5. not-found.tsx - 404ページ**

```tsx
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>ページが見つかりません</p>
    </div>
  );
}
```

**使い方：**

```tsx
// src/app/posts/[id]/page.tsx
import { notFound } from 'next/navigation';

export default async function PostDetail({ params }) {
  const post = await getPost(params.id);
  
  if (!post) {
    notFound();  // → not-found.tsx が表示される
  }
  
  return <div>{post.title}</div>;
}
```

---

### 動的ルートの詳細

動的ルートの各パターンを詳しく見ていきましょう。

**1. 基本の動的ルート `[id]`**

```
フォルダ名: [id]
マッチ: 任意の1セグメント

/posts/1        ✅ params.id = "1"
/posts/abc      ✅ params.id = "abc"
/posts/1/edit   ❌ マッチしない（2セグメント）
```

**2. キャッチオールセグメント `[...slug]`**

```
フォルダ名: [...slug]
マッチ: 1つ以上のセグメント

/docs/a           ✅ params.slug = ["a"]
/docs/a/b         ✅ params.slug = ["a", "b"]
/docs/a/b/c       ✅ params.slug = ["a", "b", "c"]
/docs             ❌ マッチしない（0セグメント）
```

**3. オプショナルキャッチオール `[[...slug]]`**

```
フォルダ名: [[...slug]]
マッチ: 0個以上のセグメント

/docs             ✅ params.slug = []
/docs/a           ✅ params.slug = ["a"]
/docs/a/b         ✅ params.slug = ["a", "b"]
```

---

## 5.3 動的ルート

動的ルートを使うと、1つのページで複数のURLに対応できます。

### なぜ動的ルートが必要？

**静的ルートだけの場合：**

```
投稿が100個ある場合...

src/app/posts/
├── 1/
│   └── page.tsx    # 投稿1
├── 2/
│   └── page.tsx    # 投稿2
├── 3/
│   └── page.tsx    # 投稿3
...
└── 100/
    └── page.tsx    # 投稿100

問題点:
❌ ファイルが100個必要
❌ 新しい投稿ごとにファイル追加
❌ メンテナンス不可能
```

**動的ルートを使う：**

```
src/app/posts/
└── [id]/
    └── page.tsx    # すべての投稿に対応 ✅

メリット:
✅ ファイル1つで全投稿に対応
✅ 新しい投稿が自動的に表示
✅ メンテナンスが簡単
```

---

### 基本の動的ルート

**手順1：フォルダ名を `[id]` にする**

```
src/app/posts/
└── [id]/              ← [角括弧] で動的ルート
    └── page.tsx
```

**手順2：page.tsx でparamsを受け取る**

> **📝 注意（Next.js 15以降）**
> 
> Next.js 15以降では、`params`が非同期（Promise）になる場合があります。
> このため、以下のように`await`を使用することが推奨されます。

**Next.js 14以前（同期的なparams）：**

```tsx
// src/app/posts/[id]/page.tsx
export default function PostDetail({
  params
}: {
  params: { id: string }  // id はフォルダ名と一致
}) {
  return (
    <div>
      <h1>投稿詳細</h1>
      <p>投稿ID: {params.id}</p>
    </div>
  );
}
```

**Next.js 15以降（推奨）：**

```tsx
// src/app/posts/[id]/page.tsx
export default async function PostDetail({
  params
}: {
  params: Promise<{ id: string }>  // Promiseになる
}) {
  const { id } = await params;  // awaitが必要
  
  return (
    <div>
      <h1>投稿詳細</h1>
      <p>投稿ID: {id}</p>
    </div>
  );
}
```

**アクセスとparamsの関係：**

```
URL: /posts/1
→ params.id = "1"

URL: /posts/123
→ params.id = "123"

URL: /posts/my-first-post
→ params.id = "my-first-post"

URL: /posts/あいう
→ params.id = "あいう"
```

**実際の使用例（Next.js 15以降）：**

```tsx
export default async function PostDetail({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;  // awaitで取得
  
  // IDを使ってデータ取得
  const response = await fetch(`http://localhost:3000/api/posts/${id}`);
  const post = await response.json();
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>投稿者: {post.author}</p>
    </article>
  );
}
```

**動作の流れ：**

```
ユーザーが /posts/123 にアクセス
    ↓
Next.js が [id] フォルダの page.tsx を実行
    ↓
params.id に "123" が入る
    ↓
fetch(`/api/posts/123`) でデータ取得
    ↓
投稿123の内容を表示
```

---

### 複数の動的セグメント

複数のパラメータを組み合わせることもできます。

**src/app/posts/[id]/comments/[commentId]/page.tsx**：

```tsx
export default function CommentDetail({
  params
}: {
  params: {
    id: string;         // 投稿ID
    commentId: string;  // コメントID
  }
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

**URL構造：**

```
src/app/posts/[id]/comments/[commentId]/page.tsx
           └─┬─┘          └────┬────┘
             │                  └─ 2つ目の動的パラメータ
             └─ 1つ目の動的パラメータ

アクセス例:
/posts/1/comments/5
→ params.id = "1"
→ params.commentId = "5"

/posts/123/comments/456
→ params.id = "123"
→ params.commentId = "456"
```

**実際の使用例：**

```tsx
export default async function CommentDetail({
  params
}: {
  params: { id: string; commentId: string }
}) {
  // 両方のIDを使ってデータ取得
  const comment = await fetch(
    `http://localhost:3000/api/posts/${params.id}/comments/${params.commentId}`
  ).then(res => res.json());
  
  return (
    <div>
      <h2>{comment.author}のコメント</h2>
      <p>{comment.text}</p>
      <a href={`/posts/${params.id}`}>投稿に戻る</a>
    </div>
  );
}
```

---

### キャッチオールセグメント

`[...パラメータ名]` で複数のセグメントをまとめて受け取れます。

**src/app/docs/[...slug]/page.tsx**：

```tsx
export default function Docs({
  params
}: {
  params: { slug: string[] }  // 配列で受け取る
}) {
  return (
    <div>
      <h1>ドキュメント</h1>
      <p>パス: {params.slug.join('/')}</p>
      <ul>
        {params.slug.map((segment, index) => (
          <li key={index}>{segment}</li>
        ))}
      </ul>
    </div>
  );
}
```

**マッチするURL：**

```
/docs/guide
→ params.slug = ["guide"]

/docs/guide/getting-started
→ params.slug = ["guide", "getting-started"]

/docs/api/reference/users
→ params.slug = ["api", "reference", "users"]

/docs/a/b/c/d/e/f
→ params.slug = ["a", "b", "c", "d", "e", "f"]

/docs
→ ❌ マッチしない（最低1つ必要）
```

**実際の使用例（ドキュメントサイト）：**

```tsx
const docs = {
  'guide': {
    'getting-started': 'はじめに',
    'installation': 'インストール',
  },
  'api': {
    'users': 'ユーザーAPI',
    'posts': '投稿API',
  },
};

export default function Docs({
  params
}: {
  params: { slug: string[] }
}) {
  // slug 配列からドキュメントを探す
  let content = docs;
  
  for (const segment of params.slug) {
    content = content[segment];
    if (!content) {
      return <div>ドキュメントが見つかりません</div>;
    }
  }
  
  return (
    <article>
      <h1>{content}</h1>
      <p>パス: {params.slug.join(' > ')}</p>
    </article>
  );
}
```

**パンくずリストの作成例：**

```tsx
export default function Docs({
  params
}: {
  params: { slug: string[] }
}) {
  return (
    <div>
      {/* パンくずリスト */}
      <nav>
        <a href="/docs">ドキュメント</a>
        {params.slug.map((segment, index) => {
          const path = `/docs/${params.slug.slice(0, index + 1).join('/')}`;
          return (
            <span key={index}>
              {' > '}
              <a href={path}>{segment}</a>
            </span>
          );
        })}
      </nav>
      
      {/* コンテンツ */}
      <article>
        {/* ... */}
      </article>
    </div>
  );
}
```

---

### オプショナルキャッチオール

`[[...パラメータ名]]` で0個以上のセグメントを受け取れます。

**src/app/shop/[[...category]]/page.tsx**：

```tsx
export default function Shop({
  params
}: {
  params: { category?: string[] }  // オプショナル（なくてもOK）
}) {
  // category がない場合は全商品
  if (!params.category || params.category.length === 0) {
    return <div>全商品</div>;
  }
  
  return (
    <div>
      <h1>カテゴリ: {params.category.join(' > ')}</h1>
    </div>
  );
}
```

**マッチするURL：**

```
/shop
→ params.category = undefined（または []）
→ 「全商品」を表示

/shop/electronics
→ params.category = ["electronics"]

/shop/electronics/phones
→ params.category = ["electronics", "phones"]

/shop/electronics/phones/iphone
→ params.category = ["electronics", "phones", "iphone"]
```

**実際の使用例（ショップ）：**

```tsx
const categories = {
  electronics: {
    name: '家電',
    subcategories: {
      phones: { name: 'スマートフォン' },
      laptops: { name: 'ノートPC' },
    }
  },
  clothing: {
    name: '衣類',
    subcategories: {
      shirts: { name: 'シャツ' },
      pants: { name: 'パンツ' },
    }
  },
};

export default function Shop({
  params
}: {
  params: { category?: string[] }
}) {
  // カテゴリがない場合
  if (!params.category || params.category.length === 0) {
    return (
      <div>
        <h1>全商品</h1>
        <div>
          {Object.entries(categories).map(([key, cat]) => (
            <a key={key} href={`/shop/${key}`}>
              {cat.name}
            </a>
          ))}
        </div>
      </div>
    );
  }
  
  // カテゴリを辿る
  let current = categories;
  for (const segment of params.category) {
    if (current[segment]) {
      current = current[segment];
    } else {
      return <div>カテゴリが見つかりません</div>;
    }
  }
  
  return (
    <div>
      <h1>{current.name}</h1>
      {/* サブカテゴリまたは商品を表示 */}
    </div>
  );
}
```

---

### 動的ルートの比較

| 種類 | フォルダ名 | マッチ | params の型 | 用途 |
|------|-----------|--------|-------------|------|
| **通常** | `posts` | `/posts` のみ | - | 固定パス |
| **動的** | `[id]` | `/posts/123` | `{ id: string }` | ID1つで特定 |
| **キャッチオール** | `[...slug]` | `/docs/a/b/c` | `{ slug: string[] }` | 階層構造 |
| **オプショナル** | `[[...slug]]` | `/shop` も `/shop/a/b` も | `{ slug?: string[] }` | 任意の階層 |

**どれを使う？**

```
[id] を使う:
- ブログ記事: /posts/123
- ユーザーページ: /users/john
- 商品詳細: /products/abc
→ 1つのIDで特定できる

[...slug] を使う:
- ドキュメント: /docs/guide/getting-started
- ファイルブラウザ: /files/2024/photos/vacation.jpg
→ 必ず階層がある

[[...slug]] を使う:
- ショップ: /shop（全商品）と /shop/electronics（カテゴリ）
- 検索: /search（全体）と /search/posts/recent（絞り込み）
→ あってもなくても良い階層
```

---

### データ取得パターン

**パターン1：単純なID取得**

```tsx
export default async function PostDetail({
  params
}: {
  params: { id: string }
}) {
  // APIからデータ取得
  const post = await fetch(`/api/posts/${params.id}`)
    .then(res => res.json());
  
  return <div>{post.title}</div>;
}
```

**パターン2：データベースから直接取得**

```tsx
import { prisma } from '@/lib/prisma';

export default async function PostDetail({
  params
}: {
  params: { id: string }
}) {
  // サーバーコンポーネントなのでDBに直接アクセス可能
  const post = await prisma.post.findUnique({
    where: { id: parseInt(params.id) }
  });
  
  if (!post) {
    notFound();  // 404ページに飛ばす
  }
  
  return <div>{post.title}</div>;
}
```

**パターン3：複数のデータを並列取得**

```tsx
export default async function PostDetail({
  params
}: {
  params: { id: string }
}) {
  // Promise.all で並列取得（速い！）
  const [post, comments, author] = await Promise.all([
    fetch(`/api/posts/${params.id}`).then(r => r.json()),
    fetch(`/api/posts/${params.id}/comments`).then(r => r.json()),
    fetch(`/api/users/${params.authorId}`).then(r => r.json()),
  ]);
  
  return (
    <div>
      <h1>{post.title}</h1>
      <p>著者: {author.name}</p>
      <div>
        {comments.map(c => <div key={c.id}>{c.text}</div>)}
      </div>
    </div>
  );
}
```

---

### 初心者への補足

> 💡 **動的ルートの重要ポイント**
> 
> **1. 基本形 `[id]`**
> ```
> フォルダ: [id]
> URL: /posts/123
> params: { id: "123" }
> 用途: ID1つで特定するページ
> ```
> 
> **2. キャッチオール `[...slug]`**
> ```
> フォルダ: [...slug]
> URL: /docs/a/b/c
> params: { slug: ["a", "b", "c"] }
> 用途: 階層構造のページ
> ```
> 
> **3. オプショナル `[[...slug]]`**
> ```
> フォルダ: [[...slug]]
> URL: /shop または /shop/a/b
> params: { slug: undefined } または { slug: ["a", "b"] }
> 用途: あってもなくても良い階層
> ```
> 
> **よくある間違い：**
> ```
> ❌ [id].tsx            → フォルダの中に page.tsx を作る
> ✅ [id]/page.tsx
> 
> ❌ params.slug[0]     → undefined チェックなし
> ✅ params.slug?.[0]   → セーフアクセス
> 
> ❌ [id] と [...id]    → 同じフォルダには置けない
> ```
> 
> **デバッグのコツ：**
> ```tsx
> export default function Page({ params }) {
>   console.log('params:', params);  // paramsの中身を確認
>   return <div>{JSON.stringify(params)}</div>;
> }
> ```
> 
> **params は常に文字列：**
> ```tsx
> // ❌ 数値と勘違い
> const id = params.id;
> const nextId = id + 1;  // "1231" になる！
> 
> // ✅ 数値に変換
> const id = parseInt(params.id);
> const nextId = id + 1;  // 124 になる
> ```

---

### APIルートの構造

```
src/app/api/
├── posts/
│   ├── route.ts              # GET,POST /api/posts
│   └── [id]/
│       ├── route.ts          # GET,PUT,DELETE /api/posts/[id]
│       └── comments/
│           └── route.ts      # GET,POST /api/posts/[id]/comments
└── auth/
    └── login/
        └── route.ts          # POST /api/auth/login
```

**ルール：**
- フォルダに `route.ts` でAPIエンドポイント
- `page.tsx` と `route.ts` は同じフォルダに置けない

```
❌ 同じフォルダに両方置けない
src/app/posts/
├── page.tsx     # /posts のページ
└── route.ts     # /posts のAPI
→ エラー！

✅ 別フォルダに分ける
src/app/
├── posts/
│   └── page.tsx      # /posts のページ
└── api/
    └── posts/
        └── route.ts  # /api/posts のAPI
```

---

### 実際のプロジェクト構造例

**本プロジェクト（BOLD軽音サークル）：**

```
src/app/
├── layout.tsx                # ルートレイアウト
├── page.tsx                  # / トップページ
│
├── (auth)/                   # 認証関連（グルーピング）
│   ├── login/
│   │   └── page.tsx          # /login
│   └── register/
│       └── page.tsx          # /register
│
├── dashboard/
│   ├── layout.tsx            # ダッシュボード用レイアウト
│   └── page.tsx              # /dashboard
│
├── posts/
│   ├── page.tsx              # /posts 投稿一覧
│   ├── new/
│   │   └── page.tsx          # /posts/new 新規投稿
│   └── [id]/
│       ├── page.tsx          # /posts/123 投稿詳細
│       └── edit/
│           └── page.tsx      # /posts/123/edit 編集
│
├── events/
│   ├── page.tsx              # /events イベント一覧
│   └── [id]/
│       └── page.tsx          # /events/123 イベント詳細
│
└── api/
    ├── posts/
    │   ├── route.ts          # GET,POST /api/posts
    │   └── [id]/
    │       └── route.ts      # GET,PUT,DELETE /api/posts/[id]
    └── auth/
        └── [...nextauth]/
            └── route.ts      # NextAuth エンドポイント
```

---

### ルートグループ（Route Groups）

`(フォルダ名)` でグループ化できます（URLには含まれない）。

```
src/app/
├── (marketing)/              # グループ名（URLに含まれない）
│   ├── layout.tsx            # マーケティング用レイアウト
│   ├── page.tsx              # / トップページ
│   └── about/
│       └── page.tsx          # /about
│
└── (app)/                    # グループ名（URLに含まれない）
    ├── layout.tsx            # アプリ用レイアウト
    ├── dashboard/
    │   └── page.tsx          # /dashboard
    └── settings/
        └── page.tsx          # /settings

結果:
/ → (marketing) のレイアウト
/about → (marketing) のレイアウト
/dashboard → (app) のレイアウト
/settings → (app) のレイアウト
```

**用途：**
- レイアウトを分ける
- コードを整理する
- 認証状態で分ける（ログイン前/後）

---

### 初心者への補足

> 💡 **App Routerの重要ポイント**
> 
> **1. ファイル名のルール：**
> ```
> page.tsx     → ページ（必須）
> layout.tsx   → レイアウト
> loading.tsx  → ローディング画面
> error.tsx    → エラー画面
> route.ts     → APIルート
> ```
> 
> **2. フォルダ名のルール：**
> ```
> posts/       → /posts（通常）
> [id]/        → /123（動的）
> [...slug]/   → /a/b/c（キャッチオール）
> (group)/     → URLに含まれない（グルーピング）
> ```
> 
> **3. URLの決まり方：**
> ```
> src/app/posts/[id]/page.tsx
>         └─┬──┘ └┬┘
>           │     └─ page.tsx が必要
>           └─ これがURL: /posts/123
> ```
> 
> **4. よくある間違い：**
> ```
> ❌ src/app/posts.tsx
>    → フォルダの中に page.tsx を作る
> 
> ✅ src/app/posts/page.tsx
> 
> ❌ src/app/[id].tsx
>    → 動的ルートもフォルダ
> 
> ✅ src/app/[id]/page.tsx
> ```
> 
> **覚え方：**
> - フォルダ構造 = URL構造
> - ページには必ず `page.tsx`
> - 動的な部分は `[名前]`

---

## 5.4 ページの作成

### ステップ1：最初のページ

Next.jsでページを作るのは驚くほど簡単です。

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

**これだけで完了！**

```
ファイル作成
    ↓
npm run dev
    ↓
http://localhost:3000/ にアクセス
    ↓
ページが表示される ✅
```

**なぜ動くのか？**

```
src/app/page.tsx
        └─┬─┘
          └─ app フォルダの直下
             → ルート（/）になる

Next.js が自動的に:
1. ルーティング設定
2. HTMLの生成
3. JavaScriptのバンドル
4. 開発サーバーの起動
```

---

### ステップ2：別のページを作る

**src/app/about/page.tsx**（概要ページ）：

```tsx
export default function About() {
  return (
    <div>
      <h1>このサイトについて</h1>
      <p>BOLD軽音サークルのメンバー専用サイトです。</p>
      <p>活動報告や活動スケジュールができます。</p>
    </div>
  );
}
```

**URL構造：**

```
src/app/
├── page.tsx         → /（トップ）
└── about/
    └── page.tsx     → /about

フォルダ名 = URL
```

**アクセス方法：**

```
http://localhost:3000/about
                      └─┬─┘
                        └─ フォルダ名
```

---

### ステップ3：ネストしたページ

**src/app/posts/new/page.tsx**（新規投稿ページ）：

```tsx
export default function NewPost() {
  return (
    <div>
      <h1>新規投稿</h1>
      <form>
        <div>
          <label htmlFor="title">タイトル</label>
          <input
            id="title"
            type="text"
            placeholder="タイトルを入力"
          />
        </div>
        
        <div>
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            placeholder="内容を入力"
            rows={10}
          />
        </div>
        
        <button type="submit">投稿</button>
      </form>
    </div>
  );
}
```

**URL構造：**

```
src/app/
└── posts/           → /posts（page.tsx がないのでアクセス不可）
    └── new/
        └── page.tsx → /posts/new ✅

アクセス: http://localhost:3000/posts/new
```

**深い階層も同じ：**

```
src/app/
└── dashboard/
    └── settings/
        └── profile/
            └── page.tsx → /dashboard/settings/profile
```

---

### ページ作成のルール

**1. ファイル名は必ず `page.tsx`**

```
❌ src/app/about.tsx
✅ src/app/about/page.tsx

❌ src/app/posts/list.tsx
✅ src/app/posts/page.tsx
```

**2. デフォルトエクスポートが必要**

```tsx
// ❌ 名前付きエクスポート
export function Home() {
  return <div>ホーム</div>;
}

// ✅ デフォルトエクスポート
export default function Home() {
  return <div>ホーム</div>;
}
```

**3. 関数名は何でもOK（慣習的にフォルダ名を使う）**

```tsx
// すべて同じ動作
export default function Page() { /* ... */ }
export default function About() { /* ... */ }
export default function MyAboutPage() { /* ... */ }

// 推奨：フォルダ名に合わせる
// src/app/about/page.tsx
export default function About() { /* ... */ }
```

---

### 複数ページの例

**完全な構造：**

```
src/app/
├── page.tsx                    # / トップページ
├── about/
│   └── page.tsx                # /about
├── contact/
│   └── page.tsx                # /contact
├── posts/
│   ├── page.tsx                # /posts 一覧
│   ├── new/
│   │   └── page.tsx            # /posts/new 新規作成
│   └── [id]/
│       ├── page.tsx            # /posts/123 詳細
│       └── edit/
│           └── page.tsx        # /posts/123/edit 編集
└── dashboard/
    ├── page.tsx                # /dashboard
    ├── analytics/
    │   └── page.tsx            # /dashboard/analytics
    └── settings/
        ├── page.tsx            # /dashboard/settings
        └── profile/
            └── page.tsx        # /dashboard/settings/profile
```

---

### 初心者への補足

> 💡 **ページ作成の3ステップ**
> 
> **1. フォルダを作る**
> ```bash
> mkdir -p src/app/about
> ```
> 
> **2. page.tsx を作る**
> ```tsx
> // src/app/about/page.tsx
> export default function About() {
>   return <div>概要ページ</div>;
> }
> ```
> 
> **3. アクセスする**
> ```
> http://localhost:3000/about
> ```
> 
> **よくある質問：**
> 
> **Q: ファイル名を変えられる？**
> A: いいえ。必ず `page.tsx` です。
> 
> **Q: フォルダがないとダメ？**
> A: はい。`src/app/about.tsx` ではなく `src/app/about/page.tsx` です。
> 
> **Q: 複数のページを同じフォルダに？**
> A: いいえ。1フォルダ = 1ページ（1つの page.tsx）です。
> 
> **Q: ページが表示されない**
> A: チェック項目：
> - ファイル名は `page.tsx`？
> - デフォルトエクスポート？
> - 開発サーバーは起動中？
> - URLは正しい？

---

## 5.5 レイアウト

レイアウトを使うと、複数のページで共通のUIを再利用できます。

### レイアウトとは？

**問題：すべてのページでヘッダーとフッターを表示したい**

```
従来の方法（悪い例）:

src/app/page.tsx:
<Header />
<div>トップページの内容</div>
<Footer />

src/app/about/page.tsx:
<Header />            ← 重複！
<div>概要ページの内容</div>
<Footer />            ← 重複！

src/app/posts/page.tsx:
<Header />            ← 重複！
<div>投稿一覧の内容</div>
<Footer />            ← 重複！

問題点:
❌ すべてのページで同じコードを書く
❌ ヘッダーを変更したら全ページ修正
❌ メンテナンス不可能
```

**レイアウトを使う（良い例）：**

```
src/app/layout.tsx:
<Header />
{children}  ← ここに各ページの内容
<Footer />

すべてのページで自動的に:
<Header />
<ページの内容 />
<Footer />

メリット:
✅ 1か所で共通UIを管理
✅ ヘッダー変更は1ファイルだけ
✅ メンテナンスが簡単
```

---

### ルートレイアウト（必須）

**src/app/layout.tsx**は**必須**で、すべてのページで使われます。

```tsx
// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'BOLD軽音サークル',
  description: 'メンバー専用サイト',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;  // 各ページの内容
}) {
  return (
    <html lang="ja">
      <body>
        {/* すべてのページで表示されるヘッダー */}
        <header className="header">
          <nav>
            <a href="/">ホーム</a>
            <a href="/posts">投稿</a>
            <a href="/events">イベント</a>
          </nav>
        </header>
        
        {/* ここに各ページの内容が入る */}
        <main className="main">{children}</main>
        
        {/* すべてのページで表示されるフッター */}
        <footer className="footer">
          <p>&copy; 2025 BOLD軽音</p>
        </footer>
      </body>
    </html>
  );
}
```

**レンダリングの流れ：**

```
ユーザーが /posts にアクセス
    ↓
Next.js が RootLayout を実行
    ↓
children に PostsPage の内容を渡す
    ↓
最終的なHTML:
<html>
  <body>
    <header>...</header>          ← RootLayout から
    <main>
      <div>投稿一覧</div>         ← PostsPage から
    </main>
    <footer>...</footer>          ← RootLayout から
  </body>
</html>
```

---

### ルートレイアウトのルール

**1. 必ず `<html>` と `<body>` を含む**

```tsx
// ✅ 正しい
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

// ❌ 間違い（html/body がない）
export default function RootLayout({ children }) {
  return <div>{children}</div>;
}
```

**2. `children` を必ず表示する**

```tsx
// ✅ 正しい
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header>ヘッダー</header>
        {children}  ← これがないとページが表示されない
        <footer>フッター</footer>
      </body>
    </html>
  );
}

// ❌ 間違い（children を表示していない）
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header>ヘッダー</header>
        {/* children がない！ */}
        <footer>フッター</footer>
      </body>
    </html>
  );
}
```

---

### ネストしたレイアウト

特定のセクションだけに適用されるレイアウトも作れます。

**src/app/posts/layout.tsx**（投稿セクション用）：

```tsx
export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="posts-container">
      {/* 投稿セクション専用のサイドバー */}
      <aside className="sidebar">
        <h2>投稿メニュー</h2>
        <ul>
          <li><a href="/posts">一覧</a></li>
          <li><a href="/posts/new">新規投稿</a></li>
          <li><a href="/posts/drafts">下書き</a></li>
        </ul>
      </aside>
      
      {/* メインコンテンツ */}
      <div className="posts-content">
        {children}
      </div>
    </div>
  );
}
```

**レイアウトの入れ子構造：**

```
URL: /posts/123

実際のレンダリング順序:
1. RootLayout（app/layout.tsx）
   ↓ children に渡す
2. PostsLayout（app/posts/layout.tsx）
   ↓ children に渡す
3. PostDetailPage（app/posts/[id]/page.tsx）

最終的なHTML:
<html lang="ja">                    ← RootLayout
  <body>
    <header>...</header>            ← RootLayout
    <main>
      <div className="posts-container">  ← PostsLayout
        <aside>...</aside>                ← PostsLayout
        <div className="posts-content">  ← PostsLayout
          <article>                       ← PostDetailPage
            <h1>投稿詳細</h1>
          </article>
        </div>
      </div>
    </main>
    <footer>...</footer>            ← RootLayout
  </body>
</html>
```

---

### レイアウトの適用範囲

```
src/app/
├── layout.tsx          ← すべてのページに適用
├── page.tsx            ← / （RootLayout のみ）
├── about/
│   └── page.tsx        ← /about （RootLayout のみ）
├── posts/
│   ├── layout.tsx      ← /posts 以下に適用
│   ├── page.tsx        ← /posts （Root + Posts）
│   └── [id]/
│       └── page.tsx    ← /posts/123 （Root + Posts）
└── dashboard/
    ├── layout.tsx      ← /dashboard 以下に適用
    ├── page.tsx        ← /dashboard （Root + Dashboard）
    └── settings/
        └── page.tsx    ← /dashboard/settings （Root + Dashboard）
```

**適用例：**

```
/ → RootLayout
/about → RootLayout
/posts → RootLayout + PostsLayout
/posts/123 → RootLayout + PostsLayout
/dashboard → RootLayout + DashboardLayout
```

---

### レイアウトでのデータ取得

レイアウトでもデータを取得できます。

```tsx
// src/app/posts/layout.tsx
export default async function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // サイドバーに表示するカテゴリを取得
  const categories = await fetch('http://localhost:3000/api/categories')
    .then(res => res.json());
  
  return (
    <div className="posts-container">
      <aside>
        <h2>カテゴリ</h2>
        <ul>
          {categories.map(cat => (
            <li key={cat.id}>
              <a href={`/posts?category=${cat.slug}`}>
                {cat.name}
              </a>
            </li>
          ))}
        </ul>
      </aside>
      
      <div>{children}</div>
    </div>
  );
}
```

---

### 初心者への補足

> 💡 **レイアウトのポイント**
> 
> **1. レイアウトの基本：**
> ```tsx
> export default function Layout({ children }) {
>   return (
>     <div>
>       <共通部分>
>       {children}  ← ページの内容
>       <共通部分>
>     </div>
>   );
> }
> ```
> 
> **2. 階層構造：**
> ```
> RootLayout（全体）
>   └─ SectionLayout（セクション）
>       └─ Page（ページ）
> ```
> 
> **3. よくある使い方：**
> ```
> RootLayout:
> - ヘッダー・フッター
> - グローバルナビ
> - メタタグ
> 
> SectionLayout:
> - サイドバー
> - セクション固有のナビ
> - パンくずリスト
> ```
> 
> **4. 注意点：**
> ```tsx
> // ❌ RootLayout で <html> を忘れる
> export default function RootLayout({ children }) {
>   return <body>{children}</body>;  // エラー！
> }
> 
> // ✅ RootLayout は html と body が必須
> export default function RootLayout({ children }) {
>   return (
>     <html>
>       <body>{children}</body>
>     </html>
>   );
> }
> 
> // ✅ 他のレイアウトは普通の div でOK
> export default function PostsLayout({ children }) {
>   return <div>{children}</div>;
> }
> ```

---

## 5.6 リンクとナビゲーション

### なぜ Link コンポーネント？

**通常の `<a>` タグの問題：**

```tsx
// ❌ 通常の a タグ
<a href="/posts">投稿一覧</a>

クリックすると:
1. ブラウザがページ全体をリロード
2. JavaScript が再読み込み
3. React が再起動
4. State がすべてリセット
→ 遅い！ユーザー体験が悪い
```

**Link コンポーネントの利点：**

```tsx
// ✅ Link コンポーネント
<Link href="/posts">投稿一覧</Link>

クリックすると:
1. JavaScriptで必要な部分だけ更新
2. State は保持される
3. 高速！
→ まるでシングルページアプリケーション（SPA）
```

**比較：**

```
通常の <a> タグ:
クリック → ページ全体リロード → 3秒
                              ↑ 遅い

Link コンポーネント:
クリック → 必要な部分だけ更新 → 0.3秒
                            ↑ 速い！
```

---

### Link コンポーネントの基本

```tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      {/* 基本的な使い方 */}
      <Link href="/">ホーム</Link>
      <Link href="/about">概要</Link>
      <Link href="/posts">投稿</Link>
      
      {/* 動的ルート */}
      <Link href="/posts/123">投稿123</Link>
      
      {/* 変数を使う */}
      <Link href={`/posts/${postId}`}>投稿詳細</Link>
      
      {/* クエリパラメータ */}
      <Link href="/posts?sort=new&page=1">新着順</Link>
      
      {/* 外部リンク（target="_blank" を追加） */}
      <Link href="https://example.com" target="_blank" rel="noopener">
        外部サイト
      </Link>
    </nav>
  );
}
```

---

### Link の高度な使い方

**1. オブジェクト形式でURLを指定**

```tsx
<Link
  href={{
    pathname: '/posts',
    query: { sort: 'new', page: 1 },
  }}
>
  新着順
</Link>

// 結果: /posts?sort=new&page=1
```

**2. スタイル付き Link**

```tsx
<Link
  href="/posts"
  className="text-blue-500 hover:underline"
>
  投稿一覧
</Link>

// 子要素でスタイル
<Link href="/posts">
  <span className="button">投稿一覧</span>
</Link>
```

**3. アクティブ状態の判定**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();  // 現在のパス
  
  return (
    <nav>
      <Link
        href="/"
        className={pathname === '/' ? 'active' : ''}
      >
        ホーム
      </Link>
      
      <Link
        href="/posts"
        className={pathname.startsWith('/posts') ? 'active' : ''}
      >
        投稿
      </Link>
    </nav>
  );
}
```

---

### useRouter フック

プログラムからページ遷移するには `useRouter` を使います。

> ⚠️ **注意**: `'use client'` が必要！

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    
    const post = await response.json();
    
    // 詳細ページに遷移
    router.push(`/posts/${post.id}`);
  };
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

### useRouter のメソッド

```tsx
'use client';

import { useRouter } from 'next/navigation';

export default function MyComponent() {
  const router = useRouter();
  
  return (
    <div>
      {/* 1. push: 履歴に追加して遷移 */}
      <button onClick={() => router.push('/posts')}>
        投稿一覧へ（戻るボタンで戻れる）
      </button>
      
      {/* 2. replace: 履歴を置き換えて遷移 */}
      <button onClick={() => router.replace('/posts')}>
        投稿一覧へ（戻るボタンで戻れない）
      </button>
      
      {/* 3. back: 前のページに戻る */}
      <button onClick={() => router.back()}>
        戻る
      </button>
      
      {/* 4. forward: 次のページに進む */}
      <button onClick={() => router.forward()}>
        進む
      </button>
      
      {/* 5. refresh: ページを再読み込み */}
      <button onClick={() => router.refresh()}>
        再読み込み
      </button>
      
      {/* 6. prefetch: 事前にページを読み込む */}
      <button onClick={() => router.prefetch('/posts')}>
        投稿ページを先読み
      </button>
    </div>
  );
}
```

**push vs replace の違い：**

```
push('/posts'):
履歴: [/, /about, /posts]
        ↑ 今ここ
「戻る」ボタン → /about に戻る

replace('/posts'):
履歴: [/, /posts]
          ↑ 今ここ（/about は消えた）
「戻る」ボタン → / に戻る
```

**使い分け：**

```
push を使う:
- 通常のページ遷移
- ユーザーが戻りたい場合

replace を使う:
- ログイン後のリダイレクト
- フォーム送信後
- 戻られたくないページ
```

---

### プログラム的な遷移の例

**例1：フォーム送信後に遷移**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PostForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.get('title'),
          content: formData.get('content'),
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const post = await response.json();
      
      // 成功したら詳細ページへ
      router.push(`/posts/${post.id}`);
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit" disabled={loading}>
        {loading ? '送信中...' : '投稿'}
      </button>
    </form>
  );
}
```

**例2：認証チェック後にリダイレクト**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 認証チェック
    const checkAuth = async () => {
      const response = await fetch('/api/auth/check');
      const { isAuthenticated } = await response.json();
      
      if (!isAuthenticated) {
        // 未認証ならログインページへ
        router.replace('/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  return <div>保護されたページ</div>;
}
```

**例3：タイマー後に遷移**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/');  // 0になったらトップへ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);
  
  return (
    <div>
      <h1>ありがとうございました</h1>
      <p>{countdown}秒後にトップページに戻ります</p>
    </div>
  );
}
```

---

### 初心者への補足

> 💡 **リンクとナビゲーションのポイント**
> 
> **1. Link vs a タグ：**
> ```tsx
> // ❌ 遅い（ページ全体リロード）
> <a href="/posts">投稿</a>
> 
> // ✅ 速い（必要な部分だけ更新）
> <Link href="/posts">投稿</Link>
> 
> // ✅ 外部リンクは a タグでOK
> <a href="https://example.com" target="_blank">外部</a>
> ```
> 
> **2. useRouter の使い分け：**
> ```tsx
> // 通常の遷移（戻れる）
> router.push('/posts');
> 
> // 戻られたくない遷移
> router.replace('/posts');
> 
> // 前のページに戻る
> router.back();
> ```
> 
> **3. よくある質問：**
> 
> **Q: Link の中に div や button を入れられる？**
> A: はい、できます。
> ```tsx
> <Link href="/posts">
>   <div className="card">
>     <h2>投稿一覧</h2>
>   </div>
> </Link>
> ```
> 
> **Q: Link をクリックしても遷移しない**
> A: チェック項目：
> - href は正しい？
> - onClick で e.preventDefault() してない？
> - Link が正しくimportされてる？
> 
> **Q: useRouter が動かない**
> A: `'use client'` を追加してください。
> ```tsx
> 'use client';  // ← これが必要
> 
> import { useRouter } from 'next/navigation';
> ```
> 
> **覚えておくこと：**
> - 内部リンク → `<Link>`
> - 外部リンク → `<a>`
> - プログラムから遷移 → `useRouter`

---

## 5.7 サーバーコンポーネントとクライアントコンポーネント

Next.js App Router の最大の特徴が**サーバーコンポーネント**です。

### なぜサーバーコンポーネント？

**従来の React（CSR）の問題：**

```
ユーザーがページにアクセス
    ↓
1. 空のHTMLを受信（<div id="root"></div>）
2. JavaScript（React）をダウンロード（数MB）
3. JavaScript を実行
4. API でデータ取得
5. 画面をレンダリング
    ↓
初回表示まで 3-5秒 😢

問題点:
❌ 初回表示が遅い
❌ JavaScript が大きい
❌ SEO に弱い
❌ データ取得で追加の待ち時間
```

**Next.js のサーバーコンポーネント：**

```
ユーザーがページにアクセス
    ↓
1. サーバーでデータ取得
2. サーバーでHTMLを生成
3. 完成したHTMLを送信
    ↓
初回表示まで 0.5秒 🚀

メリット:
✅ 初回表示が高速
✅ JavaScript が小さい
✅ SEO に強い
✅ データベース直接アクセス可能
```

---

### サーバーコンポーネント（デフォルト）

**App Router では、すべてのコンポーネントがデフォルトでサーバーコンポーネント**です。

```tsx
// src/app/posts/page.tsx
// 何も書かなければサーバーコンポーネント

export default async function PostsList() {
  // サーバーで実行される
  console.log('サーバーで実行');  // ← ターミナルに表示される
  
  // データベースに直接アクセス可能
  const posts = await fetch('http://localhost:3000/api/posts')
    .then(res => res.json());
  
  return (
    <div>
      <h1>投稿一覧</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

**実行フロー：**

```
ユーザーが /posts にアクセス
    ↓
Next.js サーバーが PostsList を実行
    ↓
fetch でデータ取得（サーバー内部で完結）
    ↓
HTML を生成
    ↓
<div>
  <h1>投稿一覧</h1>
  <ul>
    <li>投稿1</li>
    <li>投稿2</li>
  </ul>
</div>
    ↓
ユーザーに送信
```

---

### サーバーコンポーネントの特徴

**✅ できること：**

```tsx
// 1. async/await が使える
export default async function MyComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// 2. データベースに直接アクセス
import { prisma } from '@/lib/prisma';

export default async function Users() {
  const users = await prisma.user.findMany();
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// 3. サーバー環境の変数にアクセス
export default function Config() {
  const apiKey = process.env.SECRET_API_KEY;  // ← クライアントに送られない
  console.log('Secret:', apiKey);  // ← ターミナルに表示
  return <div>設定ページ</div>;
}

// 4. 大きなライブラリを使っても JavaScript が増えない
import { huge-library } from 'huge-library';  // ← クライアントに送られない

export default async function HeavyComponent() {
  const result = hugeLibrary.doSomething();
  return <div>{result}</div>;
}
```

**❌ できないこと：**

```tsx
// ❌ useState、useEffect などのフックは使えない
export default function BadComponent() {
  const [count, setCount] = useState(0);  // エラー！
  return <div>{count}</div>;
}

// ❌ onClick などのイベントハンドラは使えない
export default function BadComponent() {
  return (
    <button onClick={() => alert('クリック')}>  {/* エラー！ */}
      ボタン
    </button>
  );
}

// ❌ ブラウザAPIは使えない
export default function BadComponent() {
  const width = window.innerWidth;  // エラー！window は存在しない
  return <div>幅: {width}</div>;
}

// ❌ useRouter、usePathname などのナビゲーションフックは使えない
export default function BadComponent() {
  const router = useRouter();  // エラー！
  return <div>ページ</div>;
}
```

---

### クライアントコンポーネント

**`'use client'` を書くとクライアントコンポーネント**になります。

```tsx
'use client';  // ← この1行を追加

import { useState } from 'react';

export default function Counter() {
  // useState が使える
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>カウント: {count}</p>
      {/* onClick が使える */}
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}
```

**実行フロー：**

```
ユーザーが ページにアクセス
    ↓
Next.js サーバーが初回 HTML を生成
    ↓
<div>
  <p>カウント: 0</p>
  <button>+1</button>
</div>
    ↓
HTML + JavaScript をユーザーに送信
    ↓
ブラウザで JavaScript が実行される
    ↓
ボタンクリック → count が変更される
```

---

### クライアントコンポーネントの特徴

**✅ できること：**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function InteractiveComponent() {
  // 1. useState、useEffect などのフック
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('ブラウザで実行');  // ← ブラウザのコンソールに表示
  }, []);
  
  // 2. Next.js のナビゲーションフック
  const router = useRouter();
  const pathname = usePathname();
  
  // 3. イベントハンドラ
  const handleClick = () => {
    setCount(count + 1);
    router.push('/other');
  };
  
  // 4. ブラウザAPI
  const width = window.innerWidth;
  
  return (
    <div>
      <p>カウント: {count}</p>
      <p>パス: {pathname}</p>
      <p>画面幅: {width}px</p>
      <button onClick={handleClick}>クリック</button>
    </div>
  );
}
```

**❌ できないこと（サーバーコンポーネントと比較）：**

```tsx
'use client';

// ❌ async コンポーネントにできない
export default async function BadComponent() {  // エラー！
  const data = await fetchData();
  return <div>{data}</div>;
}

// ❌ サーバー環境変数に直接アクセスできない
export default function BadComponent() {
  const secret = process.env.SECRET_API_KEY;  // undefined
  return <div>{secret}</div>;
}

// ❌ データベースに直接アクセスできない
import { prisma } from '@/lib/prisma';

export default function BadComponent() {
  const users = await prisma.user.findMany();  // エラー！
  return <div>{users.length}</div>;
}
```

---

### サーバー vs クライアント 比較表

| 特徴 | サーバーコンポーネント | クライアントコンポーネント |
|------|------------------------|----------------------------|
| **宣言方法** | なし（デフォルト） | `'use client'` |
| **実行場所** | サーバー | ブラウザ |
| **async/await** | ✅ 可能 | ❌ 不可 |
| **useState, useEffect** | ❌ 不可 | ✅ 可能 |
| **onClick などのイベント** | ❌ 不可 | ✅ 可能 |
| **useRouter, usePathname** | ❌ 不可 | ✅ 可能 |
| **データベース直接アクセス** | ✅ 可能 | ❌ 不可 |
| **サーバー環境変数** | ✅ 可能 | ❌ 不可 |
| **ブラウザAPI** | ❌ 不可 | ✅ 可能 |
| **JavaScript サイズ** | 0（送られない） | 増える |
| **初回表示** | 速い | 遅い |
| **SEO** | 強い | 弱い |

---

### 使い分けガイド

**サーバーコンポーネントを使う場合：**

```
✅ データ取得がメイン
✅ 静的コンテンツ
✅ SEO が重要
✅ データベース直接アクセスしたい
✅ 秘密情報を扱う
✅ JavaScript を減らしたい

例:
- ブログ記事一覧
- 投稿詳細ページ
- ユーザープロフィール
- 商品一覧
- ドキュメント
```

**クライアントコンポーネントを使う場合：**

```
✅ ユーザーのインタラクション
✅ useState、useEffect などのフック
✅ イベントハンドラ（onClick等）
✅ ブラウザAPI（window、localStorage等）
✅ リアルタイム更新

例:
- フォーム
- ボタン
- モーダル
- カウンター
- チャート
- タイマー
```

---

### 混在パターン（推奨）

**パターン1：サーバーコンポーネント内にクライアントコンポーネント**

```tsx
// src/app/posts/page.tsx（サーバーコンポーネント）
import LikeButton from '@/components/LikeButton';

export default async function PostsList() {
  // サーバーでデータ取得
  const posts = await fetch('http://localhost:3000/api/posts')
    .then(res => res.json());
  
  return (
    <div>
      <h1>投稿一覧</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          {/* クライアントコンポーネント */}
          <LikeButton postId={post.id} initialLikes={post.likes} />
        </article>
      ))}
    </div>
  );
}
```

```tsx
// src/components/LikeButton.tsx（クライアントコンポーネント）
'use client';

import { useState } from 'react';

export default function LikeButton({
  postId,
  initialLikes,
}: {
  postId: number;
  initialLikes: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  
  const handleLike = async () => {
    if (liked) return;
    
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
    
    if (response.ok) {
      setLikes(likes + 1);
      setLiked(true);
    }
  };
  
  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={liked ? 'text-red-500' : ''}
    >
      {liked ? '♥' : '♡'} {likes}
    </button>
  );
}
```

**レンダリングフロー：**

```
ユーザーが /posts にアクセス
    ↓
[サーバー]
PostsList が実行
    ↓
fetch でデータ取得
posts = [
  { id: 1, title: '投稿1', content: '...', likes: 10 },
  { id: 2, title: '投稿2', content: '...', likes: 5 },
]
    ↓
HTML を生成
<div>
  <h1>投稿一覧</h1>
  <article>
    <h2>投稿1</h2>
    <p>...</p>
    <button>♡ 10</button>
  </article>
  ...
</div>
    ↓
HTML + LikeButton の JavaScript を送信
    ↓
[ブラウザ]
HTML が表示される（即座に）
    ↓
JavaScript が読み込まれる
    ↓
LikeButton がインタラクティブになる
    ↓
ユーザーがボタンをクリック
    ↓
handleLike が実行
```

---

### パターン2：サーバーコンポーネントをクライアントに渡す

```tsx
// src/app/posts/[id]/page.tsx（サーバーコンポーネント）
import PostContent from '@/components/PostContent';
import InteractiveWrapper from '@/components/InteractiveWrapper';

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  // サーバーでデータ取得
  const post = await fetch(`http://localhost:3000/api/posts/${params.id}`)
    .then(res => res.json());
  
  return (
    <InteractiveWrapper>
      {/* サーバーコンポーネントを children として渡す */}
      <PostContent post={post} />
    </InteractiveWrapper>
  );
}
```

```tsx
// src/components/PostContent.tsx（サーバーコンポーネント）
export default function PostContent({ post }: { post: any }) {
  // サーバーコンポーネントなので async にもできる
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>投稿者: {post.author.name}</p>
    </article>
  );
}
```

```tsx
// src/components/InteractiveWrapper.tsx（クライアントコンポーネント）
'use client';

import { useState } from 'react';

export default function InteractiveWrapper({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(16);
  
  return (
    <div>
      <div>
        <button onClick={() => setFontSize(fontSize - 2)}>A-</button>
        <button onClick={() => setFontSize(fontSize + 2)}>A+</button>
      </div>
      
      <div style={{ fontSize: `${fontSize}px` }}>
        {children}  {/* ← サーバーコンポーネントを表示 */}
      </div>
    </div>
  );
}
```

**メリット：**

```
✅ PostContent はサーバーコンポーネントのまま
   → データベース直接アクセス可能
   → JavaScript が増えない

✅ InteractiveWrapper だけクライアントコンポーネント
   → 必要最小限の JavaScript

✅ 最適なパフォーマンス
```

---

### よくある間違い

**❌ 間違い1：サーバーコンポーネントで useState**

```tsx
// ❌ エラー！
export default function BadComponent() {
  const [count, setCount] = useState(0);  // 'use client' がない
  return <div>{count}</div>;
}

// ✅ 修正
'use client';  // ← 追加

export default function GoodComponent() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

**❌ 間違い2：クライアントコンポーネントで async**

```tsx
// ❌ エラー！
'use client';

export default async function BadComponent() {  // async は使えない
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ 修正1：サーバーコンポーネントにする
export default async function GoodComponent() {  // 'use client' を削除
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ 修正2：useEffect で取得
'use client';

import { useState, useEffect } from 'react';

export default function GoodComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  if (!data) return <div>読み込み中...</div>;
  return <div>{data}</div>;
}
```

**❌ 間違い3：クライアントコンポーネントから直接サーバーコンポーネントをimport**

```tsx
// ❌ エラー！
'use client';

import ServerComponent from './ServerComponent';  // サーバーコンポーネント

export default function BadComponent() {
  return (
    <div>
      <ServerComponent />  {/* これは動かない */}
    </div>
  );
}

// ✅ 修正：children として渡す
// Parent.tsx（サーバーコンポーネント）
import ServerComponent from './ServerComponent';
import ClientWrapper from './ClientWrapper';

export default function Parent() {
  return (
    <ClientWrapper>
      <ServerComponent />  {/* children として渡す */}
    </ClientWrapper>
  );
}

// ClientWrapper.tsx
'use client';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <div className="wrapper">{children}</div>;
}
```

---

### 実践例：ブログ投稿ページ

```tsx
// src/app/posts/[id]/page.tsx（サーバーコンポーネント）
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import LikeButton from '@/components/LikeButton';

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  // サーバーでデータ取得
  const [post, comments] = await Promise.all([
    fetch(`http://localhost:3000/api/posts/${params.id}`).then(res => res.json()),
    fetch(`http://localhost:3000/api/posts/${params.id}/comments`).then(res => res.json()),
  ]);
  
  return (
    <div>
      {/* サーバーコンポーネント部分 */}
      <article>
        <h1>{post.title}</h1>
        <p>投稿者: {post.author.name}</p>
        <p>投稿日: {new Date(post.createdAt).toLocaleDateString()}</p>
        <div>{post.content}</div>
      </article>
      
      {/* クライアントコンポーネント */}
      <LikeButton postId={post.id} initialLikes={post.likes} />
      
      {/* サーバーコンポーネント */}
      <h2>コメント（{comments.length}件）</h2>
      <CommentList comments={comments} />
      
      {/* クライアントコンポーネント */}
      <CommentForm postId={post.id} />
    </div>
  );
}
```

---

### 初心者への補足

> 💡 **サーバー vs クライアントコンポーネント**
> 
> **基本的な考え方：**
> ```
> デフォルト = サーバーコンポーネント
> 
> インタラクション必要 → 'use client' を追加
> ```
> 
> **判断フローチャート：**
> ```
> useState、useEffect が必要？
>   YES → 'use client'
>   NO ↓
> 
> onClick などのイベントが必要？
>   YES → 'use client'
>   NO ↓
> 
> ブラウザAPI（window等）が必要？
>   YES → 'use client'
>   NO ↓
> 
> データ取得だけ？
>   YES → サーバーコンポーネント
> ```
> 
> **よくある質問：**
> 
> **Q: どちらを使うか迷ったら？**
> A: **サーバーコンポーネント（デフォルト）** を使う。
>    必要になったら `'use client'` を追加。
> 
> **Q: 'use client' を書き忘れたら？**
> A: エラーメッセージが出ます。
> ```
> Error: useState can only be used in Client Components.
> Add 'use client' to the top of the file.
> ```
> → ファイルの先頭に `'use client'` を追加すればOK。
> 
> **Q: すべてのコンポーネントを 'use client' にしてもいい？**
> A: 動きますが、**非推奨**。
> - JavaScript が大きくなる
> - 初回表示が遅くなる
> - サーバーの利点を失う
> 
> **Q: サーバーコンポーネントで console.log() するとどこに表示？**
> A: **ターミナル**（サーバー側）に表示されます。
> 
> **Q: クライアントコンポーネントで console.log() するとどこに表示？**
> A: **ブラウザのコンソール**に表示されます。
> 
> **ベストプラクティス：**
> ```tsx
> // ✅ 推奨：サーバーコンポーネントがメイン
> export default async function Page() {
>   const data = await fetchData();  // サーバーで取得
>   
>   return (
>     <div>
>       <StaticContent data={data} />
>       <InteractiveButton />  {/* 必要な部分だけクライアント */}
>     </div>
>   );
> }
> 
> // ❌ 非推奨：すべてクライアント
> 'use client';
> 
> export default function Page() {
>   const [data, setData] = useState(null);
>   
>   useEffect(() => {
>     fetchData().then(setData);  // クライアントで取得
>   }, []);
>   
>   // ...
> }
> ```

---

## 5.8 データ取得

### サーバーコンポーネントでのデータ取得（推奨）

**基本的なパターン：**

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

**実行フロー：**

```
ユーザーが /posts/123 にアクセス
    ↓
[サーバー]
PostDetail コンポーネントを実行
    ↓
fetch でデータ取得
    ↓
post = {
  id: 123,
  title: '投稿タイトル',
  content: '投稿内容',
  author: { name: '山田太郎' }
}
    ↓
HTML を生成
<article>
  <h1>投稿タイトル</h1>
  <p>投稿内容</p>
  <p>投稿者: 山田太郎</p>
</article>
    ↓
[ブラウザ]
HTML を即座に表示
```

**メリット：**

```
✅ 初回表示が速い（サーバーで完成したHTMLを送信）
✅ SEO に強い（クローラーが内容を読める）
✅ Loading 状態を管理不要
✅ データベースに直接アクセス可能
```

---

### 複数のデータを並列取得

```tsx
export default async function PostDetail({ params }: { params: { id: string } }) {
  // ❌ 遅い（直列実行）
  const post = await fetch(`/api/posts/${params.id}`).then(r => r.json());
  const comments = await fetch(`/api/posts/${params.id}/comments`).then(r => r.json());
  const likes = await fetch(`/api/posts/${params.id}/likes`).then(r => r.json());
  
  // 合計時間 = fetch1 + fetch2 + fetch3
  
  // ✅ 速い（並列実行）
  const [post, comments, likes] = await Promise.all([
    fetch(`/api/posts/${params.id}`).then(r => r.json()),
    fetch(`/api/posts/${params.id}/comments`).then(r => r.json()),
    fetch(`/api/posts/${params.id}/likes`).then(r => r.json()),
  ]);
  
  // 合計時間 = max(fetch1, fetch2, fetch3)
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>コメント: {comments.length}件</p>
      <p>いいね: {likes.length}件</p>
    </article>
  );
}
```

**実行時間の比較：**

```
直列実行（await を3回）:
fetch1 (200ms) → fetch2 (200ms) → fetch3 (200ms)
合計: 600ms

並列実行（Promise.all）:
fetch1 (200ms) ┐
fetch2 (200ms) ├→ 同時実行
fetch3 (200ms) ┘
合計: 200ms

⚡ 3倍速い！
```

---

### キャッシュの制御

Next.js のfetchには**キャッシュ機能**があります。

> **📝 重要な変更（Next.js 15以降）**
> 
> Next.js 15からfetchのデフォルト動作が変更されました：
> - **Next.js 14以前**: デフォルトで無限キャッシュ (`cache: 'force-cache'`)
> - **Next.js 15以降**: デフォルトでキャッシュなし (`cache: 'no-store'`)
> 
> この変更により、**常に最新データを取得**する動作がデフォルトになりました。

**1. デフォルト（Next.js 15以降: キャッシュなし）：**

```tsx
// Next.js 15以降: 毎回サーバーから最新データを取得
const response = await fetch('http://localhost:3000/api/posts');
const posts = await response.json();

// 動作:
// 毎回サーバーから最新データを取得（cache: 'no-store' がデフォルト）
```

**2. キャッシュする（無限キャッシュ）：**

```tsx
const response = await fetch('http://localhost:3000/api/posts', {
  cache: 'force-cache'  // 明示的にキャッシュ
});
const posts = await response.json();

// 動作:
// 1回目: サーバーから取得 → キャッシュに保存
// 2回目以降: キャッシュから返す（サーバーにリクエストしない）

// 使う場面:
// - 静的コンテンツ（ほとんど更新されない）
// - ビルド時のデータ
```

**3. 時間指定で再検証（ISR）：**

```tsx
const response = await fetch('http://localhost:3000/api/posts', {
  next: { revalidate: 60 }  // 60秒ごとに再検証
});
const posts = await response.json();

// 動作:
// 0秒: fetch → キャッシュに保存
// 0-60秒: キャッシュから返す
// 60秒: 次のリクエストで再fetch → キャッシュ更新
// 60-120秒: 新しいキャッシュから返す

// 使う場面:
// - ブログ記事（更新は頻繁でない）
// - 商品一覧（価格変更は時々）
```

**比較表：**

| オプション | 動作 | 使う場面 |
|-----------|------|----------|
| デフォルト (Next.js 15以降) | 毎回fetch | リアルタイムデータ |
| `cache: 'force-cache'` | 無限キャッシュ | 静的コンテンツ |
| `cache: 'no-store'` | 毎回fetch (明示的) | リアルタイムデータ |
| `next: { revalidate: N }` | N秒ごとに更新 | 定期的に変わるデータ |

---

### クライアントコンポーネントでのデータ取得

**基本パターン（useEffect）：**

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch('/api/posts')
      .then(res => {
        if (!res.ok) throw new Error('データ取得に失敗');
        return res.json();
      })
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**実行フロー：**

```
[サーバー]
PostsList の初回 HTML 生成
    ↓
<p>読み込み中...</p>  ← loading = true
    ↓
HTML を送信
    ↓
[ブラウザ]
HTML 表示
    ↓
useEffect 実行
    ↓
fetch('/api/posts')
    ↓
データ取得完了
    ↓
setPosts(data)  ← 再レンダリング
    ↓
<ul>...</ul>  ← 投稿一覧を表示
```

**問題点：**

```
❌ 初回表示が遅い（2段階レンダリング）
❌ Loading 状態の管理が必要
❌ SEO に弱い（初回HTMLに内容がない）

→ サーバーコンポーネントを使うべき
```

---

### サーバー vs クライアント データ取得の比較

**サーバーコンポーネント（推奨）：**

```tsx
// ✅ シンプル
export default async function Posts() {
  const posts = await fetch('/api/posts').then(r => r.json());
  return <ul>{posts.map(...)}</ul>;
}

メリット:
✅ 初回表示が速い
✅ Loading 状態不要
✅ エラー処理がシンプル
✅ SEO に強い
```

**クライアントコンポーネント：**

```tsx
'use client';

import { useState, useEffect } from 'react';

// ❌ 複雑
export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  return <ul>{posts.map(...)}</ul>;
}

デメリット:
❌ Loading 状態の管理
❌ エラー処理が複雑
❌ 初回表示が遅い
```

**いつクライアントでデータ取得？**

```
✅ 使う場面:
- ユーザーの操作後にデータ取得（ボタンクリック等）
- リアルタイム更新（ポーリング）
- フィルター・検索（即座に反応）

例:
- 検索ボックス（入力ごとに検索）
- 無限スクロール（スクロールで追加読み込み）
- チャット（新メッセージをポーリング）
```

---

### エラーハンドリング

**サーバーコンポーネント：**

```tsx
import { notFound } from 'next/navigation';

export default async function PostDetail({ params }: { params: { id: string } }) {
  try {
    const response = await fetch(`/api/posts/${params.id}`);
    
    if (response.status === 404) {
      notFound();  // 404 ページを表示
    }
    
    if (!response.ok) {
      throw new Error('データ取得エラー');
    }
    
    const post = await response.json();
    
    return (
      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    );
  } catch (error) {
    // error.tsx が表示される
    throw error;
  }
}
```

---

### 初心者への補足

> 💡 **データ取得のポイント**
> 
> **基本ルール：**
> ```
> サーバーコンポーネント（デフォルト）を使う
> ↓
> async function で await fetch()
> ↓
> シンプルで速い！
> ```
> 
> **よくある質問：**
> 
> **Q: いつキャッシュをオフにする？**
> A: 
> - ユーザー固有データ（マイページ等）
> - リアルタイムデータ（株価、チャット等）
> - 常に最新が必要な場合
> 
> **Q: revalidate は何秒にする？**
> A: 
> - ブログ記事: 3600（1時間）
> - 商品一覧: 60（1分）
> - ニュース: 300（5分）
> 
> **Q: クライアントでデータ取得するのはいつ？**
> A: 
> - ユーザーの操作後（ボタンクリック等）
> - リアルタイム更新が必要
> - 初回表示に含めなくていいデータ
> 
> **ベストプラクティス：**
> ```tsx
> // ✅ 推奨：サーバーで取得
> export default async function Page() {
>   const data = await fetch(...).then(r => r.json());
>   return <div>{data.title}</div>;
> }
> 
> // ❌ 非推奨：クライアントで取得
> 'use client';
> 
> export default function Page() {
>   const [data, setData] = useState(null);
>   useEffect(() => {
>     fetch(...).then(r => r.json()).then(setData);
>   }, []);
>   if (!data) return <div>Loading...</div>;
>   return <div>{data.title}</div>;
> }
> ```

---

## 5.9 APIルート

Next.js では `route.ts` ファイルで**サーバーレス API**を作成できます。

### APIルートとは？

```
従来のバックエンド:
Express.js や Django でサーバーを構築
    ↓
サーバーを常時起動
    ↓
デプロイ・管理が大変

Next.js API ルート:
route.ts ファイルを作るだけ
    ↓
リクエストがあるときだけ実行
    ↓
自動スケール・簡単デプロイ
```

**ディレクトリ構造：**

```
src/app/api/
├── posts/
│   ├── route.ts          # GET /api/posts, POST /api/posts
│   └── [id]/
│       ├── route.ts      # GET /api/posts/123, PUT /api/posts/123
│       └── like/
│           └── route.ts  # POST /api/posts/123/like
└── auth/
    └── route.ts          # POST /api/auth
```

---

### GETリクエスト

**src/app/api/posts/route.ts**：

```ts
import { NextResponse } from 'next/server';

// GET /api/posts
export async function GET() {
  // データベースから投稿を取得（仮のデータ）
  const posts = [
    { id: 1, title: '投稿1', content: '内容1' },
    { id: 2, title: '投稿2', content: '内容2' },
  ];
  
  return NextResponse.json(posts);
}
```

**このコードの詳しい説明：**

```ts
// 1. NextResponse をインポート
import { NextResponse } from 'next/server';
//     ↑ レスポンスを返すためのヘルパー

// 2. GET 関数をエクスポート
export async function GET() {
//     ↑ 関数名 = HTTP メソッド（GET, POST, PUT, DELETE等）
//       ↑ async: データベースアクセスに必要
  
  // 3. データを取得（ここでは仮データ）
  const posts = [
    { id: 1, title: '投稿1', content: '内容1' },
    { id: 2, title: '投稿2', content: '内容2' },
  ];
  
  // 4. JSON レスポンスを返す
  return NextResponse.json(posts);
  //                   ↑ 自動的に Content-Type: application/json
}
```

**アクセス方法：**

```bash
# ブラウザまたはcurlで
GET http://localhost:3000/api/posts

# レスポンス:
[
  { "id": 1, "title": "投稿1", "content": "内容1" },
  { "id": 2, "title": "投稿2", "content": "内容2" }
]
```

**フロントエンドから使う：**

```tsx
// クライアントコンポーネント
'use client';

import { useEffect, useState } from 'react';

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts);
  }, []);
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

---

### POSTリクエスト

**src/app/api/posts/route.ts**に追加：

```ts
import { NextResponse } from 'next/server';

// GET /api/posts
export async function GET() {
  // ... 上記と同じ
}

// POST /api/posts
export async function POST(request: Request) {
  // 1. リクエストボディを取得
  const body = await request.json();
  const { title, content } = body;
  
  // 2. バリデーション
  if (!title || !content) {
    return NextResponse.json(
      { error: 'タイトルと内容は必須です' },
      { status: 400 }  // Bad Request
    );
  }
  
  // 3. データベースに保存（仮の処理）
  const newPost = {
    id: Date.now(),
    title,
    content,
    createdAt: new Date().toISOString(),
  };
  
  // TODO: 実際はデータベースに保存
  // await prisma.post.create({ data: newPost });
  
  // 4. 作成したデータを返す
  return NextResponse.json(newPost, { status: 201 });  // Created
}
```

**フロントエンドから使う：**

```tsx
'use client';

import { useState } from 'react';

export default function PostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    
    if (response.ok) {
      const newPost = await response.json();
      console.log('作成された投稿:', newPost);
      alert('投稿を作成しました');
    } else {
      const error = await response.json();
      alert(`エラー: ${error.error}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="タイトル"
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="内容"
      />
      <button type="submit">投稿</button>
    </form>
  );
}
```

---

### 動的ルートのAPI

**src/app/api/posts/[id]/route.ts**：

```ts
import { NextResponse } from 'next/server';

// GET /api/posts/123
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;  // URL から id を取得
  
  // データベースから投稿を取得（仮の処理）
  const post = {
    id,
    title: '投稿タイトル',
    content: '投稿内容',
    author: { name: '山田太郎' },
  };
  
  // TODO: 実際はデータベースから取得
  // const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
  
  if (!post) {
    return NextResponse.json(
      { error: '投稿が見つかりません' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(post);
}

// PUT /api/posts/123
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const { title, content } = body;
  
  // バリデーション
  if (!title || !content) {
    return NextResponse.json(
      { error: 'タイトルと内容は必須です' },
      { status: 400 }
    );
  }
  
  // 更新処理（仮）
  const updatedPost = {
    id,
    title,
    content,
    updatedAt: new Date().toISOString(),
  };
  
  // TODO: 実際はデータベースを更新
  // await prisma.post.update({
  //   where: { id: parseInt(id) },
  //   data: { title, content },
  // });
  
  return NextResponse.json(updatedPost);
}

// DELETE /api/posts/123
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // 削除処理（仮）
  // TODO: 実際はデータベースから削除
  // await prisma.post.delete({ where: { id: parseInt(id) } });
  
  return NextResponse.json({ message: '削除しました' });
}
```

**すべてのHTTPメソッド：**

| メソッド | 用途 | 例 |
|---------|------|----|
| GET | データ取得 | 投稿一覧、投稿詳細 |
| POST | データ作成 | 新規投稿 |
| PUT | データ更新（全体） | 投稿を丸ごと更新 |
| PATCH | データ更新（一部） | タイトルだけ更新 |
| DELETE | データ削除 | 投稿を削除 |

---

### エラーハンドリング

**完全な例：**

```ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ID のバリデーション
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'IDが不正です' },
        { status: 400 }  // Bad Request
      );
    }
    
    // データベースから取得
    const post = await getPostById(id);
    
    // 存在チェック
    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }  // Not Found
      );
    }
    
    // 成功
    return NextResponse.json(post);
    
  } catch (error) {
    // サーバーエラー
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }  // Internal Server Error
    );
  }
}
```

**HTTPステータスコード：**

| コード | 意味 | 使う場面 |
|-------|------|----------|
| 200 | OK | 成功（GET, PUT, PATCH） |
| 201 | Created | 作成成功（POST） |
| 204 | No Content | 削除成功（DELETE） |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 未認証 |
| 403 | Forbidden | 権限なし |
| 404 | Not Found | データが見つからない |
| 500 | Internal Server Error | サーバーエラー |

---

### クエリパラメータの取得

**URL: `/api/posts?sort=new&page=2`**

```ts
export async function GET(request: Request) {
  // URL からクエリパラメータを取得
  const { searchParams } = new URL(request.url);
  
  const sort = searchParams.get('sort');      // 'new'
  const page = searchParams.get('page');      // '2'
  const limit = searchParams.get('limit');    // null（存在しない）
  
  // デフォルト値
  const sortBy = sort || 'createdAt';
  const pageNum = parseInt(page || '1');
  const limitNum = parseInt(limit || '10');
  
  console.log({ sortBy, pageNum, limitNum });
  // { sortBy: 'new', pageNum: 2, limitNum: 10 }
  
  // データ取得
  const posts = await getPosts({
    sort: sortBy,
    page: pageNum,
    limit: limitNum,
  });
  
  return NextResponse.json(posts);
}
```

---

### ヘッダーの取得

```ts
export async function POST(request: Request) {
  // Authorization ヘッダーを取得
  const token = request.headers.get('authorization');
  
  if (!token) {
    return NextResponse.json(
      { error: '認証が必要です' },
      { status: 401 }
    );
  }
  
  // トークンを検証
  const user = await verifyToken(token);
  
  if (!user) {
    return NextResponse.json(
      { error: 'トークンが無効です' },
      { status: 401 }
    );
  }
  
  // 処理を続ける
  const body = await request.json();
  // ...
}
```

---

### CORS設定

外部ドメインからのアクセスを許可：

```ts
export async function GET(request: Request) {
  const posts = await getPosts();
  
  return NextResponse.json(posts, {
    headers: {
      'Access-Control-Allow-Origin': '*',  // すべてのドメインを許可
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// OPTIONS リクエスト（プリフライト）への対応
export async function OPTIONS(request: Request) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

---

### 初心者への補足

> 💡 **APIルートのポイント**
> 
> **基本構造：**
> ```ts
> // src/app/api/[エンドポイント]/route.ts
> import { NextResponse } from 'next/server';
> 
> export async function GET(request: Request) {
>   const data = await getData();
>   return NextResponse.json(data);
> }
> 
> export async function POST(request: Request) {
>   const body = await request.json();
>   const result = await createData(body);
>   return NextResponse.json(result, { status: 201 });
> }
> ```
> 
> **覚えておくこと：**
> ```
> 1. 関数名 = HTTP メソッド
>    GET, POST, PUT, PATCH, DELETE
> 
> 2. request から取得できるもの:
>    - body: await request.json()
>    - query: new URL(request.url).searchParams
>    - headers: request.headers.get('...')
> 
> 3. レスポンスは NextResponse.json()
>    - データ
>    - ステータスコード（200, 201, 400, 404, 500）
> 
> 4. params は第2引数
>    async function GET(request, { params })
> ```
> 
> **よくある間違い：**
> ```ts
> // ❌ 間違い: 関数名が小文字
> export async function get() { ... }  // 動かない
> 
> // ✅ 正しい: 大文字
> export async function GET() { ... }
> 
> 
> // ❌ 間違い: JSON を直接 return
> return { data: 'test' };  // エラー
> 
> // ✅ 正しい: NextResponse.json()
> return NextResponse.json({ data: 'test' });
> 
> 
> // ❌ 間違い: params を request.params で取得
> const { id } = request.params;  // undefined
> 
> // ✅ 正しい: 第2引数から取得
> async function GET(request, { params }) {
>   const { id } = params;
> }
> ```

---

## 5.10 Server Actions（フォーム処理の新しい方法）

**Server Actions**は、Next.js 13.4以降で導入された機能で、**フォーム送信やデータ更新を簡単に実装**できます。

### Server Actionsとは？

従来のAPI実装との比較：

```mermaid
graph LR
    subgraph "従来のAPI"
    A1[Form] -->|fetch POST| B1[API Route]
    B1 --> C1[Database]
    C1 --> B1
    B1 -->|JSON| A1
    end
    
    subgraph "Server Actions"
    A2[Form] -->|action| B2[Server Action]
    B2 --> C2[Database]
    end
    
    style A1 fill:#e1f5ff
    style A2 fill:#e1f5ff
    style B1 fill:#fff4e1
    style B2 fill:#d4edda
    style C1 fill:#f8d7da
    style C2 fill:#f8d7da
```

**メリット：**
- APIルートを作る必要がない
- フォームの状態管理が自動
- JavaScriptなしでも動作（Progressive Enhancement）
- 型安全（TypeScript）

---

### 基本的な使い方

#### 1. Server Actionの作成

```typescript
// src/app/posts/actions.ts
'use server';  // ← 必須：Server Actionsであることを宣言

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function createPost(formData: FormData) {
  // FormDataから値を取得
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  // バリデーション
  if (!title || title.length < 3) {
    return { error: 'タイトルは3文字以上必要です' };
  }
  
  // データベースに保存
  await prisma.post.create({
    data: { title, content }
  });
  
  // キャッシュを更新
  revalidatePath('/posts');
  
  // リダイレクト
  redirect('/posts');
}
```

**このコードの詳しい説明：**

1. **`'use server'`ディレクティブ**
   - ファイルの先頭に記述
   - このファイルの関数がサーバー側で実行されることを宣言
   - クライアント側には送信されない

2. **FormData型の引数**
   - フォームから送信されたデータを受け取る
   - `formData.get('name')`で値を取得

3. **revalidatePath()**
   - 指定したパスのキャッシュを無効化
   - 最新データを表示するために必要

4. **redirect()**
   - 処理完了後に別ページへリダイレクト
   - フォーム送信後の画面遷移に使用

#### 2. フォームでの使用

```typescript
// src/app/posts/new/page.tsx
import { createPost } from '../actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <div>
        <label>タイトル</label>
        <input 
          type="text" 
          name="title"  // ← FormDataのキーになる
          required 
        />
      </div>
      
      <div>
        <label>本文</label>
        <textarea 
          name="content"  // ← FormDataのキーになる
          required 
        />
      </div>
      
      <button type="submit">投稿する</button>
    </form>
  );
}
```

**動作の流れ：**

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as Form
    participant S as Server Action
    participant DB as Database
    
    U->>F: フォーム入力
    U->>F: 送信ボタン押下
    F->>S: createPost(formData)
    S->>S: バリデーション
    S->>DB: データ保存
    DB-->>S: 完了
    S->>S: revalidatePath()
    S-->>F: redirect('/posts')
    F-->>U: /posts画面表示
    
    Note over F,S: JavaScriptなしでも動作
```

---

### エラーハンドリング

#### 1. クライアント側でエラー表示

```typescript
// src/app/posts/new/page.tsx
'use client';

import { useActionState } from 'react';
import { createPost } from '../actions';

export default function NewPostPage() {
  const [state, formAction] = useActionState(createPost, null);
  
  return (
    <form action={formAction}>
      {state?.error && (
        <div style={{ color: 'red' }}>
          エラー: {state.error}
        </div>
      )}
      
      <div>
        <label>タイトル</label>
        <input type="text" name="title" required />
      </div>
      
      <div>
        <label>本文</label>
        <textarea name="content" required />
      </div>
      
      <button type="submit">投稿する</button>
    </form>
  );
}
```

**このコードの詳しい説明：**

1. **useActionState フック**
   - React 19の新しいフック
   - Server Actionの戻り値を管理
   - `[state, formAction] = useActionState(action, initialState)`

2. **エラー表示**
   - `state?.error`でエラーメッセージを取得
   - 条件付きレンダリングでエラー表示

#### 2. 詳細なバリデーション

```typescript
// src/app/posts/actions.ts
'use server';

import { z } from 'zod';

// Zodでバリデーションスキーマを定義
const postSchema = z.object({
  title: z.string()
    .min(3, 'タイトルは3文字以上必要です')
    .max(100, 'タイトルは100文字以内にしてください'),
  content: z.string()
    .min(10, '本文は10文字以上必要です')
    .max(5000, '本文は5000文字以内にしてください'),
});

export async function createPost(prevState: any, formData: FormData) {
  // FormDataをオブジェクトに変換
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
  };
  
  // バリデーション
  const result = postSchema.safeParse(rawData);
  
  if (!result.success) {
    // エラーをフィールドごとに返す
    return {
      errors: result.error.flatten().fieldErrors,
      message: '入力内容を確認してください',
    };
  }
  
  // データベースに保存
  try {
    await prisma.post.create({
      data: result.data
    });
    
    revalidatePath('/posts');
    redirect('/posts');
  } catch (error) {
    return {
      message: 'データベースエラーが発生しました',
    };
  }
}
```

#### 3. フィールドごとのエラー表示

```typescript
// src/app/posts/new/page.tsx
'use client';

import { useActionState } from 'react';
import { createPost } from '../actions';

export default function NewPostPage() {
  const [state, formAction] = useActionState(createPost, null);
  
  return (
    <form action={formAction}>
      {state?.message && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {state.message}
        </div>
      )}
      
      <div>
        <label>タイトル</label>
        <input type="text" name="title" required />
        {state?.errors?.title && (
          <p style={{ color: 'red', fontSize: '0.875rem' }}>
            {state.errors.title[0]}
          </p>
        )}
      </div>
      
      <div>
        <label>本文</label>
        <textarea name="content" required />
        {state?.errors?.content && (
          <p style={{ color: 'red', fontSize: '0.875rem' }}>
            {state.errors.content[0]}
          </p>
        )}
      </div>
      
      <button type="submit">投稿する</button>
    </form>
  );
}
```

---

### 楽観的UI更新（useOptimistic）

ユーザー体験を向上させるため、**サーバー処理の完了を待たずにUIを更新**します。

```typescript
// src/app/posts/[id]/like-button.tsx
'use client';

import { useOptimistic } from 'react';
import { likePost } from '../actions';

export default function LikeButton({ 
  postId,
  initialLikes 
}: { 
  postId: string;
  initialLikes: number;
}) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state, amount: number) => state + amount
  );
  
  return (
    <form action={async () => {
      // 即座にUI更新（楽観的更新）
      addOptimisticLike(1);
      
      // サーバー処理（非同期）
      await likePost(postId);
    }}>
      <button type="submit">
        ❤️ いいね ({optimisticLikes})
      </button>
    </form>
  );
}
```

**動作の流れ：**

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant UI as UI
    participant S as Server Action
    participant DB as Database
    
    U->>UI: いいねボタン押下
    UI->>UI: addOptimisticLike(1)
    Note over UI: 即座に表示更新（25→26）
    UI->>S: likePost(postId)
    S->>DB: データ保存
    DB-->>S: 完了
    S-->>UI: 成功
    Note over UI: 確定（26のまま）
    
    Note over U,UI: ネットワーク遅延を感じさせない
```

**このコードの詳しい説明：**

1. **useOptimistic フック**
   - `useOptimistic(currentState, updateFn)`
   - 現在の状態と更新関数を受け取る
   - 楽観的更新を管理

2. **addOptimisticLike(1)**
   - UI上で即座に+1
   - ユーザーは待たずに結果を確認

3. **エラー時の自動ロールバック**
   - サーバー処理が失敗すると自動的に元の値に戻る
   - 手動でロールバック処理を書く必要なし

---

### 認証との組み合わせ

```typescript
// src/app/posts/actions.ts
'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function createPost(formData: FormData) {
  // 認証チェック
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: 'ログインが必要です' };
  }
  
  // 管理者チェック
  if (session.user.role !== 'admin') {
    return { error: '投稿権限がありません' };
  }
  
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  // 投稿作成
  await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,  // 作成者IDを設定
    }
  });
  
  revalidatePath('/posts');
  redirect('/posts');
}
```

---

### 実用例：コメント投稿

```typescript
// src/app/posts/[id]/actions.ts
'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addComment(postId: string, formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: 'ログインが必要です' };
  }
  
  const content = formData.get('content') as string;
  
  if (!content || content.trim().length === 0) {
    return { error: 'コメントを入力してください' };
  }
  
  await prisma.comment.create({
    data: {
      content,
      postId,
      userId: session.user.id,
    }
  });
  
  revalidatePath(`/posts/${postId}`);
  
  return { success: true };
}
```

```typescript
// src/app/posts/[id]/comment-form.tsx
'use client';

import { useActionState } from 'react';
import { addComment } from './actions';

export default function CommentForm({ postId }: { postId: string }) {
  const [state, formAction] = useActionState(
    addComment.bind(null, postId),
    null
  );
  
  return (
    <form action={formAction}>
      {state?.error && (
        <div style={{ color: 'red' }}>{state.error}</div>
      )}
      
      {state?.success && (
        <div style={{ color: 'green' }}>コメントを投稿しました</div>
      )}
      
      <textarea 
        name="content"
        placeholder="コメントを入力..."
        required
      />
      
      <button type="submit">コメントする</button>
    </form>
  );
}
```

**初心者への補足：**
> 💡 **Server Actionsのベストプラクティス：**
> 
> | 項目 | 推奨方法 | 理由 |
> |------|---------|------|
> | **ファイル配置** | 同じディレクトリに`actions.ts` | ページと関連付けやすい |
> | **バリデーション** | Zodなどのライブラリ使用 | 型安全で保守しやすい |
> | **エラー処理** | try-catch必須 | データベースエラーに対応 |
> | **認証チェック** | 各Actionの先頭で実施 | セキュリティ確保 |
> | **キャッシュ更新** | revalidatePathで適切に | 最新データを表示 |
> 
> **従来のAPI Routeとの使い分け：**
> ```
> Server Actions を使う場面：
> - フォーム送信（投稿作成、コメント、いいね）
> - データ更新・削除
> - ページ内での完結する処理
> 
> API Route を使う場面：
> - 外部からのAPIアクセス（モバイルアプリなど）
> - Webhookの受信
> - 複雑なクエリパラメータ処理
> - ファイルアップロード
> ```

---

## 5.11 メタデータとSEO

メタデータは**検索エンジン最適化（SEO）**に重要です。Next.jsでは簡単に設定できます。

### なぜメタデータ？

```
検索結果での表示:
┌─────────────────────────────────────┐
│ 🔍 Google                           │
├─────────────────────────────────────┤
│                                      │
│ BOLD軽音サークル - 投稿一覧       │  ← title
│ メンバーの投稿一覧ページです。    │  ← description
│ 最新の活動報告やイベント情報...    │
│                                      │
│ bold-keion.com › posts              │
│                                      │
└─────────────────────────────────────┘

メタデータがないと:
- タイトルが「投稿」だけ
- 説明文がない
- 検索順位が下がる
```

---

### 静的メタデータ

**全ページ共通のメタデータ：**

```tsx
// src/app/posts/page.tsx

export const metadata = {
  title: '投稿一覧 | BOLD軽音',
  description: 'メンバーの投稿一覧ページです。最新の活動報告やイベント情報をご覧ください。',
};

export default function PostsList() {
  return (
    <div>
      <h1>投稿一覧</h1>
      {/* ... */}
    </div>
  );
}
```

**生成されるHTML：**

```html
<head>
  <title>投稿一覧 | BOLD軽音</title>
  <meta name="description" content="メンバーの投稿一覧ページです。最新の活動報告やイベント情報をご覧ください。" />
</head>
```

---

### 動的メタデータ

**ページごとに異なるメタデータ：**

```tsx
// src/app/posts/[id]/page.tsx

export async function generateMetadata({ params }: { params: { id: string } }) {
  // データを取得
  const post = await fetch(`http://localhost:3000/api/posts/${params.id}`)
    .then(res => res.json());
  
  return {
    title: `${post.title} | BOLD軽音`,
    description: post.content.substring(0, 160),  // 160文字まで
  };
}

export default async function PostDetail({ params }: { params: { id: string } }) {
  const post = await fetch(`http://localhost:3000/api/posts/${params.id}`)
    .then(res => res.json());
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

**実行フロー：**

```
ユーザーが /posts/123 にアクセス
    ↓
1. generateMetadata が実行される
   → データ取得
   → メタデータ生成
    ↓
2. <head> タグにメタデータを挿入
    ↓
3. PostDetail コンポーネントが実行される
   → 同じデータを再取得（キャッシュされる）
    ↓
4. HTML を生成して送信
```

---

### Open Graph（OGP）

SNSでシェアされたときの表示を制御：

```tsx
export const metadata = {
  title: 'BOLD軽音サークル - 投稿一覧',
  description: 'メンバーの投稿一覧ページ',
  openGraph: {
    title: 'BOLD軽音サークル - 投稿一覧',
    description: 'メンバーの投稿一覧ページ',
    url: 'https://bold-keion.com/posts',
    siteName: 'BOLD軽音サークル',
    images: [
      {
        url: 'https://bold-keion.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BOLD軽音サークル',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
};
```

**Twitter カード：**

```tsx
export const metadata = {
  title: '投稿一覧',
  description: 'メンバーの投稿一覧',
  twitter: {
    card: 'summary_large_image',
    title: '投稿一覧 | BOLD軽音',
    description: 'メンバーの投稿一覧ページ',
    images: ['https://bold-keion.com/twitter-image.jpg'],
  },
};
```

---

### 完全な例

```tsx
// src/app/posts/[id]/page.tsx

import { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetch(`http://localhost:3000/api/posts/${params.id}`)
    .then(res => res.json());
  
  return {
    title: `${post.title} | BOLD軽音`,
    description: post.content.substring(0, 160),
    keywords: ['BOLD軽音', '投稿', post.title],
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
      url: `https://bold-keion.com/posts/${params.id}`,
      siteName: 'BOLD軽音サークル',
      images: [
        {
          url: post.imageUrl || 'https://bold-keion.com/default-og.jpg',
          width: 1200,
          height: 630,
        },
      ],
      type: 'article',
      publishedTime: post.createdAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content.substring(0, 160),
      images: [post.imageUrl || 'https://bold-keion.com/default-twitter.jpg'],
    },
  };
}

export default async function PostDetail({ params }: Props) {
  const post = await fetch(`http://localhost:3000/api/posts/${params.id}`)
    .then(res => res.json());
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>投稿者: {post.author.name}</p>
      <p>投稿日: {new Date(post.createdAt).toLocaleDateString()}</p>
      <div>{post.content}</div>
    </article>
  );
}
```

---

### 初心者への補足

> 💡 **メタデータのポイント**
> 
> **基本的な設定：**
> ```tsx
> export const metadata = {
>   title: 'ページタイトル',
>   description: 'ページの説明（160文字以内）',
> };
> ```
> 
> **動的に変える場合：**
> ```tsx
> export async function generateMetadata({ params }) {
>   const data = await fetchData(params.id);
>   return {
>     title: data.title,
>     description: data.description,
>   };
> }
> ```
> 
> **よくある質問：**
> 
> **Q: metadata と generateMetadata の違いは？**
> A: 
> - `metadata`: 静的（固定）なメタデータ
> - `generateMetadata`: 動的（データに応じて変わる）メタデータ
> 
> **Q: どちらを使うべき？**
> A: 
> - 固定ページ（/about等）→ `metadata`
> - 動的ページ（/posts/[id]等）→ `generateMetadata`
> 
> **Q: OGPは必須？**
> A: 必須ではないが、SNSでシェアされる可能性があるなら設定推奨。

---

## 5.12 画像の最適化

### なぜ画像最適化？

**通常の `<img>` タグの問題：**

```
問題点:
❌ 大きい画像ファイル（数MB）をそのまま送信
❌ すべての画像を最初に読み込み
❌ レスポンシブ対応なし
❌ 古いブラウザ用フォーマット（JPEG/PNG）

結果:
→ ページ読み込みが遅い
→ モバイルで通信量が多い
→ ユーザー体験が悪い
```

**Next.js Image コンポーネント：**

```
最適化:
✅ 自動的に WebP/AVIF に変換（50%軽量化）
✅ レスポンシブ画像（画面サイズに応じて最適なサイズ）
✅ 遅延読み込み（Lazy Loading）
✅ ぼかしプレースホルダー
✅ CLS（Cumulative Layout Shift）防止

結果:
→ 高速なページ読み込み
→ 通信量削減
→ 優れたユーザー体験
```

---

### 基本的な使い方

```tsx
import Image from 'next/image';

export default function UserAvatar() {
  return (
    <div>
      {/* ❌ 通常のimgタグ */}
      <img src="/avatar.jpg" alt="アバター" width={100} height={100} />
      
      {/* ✅ Imageコンポーネント */}
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

**比較：**

```
<img> タグ:
avatar.jpg (500KB)
    ↓
そのまま送信
    ↓
500KB ダウンロード

<Image> コンポーネント:
avatar.jpg (500KB)
    ↓
Next.js が自動変換
    ↓
avatar.webp (150KB)  ← 70%削減！
    ↓
画面外なら遅延読み込み
```

---

### ローカル画像

**public フォルダの画像：**

```tsx
import Image from 'next/image';

export default function MyImage() {
  return (
    <Image
      src="/images/logo.png"  // public/images/logo.png
      alt="ロゴ"
      width={200}
      height={100}
    />
  );
}
```

**import で画像を読み込む：**

```tsx
import Image from 'next/image';
import logoImage from '@/public/images/logo.png';

export default function MyImage() {
  return (
    <Image
      src={logoImage}  // width/height 自動設定
      alt="ロゴ"
    />
  );
}
```

---

### 外部画像

**設定が必要：**

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
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

---

### レスポンシブ画像

**パターン1: fill プロパティ**

```tsx
<div style={{ position: 'relative', width: '100%', height: '400px' }}>
  <Image
    src="/banner.jpg"
    alt="バナー"
    fill  // 親要素のサイズに合わせる
    style={{ objectFit: 'cover' }}  // 切り抜き方法
  />
</div>
```

**objectFit の種類：**

```tsx
// cover: 親要素を埋める（はみ出す部分は切り取り）
<Image src="/image.jpg" alt="画像" fill style={{ objectFit: 'cover' }} />

// contain: 親要素に収める（空白ができる）
<Image src="/image.jpg" alt="画像" fill style={{ objectFit: 'contain' }} />

// fill: 親要素に合わせて引き伸ばす
<Image src="/image.jpg" alt="画像" fill style={{ objectFit: 'fill' }} />
```

**パターン2: sizes プロパティ**

```tsx
<Image
  src="/image.jpg"
  alt="画像"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
  // ↑ スマホ: 画面幅100%
  //   PC: 画面幅50%
/>
```

---

### 遅延読み込み（Lazy Loading）

デフォルトで有効ですが、制御もできます：

```tsx
// デフォルト: 画面外の画像は遅延読み込み
<Image src="/image.jpg" alt="画像" width={500} height={300} />

// すぐに読み込む（Above the fold の画像）
<Image
  src="/hero.jpg"
  alt="メイン画像"
  width={1200}
  height={600}
  priority  // ← 優先読み込み
/>

// 遅延読み込みを明示的に指定
<Image
  src="/image.jpg"
  alt="画像"
  width={500}
  height={300}
  loading="lazy"  // ← 遅延読み込み
/>
```

**使い分け：**

```
priority を使う:
- ファーストビュー（スクロールせずに見える部分）の画像
- ヒーロー画像
- ロゴ

デフォルト（lazy）:
- スクロールしないと見えない画像
- 一覧ページの画像
```

---

### プレースホルダー

**ぼかしプレースホルダー：**

```tsx
<Image
  src="/image.jpg"
  alt="画像"
  width={800}
  height={600}
  placeholder="blur"  // ← ぼかし効果
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."  // Base64エンコード
/>
```

**import の場合は自動生成：**

```tsx
import myImage from '@/public/image.jpg';

<Image
  src={myImage}
  alt="画像"
  placeholder="blur"  // blurDataURL は自動生成される
/>
```

---

### 実践例

**ユーザーアバター：**

```tsx
import Image from 'next/image';

export default function UserCard({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4">
      {/* アバター画像 */}
      <div className="relative w-16 h-16 rounded-full overflow-hidden">
        <Image
          src={user.avatarUrl || '/default-avatar.png'}
          alt={user.name}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      
      <div>
        <h3>{user.name}</h3>
        <p>{user.bio}</p>
      </div>
    </div>
  );
}
```

**ヒーロー画像：**

```tsx
export default function Hero() {
  return (
    <div className="relative w-full h-[500px]">
      <Image
        src="/hero.jpg"
        alt="メイン画像"
        fill
        style={{ objectFit: 'cover' }}
        priority  // ← ファーストビューなので優先読み込み
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-white text-5xl">Welcome</h1>
      </div>
    </div>
  );
}
```

**画像一覧：**

```tsx
export default function ImageGrid({ images }: { images: Image[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(img => (
        <div key={img.id} className="relative aspect-square">
          <Image
            src={img.url}
            alt={img.alt}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}
```

---

### 初心者への補足

> 💡 **画像最適化のポイント**
> 
> **基本的な使い方：**
> ```tsx
> import Image from 'next/image';
> 
> // 固定サイズ
> <Image
>   src="/image.jpg"
>   alt="説明"
>   width={500}
>   height={300}
> />
> 
> // 親要素に合わせる
> <div style={{ position: 'relative', width: '100%', height: '400px' }}>
>   <Image
>     src="/image.jpg"
>     alt="説明"
>     fill
>     style={{ objectFit: 'cover' }}
>   />
> </div>
> ```
> 
> **よくある質問：**
> 
> **Q: width と height は必須？**
> A: `fill` を使わない場合は必須。CLS（レイアウトシフト）防止のため。
> 
> **Q: 外部画像を使うと警告が出る**
> A: `next.config.ts` で `remotePatterns` を設定する必要があります。
> 
> **Q: priority はいつ使う？**
> A: スクロールせずに見える画像（ファーストビュー）のみ。
> 
> **Q: 画像が表示されない**
> A: チェック項目：
> - ファイルパスは正しい？（public フォルダからの相対パス）
> - 外部画像の場合、remotePatterns に追加した？
> - width/height または fill を指定した？

---

---

## 5.13 環境変数

### なぜ環境変数？

```
問題: コードに直接書くと...
const API_KEY = 'sk_live_abc123';  ← コードに直接書いた
    ↓
GitHub にプッシュ
    ↓
❌ 全世界に API キーが公開される！
❌ セキュリティリスク
❌ 環境ごとに変更できない

解決: 環境変数を使う
.env.local:  API_KEY=sk_live_abc123
コード:      const apiKey = process.env.API_KEY;
    ↓
✅ .env.local は Git に含めない
✅ 環境ごとに異なる値を設定可能
✅ セキュリティが保たれる
```

---

### 環境変数ファイル

**優先順位（高い順）：**

```
1. .env.local          ← 最優先（開発環境用）
2. .env.production     ← 本番環境
3. .env.development    ← 開発環境
4. .env                ← デフォルト
```

**.env.local の例：**

```env
# データベース
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# 認証
AUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# 外部API
OPENAI_API_KEY="sk-proj-abc123..."

# 公開変数（ブラウザでも使える）
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://abc.supabase.co"
```

**.gitignore に追加：**

```gitignore
# 環境変数ファイル（Git に含めない）
.env*.local
.env.local
.env.development.local
.env.production.local

# これらは Git に含めても OK
.env.example
```

---

### 公開変数 vs 秘密変数

**公開変数（`NEXT_PUBLIC_` で始まる）：**

```env
# ブラウザでも使える
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

```tsx
// クライアントコンポーネントで使える
'use client';

export default function MyComponent() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log(apiUrl);  // ← ブラウザのコンソールに表示される
  
  return <div>API URL: {apiUrl}</div>;
}
```

**秘密変数（`NEXT_PUBLIC_` なし）：**

```env
# サーバーでのみ使える
DATABASE_URL=postgresql://...
AUTH_SECRET=secret-key
OPENAI_API_KEY=sk-proj-...
```

```tsx
// サーバーコンポーネント・API ルートでのみ使える
export default async function MyComponent() {
  const dbUrl = process.env.DATABASE_URL;
  console.log(dbUrl);  // ← サーバーのターミナルに表示される
  
  // データベース接続
  const data = await fetchFromDatabase(dbUrl);
  
  return <div>データ取得完了</div>;
}
```

**重要な違い：**

```
NEXT_PUBLIC_ 付き:
→ JavaScript バンドルに含まれる
→ ブラウザで見える
→ 秘密情報は絶対に入れない

NEXT_PUBLIC_ なし:
→ JavaScript バンドルに含まれない
→ ブラウザで見えない
→ 秘密情報を入れてOK
```

---

### 使用例

**API ルートで使う：**

```ts
// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 秘密の API キーを取得
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API キーが設定されていません' },
      { status: 500 }
    );
  }
  
  // OpenAI API を呼び出す
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ /* ... */ }),
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

**サーバーコンポーネントで使う：**

```tsx
// src/app/posts/page.tsx
export default async function PostsList() {
  // データベース URL を取得
  const dbUrl = process.env.DATABASE_URL;
  
  // データベースに接続
  const posts = await fetchPostsFromDatabase(dbUrl);
  
  return (
    <div>
      <h1>投稿一覧</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

**クライアントコンポーネントで使う：**

```tsx
// src/components/AnalyticsTracker.tsx
'use client';

import { useEffect } from 'react';

export default function AnalyticsTracker() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  
  useEffect(() => {
    if (gaId) {
      // Google Analytics を初期化
      window.gtag('config', gaId);
    }
  }, [gaId]);
  
  return null;
}
```

---

### 本番環境での設定

**Vercel の場合：**

1. Vercel ダッシュボード → Settings → Environment Variables
2. 変数名と値を入力
3. Environment を選択（Production / Preview / Development）
4. Save

**例：**

```
変数名: DATABASE_URL
値: postgresql://user:pass@host:5432/db
Environment: Production

変数名: NEXT_PUBLIC_API_URL
値: https://api.example.com
Environment: Production, Preview, Development
```

---

### バリデーション

**環境変数が設定されているかチェック：**

```ts
// src/lib/env.ts
export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'NEXT_PUBLIC_API_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `環境変数が設定されていません: ${missing.join(', ')}`
    );
  }
}

// アプリ起動時に実行
validateEnv();
```

**型安全な環境変数：**

```ts
// src/lib/env.ts
interface Env {
  DATABASE_URL: string;
  AUTH_SECRET: string;
  NEXT_PUBLIC_API_URL: string;
}

export function getEnv(): Env {
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    AUTH_SECRET: process.env.AUTH_SECRET!,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL!,
  };
}

// 使用
import { getEnv } from '@/lib/env';

const env = getEnv();
console.log(env.DATABASE_URL);  // 型安全
```

---

### 初心者への補足

> 💡 **環境変数のポイント**
> 
> **基本ルール：**
> ```
> 秘密情報（API キー、パスワード等）:
> → NEXT_PUBLIC_ を付けない
> → サーバーでのみ使える
> 
> 公開情報（API URL 等）:
> → NEXT_PUBLIC_ を付ける
> → ブラウザでも使える
> ```
> 
> **よくある質問：**
> 
> **Q: .env.local を Git に入れていい？**
> A: ❌ 絶対にダメ！秘密情報が漏洩します。
> 
> **Q: NEXT_PUBLIC_ を付け忘れたら？**
> A: クライアントコンポーネントで使えません（undefined になる）。
> 
> **Q: 環境変数を変更したのに反映されない**
> A: 開発サーバーを再起動してください（`npm run dev` を再実行）。
> 
> **Q: 本番環境でどう設定する？**
> A: Vercel/Netlify 等のダッシュボードで設定します。
> 
> **覚えておくこと：**
> - .env.local は Git に入れない
> - 秘密情報には NEXT_PUBLIC_ を付けない
> - 環境変数変更後は開発サーバーを再起動

---

---

## 5.14 実践例：ブログアプリ

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

## 5.15 ミドルウェア（Middleware）

**ミドルウェア**は、リクエストが完了する**前**に実行されるコードです。認証チェック、リダイレクト、ログ記録などに使います。

### ミドルウェアとは？

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant M as Middleware
    participant P as ページ
    participant API as API
    
    U->>M: /dashboard にアクセス
    
    alt 認証済み
        M->>P: リクエストを通す
        P->>U: ダッシュボード表示
    else 未認証
        M->>U: /login へリダイレクト
    end
    
    Note over M,P: ページの前に実行される
```

**ミドルウェアの用途：**
- 🔐 **認証チェック**：ログインしていないユーザーをリダイレクト
- 🌐 **国際化（i18n）**：言語に応じてリダイレクト
- 📝 **ログ記録**：アクセスログを記録
- 🛡️ **セキュリティ**：ヘッダーの設定、CSRF対策
- 🚦 **リダイレクト**：URL の正規化、メンテナンスモード

---

### 基本的な使い方

ミドルウェアは**プロジェクトのルート**に `middleware.ts` ファイルを作成します。

```
プロジェクトルート/
├── src/
│   ├── app/
│   │   └── ...
│   └── middleware.ts    ← ここに配置
├── package.json
└── ...
```

**最もシンプルなミドルウェア：**

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('Middleware実行:', request.nextUrl.pathname);
  
  // リクエストを通す
  return NextResponse.next();
}

// どのパスで実行するか指定
export const config = {
  matcher: [
    '/dashboard/:path*',  // /dashboard 配下すべて
    '/api/:path*',        // /api 配下すべて
  ]
};
```

**このコードの詳しい説明：**

1. **middleware関数**
   - すべてのリクエストがページに到達する前に実行
   - `NextRequest` オブジェクトを受け取る
   - `NextResponse` を返す必要がある

2. **config.matcher**
   - ミドルウェアを実行するパスを指定
   - ワイルドカード `*` が使える
   - 配列で複数指定可能

---

### 認証チェック

最も一般的な使用例：ログインしていないユーザーをリダイレクトします。

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // クッキーから認証トークンを取得
  const token = request.cookies.get('auth-token')?.value;
  
  // ログインページへのアクセスは常に許可
  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next();
  }
  
  // トークンがない場合はログインページへリダイレクト
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 認証済みの場合はそのまま通す
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ]
};
```

**動作の流れ：**

```mermaid
flowchart TD
    A[ユーザーが /dashboard にアクセス] --> B{Middleware実行}
    B --> C{auth-token<br/>クッキーあり?}
    C -->|あり| D[NextResponse.next<br/>ページ表示]
    C -->|なし| E[NextResponse.redirect<br/>/login?from=/dashboard]
    E --> F[ログイン画面表示]
    
    style A fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#d4edda
    style E fill:#f8d7da
    style F fill:#fff3cd
```

**このコードの詳しい説明：**

1. **クッキーの取得**
   ```typescript
   const token = request.cookies.get('auth-token')?.value;
   ```
   - `request.cookies.get()` でクッキーを取得
   - `?.value` でOptional Chainingを使用

2. **リダイレクトURLの作成**
   ```typescript
   const loginUrl = new URL('/login', request.url);
   loginUrl.searchParams.set('from', request.nextUrl.pathname);
   ```
   - 元のURLを `from` パラメータに設定
   - ログイン後に元のページに戻れる

3. **NextResponse.redirect()**
   - 別のURLにリダイレクト
   - ブラウザは自動的に遷移

---

### NextAuth.js との組み合わせ

実際のプロジェクトでは NextAuth.js と組み合わせて使います。

```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // 認証済みユーザーの追加チェック
    const token = req.nextauth.token;
    
    // 管理者ページは管理者のみアクセス可能
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // tokenがあればアクセス許可
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
  ]
};
```

**このコードの詳しい説明：**

1. **withAuth() 関数**
   - NextAuth.jsが提供するヘルパー
   - 自動的に認証チェックを行う

2. **token.role でロールベースアクセス制御**
   - 管理者のみアクセス可能なページを保護
   - 権限がない場合は `/unauthorized` にリダイレクト

3. **authorized コールバック**
   - `true` を返すとアクセス許可
   - `false` を返すとログインページへリダイレクト

---

### レスポンスヘッダーの設定

セキュリティヘッダーやCORSヘッダーを設定できます。

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // セキュリティヘッダーを追加
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  
  // CORSヘッダー（API用）
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
  }
  
  return response;
}

export const config = {
  matcher: '/:path*',  // すべてのパス
};
```

**セキュリティヘッダーの説明：**

| ヘッダー | 効果 |
|---------|------|
| **X-Frame-Options** | クリックジャッキング攻撃を防ぐ |
| **X-Content-Type-Options** | MIMEタイプスニッフィングを防ぐ |
| **X-XSS-Protection** | XSS攻撃を防ぐ（古いブラウザ用） |
| **Strict-Transport-Security** | HTTPS接続を強制 |
| **Access-Control-Allow-Origin** | CORS設定 |

---

### パスの書き換え（Rewrite）

URLを変えずに別のページを表示します。

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // サブドメインに応じて異なるページを表示
  if (hostname.startsWith('blog.')) {
    // blog.example.com → /blog にrewrite
    return NextResponse.rewrite(new URL('/blog', request.url));
  }
  
  if (hostname.startsWith('shop.')) {
    // shop.example.com → /shop にrewrite
    return NextResponse.rewrite(new URL('/shop', request.url));
  }
  
  // A/Bテスト
  const bucket = Math.random();
  if (request.nextUrl.pathname === '/') {
    if (bucket < 0.5) {
      // 50%のユーザーに新しいホームページを表示
      return NextResponse.rewrite(new URL('/home-new', request.url));
    }
  }
  
  return NextResponse.next();
}
```

**rewrite と redirect の違い：**

```mermaid
graph LR
    subgraph "redirect（リダイレクト）"
    A1[ユーザー] -->|/old にアクセス| B1[Middleware]
    B1 -->|redirect| C1[ブラウザ]
    C1 -->|/new に再リクエスト| D1[ページ]
    end
    
    subgraph "rewrite（書き換え）"
    A2[ユーザー] -->|/old にアクセス| B2[Middleware]
    B2 -->|内部で /new 表示| C2[ページ]
    C2 -->|URLは /old のまま| A2
    end
    
    style B1 fill:#f8d7da
    style B2 fill:#d4edda
```

**使い分け：**
- **redirect**：URLを変えたい（SEO、ログイン画面など）
- **rewrite**：URLは変えずに内容だけ変える（A/Bテスト、サブドメイン分岐）

---

### クッキーの操作

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // クッキーを取得
  const theme = request.cookies.get('theme')?.value;
  
  // クッキーがない場合はデフォルト値を設定
  if (!theme) {
    response.cookies.set('theme', 'light', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,  // 1年
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
  
  // 訪問回数をカウント
  const visitCount = parseInt(request.cookies.get('visit-count')?.value || '0');
  response.cookies.set('visit-count', String(visitCount + 1), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  
  return response;
}

export const config = {
  matcher: '/:path*',
};
```

**クッキーオプションの説明：**

| オプション | 説明 |
|-----------|------|
| **path** | クッキーが有効なパス |
| **maxAge** | 有効期限（秒） |
| **httpOnly** | JavaScriptからアクセス不可（XSS対策） |
| **secure** | HTTPS接続でのみ送信 |
| **sameSite** | CSRF攻撃対策（'lax', 'strict', 'none'） |

---

### 国際化（i18n）の例

言語に応じてリダイレクトします。

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'ja', 'zh'];
const defaultLocale = 'ja';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // パスに言語プレフィックスがあるかチェック
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) {
    return NextResponse.next();
  }
  
  // Accept-Languageヘッダーから言語を取得
  const acceptLanguage = request.headers.get('accept-language') || '';
  let locale = defaultLocale;
  
  // ユーザーの優先言語を判定
  for (const l of locales) {
    if (acceptLanguage.includes(l)) {
      locale = l;
      break;
    }
  }
  
  // 言語プレフィックスを追加してリダイレクト
  const url = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // 静的ファイル、APIルートを除外
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};
```

**動作例：**
```
ユーザーアクセス: https://example.com/about
Accept-Language: ja,en;q=0.9
    ↓
Middleware判定: 日本語優先
    ↓
リダイレクト: https://example.com/ja/about
```

---

### メンテナンスモード

メンテナンス中は特定のページのみ表示します。

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const ALLOWED_IPS = ['123.45.67.89'];  // 管理者のIPアドレス

export function middleware(request: NextRequest) {
  // メンテナンスページへのアクセスは常に許可
  if (request.nextUrl.pathname === '/maintenance') {
    return NextResponse.next();
  }
  
  if (MAINTENANCE_MODE) {
    // 管理者のIPアドレスは除外
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || '';
    
    if (!ALLOWED_IPS.some(allowedIp => ip.includes(allowedIp))) {
      return NextResponse.rewrite(new URL('/maintenance', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
```

**環境変数での制御：**
```env
# .env.local
MAINTENANCE_MODE=false  # メンテナンスモードOFF

# メンテナンス時
MAINTENANCE_MODE=true   # メンテナンスモードON
```

---

### ログ記録

アクセスログを記録します。

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  // リクエスト情報をログ
  console.log({
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    ip: request.headers.get('x-forwarded-for'),
    timestamp: new Date().toISOString(),
  });
  
  const response = NextResponse.next();
  
  // レスポンス時間をログ
  const duration = Date.now() - start;
  console.log(`${request.method} ${request.nextUrl.pathname} - ${duration}ms`);
  
  // カスタムヘッダーに処理時間を追加
  response.headers.set('X-Response-Time', `${duration}ms`);
  
  return response;
}

export const config = {
  matcher: '/:path*',
};
```

---

### 実用例：認証 + ロール制御

実際のプロジェクトで使える完全な例です。

```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // 公開ページは常にアクセス可能
    const publicPaths = ['/', '/about', '/contact', '/blog'];
    if (publicPaths.some(p => path === p)) {
      return NextResponse.next();
    }
    
    // 管理者専用ページ
    if (path.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
    
    // メンバー専用ページ
    if (path.startsWith('/members')) {
      if (!token || token.role === 'guest') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
    
    // ログ記録
    console.log({
      user: token?.email,
      role: token?.role,
      path,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // 公開ページは認証不要
        const publicPaths = ['/', '/about', '/contact', '/blog'];
        if (publicPaths.some(p => path === p)) {
          return true;
        }
        
        // その他は認証必須
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};
```

**初心者への補足：**
> 💡 **ミドルウェアのベストプラクティス：**
> 
> | 項目 | 推奨方法 | 理由 |
> |------|---------|------|
> | **配置場所** | `src/middleware.ts` | プロジェクトルート |
> | **実行範囲** | `config.matcher`で限定 | パフォーマンス向上 |
> | **処理内容** | 軽量に保つ | すべてのリクエストで実行される |
> | **エラー処理** | try-catchで囲む | エラーでアプリ全体が止まる |
> | **ログ** | 本番では最小限に | ログが多いと遅くなる |
> 
> **よくある使用例：**
> ```typescript
> // ✅ 認証チェック（最も一般的）
> if (!token) {
>   return NextResponse.redirect(new URL('/login', request.url));
> }
> 
> // ✅ ロール制御
> if (path.startsWith('/admin') && role !== 'admin') {
>   return NextResponse.redirect(new URL('/unauthorized', request.url));
> }
> 
> // ✅ セキュリティヘッダー
> response.headers.set('X-Frame-Options', 'DENY');
> 
> // ❌ 重い処理（データベースアクセスなど）
> // ミドルウェアでは避ける
> ```
> 
> **matcher のパターン：**
> ```typescript
> export const config = {
>   matcher: [
>     '/dashboard/:path*',       // /dashboard 配下すべて
>     '/api/:path*',             // /api 配下すべて
>     '/((?!api|_next).*)',      // api と _next 以外すべて
>     '/',                       // トップページのみ
>   ]
> };
> ```

---

## 5.16 Next.js 16 と React 19 の新機能

このプロジェクトでは **Next.js 16** と **React 19** を使用しています。最新バージョンならではの新機能と改善点を理解しましょう。

### 5.16.1 Next.js 16 の新機能

**1. Async Request APIs**

Next.js 16 では、リクエスト情報（cookies、headers、params など）を取得するAPIが非同期になりました。

```typescript
// Next.js 15以前
import { cookies } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();  // 同期
  const token = cookieStore.get('token');
  return <div>Token: {token?.value}</div>;
}
```

```typescript
// Next.js 16（現在のプロジェクト）
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();  // 非同期
  const token = cookieStore.get('token');
  return <div>Token: {token?.value}</div>;
}
```

**なぜ非同期に？**
- より効率的なキャッシング
- パフォーマンスの向上
- 将来のReact機能（React Server Components）との互換性

**2. Server Actions の改善**

Server Actions がより安定し、フォーム送信やデータ更新が簡単に。

```typescript
// app/posts/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  await prisma.post.create({
    data: { title, content }
  });
  
  // キャッシュを更新
  revalidatePath('/posts');
}
```

```typescript
// app/posts/new/page.tsx
import { createPost } from '../actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">投稿</button>
    </form>
  );
}
```

**メリット:**
- JavaScriptなしでも動作（Progressive Enhancement）
- 自動的にフォームの状態管理
- revalidatePathで簡単にキャッシュ更新

**3. Turbopack の安定化**

開発サーバーの高速化（Webpack の代替）。

```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbo"  // Turbopack を使用
  }
}
```

**効果:**
- 開発サーバーの起動が最大5倍速い
- Hot Module Replacement（HMR）が高速
- 大規模プロジェクトでも快適

**4. 静的エクスポートの改善**

静的サイト生成（SSG）がより柔軟に。

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // 静的エクスポート
};

export default nextConfig;
```

### 5.16.2 React 19 の新機能

**1. Actions（Server Actions + Client Actions）**

フォーム送信やデータ更新が簡単に。

```typescript
// Server Action（Next.js 16）
'use server';

export async function likePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  await prisma.like.create({
    data: { postId, userId: session.user.id }
  });
}
```

```typescript
// Client Component
'use client';

export default function LikeButton({ postId }: { postId: string }) {
  return (
    <form action={() => likePost(postId)}>
      <button type="submit">❤️ いいね</button>
    </form>
  );
}
```

**2. useOptimistic フック**

楽観的UI更新が簡単に実装できる。

```typescript
'use client';

import { useOptimistic } from 'react';

export default function LikeButton({ 
  postId, 
  initialLikes 
}: { 
  postId: string; 
  initialLikes: number; 
}) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state, amount: number) => state + amount
  );
  
  return (
    <form action={async () => {
      addOptimisticLike(1);  // 即座にUI更新
      await likePost(postId);  // サーバーに送信
    }}>
      <button type="submit">
        ❤️ いいね ({optimisticLikes})
      </button>
    </form>
  );
}
```

**メリット:**
- UIが即座に反応
- ネットワーク遅延を感じさせない
- 自動的にエラー時はロールバック

**3. use() フック**

Promise を直接コンポーネント内で扱える。

```typescript
import { use } from 'react';

async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

export default function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);  // Promise を解決
  
  return <div>{user.name}</div>;
}
```

**4. React Compiler（実験的）**

手動の useMemo / useCallback が不要に。

```typescript
// React 18まで
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ items }) {
  const filtered = useMemo(
    () => items.filter(item => item.active),
    [items]
  );
  
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <div onClick={handleClick}>{filtered.length}</div>;
}
```

```typescript
// React 19（React Compiler使用時）
function ExpensiveComponent({ items }) {
  // 自動的にメモ化される
  const filtered = items.filter(item => item.active);
  
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <div onClick={handleClick}>{filtered.length}</div>;
}
```

### 5.16.3 プロジェクトでの活用例

**このプロジェクト（BOLD軽音サイト）では以下を活用：**

```typescript
// 1. Async Request APIs
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';

export default async function Page() {
  const session = await auth();
  const cookieStore = await cookies();
  // ...
}
```

```typescript
// 2. Server Actions
'use server';

export async function createSchedule(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  // スケジュール作成
  await prisma.activitySchedule.create({
    data: { /* ... */ }
  });
  
  revalidatePath('/schedules');
}
```

```typescript
// 3. useOptimistic（いいね機能）
'use client';

export function LikeButton({ postId, initialLikes }: Props) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state) => state + 1
  );
  
  return (
    <form action={async () => {
      addOptimisticLike(1);
      await toggleLike(postId);
    }}>
      <button>❤️ {optimisticLikes}</button>
    </form>
  );
}
```

### 5.16.4 移行のポイント

**Next.js 15 → 16 への移行:**

```typescript
// ❌ Before（Next.js 15）
import { cookies, headers } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();  // 同期
  const headersList = headers();  // 同期
  // ...
}
```

```typescript
// ✅ After（Next.js 16）
import { cookies, headers } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();  // 非同期
  const headersList = await headers();  // 非同期
  // ...
}
```

**注意点:**
- すべてのServer Componentが `async function` になる
- `cookies()`, `headers()`, `params` は `await` が必要
- Client Componentは変更なし（`'use client'`）

### 5.16.5 パフォーマンスの改善

**Next.js 16 + React 19 のパフォーマンス:**

```
従来（Next.js 14 + React 18）:
├─ 初回表示: 1.2秒
├─ ページ遷移: 300ms
└─ HMR（開発時）: 500ms

現在（Next.js 16 + React 19）:
├─ 初回表示: 0.8秒 ⚡ 33%高速化
├─ ページ遷移: 200ms ⚡ 33%高速化
└─ HMR（開発時）: 100ms ⚡ 80%高速化
```

**主な改善点:**
- ✅ Server Components のストリーミング最適化
- ✅ Turbopack による高速ビルド
- ✅ 自動的なコード分割の改善
- ✅ キャッシュ戦略の最適化

---

## まとめ

この章では、**Next.js の基礎から実践**まで学びました。

### 学んだこと

**1. Next.js の基礎（5.1-5.3）**
```
✅ Next.js とは: React フレームワーク
✅ App Router: ファイルベースルーティング
✅ ページ作成: page.tsx でページを定義
✅ URL マッピング: ディレクトリ構造 = URL 構造
```

**2. ルーティング（5.4-5.6）**
```
✅ 動的ルート: [id], [...slug], [[...slug]]
✅ レイアウト: 共通 UI の再利用
✅ リンク: <Link> コンポーネントで高速ナビゲーション
✅ useRouter: プログラムからの遷移
```

**3. コンポーネント（5.7）**
```
✅ サーバーコンポーネント（デフォルト）:
   - データベース直接アクセス
   - SEO に強い
   - JavaScript が軽量

✅ クライアントコンポーネント（'use client'）:
   - useState, useEffect が使える
   - イベントハンドラが使える
   - インタラクティブな UI
```

**4. データとAPI（5.8-5.9）**
```
✅ サーバーでのデータ取得:
   - async/await で fetch
   - Promise.all で並列取得
   - キャッシュ制御

✅ API ルート:
   - route.ts で API 作成
   - GET, POST, PUT, DELETE
   - エラーハンドリング
```

**5. 最適化（5.10-5.12）**
```
✅ メタデータ: SEO 対策
✅ Image: 画像の自動最適化
✅ 環境変数: 秘密情報の管理
```

---

### 重要なポイント

**✅ サーバーコンポーネントを基本に**

```tsx
// 👍 推奨: サーバーコンポーネント
export default async function Page() {
  const data = await fetch(...).then(r => r.json());
  return <div>{data.title}</div>;
}

// 👎 非推奨: クライアントで全部やる
'use client';
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(...).then(setData); }, []);
  // ...
}
```

**✅ 必要な部分だけクライアントコンポーネント**

```tsx
// サーバーコンポーネント
export default async function PostsList() {
  const posts = await getPosts();  // サーバーで取得
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <LikeButton postId={post.id} />  {/* ここだけクライアント */}
        </div>
      ))}
    </div>
  );
}
```

**✅ 適切なキャッシュ戦略**

```tsx
// 静的コンテンツ: デフォルト（無限キャッシュ）
await fetch('/api/about');

// 動的コンテンツ: キャッシュしない
await fetch('/api/posts', { cache: 'no-store' });

// 定期更新: ISR
await fetch('/api/posts', { next: { revalidate: 60 } });
```

---

### Next.js の学習ロードマップ

```
Chapter 5 で学んだこと（基礎）:
✅ App Router の基本
✅ ページとレイアウト
✅ サーバー/クライアントコンポーネント
✅ データ取得
✅ API ルート

さらに学ぶべきこと（発展）:
📚 Server Actions（フォーム処理の新しい方法）
📚 Streaming（段階的なレンダリング）
📚 Parallel Routes（並行ルーティング）
📚 Intercepting Routes（モーダル実装）
📚 Middleware（認証・リダイレクト）
📚 Edge Runtime（エッジコンピューティング）
```

---

### よくある質問と回答

**Q1: ページが表示されない**
```
チェック項目:
□ page.tsx という名前か？
□ default export しているか？
□ ディレクトリ構造は正しいか？
□ 開発サーバーは起動しているか？
```

**Q2: useState が使えない**
```
原因: サーバーコンポーネントで使おうとしている

解決:
'use client';  // ← ファイルの先頭に追加

import { useState } from 'react';
```

**Q3: データが古い**
```
原因: Next.js がキャッシュしている

解決:
await fetch('/api/data', {
  cache: 'no-store'  // ← キャッシュしない
});
```

**Q4: 画像が表示されない**
```
原因: 外部画像の設定漏れ

解決:
// next.config.ts
export default {
  images: {
    remotePatterns: [
      { hostname: 'example.com' }  // ← 許可する
    ]
  }
};
```

**Q5: 環境変数が undefined**
```
原因1: NEXT_PUBLIC_ を付け忘れ
→ クライアントコンポーネントで使うなら必要

原因2: 開発サーバーを再起動していない
→ .env.local 変更後は再起動必須
```

---

### 実践的なヒント

**💡 開発の流れ**

```
1. ページ構成を考える
   → どんなページが必要？
   → URL 構造は？

2. ディレクトリを作る
   → app/posts/page.tsx
   → app/posts/[id]/page.tsx

3. サーバーコンポーネントでデータ取得
   → async function でシンプルに

4. 必要な部分だけクライアントコンポーネント
   → ボタン、フォームなど

5. レイアウトで共通 UI を整理
   → ヘッダー、フッターなど
```

**💡 パフォーマンスチェックリスト**

```
✅ サーバーコンポーネントを優先
✅ 並列データ取得（Promise.all）
✅ 適切なキャッシュ戦略
✅ Image コンポーネントで画像最適化
✅ 動的 import で Code Splitting
✅ メタデータで SEO 対策
```

**💡 デバッグ方法**

```
// サーバーコンポーネント
console.log('サーバー');  // ← ターミナルに表示

// クライアントコンポーネント
'use client';
console.log('クライアント');  // ← ブラウザのコンソールに表示
```

---

### 次のステップ

この章で Next.js の基礎を学びました。次の章では **TypeScript** について学びます。

**なぜ TypeScript？**

```
Next.js プロジェクトの多くが TypeScript を使っています：

✅ 型安全性: バグを事前に防げる
✅ 補完: エディタが賢くなる
✅ ドキュメント: コードが自己説明的に
✅ リファクタリング: 安全に変更できる

本プロジェクト（BOLD 軽音サークル）も TypeScript を使用しています。
```

**Chapter 6 で学ぶこと：**

```
📖 TypeScript の基本文法
📖 型システムの理解
📖 インターフェースと型エイリアス
📖 ジェネリクス
📖 Next.js + TypeScript のパターン
```

---

### まとめの まとめ

```
Next.js = React フレームワーク
├─ App Router: ファイルベースルーティング
├─ Server Components: デフォルト、高速、SEO に強い
├─ Client Components: 'use client'、インタラクティブ
├─ Data Fetching: サーバーで async/await
├─ API Routes: route.ts でバックエンド API
├─ Optimization: Image, Metadata, Caching
└─ Next.js 16 + React 19: 最新の機能と改善

覚えておくこと:
1. サーバーコンポーネントが基本
2. 必要な部分だけクライアントコンポーネント
3. データはサーバーで取得
4. 適切なキャッシュ戦略
5. Next.js 16: Async Request APIs を使用
6. React 19: useOptimistic で楽観的UI
```

**🎉 お疲れ様でした！**

Next.js の基礎をマスターしました。次は TypeScript でさらにパワーアップしましょう！

---

[← 前の章：第4章 React入門](04-React入門.md) | [目次に戻る](00-目次.md) | [次の章へ：第6章 TypeScript入門 →](06-TypeScript入門.md)
