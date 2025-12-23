# 付録A：用語集

> **この付録では、教科書に登場する技術用語を五十音順で解説します**

## 📚 この付録の目的

- ✅ 初心者が理解しやすいように用語を解説
- ✅ 関連用語もまとめて理解できる
- ✅ 必要に応じて参照できる辞書として活用

---

## 🔤 アルファベット

### API (Application Programming Interface)

アプリケーション同士が通信するための規約・仕様。

```
【例】
  フロントエンド（ブラウザ）
        ↓ HTTP リクエスト
  API（/api/posts）
        ↓ データベースアクセス
  データベース
        ↓ データ
  API
        ↓ JSON レスポンス
  フロントエンド
```

**関連用語**: REST API, GraphQL, API Route

### API Route

Next.js の機能で、`src/app/api/` ディレクトリ内にAPIエンドポイントを作成できる。

```typescript
// src/app/api/posts/route.ts
export async function GET() {
  const posts = await prisma.post.findMany()
  return NextResponse.json(posts)
}
```

### App Router

Next.js 13以降の新しいルーティングシステム。`src/app/` ディレクトリを使用。

```
src/app/
├─ page.tsx        → /
├─ posts/
│  └─ page.tsx     → /posts
└─ users/
   └─ [id]/
      └─ page.tsx  → /users/:id
```

**従来のPages Router** (`src/pages/`) から移行中。

### Auth（認証）

ユーザーが誰であるかを確認するプロセス。

- **Authentication（認証）**: ログイン、本人確認
- **Authorization（認可）**: 権限チェック、アクセス制御

```
認証: あなたは誰ですか？ → ログイン
認可: あなたは何ができますか？ → 管理者かメンバーか
```

### bcrypt

パスワードをハッシュ化するライブラリ。

```typescript
// パスワードをハッシュ化
const hashedPassword = await bcrypt.hash('password123', 10)
// → '$2a$10$...'

// パスワードを検証
const isValid = await bcrypt.compare('password123', hashedPassword)
// → true
```

**ソルト**: ハッシュ化の際にランダムな値を追加してセキュリティを強化。

### Client Component

`'use client'` ディレクティブを持つコンポーネント。ブラウザで実行される。

```typescript
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

- useState, useEffect などのHooksが使える
- イベントハンドラーが使える
- リアルタイムなインタラクションが必要な場合に使用

**対義語**: Server Component

### CORS (Cross-Origin Resource Sharing)

異なるドメイン間でのリソース共有を制御する仕組み。

```
ブラウザ（example.com）
  → API（api.example.com）
  
❌ デフォルトではブロックされる
✅ CORS設定で許可できる
```

### CRUD

データベース操作の4つの基本操作。

- **C**reate（作成）: POST
- **R**ead（読取）: GET
- **U**pdate（更新）: PUT/PATCH
- **D**elete（削除）: DELETE

### CSS (Cascading Style Sheets)

Webページのスタイルを定義する言語。

```css
.button {
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}
```

**このプロジェクトでは**: Tailwind CSS を使用

### Database（データベース）

データを保存・管理するシステム。

- **SQLite**: 軽量、ファイルベース、開発環境に適している
- **PostgreSQL**: 高機能、本番環境に適している
- **MySQL**: 広く使われている、Webアプリに適している

### Docker

アプリケーションをコンテナで実行する技術。

```bash
# イメージをビルド
docker build -t myapp .

# コンテナを起動
docker run -p 3000:3000 myapp
```

**メリット**: 環境の差異を吸収、開発環境の統一

### Environment Variable（環境変数）

設定値を外部から注入する仕組み。

```bash
# .env.local
DATABASE_URL="postgresql://..."
AUTH_SECRET="secret123"
```

```typescript
// コードから参照
const dbUrl = process.env.DATABASE_URL
```

**メリット**: 秘密情報をコードに含めない、環境ごとに設定を変更できる

### Git

バージョン管理システム。コードの変更履歴を管理。

```bash
git add .
git commit -m "機能を追加"
git push origin main
```

### GitHub

Gitリポジトリをホスティングするサービス。

- リポジトリ管理
- プルリクエスト
- Issue管理
- GitHub Actions（CI/CD）

### Hydration

サーバーで生成されたHTMLをクライアントで「生き返らせる」プロセス。

```
1. サーバーで HTML を生成
   <button>0</button>

2. ブラウザに送信

3. Hydration
   → JavaScript を実行
   → イベントハンドラーを追加
   → React のステートを初期化

4. インタラクティブに
   <button onClick={...}>0</button>
