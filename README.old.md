<div align="center">

# 🎸 BOLD 軽音 メンバーサイト

**Next.js 16 + TypeScript による軽音サークル専用コミュニティプラットフォーム**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[🌐 本番環境](https://keion-circle-site.vercel.app/)

</div>

---

## 📋 目次

- [プロジェクト概要](#-プロジェクト概要)
- [技術スタック](#-技術スタック)
- [機能一覧](#-機能一覧)
- [開発ガイド](#-開発ガイド)
- [テスト](#-テスト)
- [CI/CD](#-cicd-パイプライン)
- [API仕様](#-api仕様)

---

## 🎯 プロジェクト概要

BOLD 軽音メンバーサイトは、軽音サークルの活動を支援するモダンなWebアプリケーションです。活動報告の共有、イベント管理、スケジュール調整など、サークル活動に必要な機能を統合し、メンバー間のコミュニケーションを円滑にします。

### 主要な特徴

- 🚀 **高速**: Next.js 16 App Router による最適化されたパフォーマンス
- 📱 **レスポンシブ**: モバイルファーストデザインで全デバイスに対応
- � **PWA対応**: ホーム画面に追加してアプリのように利用可能
- �🔒 **セキュア**: NextAuth.js v5 による堅牢な認証システム
- 🎭 **役割管理**: 管理者と一般メンバーの権限分離
- ⚡ **リアルタイム**: 楽観的UI による即座のフィードバック
- 🎥 **メディア対応**: YouTube動画埋め込みと画像アップロード
- 📊 **統計表示**: 参加状況やいいね数の可視化

---

## ✨ 機能一覧

### 1️⃣ 認証システム

**機能詳細:**
- **Google OAuth 2.0**: ワンクリックログイン（名前、メールアドレス、アバター画像を自動登録）
- **メールアドレス + パスワード**: bcryptjsによる安全なハッシュ化
- **役割ベースアクセス制御**:
  - 🔑 **管理者（admin）**: 全機能へのアクセス、コンテンツの作成・編集・削除
  - 👤 **一般メンバー（member）**: 閲覧、参加登録、いいね、コメント

### 2️⃣ 活動報告（投稿機能）

**管理者のみ作成可能 | 公開アクセス可能（ログイン不要で閲覧）**

- ✅ **Markdown対応**: リッチテキスト編集（見出し、リスト、太字、リンク）
- ✅ **複数YouTube動画**: 1つの投稿に複数動画を埋め込み
  - 対応フォーマット: `/watch`, `/live/`, `/shorts/`, `/embed/`, `youtu.be`
- ✅ **画像アップロード**: Supabase Storageによる画像管理（複数枚対応）
- ✅ **参加状況管理**: メンバーが「参加」「不参加」を登録
- ✅ **いいね機能**: 楽観的UIによる即座の反映（トグル式）
- ✅ **コメント機能**: ネストなしシンプルコメント
- ✅ **イベント/スケジュールからの自動生成**: テンプレート機能でワンクリック作成

### 3️⃣ イベント管理

**管理者のみ作成可能 | メンバー全員が閲覧・参加可能**

**機能詳細:**
- 📅 **イベント作成**: 日時、場所、内容の設定
- 🎵 **課題曲管理**: 
  - 曲名、楽譜URL、YouTube動画URL
  - パート別の担当者割り当て（ボーカル、ギター、ベース、ドラム、キーボード）
- 👥 **参加者管理**: メンバーの参加状況を記録
- 💬 **コメント機能**: イベントに対するフィードバック
- 📝 **活動報告への変換**: イベント情報をテンプレートとして活動報告を作成
  - イベント詳細、課題曲リスト、参加者リストを自動挿入

### 4️⃣ 活動スケジュール

**管理者のみ作成可能 | メンバー全員が閲覧・参加可能**

- 📆 **スケジュール作成**: 日時、場所、内容の設定
- 🗺️ **地図リンク**: Google Mapsなどの場所URLを設定可能
- 👥 **参加者管理**: メンバーの参加状況を記録
- 💬 **コメント機能**: スケジュールに対するコメント投稿
- 📝 **活動報告への変換**: スケジュール情報をテンプレートとして活動報告を作成

### 5️⃣ ユーザープロフィール

- 🖼️ **アバター画像**: Supabase Storageによる画像管理
- ✏️ **自己紹介**: プロフィール情報の編集
- 🎸 **担当楽器**: 楽器情報の登録
- 📊 **活動履歴**: 参加した活動の一覧表示

### 6️⃣ ユーザー管理（管理者のみ）

- 👥 **メンバー一覧**: 全ユーザーの表示
- 🔄 **役割変更**: 一般メンバー ↔ 管理者の切り替え
- 📊 **活動統計**: 各ユーザーの参加回数などを表示

---

## 🛠 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.1 | App Router、Server Components、Server Actions |
| React | 19 | UI構築 |
| TypeScript | 5.0 | 型安全な開発 |
| Tailwind CSS | 4.0 | ユーティリティファーストCSS |
| Lucide React | latest | アイコンライブラリ |
| react-youtube | latest | YouTube動画埋め込み |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js API Routes | 16.1 | RESTful API |
| Prisma | 5.22 | ORM（Object-Relational Mapping） |
| PostgreSQL | latest | 本番環境データベース（Supabase） |
| SQLite | latest | ローカル開発環境データベース |

### 認証

| 技術 | バージョン | 用途 |
|------|-----------|------|
| NextAuth.js | v5 | 認証フレームワーク |
| Google OAuth 2.0 | - | ソーシャルログイン |
| bcryptjs | latest | パスワードハッシュ化 |

### インフラ

| サービス | 用途 |
|---------|------|
| Vercel | ホスティング・CI/CD |
| Supabase | データベース・ストレージ |
| GitHub | バージョン管理 |

---

## 🔌 API仕様

### 📊 APIサマリー

- **総エンドポイント数**: 35
- **公開アクセス可能**: 6（認証不要）
- **メンバー権限**: 19（member/admin）
- **管理者専用**: 10（admin）
- **HTTPメソッド**: GET (8), POST (20), PUT (4), PATCH (2), DELETE (5)

###  API エンドポイント一覧

#### 投稿 (Posts) - `/api/posts`

| メソッド | エンドポイント | 認証 | 権限 | 説明 |
|---------|--------------|------|------|------|
| GET | `/api/posts` | 不要 | public | 投稿一覧を取得（最新50件） |
| POST | `/api/posts` | 必須 | admin | 新規投稿を作成 |
| GET | `/api/posts/[id]` | 不要 | public | 特定の投稿を取得 |
| PUT | `/api/posts/[id]` | 必須 | admin | 投稿を更新 |
| DELETE | `/api/posts/[id]` | 必須 | admin | 投稿を削除 |
| GET | `/api/posts/[id]/details` | 不要 | public | 投稿詳細（コメント含む） |
| POST | `/api/posts/[id]/comments` | 必須 | member/admin | コメントを投稿 |
| POST | `/api/posts/[id]/like` | 必須 | member/admin | いいねを登録・削除（トグル） |
| DELETE | `/api/posts/[id]/like` | 必須 | member/admin | いいねを削除 |
| POST | `/api/posts/[id]/participate` | 必須 | member/admin | 参加/不参加を登録 |
| DELETE | `/api/posts/[id]/participate` | 必須 | member/admin | 参加をキャンセル |
| POST | `/api/posts/image` | 必須 | member/admin | 画像をアップロード（Base64） |

**リクエスト例: POST `/api/posts`**
```json
{
  "title": "2025年12月 第1回セッション",
  "content": "# 今回の内容\n- ギター練習\n- ドラム練習",
  "youtubeUrls": [
    "https://www.youtube.com/watch?v=xxxxx",
    "https://youtu.be/yyyyy"
  ],
  "images": [
    "https://supabase.co/storage/v1/object/public/avatars/image1.jpg"
  ]
}
```

**レスポンス例: GET `/api/posts`**
```json
[
  {
    "id": "clx123abc",
    "title": "2025年12月 第1回セッション",
    "content": "# 今回の内容\n- ギター練習",
    "youtubeUrls": ["https://www.youtube.com/watch?v=xxxxx"],
    "images": ["https://supabase.co/storage/..."],
    "createdAt": "2025-12-23T10:00:00Z",
    "userId": "user123",
    "user": {
      "id": "user123",
      "name": "山田太郎",
      "email": "yamada@example.com",
      "avatarUrl": "https://..."
    },
    "participants": [
      {
        "id": "part123",
        "status": "participating",
        "user": { "id": "user456", "name": "佐藤花子" }
      }
    ],
    "likes": [
      { "userId": "user789", "createdAt": "2025-12-23T11:00:00Z" }
    ],
    "_count": { "comments": 5 }
  }
]
```

#### イベント (Events) - `/api/events`

| メソッド | エンドポイント | 認証 | 権限 | 説明 |
|---------|--------------|------|------|------|
| GET | `/api/events` | 必須 | member/admin | イベント一覧を取得 |
| POST | `/api/events` | 必須 | admin | イベントを作成 |
| PUT | `/api/events/[id]` | 必須 | admin | イベントを更新 |
| DELETE | `/api/events/[id]` | 必須 | admin | イベントを削除 |
| POST | `/api/events/[id]/comments` | 必須 | member/admin | コメントを投稿 |
| POST | `/api/events/[id]/participate` | 必須 | member/admin | 参加登録/解除（トグル） |
| POST | `/api/events/[id]/report` | 必須 | admin | 活動報告を作成 |

**リクエスト例: POST `/api/events`**
```json
{
  "title": "新年ライブ2025",
  "content": "新年最初のライブイベントです",
  "date": "2025-01-15T18:00:00Z",
  "locationName": "市民会館ホール",
  "locationUrl": "https://maps.google.com/?q=...",
  "songs": [
    {
      "title": "Yesterday",
      "sheetUrl": "https://example.com/sheet.pdf",
      "youtubeUrl": "https://www.youtube.com/watch?v=xxxxx",
      "parts": {
        "vocal": "山田太郎",
        "guitar": "佐藤花子",
        "bass": "鈴木一郎",
        "drums": "田中次郎",
        "keyboard": "高橋三郎"
      }
    }
  ]
}
```

#### 活動スケジュール (Activity Schedules) - `/api/activity-schedules`

| メソッド | エンドポイント | 認証 | 権限 | 説明 |
|---------|--------------|------|------|------|
| GET | `/api/activity-schedules` | 必須 | member/admin | スケジュール一覧を取得 |
| POST | `/api/activity-schedules` | 必須 | admin | スケジュールを作成 |
| PUT | `/api/activity-schedules/[id]` | 必須 | admin | スケジュールを更新 |
| DELETE | `/api/activity-schedules/[id]` | 必須 | admin | スケジュールを削除 |
| POST | `/api/activity-schedules/[id]/comments` | 必須 | member/admin | コメントを投稿 |
| POST | `/api/activity-schedules/[id]/participate` | 必須 | member/admin | 参加登録/解除 |
| POST | `/api/activity-schedules/[id]/report` | 必須 | admin | 活動報告を作成 |

#### ユーザー (Users) - `/api/users`

| メソッド | エンドポイント | 認証 | 権限 | 説明 |
|---------|--------------|------|------|------|
| GET | `/api/users` | 必須 | admin | ユーザー一覧を取得 |
| DELETE | `/api/users/[id]` | 必須 | admin | ユーザーを削除 |
| PATCH | `/api/users/[id]` | 必須 | admin | ユーザー役割を更新 |

#### プロフィール (Profile) - `/api/profile`

| メソッド | エンドポイント | 認証 | 権限 | 説明 |
|---------|--------------|------|------|------|
| PATCH | `/api/profile` | 必須 | member/admin | 自分のプロフィールを更新 |
| POST | `/api/profile/avatar` | 必須 | member/admin | アバター画像をアップロード |

**リクエスト例: PATCH `/api/profile`**
```json
{
  "name": "山田太郎",
  "bio": "ギター担当です。よろしくお願いします！",
  "instruments": "ギター、ベース"
}
```

---

## 👨‍💻 開発ガイド

### 🚀 クイックスタート

#### 1. リポジトリのクローンと依存関係のインストール

```bash
git clone https://github.com/shuhei0720/keion-circle-site.git
cd keion-circle-site
npm install
```

#### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. **New Project** をクリック
3. プロジェクト名、データベースパスワードを設定して **Create new project** をクリック
4. プロジェクトが作成されるまで数分待機

**必要な情報を取得**:
- **Project Settings** → **Database** → **Connection String** タブ
  - **Session pooler** の接続文字列をコピー（ポート5432、開発環境用）
  - `[YOUR-PASSWORD]` を実際のパスワードに置き換え
- **Project Settings** → **API** タブ
  - **Project URL**: `https://xxxxx.supabase.co` をコピー
  - **Project API keys** → `anon` `public` キーをコピー

**Storageバケットの作成**:
1. **Storage** → **Create a new bucket** をクリック
2. Bucket name: `avatars`
3. **Public bucket** をONにして **Create bucket** をクリック

#### 3. Google OAuth認証の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. **新しいプロジェクトを作成** または既存のプロジェクトを選択
3. **APIとサービス** → **OAuth同意画面** に移動
   - User Type: **外部** を選択して **作成**
   - アプリ名、ユーザーサポートメール、デベロッパーの連絡先情報を入力
   - **保存して次へ** → **保存して次へ** → **ダッシュボードに戻る**
4. **認証情報** → **認証情報を作成** → **OAuth 2.0 クライアントID** を選択
   - アプリケーションの種類: **ウェブアプリケーション**
   - 名前: `BOLD軽音サイト`
   - **承認済みのリダイレクトURI** に以下を追加:
     - `http://localhost:3000/api/auth/callback/google` (開発環境)
     - `https://your-domain.vercel.app/api/auth/callback/google` (本番環境)
   - **作成** をクリック
5. **クライアントID** と **クライアントシークレット** をコピー

#### 4. AUTH_SECRETの生成

以下のコマンドで安全なランダム文字列を生成:

```bash
openssl rand -base64 32
```

または

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

出力された文字列（例: `hJuxPYaghehoKsbochfayrxjOLm3g+Z+CKoqrBsaCas=`）をコピー

#### 5. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を開いて以下を設定:

```env
# 認証設定
AUTH_URL=http://localhost:3000
AUTH_SECRET=<ステップ4で生成した文字列>
AUTH_TRUST_HOST=true

# NextAuth v5用
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<AUTH_SECRETと同じ値>

# データベース設定（Supabaseから取得）
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Google OAuth（Google Cloud Consoleから取得）
GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Supabase設定（Supabase Dashboardから取得）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

#### 6. データベースの初期化

Supabase DashboardのSQL Editorで直接SQLを実行してテーブルを作成します。

1. [Supabase Dashboard](https://supabase.com/dashboard) → プロジェクトを選択 → **SQL Editor** を開く
2. **New query** をクリック
3. 以下のSQLをコピーして貼り付け
4. **Run** をクリック

<details>
<summary>📋 データベース初期化SQL（クリックして展開）</summary>

```sql
-- 既存のテーブルを削除（クリーンスタート）
DROP TABLE IF EXISTS "Template" CASCADE;
DROP TABLE IF EXISTS "EventParticipant" CASCADE;
DROP TABLE IF EXISTS "Event" CASCADE;
DROP TABLE IF EXISTS "ActivityParticipant" CASCADE;
DROP TABLE IF EXISTS "ActivitySchedule" CASCADE;
DROP TABLE IF EXISTS "Comment" CASCADE;
DROP TABLE IF EXISTS "ScheduleResponse" CASCADE;
DROP TABLE IF EXISTS "ScheduleDate" CASCADE;
DROP TABLE IF EXISTS "Schedule" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "PostLike" CASCADE;
DROP TABLE IF EXISTS "PostParticipant" CASCADE;
DROP TABLE IF EXISTS "Post" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Userテーブル
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "email" TEXT UNIQUE,
    "password" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "instruments" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Accountテーブル
CREATE TABLE "Account" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE("provider", "providerAccountId")
);

-- Sessionテーブル
CREATE TABLE "Session" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- VerificationTokenテーブル
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMP(3) NOT NULL,
    UNIQUE("identifier", "token")
);

-- Postテーブル
CREATE TABLE "Post" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "youtubeUrls" TEXT[] NOT NULL DEFAULT '{}',
    "images" TEXT[] NOT NULL DEFAULT '{}',
    "userId" TEXT NOT NULL,
    "eventId" TEXT,
    "activityScheduleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- PostParticipantテーブル
CREATE TABLE "PostParticipant" (
    "id" TEXT PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostParticipant_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
    CONSTRAINT "PostParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE("postId", "userId")
);

-- PostLikeテーブル
CREATE TABLE "PostLike" (
    "id" TEXT PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
    CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE("postId", "userId")
);

-- Messageテーブル
CREATE TABLE "Message" (
    "id" TEXT PRIMARY KEY,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileType" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Scheduleテーブル
CREATE TABLE "Schedule" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ScheduleDateテーブル
CREATE TABLE "ScheduleDate" (
    "id" TEXT PRIMARY KEY,
    "scheduleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScheduleDate_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE
);

-- ScheduleResponseテーブル
CREATE TABLE "ScheduleResponse" (
    "id" TEXT PRIMARY KEY,
    "scheduleDateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScheduleResponse_scheduleDateId_fkey" FOREIGN KEY ("scheduleDateId") REFERENCES "ScheduleDate"("id") ON DELETE CASCADE,
    CONSTRAINT "ScheduleResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE("scheduleDateId", "userId")
);

-- ActivityScheduleテーブル
CREATE TABLE "ActivitySchedule" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "date" TIMESTAMP(3),
    "location" TEXT,
    "locationUrl" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivitySchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- ActivityParticipantテーブル
CREATE TABLE "ActivityParticipant" (
    "id" TEXT PRIMARY KEY,
    "activityScheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityParticipant_activityScheduleId_fkey" FOREIGN KEY ("activityScheduleId") REFERENCES "ActivitySchedule"("id") ON DELETE CASCADE,
    CONSTRAINT "ActivityParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE("activityScheduleId", "userId")
);

-- Eventテーブル
CREATE TABLE "Event" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "date" TIMESTAMP(3),
    "locationName" TEXT,
    "locationUrl" TEXT,
    "songs" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- EventParticipantテーブル
CREATE TABLE "EventParticipant" (
    "id" TEXT PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE,
    CONSTRAINT "EventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE("eventId", "userId")
);

-- Commentテーブル
CREATE TABLE "Comment" (
    "id" TEXT PRIMARY KEY,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "activityScheduleId" TEXT,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
    CONSTRAINT "Comment_activityScheduleId_fkey" FOREIGN KEY ("activityScheduleId") REFERENCES "ActivitySchedule"("id") ON DELETE CASCADE,
    CONSTRAINT "Comment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE
);

-- Templateテーブル
CREATE TABLE "Template" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Post.eventId外部キー制約を追加
ALTER TABLE "Post" ADD CONSTRAINT "Post_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL;

-- インデックスを追加（パフォーマンス向上）
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Post_userId_idx" ON "Post"("userId");
CREATE INDEX "Post_eventId_idx" ON "Post"("eventId");
CREATE INDEX "PostParticipant_postId_idx" ON "PostParticipant"("postId");
CREATE INDEX "PostParticipant_userId_idx" ON "PostParticipant"("userId");
CREATE INDEX "PostLike_postId_idx" ON "PostLike"("postId");
CREATE INDEX "PostLike_userId_idx" ON "PostLike"("userId");
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");
CREATE INDEX "Comment_eventId_idx" ON "Comment"("eventId");
CREATE INDEX "Comment_activityScheduleId_idx" ON "Comment"("activityScheduleId");
```

</details>

5. Prisma Clientを生成:

```bash
npx prisma generate
```

#### 7. 管理者ユーザーの作成

```bash
export $(cat .env.local | grep DATABASE_URL | xargs) && node scripts/create-admin.js admin@example.com password123 "管理者名"
```

#### 8. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてログイン:
- メール: `admin@example.com`
- パスワード: `password123`

---

## 🧪 テスト

#### 認証設定

| 変数名 | 説明 | 取得方法 |
|--------|------|----------|
| `AUTH_URL` | アプリケーションのベースURL | 開発: `http://localhost:3000`<br/>本番: `https://your-domain.vercel.app` |
| `AUTH_SECRET` | NextAuth.jsの暗号化キー | `openssl rand -base64 32` で生成 |
| `AUTH_TRUST_HOST` | Vercelでのホスト検証を無効化 | 常に `true` |
| `NEXTAUTH_URL` | NextAuth v5用のURL | `AUTH_URL`と同じ値 |
| `NEXTAUTH_SECRET` | NextAuth v5用のシークレット | `AUTH_SECRET`と同じ値 |

#### データベース設定

| 変数名 | 説明 | 取得方法 |
|--------|------|----------|
| `DATABASE_URL` | PostgreSQL接続文字列 | **Supabase Dashboard** → **Project Settings** → **Database** → **Connection String** → **Session pooler**<br/>`postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`<br/>または **Transaction pooler**（ポート6543）も使用可能 |

#### Google OAuth設定

| 変数名 | 説明 | 取得方法 |
|--------|------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuthクライアントID | [Google Cloud Console](https://console.cloud.google.com/) → **APIとサービス** → **認証情報** → 作成したOAuth 2.0クライアントIDをクリック |
| `GOOGLE_CLIENT_SECRET` | Google OAuthクライアントシークレット | 同上 |

#### Supabase設定

| 変数名 | 説明 | 取得方法 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | **Supabase Dashboard** → **Project Settings** → **API** → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名アクセスキー | **Supabase Dashboard** → **Project Settings** → **API** → **Project API keys** → `anon` `public` |

### 🔍 トラブルシューティング

#### データベース接続エラー

**エラー**: `Can't reach database server`

**解決策**:
1. Supabaseプロジェクトが起動しているか確認（無料プランは1週間非アクティブで一時停止）
2. `DATABASE_URL`のパスワードが正しいか確認
3. Session pooler（ポート5432）またはTransaction pooler（ポート6543）を使用

#### Google OAuth認証エラー

**エラー**: `redirect_uri_mismatch`

**解決策**:
1. Google Cloud Consoleの **承認済みのリダイレクトURI** に以下が追加されているか確認:
   - 開発: `http://localhost:3000/api/auth/callback/google`
   - 本番: `https://your-domain.vercel.app/api/auth/callback/google`
2. URIに余分なスペースや改行がないか確認
3. HTTPSとHTTPを間違えていないか確認

#### Prisma Client生成エラー

**エラー**: `Environment variable not found: DATABASE_URL`

**解決策**:
```bash
export $(cat .env.local | grep DATABASE_URL | xargs)
npx prisma generate
```

または、`.env.local`が正しい場所にあるか確認してください。
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase設定（画像アップロード用）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**本番環境（Vercel）**: 上記と同じ環境変数を設定しますが、`AUTH_URL` と `NEXTAUTH_URL` を本番URLに変更してください。

### 🗄 データベース操作

**スキーマ変更の流れ:**

1. `prisma/schema.prisma` を編集
2. データベースに反映:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. 本番環境: Vercel で自動的に `npm run build` が実行され、スキーマが適用されます

**初回セットアップ時のデータベース初期化:**

```bash
# Prisma Clientを生成
npx prisma generate

# スキーマをデータベースに適用
npx prisma db push

# 管理者ユーザーを作成
node scripts/create-admin.js admin@example.com password123 "管理者名"
```

**Prisma Studio でデータ確認:**

```bash
npx prisma studio
```

ブラウザで http://localhost:5555 が開き、データベースの内容をGUIで確認・編集できます。

### 🔐 認証フロー実装例

**サーバーコンポーネントで認証確認:**

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  // 管理者チェック
  if (session.user.role !== "admin") {
    return <div>管理者のみアクセス可能です</div>;
  }
  
  return <div>管理者ページ</div>;
}
```

**API Routeで認証確認:**

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: "認証が必要です" },
      { status: 401 }
    );
  }
  
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "管理者権限が必要です" },
      { status: 403 }
    );
  }
  
  // 処理...
}
```

### 🎨 スタイリングガイド

このプロジェクトではTailwind CSS v4を使用しています。

**カラーパレット:**
- プライマリ: `bg-blue-500`, `text-blue-600`
- セカンダリ: `bg-gray-500`, `text-gray-600`
- 成功: `bg-green-500`, `text-green-600`
- エラー: `bg-red-500`, `text-red-600`
- 警告: `bg-yellow-500`, `text-yellow-600`

**レスポンシブデザイン:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* モバイル: 1列、タブレット: 2列、デスクトップ: 3列 */}
</div>
```

### 🧪 テスト仕様

このプロジェクトは包括的な自動テストスイートを実装しています。

#### テスト構成

| テストタイプ | フレームワーク | 対象 | 実行時間 |
|------------|-------------|------|---------|
| **Lint** | ESLint | コード品質・スタイル | ~30秒 |
| **Type Check** | TypeScript | 型安全性 | ~10秒 |
| **Unit Tests** | Jest + React Testing Library | コンポーネント・関数 | ~5秒 |
| **Integration Tests** | Jest | API Routes・DB操作 | ~10秒 |
| **E2E Tests** | Playwright | ユーザーフロー（Chromium） | ~5-7分 |
| **Build** | Next.js | 本番ビルド検証 | ~20秒 |

#### テストコマンド

```bash
# 全テストを実行
npm test                    # Jestウォッチモード

# 個別実行
npm run lint                # ESLint
npx tsc --noEmit           # 型チェック
npm run test:unit          # ユニットテスト + カバレッジ
npm run test:integration   # 統合テスト
npm run test:e2e           # E2Eテスト
npm run test:e2e:ui        # E2E UIモード（デバッグ用）

# CI環境用
npm run test:ci            # カバレッジ付きテスト
```

#### カバレッジ目標

現在は基本的なテスト構造のみ実装済み。今後70%のカバレッジを目指します。

```
目標カバレッジ: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%
```

#### E2Eテスト詳細

**テストシナリオ:**
- 認証フロー（ログイン・ログアウト・エラーハンドリング）
- 投稿管理（作成・表示・いいね・コメント・削除）
- イベント管理（作成・参加・課題曲追加・報告作成）

**ブラウザ対応:**
- CI環境: Chromiumのみ（高速化）
- ローカル環境: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- 週次フルテスト: 全ブラウザで自動実行（毎週日曜日）

**設定ファイル:**
- `playwright.config.ts`: E2Eテスト設定
- `jest.config.js`: ユニット・統合テスト設定
- `jest.setup.js`: テストモック設定

---

## 🚀 CI/CD パイプライン

### GitHub Actions ワークフロー

このプロジェクトは自動化されたCI/CDパイプラインを実装しています。

```
コミット → GitHub
    ↓
    ├─→ GitHub Actions（テスト実行・並列）
    │   ├─ Lint ✓
    │   ├─ Type Check ✓
    │   ├─ Unit Tests ✓
    │   ├─ Integration Tests ✓
    │   ├─ E2E Tests ✓
    │   └─ Build ✓
    │
    └─→ Vercel（自動デプロイ）
        ├─ mainブランチ → 本番環境
        └─ developブランチ → プレビュー環境
```

### ワークフロー詳細

#### 1. メインCI（`.github/workflows/ci.yml`）

**トリガー:**
- `main`, `develop`ブランチへのプッシュ
- `main`, `develop`へのPull Request

**ジョブ構成:**

| ジョブ | 実行内容 | 依存関係 | 想定時間 |
|-------|---------|---------|---------|
| **lint** | ESLintチェック | なし | 30秒 |
| **type-check** | TypeScript型チェック + Prisma生成 | なし | 10秒 |
| **unit-tests** | Jestユニットテスト + Codecovアップロード | なし | 5秒 |
| **integration-tests** | 統合テスト + PostgreSQLコンテナ | なし | 10秒 |
| **e2e-tests** | Playwright E2Eテスト（Chromiumのみ） | なし | 5-7分 |
| **build** | Next.js本番ビルド | lint, type-check, unit-tests | 20秒 |

**環境変数:**
```yaml
NODE_VERSION: '20'
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test  # テスト用
NEXTAUTH_SECRET: test-secret
AUTH_SECRET: test-secret
```

**並列実行:** lint, type-check, unit-tests, integration-tests, e2e-testsは並列実行され、約7分で完了

#### 2. 週次フルE2E（`.github/workflows/full-e2e.yml`）

**トリガー:**
- 毎週日曜日 午前2時（UTC）に自動実行
- 手動実行可能（Actions → Full E2E Tests → Run workflow）

**実行内容:**
- 全ブラウザ（Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari）でE2Eテスト
- クロスブラウザ互換性の確認
- 想定時間: 15-25分

#### 3. セキュリティスキャン（`.github/workflows/codeql.yml`）

**トリガー:**
- 毎週日曜日に自動実行
- `main`ブランチへのプッシュ・PR

**実行内容:**
- CodeQL静的解析（JavaScript/TypeScript）
- セキュリティ脆弱性の検出

### Vercelデプロイ

**自動デプロイ:**
- VercelのGitHub統合により、GitHubへのプッシュで自動デプロイ
- GitHub Actionsのテスト結果とは独立して実行

**デプロイ先:**
- `main`ブランチ → https://keion-circle-site.vercel.app/（本番環境）
- `develop`ブランチ → プレビューURL
- Pull Request → 専用プレビューURL

**ビルドコマンド:**
```bash
prisma generate && next build
```

**環境変数（Vercel Dashboard設定）:**
```env
# 認証
AUTH_URL=https://keion-circle-site.vercel.app
AUTH_SECRET=<ランダム文字列>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://keion-circle-site.vercel.app
NEXTAUTH_SECRET=<AUTH_SECRETと同じ>

# データベース（重要: Transaction Pooler使用）
DATABASE_URL=postgresql://[user]:[password]@[host]:6543/postgres?pgbouncer=true

# Google OAuth
GOOGLE_CLIENT_ID=<Google Cloud Console>
GOOGLE_CLIENT_SECRET=<Google Cloud Console>

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

**⚠️ 重要: データベース接続設定**

Vercelなどのサーバーレス環境では、必ず**Transaction Pooler（ポート6543）**を使用してください：

```env
# ✅ 正しい（サーバーレス環境）
DATABASE_URL=postgresql://[user]:[password]@[host]:6543/postgres?pgbouncer=true

# ❌ 誤り（接続数制限エラー）
DATABASE_URL=postgresql://[user]:[password]@[host]:5432/postgres
```

**理由:**
- ポート5432（Session Mode）: 数十の接続のみ → サーバーレスでは`MaxClientsInSessionMode`エラー
- ポート6543（Transaction Pooler）: 数千の接続に対応 → サーバーレス環境で必須

### デプロイフロー推奨事項

1. **developブランチで開発**
   ```bash
   git checkout develop
   git commit -m "feat: 新機能"
   git push origin develop
   ```

2. **GitHub Actionsでテスト確認**
   - https://github.com/shuhei0720/keion-circle-site/actions
   - 全テストがPassすることを確認

3. **Vercelプレビュー確認**
   - プレビューURLで動作確認
   - データベース接続、認証、機能が正常動作

4. **mainブランチへマージ**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

5. **本番デプロイ自動実行**
   - Vercelが自動で本番環境にデプロイ
   - https://keion-circle-site.vercel.app/ で確認

### トラブルシューティング

#### GitHub Actionsが失敗する

**Lint失敗:**
```bash
npm run lint  # ローカルで確認
```

**Type Check失敗:**
```bash
npx tsc --noEmit  # 型エラーを確認
```

**E2Eテストタイムアウト:**
- Playwrightブラウザのインストール: `npx playwright install`
- テスト環境のデータベース確認

#### Vercelデプロイが失敗する

**ビルドエラー:**
1. 環境変数が全て設定されているか確認
2. `DATABASE_URL`がTransaction Pooler（ポート6543）を使用しているか確認
3. ローカルで`npm run build`が成功するか確認

**データベース接続エラー:**
```
MaxClientsInSessionMode: max clients reached
```
→ `DATABASE_URL`をポート6543に変更し、`?pgbouncer=true`を追加

**認証エラー:**
- Google Cloud ConsoleのOAuth認証情報でリダイレクトURIを確認
- `AUTH_URL`と`NEXTAUTH_URL`が正しいか確認

### 監視とログ

**Vercel Dashboard:**
- Runtime Logs: リアルタイムログ確認
- Deployment Logs: ビルドログ確認
- Analytics: アクセス解析

**GitHub Actions:**
- Actions タブ: ワークフロー実行履歴
- Artifacts: テストレポート、Playwrightレポートのダウンロード

**Codecov（オプション）:**
- https://codecov.io でカバレッジ推移を確認
- PRごとのカバレッジ変化を自動コメント

---

## 🔐 セキュリティ

- ✅ **環境変数**: `.env.local` は Git に含めない（`.gitignore` 設定済み）
- ✅ **パスワード**: bcryptjs による安全なハッシュ化（ソルトラウンド10）
- ✅ **認証**: NextAuth.js v5 による堅牢な認証
- ✅ **CSRF対策**: NextAuth.js の標準セキュリティ機能
- ✅ **SQLインジェクション**: Prisma による自動防止
- ✅ **XSS対策**: React の自動エスケープ
- ✅ **画像アップロード**: ファイルサイズ制限（2MB）、MIME type検証

---

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。

---

## 🤝 コントリビューション

プルリクエストを歓迎します！バグ報告や機能リクエストは [GitHub Issues](https://github.com/shuhei0720/keion-circle-site/issues) にお願いします。

**コントリビューション手順:**
1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## 📞 お問い合わせ

質問や提案がある場合は、[GitHub Issues](https://github.com/shuhei0720/keion-circle-site/issues) を作成してください。

---

<div align="center">

**Built with ❤️ by BOLD 軽音**

© 2025 BOLD 軽音. All rights reserved.

[ バグ報告](https://github.com/shuhei0720/keion-circle-site/issues/new) | [💡 機能リクエスト](https://github.com/shuhei0720/keion-circle-site/issues/new)

</div>
