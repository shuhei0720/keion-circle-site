# BOLD 軽音 メンバーサイト - 開発ガイド

## プロジェクト概要

Next.js 16 + TypeScript で構築された BOLD 軽音のメンバー専用 Web サイトです。

## 実装済み機能

1. **認証システム**
   - NextAuth.js v5 による認証
   - Google OAuth ログイン（Google のメールアドレス、名前、アバター画像を自動登録）
   - メールアドレス + パスワードログイン（bcryptjs でハッシュ化）

2. **役割ベースアクセス制御**
   - 管理者（admin）: 投稿・イベント・活動スケジュールの作成/編集/削除、ユーザー管理
   - 一般メンバー（member）: 閲覧・参加登録・いいね・コメント

3. **投稿機能（活動報告）**
   - YouTube 動画の複数埋め込み表示（/watch, /live/, /shorts/, /embed/, youtu.be）
   - 画像アップロード（Supabase Storage）
   - 管理者のみ作成・編集・削除
   - 公開アクセス可能（ログイン不要で閲覧）
   - 参加状況管理、いいね、コメント機能

4. **活動スケジュール**
   - スケジュール作成（日時、場所、内容）
   - 地図リンク設定
   - 参加者管理
   - 活動報告への変換（テンプレート機能）
   - コメント機能

5. **イベント管理**
   - イベント作成（日時、場所、課題曲）
   - 課題曲の詳細管理（楽譜URL、YouTube URL、パート割り当て）
   - 参加者管理
   - イベントからの活動報告作成（テンプレート機能）

6. **ユーザー管理**
   - プロフィール編集（アバター画像、自己紹介、担当楽器）
   - 管理者によるユーザー管理（役割変更）
   - ユーザー一覧・詳細ページ

7. **レスポンシブ UI**
   - Tailwind CSS v4
   - Lucide React アイコン
   - モバイルファーストデザイン
   - スケルトンスクリーン、エラーハンドリング

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS v4
- **認証**: NextAuth.js v5
- **データベース**: Prisma + PostgreSQL (本番: Supabase) / SQLite (開発)
- **ストレージ**: Supabase Storage (画像)
- **デプロイ**: Vercel

## ローカル開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成（`.env.example` をコピー）：

```bash
cp .env.example .env.local
```

以下を設定：

```env
AUTH_URL=http://localhost:3000
AUTH_SECRET=<ランダムな文字列>
AUTH_TRUST_HOST=true
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID=<Google Cloud Console で取得>
GOOGLE_CLIENT_SECRET=<Google Cloud Console で取得>
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

### 3. データベースの初期化

```bash
export DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma db push
```

### 4. 管理者ユーザーの作成

```bash
export DATABASE_URL="file:./dev.db"
node scripts/create-admin.js admin@example.com admin123 "管理者名"
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 本番環境（Vercel）のセットアップ

### 必要な環境変数

Vercel のダッシュボードで以下を設定：

```env
AUTH_URL=https://your-domain.vercel.app
AUTH_SECRET=<ランダムな文字列>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<AUTH_SECRETと同じ値>
DATABASE_URL=postgresql://user:password@host:port/database
GOOGLE_CLIENT_ID=<Google Cloud Console で取得>
GOOGLE_CLIENT_SECRET=<Google Cloud Console で取得>
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

### Google Cloud Console の設定

1. OAuth 2.0 クライアント ID を作成
2. 承認済みのリダイレクト URI に追加：
   - `http://localhost:3000/api/auth/callback/google`（開発）
   - `https://your-domain.vercel.app/api/auth/callback/google`（本番）
3. OAuth 同意画面を設定

### Supabase の設定

1. Project Settings → API で URL と Anon Key を取得
2. Storage → Create bucket で `avatars` バケットを作成（Public）

## 主要な変更点（最新アップデート）

1. **Google OAuth**: Google アカウントでログイン可能、メールアドレス、名前、アバター画像を自動登録
2. **複数 YouTube URL**: 1つの投稿に複数の YouTube 動画を添付可能
3. **アバター画像表示**: ユーザープロフィール画像を各ページに表示
4. **テンプレート機能**: イベント・活動スケジュールから投稿作成時にテンプレートを利用可能
5. **楽観的UI**: 投票、いいねなどが即座に画面に反映
6. **共通コンポーネント**: Markdown エディタ、Avatar、Button、Card、Modal コンポーネント

## データベーススキーマ管理

### 開発環境

```bash
# スキーマを変更したら
npx prisma generate
npx prisma db push
```

### 本番環境

Vercel のビルドコマンド `npm run build` で自動的に `prisma db push` が実行されます。

## 有用なコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# Prisma Studio でデータベース確認
npm run db:studio

# Prisma Client 再生成
npm run db:generate

# データベーススキーマ適用
npm run db:push
```

## プロジェクト構成

```
keion-circle-site/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # 共通コンポーネント
│   └── lib/          # ユーティリティ
├── prisma/           # データベーススキーマ
├── scripts/          # ユーティリティスクリプト
├── archive/          # 古いスクリプト・移行ファイル
└── public/           # 静的ファイル
```

1. OAuth 2.0 クライアント ID を作成
2. 承認済みのリダイレクト URI に追加：
   - `https://your-domain.vercel.app/api/auth/callback/google`
3. OAuth 同意画面を設定

## 主要な変更点（最新アップデート）

1. **Google OAuth**: Google アカウントでログイン可能、メールアドレスと名前を自動登録
2. **パスワード認証**: メールアドレスに加えてパスワードが必須
3. **管理者権限**: 投稿の作成・編集・削除、スケジュールの作成は管理者のみ
4. **複数候補日スケジュール**: 1つのスケジュールに複数の候補日を設定可能
5. **投票とコメント**: 各候補日に対して投票とコメントが可能
6. **最有力候補の表示**: 参加者が最も多い日を自動的にハイライト
7. **公開アクセス**: 投稿ページはログイン不要で閲覧可能


```bash
export DATABASE_URL="file:./dev.db"
node scripts/create-admin.js admin@example.com admin123 "管理者名"
```

### 5. 開発サーバーの起動

データベースの初期化が必要な場合：

```bash
export DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma db push
```

管理者ユーザーの作成：

```bash
export DATABASE_URL="file:./dev.db"
node scripts/create-admin.js admin@example.com password123 "管理者名"
```

### 主要な変更点（最新アップデート）

1. **パスワード認証**: メールアドレスに加えてパスワードが必須に
2. **管理者権限**: 投稿の作成・編集・削除、スケジュールの作成は管理者のみ
3. **複数候補日スケジュール**: 1つのスケジュールに複数の候補日を設定可能
4. **投票とコメント**: 各候補日に対して投票とコメントが可能
5. **最有力候補の表示**: 参加者が最も多い日を自動的にハイライト
6. **公開アクセス**: 投稿ページはログイン不要で閲覧可能