```

**Hydration Error**: サーバーとクライアントでHTMLが一致しない場合に発生。

### HTTP

Webで使われる通信プロトコル。

**HTTPメソッド**:
- GET: データの取得
- POST: データの作成
- PUT: データの完全な更新
- PATCH: データの部分的な更新
- DELETE: データの削除

**HTTPステータスコード**:
- 200 OK: 成功
- 201 Created: 作成成功
- 400 Bad Request: リクエストが不正
- 401 Unauthorized: 認証が必要
- 403 Forbidden: 権限がない
- 404 Not Found: リソースが見つからない
- 500 Internal Server Error: サーバーエラー

### JavaScript

Webブラウザで動作するプログラミング言語。

```javascript
const message = 'Hello, World!'
console.log(message)

function add(a, b) {
  return a + b
}

const result = add(1, 2)  // 3
```

**このプロジェクトでは**: TypeScript を使用（JavaScriptに型を追加）

### JSON (JavaScript Object Notation)

データを表現する形式。API のレスポンスなどで使用。

```json
{
  "id": "123",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "posts": [
    { "id": "1", "title": "投稿1" },
    { "id": "2", "title": "投稿2" }
  ]
}
```

### JWT (JSON Web Token)

認証情報を安全に送信するためのトークン形式。

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

↓ デコード

Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
Signature: (署名)
```

**メリット**: ステートレス、サーバーレス環境に適している

### Middleware

リクエストとレスポンスの間で実行される処理。

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  // 認証チェック
  const session = request.cookies.get('session')
  if (!session) {
    return NextResponse.redirect('/auth/signin')
  }
  return NextResponse.next()
}
```

### Next.js

React ベースのWebアプリケーションフレームワーク。

**主な機能**:
- サーバーサイドレンダリング（SSR）
- 静的サイト生成（SSG）
- API Routes
- ファイルベースルーティング
- 画像最適化

### Node.js

サーバーサイドで JavaScript を実行する環境。

```bash
node --version  # v20.x.x
npm --version   # 10.x.x
```

### npm (Node Package Manager)

JavaScript のパッケージ管理ツール。

```bash
npm install react  # パッケージをインストール
npm run dev        # スクリプトを実行
npm run build      # ビルド
```

### OAuth

外部サービスのアカウントでログインする仕組み。

```
1. ユーザーが「Googleでログイン」をクリック
2. Google の認証画面にリダイレクト
3. ユーザーがGoogle で認証
4. 認証コードが返ってくる
5. アクセストークンを取得
6. ユーザー情報を取得
7. ログイン完了
```

**このプロジェクトでは**: Google OAuth を使用

### ORM (Object-Relational Mapping)

オブジェクトとデータベースのテーブルを対応付ける技術。

```typescript
// Prisma（ORM）
const user = await prisma.user.findUnique({
  where: { id: '123' }
})

// ↓ SQL に変換される

SELECT * FROM users WHERE id = '123';
```

**このプロジェクトでは**: Prisma を使用

### Prisma

TypeScript/JavaScript 用の ORM。

**主な機能**:
- 型安全なデータベースアクセス
- マイグレーション管理
- Prisma Studio（GUI）

### React

UIを構築するための JavaScript ライブラリ。

```typescript
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>
}

<Greeting name="太郎" />
// → <h1>Hello, 太郎!</h1>
```

**主な特徴**:
- コンポーネントベース
- 仮想DOM
- 宣言的UI

### REST API

Webの標準的なAPI設計スタイル。

```
GET    /api/posts      → 一覧取得
GET    /api/posts/123  → 詳細取得
POST   /api/posts      → 作成
PATCH  /api/posts/123  → 更新
DELETE /api/posts/123  → 削除
```

### Server Component

`'use client'` ディレクティブを持たないコンポーネント。サーバーで実行される。

```typescript
// Server Component
export default async function Page() {
  const posts = await prisma.post.findMany()
  return <div>{posts.map(p => <div>{p.title}</div>)}</div>
}
```

- データベースに直接アクセスできる
- SEOに有利
- 初期表示が速い

**対義語**: Client Component

### SSR (Server-Side Rendering)

リクエストごとにサーバーで HTML を生成する方式。

```
リクエスト → サーバーで HTML 生成 → ブラウザに送信
```

**メリット**: SEO に有利、初期表示が速い

### Tailwind CSS

ユーティリティファーストの CSS フレームワーク。

```html
<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
  ボタン
</button>
```

**メリット**: HTMLを離れずにスタイリング、一貫性のあるデザイン

### TypeScript

JavaScript に型を追加した言語。

```typescript
// 型定義
interface User {
  id: string
  name: string
  email: string
}

