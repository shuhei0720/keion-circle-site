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

- [プロジェクト概要](#-プロジェクト概要)
- [主な機能](#-主な機能)
- [Webアプリの使い方](#-webアプリの使い方)
- [技術スタック](#-技術スタック)
- [セットアップ](#-セットアップ)
- [デプロイ](#-デプロイ)
- [プロジェクト構成](#-プロジェクト構成)
- [開発ガイド](#-開発ガイド)

---

## 🎯 プロジェクト概要

BOLD 軽音メンバーサイトは、軽音サークルメンバーのためのモダンなコミュニティプラットフォームです。活動報告の共有、イベント管理、スケジュール調整など、サークル活動に必要な機能を統合しています。

### ✨ 特徴

- 🚀 **高速**: Next.js 16 App Router による最適化されたパフォーマンス
- 📱 **レスポンシブ**: モバイルファーストデザインで全デバイスに対応
- 🔒 **セキュア**: NextAuth.js v5 による堅牢な認証システム
- 🎭 **役割管理**: 管理者と一般メンバーの権限分離
- ⚡ **リアルタイム**: 楽観的UI による即座のフィードバック

---

## 🚀 主な機能

### 1. 認証システム

- **Google OAuth 2.0**: Googleアカウントでワンクリックログイン
  - 名前、メールアドレス、アバター画像を自動登録
- **メールアドレス + パスワード**: bcryptjs による安全なハッシュ化
- **役割ベースアクセス制御**:
  - 🔑 **管理者（admin）**: 投稿・イベント・スケジュールの作成/編集/削除、ユーザー管理
  - 👤 **一般メンバー（member）**: 閲覧・参加登録・いいね・コメント

### 2. 活動報告（投稿機能）

**管理者のみ作成可能**

- ✅ **複数YouTube動画の埋め込み**: 1つの投稿に複数の動画を添付
  - 対応フォーマット: `/watch`, `/live/`, `/shorts/`, `/embed/`, `youtu.be`
- ✅ **画像アップロード**: Supabase Storage による画像管理
- ✅ **Markdown対応**: 見出し、リスト、太字などの装飾
- ✅ **参加状況管理**: メンバーが「参加」「不参加」を登録
- ✅ **いいね機能**: 楽観的UI による即座の反映
- ✅ **コメント機能**: 活動へのフィードバック投稿
- ✅ **公開アクセス**: ログイン不要で閲覧可能（外部共有に便利）

### 3. イベント管理

**管理者のみ作成可能**

- 📅 **イベント作成**: 日時、場所、内容の設定
- 🎵 **課題曲管理**: 各イベントに課題曲を複数設定可能
  - 曲名、楽譜URL、YouTube動画URL
  - パート別の担当者割り当て（ボーカル、ギター、ベース、ドラム、キーボード）
- 👥 **参加者管理**: メンバーの参加状況を記録
- 📝 **活動報告への変換**: イベント情報をテンプレートとして活動報告を作成
  - イベント詳細、課題曲、参加者リストを自動挿入

### 4. 活動スケジュール

**管理者のみ作成可能**

- 📆 **スケジュール作成**: 日時、場所、内容の設定
- 🗺️ **地図リンク**: Google Mapsなどの場所URLを設定可能
- 👥 **参加者管理**: メンバーの参加状況を記録
- 📝 **活動報告への変換**: スケジュール情報をテンプレートとして活動報告を作成

### 5. 調整さん風スケジュール投票

**管理者のみ作成可能、全メンバーが投票可能**

- 📊 **複数候補日の設定**: 最大10個の候補日を設定
- 🗳️ **3段階投票**:
  - ⭕ **参加可能**: 緑色で表示
  - 🔺 **未定**: 黄色で表示
  - ❌ **参加不可**: 赤色で表示
- 🏆 **最有力候補の自動表示**: 参加可能人数が最も多い日を自動選出
- 💬 **候補日ごとのコメント**: 各日程にコメント可能
- ⚡ **楽観的UI**: 投票結果が即座に画面に反映
- 👥 **参加者一覧**: 各候補日の参加者を色分けで表示

### 6. ユーザープロフィール

- 🖼️ **アバター画像**: Supabase Storage による画像管理
- ✏️ **自己紹介**: プロフィール情報の編集
- 🎸 **担当楽器**: 楽器情報の登録
- 📊 **活動履歴**: 参加した活動の一覧表示

### 7. ユーザー管理（管理者のみ）

- 👥 **メンバー一覧**: 全ユーザーの表示
- 🔄 **役割変更**: 一般メンバー ↔ 管理者の切り替え
- 📊 **活動統計**: 各ユーザーの参加回数などを表示

---

## 📱 Webアプリの使い方

### 初回ログイン

#### Google アカウントでログイン（推奨）

1. トップページの **「Googleでログイン」** ボタンをクリック
2. Googleアカウントを選択
3. 初回ログイン時、ユーザー情報が自動登録されます
   - 名前、メールアドレス、アバター画像が自動設定
4. ダッシュボードに自動遷移

#### メールアドレスとパスワードでログイン

1. トップページの **「新規登録」** をクリック
2. メールアドレス、パスワード、名前を入力
3. **「登録」** ボタンをクリック
4. 次回からは **「ログイン」** から入力してログイン

---

### 一般メンバーができること

#### 1. ホーム画面

- 最新の投稿（活動報告）を閲覧
- YouTube動画の視聴
- いいねボタンのクリック
- コメントの投稿

#### 2. 活動一覧ページ（`/posts`）

- 全ての活動報告を時系列で表示
- **参加登録**:
  1. 各投稿の **「参加する」** ボタンをクリック
  2. 「参加」または「不参加」を選択
  3. 参加者リストに自分の名前が表示される
- **いいね**:
  - ❤️ アイコンをクリックでいいね
  - もう一度クリックでいいね解除
- **コメント**:
  1. コメント入力欄にテキストを入力
  2. **「送信」** ボタンをクリック
  3. 自分のコメントは右上の削除ボタンで削除可能

#### 3. イベントページ（`/events`）

- イベント一覧を閲覧
- 課題曲の確認
  - YouTube動画の視聴
  - 楽譜リンクのクリック
  - パート割り当ての確認
- イベントに紐づく活動報告の閲覧

#### 4. 活動スケジュールページ（`/activity-schedules`）

- スケジュール一覧を閲覧
- 日時、場所の確認
- 地図リンクのクリック
- スケジュールに紐づく活動報告の閲覧

#### 5. スケジュール調整ページ（`/schedules`）

- **投票**:
  1. 各候補日の自分の列を確認
  2. ⭕（参加可能）、🔺（未定）、❌（参加不可）のいずれかをクリック
  3. 色がすぐに変わり、投票完了
- **コメント**:
  1. 候補日の下のコメント入力欄にテキストを入力
  2. **「送信」** ボタンをクリック
  3. 自分のコメントは削除ボタンで削除可能
- **最有力候補の確認**:
  - 「🏆 最有力候補」のラベルが付いた日程を確認

#### 6. プロフィール編集（`/profile`）

1. 右上のユーザーアイコン → **「プロフィール」** をクリック
2. 編集可能な項目:
   - **アバター画像**: 「画像を選択」ボタンから画像をアップロード
   - **名前**: テキスト入力
   - **メールアドレス**: テキスト入力（変更不可の場合あり）
   - **自己紹介**: テキストエリアに入力
   - **担当楽器**: テキスト入力
3. **「保存」** ボタンをクリックで変更を保存

---

### 管理者ができること（上記に加えて）

#### 1. 活動報告の作成（`/posts`）

1. **「新規投稿」** ボタンをクリック
2. 以下を入力:
   - **タイトル**: 活動のタイトル
   - **内容**: Markdown形式で本文を入力
     - 見出し: `# 見出し`
     - 太字: `**太字**`
     - リスト: `- 項目`
   - **YouTube URL**: 動画URLを入力（複数可）
     - 「URLを追加」ボタンで追加フィールド表示
     - 「削除」ボタンで不要なフィールドを削除
   - **画像**: 「画像を選択」ボタンから画像をアップロード
3. **「投稿」** ボタンをクリック

**編集・削除**:
- 各投稿の右上の ✏️ アイコン: 編集ページへ
- 各投稿の右上の 🗑️ アイコン: 削除（確認ダイアログ表示）

#### 2. イベントの作成（`/events`）

1. **「新規イベント」** ボタンをクリック
2. 基本情報を入力:
   - **タイトル**: イベント名
   - **内容**: イベントの詳細説明
   - **日時**: 日付と時刻を選択
   - **場所**: 場所名を入力
   - **場所URL**: Google Mapsのリンクなど
3. 課題曲を追加（オプション）:
   - **「課題曲を追加」** ボタンをクリック
   - 各課題曲の情報を入力:
     - 曲名
     - 楽譜URL
     - YouTube URL
     - パート割り当て: ドロップダウンからメンバーを選択
4. **「作成」** ボタンをクリック

**活動報告への変換**:
- 各イベントの **「活動報告を作成」** ボタンをクリック
- テンプレート付きの投稿作成ページに遷移

#### 3. 活動スケジュールの作成（`/activity-schedules`）

1. **「新規スケジュール」** ボタンをクリック
2. 以下を入力:
   - **タイトル**: スケジュール名
   - **内容**: 詳細説明
   - **日時**: 日付と時刻を選択
   - **場所**: 場所名を入力
   - **場所URL**: Google Mapsのリンクなど
3. **「作成」** ボタンをクリック

**活動報告への変換**:
- 各スケジュールの **「活動報告を作成」** ボタンをクリック
- テンプレート付きの投稿作成ページに遷移

#### 4. スケジュール調整の作成（`/schedules`）

1. **「新規スケジュール」** ボタンをクリック
2. 以下を入力:
   - **タイトル**: スケジュール名（例: 「12月の練習日程調整」）
   - **説明**: 詳細説明（オプション）
   - **候補日**: 日付と時刻を複数入力
     - 「候補日を追加」ボタンで追加
     - 「削除」ボタンで不要な候補日を削除
3. **「作成」** ボタンをクリック

#### 5. ユーザー管理（`/users`）

1. 右上のメニュー → **「ユーザー管理」** をクリック
2. 全メンバーの一覧を表示
3. 各ユーザーの操作:
   - **役割変更**: 「管理者にする」または「メンバーにする」ボタンをクリック
   - **プロフィール閲覧**: ユーザー名をクリック

---

## 🛠 技術スタック

### フロントエンド

- **Next.js 16**: App Router、Server Components、Server Actions
- **React 19**: 最新の React 機能
- **TypeScript 5**: 型安全な開発
- **Tailwind CSS v4**: ユーティリティファーストCSS
- **Lucide React**: アイコンライブラリ
- **react-youtube**: YouTube動画埋め込み

### バックエンド

- **Next.js API Routes**: RESTful API
- **Prisma 5.22**: ORM（Object-Relational Mapping）
- **PostgreSQL**: 本番環境データベース（Supabase）
- **SQLite**: ローカル開発環境データベース

### 認証

- **NextAuth.js v5**: 認証フレームワーク
- **Google OAuth 2.0**: ソーシャルログイン
- **bcryptjs**: パスワードハッシュ化

### ストレージ

- **Supabase Storage**: 画像ファイルの保存
  - アバター画像
  - 活動報告の添付画像

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

`.env.local` ファイルを作成（`.env.example` をコピー）：

```bash
cp .env.example .env.local
```

以下を設定：

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
3. Storage → Create bucket で `avatars` バケットを作成（Public に設定）

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

#### 1. GitHub リポジトリにプッシュ

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Vercel でプロジェクトをインポート

1. [Vercel](https://vercel.com/) にログイン
2. 「New Project」から GitHub リポジトリを選択
3. デフォルト設定のまま「Deploy」をクリック

#### 3. 環境変数の設定

Vercel ダッシュボード → Settings → Environment Variables で以下を設定：

```env
# 認証設定
AUTH_URL=https://your-domain.vercel.app
AUTH_SECRET=your-secret-key
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key

# データベース（Supabase PostgreSQL）
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 4. Supabase データベースの設定

1. Supabase Dashboard → Project Settings → Database
2. **Connection string** → **URI** をコピー
3. `[YOUR-PASSWORD]` を実際のデータベースパスワードに置き換え
4. Vercel の `DATABASE_URL` に設定

#### 5. 再デプロイ

環境変数を設定したら、Vercel で再デプロイを実行：

1. Deployments タブ → 最新のデプロイの「...」メニュー
2. 「Redeploy」をクリック

#### 6. 管理者ユーザーの作成（初回のみ）

ローカルで管理者を作成してから `prisma db push` でデプロイするか、Supabase SQL Editor で直接実行：

```sql
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt")
VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@example.com',
  -- bcryptjsでハッシュ化したパスワード
  '$2a$10$...',
  '管理者',
  'admin',
  NOW()
);
```

---

## 📁 プロジェクト構成

```
keion-circle-site/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/             # NextAuth.js 認証
│   │   │   ├── posts/            # 投稿API
│   │   │   ├── schedules/        # スケジュール調整API
│   │   │   ├── activity-schedules/ # 活動スケジュールAPI
│   │   │   ├── events/           # イベントAPI
│   │   │   ├── users/            # ユーザーAPI
│   │   │   └── templates/        # テンプレートAPI
│   │   ├── posts/                # 活動一覧ページ
│   │   ├── schedules/            # スケジュール調整ページ
│   │   ├── activity-schedules/   # 活動スケジュールページ
│   │   ├── events/               # イベントページ
│   │   ├── users/                # ユーザー管理ページ
│   │   ├── profile/              # プロフィールページ
│   │   ├── auth/                 # ログイン・サインアップページ
│   │   └── page.tsx              # ホームページ
│   ├── components/               # 共通コンポーネント
│   │   ├── DashboardLayout.tsx   # ダッシュボードレイアウト
│   │   ├── Navigation.tsx        # ナビゲーションバー
│   │   ├── LoginForm.tsx         # ログインフォーム
│   │   └── RichTextEditor.tsx    # Markdownエディタ
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
├── package.json                  # 依存関係・スクリプト
├── tsconfig.json                 # TypeScript設定
└── README.md                     # このファイル
```

---

## 👨‍💻 開発ガイド

### 有用なコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lintチェック
npm run lint

# Prisma Studio でデータベース確認
npm run db:studio

# Prisma Client 再生成
npm run db:generate

# データベーススキーマ適用
npm run db:push
```

### データベーススキーマの変更

1. `prisma/schema.prisma` を編集
2. 開発環境に反映:

```bash
export DATABASE_URL="file:./dev.db"
npx prisma db push
npx prisma generate
```

3. 本番環境: Vercel で自動的に `npm run build` が実行され、スキーマが適用されます

### デバッグ

```bash
# Prisma Studio でデータを視覚的に確認・編集
npx prisma studio
```

ブラウザで http://localhost:5555 が開き、データベースの内容を確認できます。

---

## 🔐 セキュリティ

- ✅ **環境変数**: `.env.local` は Git に含めない（`.gitignore` 設定済み）
- ✅ **パスワード**: bcryptjs による安全なハッシュ化
- ✅ **認証**: NextAuth.js v5 による堅牢な認証
- ✅ **CORS**: Next.js の標準セキュリティ設定
- ✅ **SQLインジェクション**: Prisma による自動防止
- ✅ **画像アップロード**: Supabase Storage による安全な管理

---

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。

---

## 🤝 コントリビューション

プルリクエストを歓迎します！バグ報告や機能リクエストは Issues にお願いします。

---

## 📞 お問い合わせ

質問や提案がある場合は、GitHub Issues を作成してください。

---

<div align="center">

**Built with ❤️ by BOLD 軽音**

© 2025 BOLD 軽音. All rights reserved.

</div>
