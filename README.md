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
- [システムアーキテクチャ](#-システムアーキテクチャ)
- [データ構造](#-データ構造)
- [ディレクトリ構成](#-ディレクトリ構成)
- [技術スタック](#-技術スタック)
- [機能一覧](#-機能一覧)
- [開発ガイド](#-開発ガイド)
- [テスト](#-テスト)
- [CI/CD](#-cicd)
- [API仕様](#-api仕様)

---

## 🎯 プロジェクト概要

BOLD 軽音メンバーサイトは、**軽音サークルの活動を支援するモダンなWebアプリケーション**です。

### 🎭 システム全体像

```mermaid
graph TB
    subgraph "👥 ユーザー"
        A[👤 一般メンバー<br/>閲覧・参加・いいね]
        B[🔑 管理者<br/>全機能 + 作成・編集・削除]
    end
    
    subgraph "💻 フロントエンド"
        C[🌐 Next.js 16<br/>App Router]
        D[🎨 Tailwind CSS v4]
    end
    
    subgraph "⚙️ バックエンド"
        E[🔐 NextAuth.js v5<br/>認証・認可]
        F[⚡ Server Actions]
        G[🗄️ Prisma ORM]
    end
    
    subgraph "💾 データ層"
        H[(PostgreSQL)]
        I[📦 Supabase Storage]
    end
    
    subgraph "🚀 インフラ"
        J[🚀 Vercel]
        K[🔄 GitHub Actions]
    end
    
    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    E --> G
    F --> G
    G --> H
    C --> I
    J --> C
    K --> J
```

### 🌟 主要な特徴

| 特徴 | 説明 |
|------|------|
| 🚀 **高速** | Next.js 16 App Router、Server Components |
| 📱 **レスポンシブ** | モバイル・タブレット・デスクトップ完全対応 |
| 🔒 **セキュア** | NextAuth.js v5 + 役割ベースアクセス制御（RBAC） |
| ⚡ **即時反映** | 楽観的UI、いいね・投票が即座に反映 |
| 🎥 **リッチメディア** | YouTube複数埋め込み、画像管理 |
| 📊 **可視化** | 参加状況、いいね数、コメント数リアルタイム表示 |

---

## 🏗 システムアーキテクチャ

### 📐 レイヤー構造

```mermaid
graph LR
    subgraph "クライアント層"
        A[🌐 Webブラウザ]
        B[📱 モバイル]
    end
    
    subgraph "プレゼンテーション層"
        C[Next.js App Router]
        D[Server Components]
        E[Client Components]
    end
    
    subgraph "ビジネスロジック層"
        F[Server Actions]
        G[API Routes]
        H[認証ミドルウェア]
    end
    
    subgraph "データアクセス層"
        I[Prisma Client]
    end
    
    subgraph "データベース層"
        J[(PostgreSQL)]
        K[Supabase Storage]
    end
    
    A --> C
    B --> C
    C --> D
    C --> E
    D --> F
    E --> G
    F --> I
    G --> H
    H --> I
    I --> J
    E --> K
```

### 🔐 認証フロー

```mermaid
sequenceDiagram
    participant U as 👤 ユーザー
    participant C as 🌐 クライアント
    participant N as ⚡ NextAuth.js
    participant G as 🔑 Google OAuth
    participant D as 🗄️ データベース
    
    rect rgb(200, 220, 255)
        Note over U,D: Google OAuth ログイン
        U->>C: Googleでログインをクリック
        C->>N: signIn('google')
        N->>G: OAuth認証リクエスト
        G->>U: Googleログイン画面
        U->>G: 認証情報入力
        G->>N: ユーザー情報返却
        N->>D: ユーザー情報保存
        D-->>N: ユーザーID返却
        N->>C: セッショントークン発行
        C->>U: ホームにリダイレクト
    end
    
    rect rgb(255, 220, 200)
        Note over U,D: メール+パスワード ログイン
        U->>C: メール・パスワード入力
        C->>N: signIn('credentials')
        N->>D: ユーザー検索
        D-->>N: ユーザー情報返却
        N->>N: bcrypt.compare()
        N->>C: セッショントークン発行
        C->>U: ホームにリダイレクト
    end
```

### 🎭 権限管理

```mermaid
graph TB
    A[🔑 ログイン] --> B{セッション確認}
    B -->|未ログイン| C[🚫 ログインページ]
    B -->|ログイン済み| D{役割確認}
    
    D -->|admin| E[🔑 管理者権限]
    D -->|member| F[👤 メンバー権限]
    
    E --> G[✅ 全機能アクセス]
    E --> H[✅ 作成・編集・削除]
    E --> I[✅ ユーザー管理]
    
    F --> J[✅ 閲覧・参加・いいね]
    F --> K[✅ コメント投稿]
    F --> L[🚫 作成・編集・削除不可]
    
    style E fill:#f9f,stroke:#333
    style F fill:#bbf,stroke:#333
    style C fill:#fbb,stroke:#333
```

---

## 💾 データ構造

### 📊 ER図

```mermaid
erDiagram
    User ||--o{ Post : "作成"
    User ||--o{ Event : "作成"
    User ||--o{ ActivitySchedule : "作成"
    User ||--o{ Comment : "投稿"
    User ||--o{ PostLike : "いいね"
    User ||--o{ PostParticipant : "参加"
    User ||--o{ EventParticipant : "参加"
    User ||--o{ ScheduleParticipant : "参加"
    User ||--o{ Account : "連携"
    User ||--o{ Session : "持つ"
    
    Post ||--o{ Comment : "持つ"
    Post ||--o{ PostLike : "持つ"
    Post ||--o{ PostParticipant : "持つ"
    
    Event ||--o{ Comment : "持つ"
    Event ||--o{ EventParticipant : "持つ"
    Event ||--o{ Post : "変換"
    
    ActivitySchedule ||--o{ Comment : "持つ"
    ActivitySchedule ||--o{ ScheduleParticipant : "持つ"
    ActivitySchedule ||--o{ Post : "変換"
    
    User {
        string id PK
        string name
        string email UK
        string password
        string role
        string avatarUrl
        string bio
        string instruments
    }
    
    Post {
        string id PK
        string title
        text content
        string[] youtubeUrls
        string[] images
        string userId FK
    }
    
    Event {
        string id PK
        string title
        text content
        datetime date
        string locationName
        string locationUrl
        json songs
        string userId FK
    }
    
    ActivitySchedule {
        string id PK
        string title
        text content
        datetime date
        string locationName
        string locationUrl
        string userId FK
    }
```

### 📦 主要モデル詳細

<details>
<summary><strong>👤 User（ユーザー）</strong></summary>

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | `string` | UUID |
| `name` | `string` | 表示名 |
| `email` | `string` | メールアドレス（一意） |
| `password` | `string?` | ハッシュ化パスワード |
| `role` | `enum` | `admin` or `member` |
| `avatarUrl` | `string?` | アバター画像URL |
| `bio` | `string?` | 自己紹介 |
| `instruments` | `string?` | 担当楽器 |

**関連:**
- `posts[]` - 作成した投稿
- `events[]` - 作成したイベント
- `activitySchedules[]` - 作成したスケジュール
- `comments[]` - コメント
- `postLikes[]` - いいね
- `participants[]` - 参加

</details>

<details>
<summary><strong>📝 Post（投稿）</strong></summary>

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | `string` | UUID |
| `title` | `string` | タイトル |
| `content` | `text` | Markdown本文 |
| `youtubeUrls` | `string[]` | YouTube URL（複数可） |
| `images` | `string[]` | 画像URL（Supabase） |
| `userId` | `string` | 作成者ID（FK） |

**YouTube URL対応形式:**
- `youtube.com/watch?v=VIDEO_ID`
- `youtu.be/VIDEO_ID`
- `youtube.com/live/VIDEO_ID`
- `youtube.com/shorts/VIDEO_ID`
- `youtube.com/embed/VIDEO_ID`

**関連:**
- `user` - 作成者
- `comments[]` - コメント
- `likes[]` - いいね
- `participants[]` - 参加者

</details>

<details>
<summary><strong>🎪 Event（イベント）</strong></summary>

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | `string` | UUID |
| `title` | `string` | イベント名 |
| `content` | `text` | 説明文 |
| `date` | `DateTime` | 開催日時 |
| `locationName` | `string?` | 場所名 |
| `locationUrl` | `string?` | 地図URL |
| `songs` | `JSON` | 課題曲リスト |
| `userId` | `string` | 作成者ID（FK） |

**songs構造:**
```json
[
  {
    "title": "曲名",
    "sheetUrl": "楽譜URL",
    "youtubeUrl": "YouTube URL",
    "parts": [
      { "instrument": "ギター", "player": "担当者名" }
    ]
  }
]
```

</details>

<details>
<summary><strong>📅 ActivitySchedule（活動スケジュール）</strong></summary>

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | `string` | UUID |
| `title` | `string` | スケジュール名 |
| `content` | `text` | 説明文 |
| `date` | `DateTime` | 開催日時 |
| `locationName` | `string?` | 場所名 |
| `locationUrl` | `string?` | 地図URL |
| `userId` | `string` | 作成者ID（FK） |

</details>

---

## 📁 ディレクトリ構成

```
keion-circle-site/
│
├── 📱 src/                              # ソースコード
│   ├── 🎨 app/                          # Next.js App Router
│   │   ├── api/                         # APIルート
│   │   │   ├── posts/                   # 投稿API
│   │   │   │   ├── route.ts             # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts         # GET, PATCH, DELETE
│   │   │   │       ├── like/route.ts
│   │   │   │       ├── unlike/route.ts
│   │   │   │       ├── participate/route.ts
│   │   │   │       └── comments/route.ts
│   │   │   │
│   │   │   ├── events/                  # イベントAPI
│   │   │   ├── activity-schedules/      # スケジュールAPI
│   │   │   ├── users/                   # ユーザーAPI
│   │   │   └── profile/                 # プロフィールAPI
│   │   │
│   │   ├── auth/                        # 認証ページ
│   │   │   ├── signin/                  # ログイン
│   │   │   └── signup/                  # 新規登録
│   │   │
│   │   ├── posts/                       # 投稿ページ
│   │   ├── events/                      # イベントページ
│   │   ├── activity-schedules/          # スケジュールページ
│   │   ├── users/                       # ユーザーページ
│   │   ├── profile/                     # プロフィールページ
│   │   │
│   │   ├── layout.tsx                   # ルートレイアウト
│   │   ├── page.tsx                     # ホームページ
│   │   └── globals.css                  # グローバルCSS
│   │
│   ├── 🧩 components/                   # 再利用コンポーネント
│   │   ├── DashboardLayout.tsx          # ダッシュボードレイアウト
│   │   ├── RichTextEditor.tsx           # Markdownエディタ
│   │   ├── Avatar.tsx                   # アバター
│   │   ├── Button.tsx                   # ボタン
│   │   ├── Card.tsx                     # カード
│   │   ├── Modal.tsx                    # モーダル
│   │   └── LoadingSpinner.tsx           # ローディング
│   │
│   └── 📚 lib/                          # ユーティリティ
│       ├── auth.ts                      # NextAuth.js設定
│       ├── prisma.ts                    # Prismaクライアント
│       └── supabase.ts                  # Supabaseクライアント
│
├── 🗄️ prisma/                           # Prisma設定
│   ├── schema.prisma                    # データベーススキーマ
│   └── migrations/                      # マイグレーション履歴
│
├── 🧪 e2e/                              # E2Eテスト
│   ├── auth.spec.ts                     # 認証テスト（4件）
│   ├── posts.spec.ts                    # 投稿テスト（5件）
│   ├── events.spec.ts                   # イベントテスト（4件）
│   └── helpers.ts                       # テストヘルパー
│
├── 🛠️ scripts/                          # ユーティリティ
│   └── create-admin.js                  # 管理者作成
│
├── 🌐 public/                           # 静的ファイル
│
└── 📄 設定ファイル
    ├── .env.local                       # 環境変数（ローカル）
    ├── next.config.js                   # Next.js設定
    ├── tailwind.config.ts               # Tailwind設定
    ├── tsconfig.json                    # TypeScript設定
    └── playwright.config.ts             # Playwright設定
```

### 📂 主要ディレクトリ詳細

<details>
<summary><strong>🎨 src/app/ - Next.js App Router</strong></summary>

| ディレクトリ | 役割 |
|-------------|------|
| `api/` | サーバーサイドAPI（RESTful） |
| `(pages)/` | ページコンポーネント（ファイルベースルーティング） |
| `layout.tsx` | 共通レイアウト（ヘッダー、フッター） |
| `page.tsx` | ルートページ（`/`） |

**特徴:**
- ✅ Server Componentsがデフォルト
- ✅ 自動コード分割
- ✅ SEO最適化

</details>

<details>
<summary><strong>🧩 src/components/ - 再利用コンポーネント</strong></summary>

| コンポーネント | 役割 |
|--------------|------|
| `DashboardLayout.tsx` | ダッシュボードUI |
| `RichTextEditor.tsx` | Markdownエディタ |
| `Avatar.tsx` | アバター表示 |
| `Button.tsx` | ボタン |
| `Card.tsx` | カード |
| `Modal.tsx` | モーダル |

**特徴:**
- ✅ TypeScript型安全
- ✅ アクセシビリティ対応（WAI-ARIA）

</details>

<details>
<summary><strong>🗄️ prisma/ - データベース管理</strong></summary>

**主要コマンド:**
```bash
# Prisma Client生成
npx prisma generate

# スキーマをDBに反映
npx prisma db push

# データベースGUI
npx prisma studio
```

</details>

<details>
<summary><strong>🧪 e2e/ - E2Eテスト</strong></summary>

| ファイル | テスト内容 |
|---------|----------|
| `auth.spec.ts` | ログイン・ログアウト（4件） |
| `posts.spec.ts` | 投稿作成・いいね・コメント（5件） |
| `events.spec.ts` | イベント作成・参加・課題曲（4件） |

**実行:**
```bash
npm run test:e2e
```

</details>

---

## 🛠 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|----------|------|
| [Next.js](https://nextjs.org/) | 16.1 | React フレームワーク、App Router |
| [TypeScript](https://www.typescriptlang.org/) | 5.0 | 型安全な開発 |
| [Tailwind CSS](https://tailwindcss.com/) | 4.0 | ユーティリティファーストCSS |
| [Lucide React](https://lucide.dev/) | latest | アイコンライブラリ |

### バックエンド

| 技術 | バージョン | 用途 |
|------|----------|------|
| [NextAuth.js](https://next-auth.js.org/) | 5.0 (beta) | 認証・認可 |
| [Prisma](https://www.prisma.io/) | 5.22 | ORM、型安全なDB操作 |
| [PostgreSQL](https://www.postgresql.org/) | 15+ | リレーショナルデータベース |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | 2.4.3 | パスワードハッシュ化 |

### インフラ

| サービス | 用途 |
|---------|------|
| [Vercel](https://vercel.com/) | ホスティング、自動デプロイ |
| [Supabase](https://supabase.com/) | PostgreSQL DB、ストレージ |
| [GitHub Actions](https://github.com/features/actions) | CI/CD、自動テスト |

### 開発ツール

| ツール | 用途 |
|--------|------|
| [Playwright](https://playwright.dev/) | E2Eテスト |
| [ESLint](https://eslint.org/) | コード品質チェック |
| [Prettier](https://prettier.io/) | コードフォーマット |

---

## ✨ 機能一覧

### 1️⃣ 認証システム

```mermaid
graph LR
    A[認証方法] --> B[Google OAuth 2.0]
    A --> C[メール + パスワード]
    
    B --> D[自動ユーザー登録]
    C --> E[bcryptjs ハッシュ化]
    
    D --> F[役割: member]
    E --> F
```

**機能:**
- ✅ Google OAuth 2.0 ログイン（ワンクリック）
- ✅ メールアドレス + パスワードログイン
- ✅ 自動ユーザー登録（Google: 名前・メール・アバター）
- ✅ パスワードハッシュ化（bcryptjs）
- ✅ 役割ベースアクセス制御（admin / member）

### 2️⃣ 投稿機能（活動報告）

```mermaid
graph TB
    A[投稿作成] --> B[Markdownエディタ]
    A --> C[YouTube動画複数埋め込み]
    A --> D[画像アップロード]
    
    B --> E[投稿詳細ページ]
    C --> E
    D --> E
    
    E --> F[いいね]
    E --> G[コメント]
    E --> H[参加状況]
```

**機能:**
- ✅ 管理者のみ作成・編集・削除
- ✅ Markdownエディタ（プレビュー機能）
- ✅ YouTube動画複数埋め込み（5形式対応）
- ✅ 画像アップロード（Supabase Storage）
- ✅ いいね機能（楽観的UI）
- ✅ コメント機能
- ✅ 参加状況管理（参加・不参加）
- ✅ 公開アクセス（ログイン不要で閲覧可）

### 3️⃣ イベント管理

```mermaid
graph TB
    A[イベント作成] --> B[基本情報]
    A --> C[課題曲登録]
    
    B --> D[日時・場所]
    C --> E[楽譜URL]
    C --> F[YouTube URL]
    C --> G[パート割り当て]
    
    D --> H[イベント詳細]
    E --> H
    F --> H
    G --> H
    
    H --> I[参加登録]
    H --> J[コメント]
    H --> K[活動報告へ変換]
```

**機能:**
- ✅ 管理者のみ作成・編集・削除
- ✅ 開催日時・場所設定
- ✅ 地図リンク設定（Google Maps等）
- ✅ 課題曲管理：
  - 曲名・楽譜URL・YouTube URL
  - パート割り当て（楽器・担当者）
- ✅ 参加者管理
- ✅ コメント機能
- ✅ イベントから活動報告作成（テンプレート機能）

### 4️⃣ 活動スケジュール

```mermaid
graph TB
    A[スケジュール作成] --> B[日時・場所]
    B --> C[参加者募集]
    C --> D[コメント]
    D --> E[活動報告へ変換]
```

**機能:**
- ✅ 管理者のみ作成・編集・削除
- ✅ 日時・場所設定
- ✅ 地図リンク設定
- ✅ 参加者管理
- ✅ コメント機能
- ✅ スケジュールから活動報告作成

### 5️⃣ ユーザープロフィール

**機能:**
- ✅ アバター画像変更（Supabase Storage）
- ✅ 自己紹介編集
- ✅ 担当楽器登録
- ✅ ユーザー詳細ページ
- ✅ 活動履歴表示

### 6️⃣ ユーザー管理

**管理者専用機能:**
- ✅ ユーザー一覧表示
- ✅ 役割変更（admin ↔ member）
- ✅ ユーザー詳細表示

---

## 🚀 開発ガイド

### 前提条件

- Node.js 18.17+ 
- npm または yarn
- Git

### ローカル開発環境セットアップ

#### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/keion-circle-site.git
cd keion-circle-site
```

#### 2. 依存関係のインストール

```bash
npm install
```

#### 3. 環境変数の設定

`.env.local` ファイルを作成：

```bash
cp .env.example .env.local
```

以下の環境変数を設定：

```env
# 認証（NextAuth.js）
AUTH_URL=http://localhost:3000
AUTH_SECRET=<ランダムな文字列（32文字以上推奨）>
AUTH_TRUST_HOST=true

# データベース（開発環境: SQLite）
DATABASE_URL="file:./dev.db"

# Google OAuth
GOOGLE_CLIENT_ID=<Google Cloud Console で取得>
GOOGLE_CLIENT_SECRET=<Google Cloud Console で取得>

# Supabase（画像ストレージ）
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

#### 4. データベースの初期化

```bash
# DATABASE_URL環境変数を設定
export DATABASE_URL="file:./dev.db"

# Prisma Clientの生成
npx prisma generate

# データベーススキーマの適用
npx prisma db push
```

#### 5. 管理者ユーザーの作成

```bash
export DATABASE_URL="file:./dev.db"
node scripts/create-admin.js admin@example.com password123 "管理者名"
```

#### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 開発用コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Prisma Studio（データベースGUI）
npm run db:studio

# Prisma Client再生成
npm run db:generate

# データベーススキーマ適用
npm run db:push

# E2Eテスト実行
npm run test:e2e
```

---

## 🧪 テスト

### E2Eテスト（Playwright）

```bash
# 全テスト実行
npm run test:e2e

# Playwright GUI起動
npx playwright test --ui

# 特定のブラウザで実行
npx playwright test --project=chromium
```

### テストカバレッジ

| カテゴリ | テスト数 | 説明 |
|---------|---------|------|
| 🔐 認証 | 4件 | ログイン・ログアウト |
| 📝 投稿 | 5件 | 作成・いいね・コメント・削除 |
| 🎪 イベント | 4件 | 作成・参加・課題曲・報告変換 |
| **合計** | **13件** | |

### テストフロー例

```mermaid
graph LR
    A[テスト開始] --> B[ログイン]
    B --> C[投稿作成]
    C --> D[いいね]
    D --> E[コメント投稿]
    E --> F[ログアウト]
    F --> G[テスト終了]
```

---

## 🔄 CI/CD

### GitHub Actions

**ワークフロー:** `.github/workflows/ci.yml`

```mermaid
graph LR
    A[git push] --> B[GitHub Actions]
    B --> C[Lint & Type Check]
    C --> D[Build Test]
    D --> E[E2E Tests]
    E --> F{Success?}
    F -->|Yes| G[Vercel Deploy]
    F -->|No| H[Fail Notification]
```

### デプロイフロー

1. **コード変更** → `git push origin main`
2. **GitHub Actions** → Lint、型チェック、ビルド、E2Eテスト
3. **Vercel** → 自動デプロイ
4. **Prisma** → データベースマイグレーション（`prisma db push`）

### 本番環境設定

#### Vercel環境変数

```env
# 認証
AUTH_URL=https://your-domain.vercel.app
AUTH_SECRET=<ランダムな文字列>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<AUTH_SECRETと同じ>

# データベース（本番: Supabase PostgreSQL）
DATABASE_URL=postgresql://user:password@host:port/database

# Google OAuth
GOOGLE_CLIENT_ID=<Google Cloud Console で取得>
GOOGLE_CLIENT_SECRET=<Google Cloud Console で取得>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

#### Google Cloud Console設定

1. OAuth 2.0 クライアントID作成
2. 承認済みリダイレクトURI追加：
   - `https://your-domain.vercel.app/api/auth/callback/google`
3. OAuth同意画面設定

#### Supabase設定

1. Project Settings → API で URL と Anon Key 取得
2. Storage → Create bucket で `avatars` バケット作成（Public）

---

## 📡 API仕様

### 投稿API

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/api/posts` | 投稿一覧取得 | 公開 |
| POST | `/api/posts` | 投稿作成 | 管理者 |
| GET | `/api/posts/[id]` | 投稿詳細取得 | 公開 |
| PATCH | `/api/posts/[id]` | 投稿更新 | 管理者 |
| DELETE | `/api/posts/[id]` | 投稿削除 | 管理者 |
| POST | `/api/posts/[id]/like` | いいね | 認証済み |
| POST | `/api/posts/[id]/unlike` | いいね取消 | 認証済み |
| POST | `/api/posts/[id]/participate` | 参加登録 | 認証済み |
| POST | `/api/posts/[id]/comments` | コメント投稿 | 認証済み |

### イベントAPI

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/api/events` | イベント一覧取得 | 認証済み |
| POST | `/api/events` | イベント作成 | 管理者 |
| GET | `/api/events/[id]` | イベント詳細取得 | 認証済み |
| PATCH | `/api/events/[id]` | イベント更新 | 管理者 |
| DELETE | `/api/events/[id]` | イベント削除 | 管理者 |
| POST | `/api/events/[id]/participate` | 参加登録 | 認証済み |
| POST | `/api/events/[id]/songs` | 課題曲追加 | 管理者 |
| POST | `/api/events/[id]/to-post` | 活動報告へ変換 | 管理者 |

### スケジュールAPI

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/api/activity-schedules` | スケジュール一覧 | 認証済み |
| POST | `/api/activity-schedules` | スケジュール作成 | 管理者 |
| GET | `/api/activity-schedules/[id]` | スケジュール詳細 | 認証済み |
| PATCH | `/api/activity-schedules/[id]` | スケジュール更新 | 管理者 |
| DELETE | `/api/activity-schedules/[id]` | スケジュール削除 | 管理者 |
| POST | `/api/activity-schedules/[id]/participate` | 参加登録 | 認証済み |
| POST | `/api/activity-schedules/[id]/to-post` | 活動報告へ変換 | 管理者 |

### ユーザーAPI

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/api/users` | ユーザー一覧取得 | 認証済み |
| GET | `/api/users/[id]` | ユーザー詳細取得 | 認証済み |
| PATCH | `/api/users/[id]/role` | 役割変更 | 管理者 |

### プロフィールAPI

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/api/profile` | 自分のプロフィール取得 | 認証済み |
| PATCH | `/api/profile` | プロフィール更新 | 認証済み |

---

## 📚 参考資料

### 公式ドキュメント

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)

### その他

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## 📝 ライセンス

MIT License

---

## 👤 作成者

**BOLD 軽音サークル**

- Website: [https://keion-circle-site.vercel.app/](https://keion-circle-site.vercel.app/)
- GitHub: [https://github.com/your-username/keion-circle-site](https://github.com/your-username/keion-circle-site)

---

<div align="center">

**🎸 BOLD 軽音メンバーサイト**

Made with ❤️ by BOLD 軽音サークル

</div>
