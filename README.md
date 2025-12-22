<div align="center">

# 🎸 BOLD 軽音 メンバーサイト

**Next.js 16 + TypeScript で構築された軽音サークルメンバー専用コミュニティプラットフォーム**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[🌐 本番環境](https://keion-circle-site.vercel.app/)

</div>

---

## 📋 目次

- [プロジェクト概要](#プロジェクト概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [デプロイ](#デプロイ)
- [プロジェクト構成](#プロジェクト構成)
- [開発ガイド](#開発ガイド)

---

## 🎯 プロジェクト概要

BOLD 軽音メンバーサイトは、軽音サークルメンバーのためのモダンなコミュニティプラットフォームです。
活動報告、スケジュール調整、リアルタイムチャットなど、サークル活動に必要な機能を統合しています。

### ✨ 特徴

- 🚀 **高速**: Next.js 16 App Router による最適化されたパフォーマンス
- 📱 **レスポンシブ**: モバイルファーストデザインで全デバイスに対応
- 🔒 **セキュア**: NextAuth.js v5 による堅牢な認証システム
- 🎭 **役割管理**: 管理者と一般メンバーの権限分離
- ⚡ **リアルタイム**: 楽観的UI による即座のフィードバック

---

## 🚀 主な機能

### 1. 認証システム

- **Google OAuth 2.0**: ワンクリックログイン（名前・メール・アバター自動登録）
- **メールアドレス + パスワード**: bcryptjs による安全なハッシュ化
- **役割ベースアクセス制御**:
  - 管理者（admin）: 投稿・スケジュールの作成/編集/削除
  - 一般メンバー（member）: 閲覧・参加・コメント

### 2. 活動報告（投稿機能）

- **YouTube 動画埋め込み**: 複数の動画を投稿に添付可能
  - 対応フォーマット: `/watch`, `/live/`, `/shorts/`, `/embed/`, `youtu.be`
- **画像アップロード**: Supabase Storage による画像管理（最大10MB）
- **参加状況管理**: メンバーの参加/不参加登録
- **いいね機能**: 楽観的UI による即座の反映
- **コメント機能**: 活動へのコメント投稿
- **公開アクセス**: ログイン不要で閲覧可能

### 3. スケジュール調整

- **複数候補日の投票**:
  - ○ 参加可能
  - △ 未定
  - × 参加不可
- **最有力候補の自動表示**: 参加者数に基づく自動選出
- **コメント機能**: 各候補日にコメント可能
- **楽観的UI**: 投票が即座に画面に反映

### 4. イベント管理

- **イベントからの活動報告作成**: テンプレート機能でスムーズに報告作成
- **参加者管理**: イベントへの参加状況を記録

### 5. ユーザープロフィール

- **アバター画像**: Supabase Storage による画像管理
- **自己紹介**: プロフィール情報の編集
- **担当楽器**: 楽器情報の登録
- **活動履歴**: 参加した活動の一覧表示

### 6. リアルタイムチャット

- **Socket.io**: リアルタイムメッセージング（開発中）

---

## 🛠 技術スタック

### フロントエンド

- **Next.js 16**: App Router、Server Components、Server Actions
- **React 19**: 最新の React 機能
- **TypeScript 5**: 型安全な開発
- **Tailwind CSS v4**: ユーティリティファーストCSS
- **Lucide React**: アイコンライブラリ

### バックエンド

- **Next.js API Routes**: RESTful API
- **Prisma**: ORM（Object-Relational Mapping）
- **PostgreSQL**: 本番環境データベース（Supabase）
- **SQLite**: ローカル開発環境データベース

### 認証

- **NextAuth.js v5**: 認証フレームワーク
- **Google OAuth 2.0**: ソーシャルログイン
- **bcryptjs**: パスワードハッシュ化

### インフラ

- **Vercel**: ホスティング・CI/CD
- **Supabase**: データベース・ストレージ
- **GitHub**: バージョン管理

---

## 📦 セットアップ

### 前提条件

- Node.js 20.x 以上
- npm または yarn
- Git

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/keion-circle-site.git
cd keion-circle-site
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定：

```env
# 認証設定
AUTH_URL=http://localhost:3000
AUTH_SECRET=your-secret-key-change-this-in-production
AUTH_TRUST_HOST=true

# NextAuth v5用（本番環境でも同じ値）
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# データベース設定（ローカル開発はSQLite）
DATABASE_URL="file:./dev.db"

# Google OAuth認証（Google Cloud Consoleで取得）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase設定（Storage用）
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 環境変数の取得方法

**Google Cloud Console**:
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「認証情報」
4. 「認証情報を作成」→「OAuth 2.0 クライアント ID」
5. 承認済みのリダイレクト URI に追加:
   - `http://localhost:3000/api/auth/callback/google`（開発環境）
   - `https://your-domain.vercel.app/api/auth/callback/google`（本番環境）

**Supabase**:
1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. Project Settings → API で以下を取得:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key
3. Storage → Create bucket で `avatars` バケットを作成（Public）

### 4. データベースの初期化

```bash
export DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma db push
```

### 5. 管理者ユーザーの作成

```bash
export DATABASE_URL="file:./dev.db"
node scripts/create-admin.js admin@example.com password123 "管理者名"
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

---

## 🚀 デプロイ

### Vercel へのデプロイ

1. **GitHub リポジトリにプッシュ**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Vercel でプロジェクトをインポート**
   - [Vercel](https://vercel.com/) にログイン
   - 「New Project」から GitHub リポジトリを選択

3. **環境変数の設定**

Vercel のダッシュボードで以下を設定：

```env
# 認証設定
AUTH_URL=https://your-domain.vercel.app
AUTH_SECRET=your-secret-key
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key

# データベース（Supabase PostgreSQL）
DATABASE_URL=postgresql://user:password@host:port/database

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Supabase データベースの設定**
   - Supabase Dashboard → Project Settings → Database
   - Connection string → URI をコピー
   - `[YOUR-PASSWORD]` を実際のパスワードに置き換え
   - Vercel の `DATABASE_URL` に設定

5. **デプロイ**
   - Vercel が自動的にビルドとデプロイを実行

6. **管理者ユーザーの作成**（初回のみ）
   - Supabase SQL Editor で実行:

```sql
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt")
VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@example.com',
  '$2a$10$your-hashed-password',
  '管理者',
  'admin',
  NOW()
);
```

または、ローカルで作成してから `prisma db push` でデプロイ。

---

## 📁 プロジェクト構成

```
keion-circle-site/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/             # NextAuth.js
│   │   │   ├── posts/            # 投稿API
│   │   │   ├── schedules/        # スケジュールAPI
│   │   │   ├── events/           # イベントAPI
│   │   │   ├── users/            # ユーザーAPI
│   │   │   └── templates/        # テンプレートAPI
│   │   ├── posts/                # 活動一覧ページ
│   │   ├── schedules/            # スケジュールページ
│   │   ├── activity-schedules/   # 活動スケジュールページ
│   │   ├── events/               # イベントページ
│   │   ├── users/                # ユーザー管理ページ
│   │   ├── profile/              # プロフィールページ
│   │   └── page.tsx              # ホームページ
│   ├── components/               # 共通コンポーネント
│   │   ├── DashboardLayout.tsx   # レイアウト
│   │   ├── Navigation.tsx        # ナビゲーション
│   │   ├── LoginForm.tsx         # ログインフォーム
│   │   └── RichTextEditor.tsx    # リッチテキストエディタ
│   └── lib/                      # ユーティリティ
│       ├── auth.ts               # NextAuth設定
│       ├── prisma.ts             # Prismaクライアント
│       ├── permissions.ts        # 権限チェック
│       └── supabase.ts           # Supabaseクライアント
├── prisma/
│   └── schema.prisma             # データベーススキーマ
├── scripts/
│   ├── create-admin.js           # 管理者作成スクリプト
│   └── create-admin-simple.js    # 簡易管理者作成
├── archive/                      # 古いスクリプト・移行ファイル
├── public/                       # 静的ファイル
├── .env.example                  # 環境変数テンプレート
├── next.config.ts                # Next.js設定
├── package.json                  # 依存関係
├── tsconfig.json                 # TypeScript設定
└── README.md                     # このファイル
```

---

## 👨‍💻 開発ガイド

### データベーススキーマの変更

```bash
# スキーマを編集
vim prisma/schema.prisma

# 開発環境に反映
export DATABASE_URL="file:./dev.db"
npx prisma db push

# Prisma Clientを再生成
npx prisma generate
```

### 本番環境へのスキーマ変更の適用

```bash
# Vercelで自動実行されるビルドコマンド
npm run build  # prisma db push が含まれる
```

### コードスタイル

- **ESLint**: コード品質チェック
- **TypeScript strict モード**: 型安全性の確保
- **Prettier**: コードフォーマット（推奨）

```bash
# Lintチェック
npm run lint
```

### デバッグ

```bash
# Prisma Studio でデータベースを確認
npx prisma studio
```

---

## 🔐 セキュリティ

- **環境変数**: `.env.local` は Git に含めない（`.gitignore` 設定済み）
- **パスワード**: bcryptjs による安全なハッシュ化
- **認証**: NextAuth.js v5 による堅牢な認証
- **CORS**: Next.js の標準セキュリティ設定
- **SQL インジェクション**: Prisma による防止

---

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。

---

## 🤝 コントリビューション

プルリクエストを歓迎します！バグ報告や機能リクエストは Issues にお願いします。

---

## 📞 お問い合わせ

質問や提案がある場合は、Issues を作成してください。

---

<div align="center">

**Built with ❤️ by BOLD 軽音**

© 2025 BOLD 軽音. All rights reserved.

</div>