// 型安全な関数
function greet(user: User): string {
  return `Hello, ${user.name}!`
}
```

**メリット**: 型エラーを事前に検出、コードの可読性向上

### Vercel

Next.js のホスティングサービス。

**主な機能**:
- 自動デプロイ
- プレビューデプロイ
- Edge Functions
- Analytics

---

## 🇯🇵 日本語（五十音順）

### いいね機能

ユーザーが投稿に「いいね」を付ける機能。

```typescript
// いいねを追加
await prisma.like.create({
  data: {
    postId: '123',
    userId: session.user.id
  }
})

// いいねを削除
await prisma.like.delete({
  where: {
    postId_userId: {
      postId: '123',
      userId: session.user.id
    }
  }
})
```

### 楽観的UI更新

APIのレスポンスを待たずに、先に画面を更新する手法。

```typescript
// 1. 先に画面を更新
setPosts(updatedPosts)

// 2. APIリクエスト
const res = await fetch('/api/posts/like', { method: 'POST' })

// 3. 失敗したら元に戻す
if (!res.ok) {
  fetchPosts()
}
```

**メリット**: ユーザー体験の向上、素早いレスポンス

### 環境変数

→ Environment Variable を参照

### コンポーネント

UI の部品。再利用可能な単位。

```typescript
// Button コンポーネント
function Button({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-blue-500 text-white px-4 py-2 rounded">
      {children}
    </button>
  )
}

// 使用
<Button onClick={() => alert('clicked')}>クリック</Button>
```

### コンポジション

小さなコンポーネントを組み合わせて大きなコンポーネントを作る設計手法。

```typescript
<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
  </CardHeader>
  <CardBody>
    内容
  </CardBody>
</Card>
```

### セッション

ユーザーのログイン状態を保持する仕組み。

```typescript
const { data: session } = useSession()

if (session) {
  console.log('ログイン中:', session.user.name)
} else {
  console.log('未ログイン')
}
```

### デプロイ

アプリケーションを本番環境に公開すること。

```bash
# Vercel にデプロイ
vercel deploy

# または Git プッシュで自動デプロイ
git push origin main
```

### 認証

→ Auth を参照

### パスワードハッシュ

パスワードを暗号化して保存する技術。

```
平文パスワード: password123
         ↓ bcrypt
ハッシュ: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

→ 元のパスワードに復元できない（一方向）
→ 同じパスワードでも異なるハッシュ（ソルト）
```

### フック (Hooks)

React の機能。関数コンポーネントでステートやライフサイクルを扱う。

```typescript
// useState: ステート管理
const [count, setCount] = useState(0)

// useEffect: 副作用の実行
useEffect(() => {
  fetchData()
}, [])

// useCallback: 関数のメモ化
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])

// useMemo: 計算結果のメモ化
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0)
}, [items])
```

### プロップス (Props)

コンポーネントに渡すパラメータ。

```typescript
interface ButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean
}

function Button({ text, onClick, disabled }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{text}</button>
}

<Button text="クリック" onClick={() => alert('clicked')} />
```

### ページネーション

大量のデータを複数ページに分割して表示する機能。

```typescript
const POSTS_PER_PAGE = 10
const currentPage = 1

const startIndex = (currentPage - 1) * POSTS_PER_PAGE
const endIndex = startIndex + POSTS_PER_PAGE
const paginatedPosts = posts.slice(startIndex, endIndex)

const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
```

### マイグレーション

データベーススキーマの変更を管理する仕組み。

```bash
# スキーマを変更
# prisma/schema.prisma を編集

# マイグレーションを作成
npx prisma migrate dev --name add_user_role

# マイグレーションを適用
npx prisma migrate deploy
```

### ミドルウェア

→ Middleware を参照

### ルーティング

URLとページの対応関係を定義すること。

```
/              → src/app/page.tsx
/posts         → src/app/posts/page.tsx
/posts/123     → src/app/posts/[id]/page.tsx
/users/456     → src/app/users/[id]/page.tsx
```

### レスポンシブデザイン

画面サイズに応じてレイアウトを変更するデザイン手法。

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- スマホ: 1列, タブレット: 2列, PC: 3列 -->
</div>
```

---

## まとめ

この付録では、教科書に登場する主要な技術用語を解説しました。

### 💡 用語を理解するコツ

1. **関連用語をまとめて覚える**
   - 例: 認証 → OAuth → JWT → セッション

2. **実際のコードと結びつける**
   - 例: API Route → `src/app/api/posts/route.ts`

3. **図を描いて理解する**
   - 例: 認証フロー、データフロー

4. **公式ドキュメントを参照する**
   - Next.js: https://nextjs.org/docs
   - React: https://react.dev/
   - Prisma: https://www.prisma.io/docs

---

[← 前の章：第28章 ライブラリとユーティリティの詳細解説](28-ライブラリとユーティリティの詳細解説.md) | [目次に戻る](00-目次.md) | [次の章へ：付録B よく使うコマンド →](付録B-よく使うコマンド.md)
