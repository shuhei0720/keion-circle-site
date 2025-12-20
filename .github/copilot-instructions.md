# 軽音サークル メンバーサイト - 開発ガイド

## プロジェクト概要

Next.js 16 + TypeScript で構築された軽音サークルのメンバー専用 Web サイトです。

## 実装済み機能

1. **認証システム**
   - NextAuth.js v5 による認証
   - Google OAuth ログイン（Google のメールアドレスと名前を自動登録）
   - メールアドレス + パスワードログイン（bcryptjs でハッシュ化）

2. **役割ベースアクセス制御**
   - 管理者（admin）: 投稿・スケジュールの作成/編集/削除
   - 一般メンバー（member）: 閲覧・参加・コメント

3. **投稿機能**
   - YouTube 動画の埋め込み表示
   - 管理者のみ作成・編集・削除
   - 公開アクセス可能（ログイン不要で閲覧）

4. **スケジュール調整**
   - 複数候補日の設定
   - メンバーの投票（参加可能/未定/参加不可）
   - コメント機能
   - 最有力候補の自動表示

5. **リアルタイムチャット**
   - Socket.io によるリアルタイムメッセージング

6. **レスポンシブ UI**
   - Tailwind CSS v4
   - Lucide React アイコン

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **認証**: NextAuth.js v5
- **データベース**: Prisma + PostgreSQL (本番) / SQLite (開発)
- **デプロイ**: Vercel

## ローカル開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定：

```env
AUTH_URL=http://localhost:3000
AUTH_SECRET=<ランダムな文字列>
AUTH_TRUST_HOST=true
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID=<Google Cloud Console で取得>
GOOGLE_CLIENT_SECRET=<Google Cloud Console で取得>
```

### 3. データベースの初期化

```bash
export DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma db push
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
```

### Google Cloud Console の設定

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

