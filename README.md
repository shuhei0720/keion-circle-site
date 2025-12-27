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
- [機能一覧](#-機能一覧)
- [技術スタック](#-技術スタック)
- [データモデル](#-データモデル)
- [API仕様](#-api仕様)
- [ディレクトリ構成](#-ディレクトリ構成)
- [開発ガイド](#-開発ガイド)

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

## 🏗 システムアーキテクチャ

```mermaid
graph TB
    subgraph "クライアント層"
        Browser[ブラウザ]
        Mobile[モバイル]
    end
    
    subgraph "Next.js アプリケーション層"
        Pages[Pages<br/>React Components]
        API[API Routes<br/>RESTful API]
        Auth[NextAuth.js<br/>認証・認可]
        ServerActions[Server Actions<br/>サーバーアクション]
    end
    
    subgraph "データ層"
        Prisma[Prisma ORM]
        DB[(PostgreSQL<br/>Supabase)]
        Storage[Supabase Storage<br/>画像保存]
    end
    
    subgraph "外部サービス"
        Google[Google OAuth 2.0]
        YouTube[YouTube API<br/>動画埋め込み]
    end
    
    Browser --> Pages
    Mobile --> Pages
    Pages --> API
    Pages --> ServerActions
    API --> Auth
    Auth --> Google
    API --> Prisma
    ServerActions --> Prisma
    Prisma --> DB
    API --> Storage
    Pages --> YouTube
    
    style Browser fill:#e3f2fd
    style Mobile fill:#e3f2fd
    style Pages fill:#fff3e0
    style API fill:#fff3e0
    style Auth fill:#f3e5f5
    style Prisma fill:#e8f5e9
    style DB fill:#e8f5e9
    style Storage fill:#e8f5e9
```

### レイヤー説明

1. **クライアント層**: ユーザーがアクセスするWebブラウザ・モバイルブラウザ
2. **アプリケーション層**: Next.js App Routerによる統合されたフロントエンド・バックエンド
3. **データ層**: Prisma経由でPostgreSQLとSupabase Storageにアクセス
4. **外部サービス層**: Google OAuthとYouTube埋め込み

---

## ✨ 機能一覧

### 1️⃣ 認証システム

```mermaid
graph LR
    User[ユーザー] --> Choice{ログイン方法}
    Choice -->|Google| OAuth[Google OAuth 2.0]
    Choice -->|メール| EmailPass[メール+パスワード]
    OAuth --> Session[セッション生成]
    EmailPass --> Verify[パスワード検証<br/>bcryptjs]
    Verify --> Session
    Session --> Dashboard[ダッシュボード]
    
    style User fill:#e3f2fd
    style OAuth fill:#fbbc04
    style EmailPass fill:#4285f4
    style Session fill:#34a853
    style Dashboard fill:#ea4335
```

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

```mermaid
graph TD
    Create[イベント作成] --> Details[基本情報入力<br/>タイトル/日時/場所]
    Details --> Songs[課題曲追加]
    Songs --> Parts[パート割り当て<br/>ボーカル/ギター/ベース<br/>ドラム/キーボード]
    Parts --> Participants[参加者募集]
    Participants --> Report[活動報告作成]
    Report --> Post[投稿として公開]
    
    style Create fill:#e3f2fd
    style Songs fill:#fff3e0
    style Parts fill:#f3e5f5
    style Report fill:#e8f5e9
    style Post fill:#ffebee
```

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

## 🗄 データモデル

### ER図

```mermaid
erDiagram
    User ||--o{ Post : creates
    User ||--o{ Event : creates
    User ||--o{ ActivitySchedule : creates
    User ||--o{ PostParticipant : participates
    User ||--o{ PostLike : likes
    User ||--o{ Comment : writes
    User ||--o{ EventParticipant : participates
    User ||--o{ ActivityParticipant : participates
    User ||--o{ Account : has
    User ||--o{ Session : has
    
    Post ||--o{ PostParticipant : has
    Post ||--o{ PostLike : has
    Post ||--o{ Comment : has
    Post }o--|| Event : references
    
    Event ||--o{ EventParticipant : has
    Event ||--o{ Comment : has
    Event ||--o{ Post : generates
    
    ActivitySchedule ||--o{ ActivityParticipant : has
    ActivitySchedule ||--o{ Comment : has
    
    User {
        string id PK
        string name
        string email UK
        string password
        string avatarUrl
        string bio
        string instruments
        string role
        datetime createdAt
        datetime updatedAt
    }
    
    Post {
        string id PK
        string title
        string content
        array youtubeUrls
        array images
        string userId FK
        string eventId FK
        string activityScheduleId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Event {
        string id PK
        string title
        string content
        datetime date
        string locationName
        string locationUrl
        string songs
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    ActivitySchedule {
        string id PK
        string title
        string content
        datetime date
        string location
        string locationUrl
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    PostParticipant {
        string id PK
        string postId FK
        string userId FK
        string status
        datetime createdAt
    }
    
    PostLike {
        string id PK
        string postId FK
        string userId FK
        datetime createdAt
    }
    
    Comment {
        string id PK
        string content
        string userId FK
        string postId FK
        string activityScheduleId FK
        string eventId FK
        datetime createdAt
        datetime updatedAt
    }
    
    EventParticipant {
        string id PK
        string eventId FK
        string userId FK
        datetime createdAt
    }
    
    ActivityParticipant {
        string id PK
        string activityScheduleId FK
        string userId FK
        datetime createdAt
    }
    
    Account {
        string id PK
        string userId FK
        string provider
        string providerAccountId
    }
    
    Session {
        string id PK
        string userId FK
        string sessionToken UK
        datetime expires
    }
```

### 主要モデル説明

#### User（ユーザー）
- サークルメンバーの基本情報を管理
- `role`: "admin" または "member" で権限を制御
- `instruments`: 演奏可能な楽器情報（JSON形式）

#### Post（投稿・活動報告）
- サークルの活動報告を管理
- `youtubeUrls`: 複数のYouTube動画URL（配列）
- `images`: 複数の画像URL（配列、Supabase Storage）
- `eventId` / `activityScheduleId`: イベント・スケジュールからの自動生成時に参照

#### Event（イベント）
- ライブやセッションなどのイベント情報
- `songs`: 課題曲情報（JSON形式）[{title, sheetUrl, youtubeUrl, parts: {instrument: player}}]
- イベント終了後、活動報告（Post）に変換可能

#### ActivitySchedule（活動スケジュール）
- 練習日程などの活動スケジュール
- `location` / `locationUrl`: 場所情報とGoogle Mapsリンク
- 活動終了後、活動報告（Post）に変換可能

#### Comment（コメント）
- 投稿、イベント、活動スケジュールに対するコメント
- ポリモーフィック関連（postId / eventId / activityScheduleId）

---

## 🔌 API仕様

### 📊 APIサマリー

- **総エンドポイント数**: 35
- **公開アクセス可能**: 6（認証不要）
- **メンバー権限**: 19（member/admin）
- **管理者専用**: 10（admin）
- **HTTPメソッド**: GET (8), POST (20), PUT (4), PATCH (2), DELETE (5)

### 🔐 認証・認可フロー

```mermaid
sequenceDiagram
    participant Client as クライアント
    participant API as API Route
    participant Auth as NextAuth.js
    participant DB as Database
    
    Client->>API: リクエスト + Cookie
    API->>Auth: getServerSession()
    Auth->>DB: セッション検証
    DB-->>Auth: User情報
    Auth-->>API: Session + User
    
    alt 認証必須エンドポイント
        API->>API: session存在チェック
        alt セッションなし
            API-->>Client: 401 Unauthorized
        end
    end
    
    alt 管理者専用エンドポイント
        API->>API: user.role === "admin"
        alt 管理者でない
            API-->>Client: 403 Forbidden
        end
    end
    
    API->>DB: データ操作
    DB-->>API: 結果
    API-->>Client: レスポンス
```

### 📝 API エンドポイント一覧

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

## 📁 ディレクトリ構成

```
keion-circle-site/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # NextAuth.js 認証
│   │   │   │   └── [...nextauth]/   # 動的認証ルート
│   │   │   ├── posts/                # 投稿API
│   │   │   │   ├── [id]/            # 個別投稿操作
│   │   │   │   │   ├── route.ts     # GET/PUT/DELETE
│   │   │   │   │   ├── details/     # 詳細取得
│   │   │   │   │   ├── comments/    # コメント
│   │   │   │   │   ├── like/        # いいね
│   │   │   │   │   └── participate/ # 参加登録
│   │   │   │   ├── image/           # 画像アップロード
│   │   │   │   └── route.ts         # GET/POST（一覧・作成）
│   │   │   ├── events/               # イベントAPI
│   │   │   │   └── [id]/            # 個別イベント操作
│   │   │   ├── activity-schedules/   # 活動スケジュールAPI
│   │   │   │   └── [id]/            # 個別スケジュール操作
│   │   │   ├── users/                # ユーザー管理API
│   │   │   │   └── [id]/            # 個別ユーザー操作
│   │   │   └── profile/              # プロフィールAPI
│   │   │       └── avatar/          # アバター画像
│   │   ├── posts/                    # 活動報告ページ
│   │   │   ├── [id]/                 # 個別投稿ページ
│   │   │   ├── new/                  # 新規投稿作成
│   │   │   ├── edit/[id]/            # 投稿編集
│   │   │   └── page.tsx              # 投稿一覧
│   │   ├── events/                   # イベントページ
│   │   │   ├── [id]/                 # 個別イベントページ
│   │   │   ├── new/                  # 新規イベント作成
│   │   │   ├── edit/[id]/            # イベント編集
│   │   │   └── page.tsx              # イベント一覧
│   │   ├── activity-schedules/       # 活動スケジュールページ
│   │   │   └── (同上)
│   │   ├── users/                    # ユーザー管理ページ
│   │   │   ├── [id]/                 # ユーザー詳細
│   │   │   └── page.tsx              # ユーザー一覧
│   │   ├── profile/                  # プロフィールページ
│   │   │   └── page.tsx
│   │   ├── auth/                     # 認証ページ
│   │   │   ├── signin/               # サインイン
│   │   │   └── signup/               # サインアップ
│   │   ├── layout.tsx                # ルートレイアウト
│   │   └── page.tsx                  # ホームページ（ダッシュボード）
│   ├── components/                   # 共通コンポーネント
│   │   ├── DashboardLayout.tsx       # ダッシュボードレイアウト
│   │   ├── Navigation.tsx            # ナビゲーションバー
│   │   ├── LoginForm.tsx             # ログインフォーム
│   │   ├── RichTextEditor.tsx        # Markdownエディタ
│   │   ├── YouTubeEmbed.tsx          # YouTube埋め込み
│   │   ├── Avatar.tsx                # アバター表示
│   │   ├── Button.tsx                # ボタン
│   │   ├── Card.tsx                  # カード
│   │   └── Modal.tsx                 # モーダル
│   ├── lib/                          # ユーティリティ
│   │   ├── auth.ts                   # NextAuth設定
│   │   ├── prisma.ts                 # Prismaクライアント
│   │   ├── permissions.ts            # 権限チェック関数
│   │   └── supabase.ts               # Supabaseクライアント
│   └── types/                        # 型定義
│       └── next-auth.d.ts            # NextAuth型拡張
├── prisma/
│   └── schema.prisma                 # データベーススキーマ
├── scripts/
│   └── create-admin.js               # 管理者作成スクリプト
├── public/                           # 静的ファイル
│   ├── icon.svg                      # PWAアイコン
│   ├── apple-touch-icon.svg          # iOS用アイコン
│   ├── manifest.json                 # PWAマニフェスト
│   └── hero-bg.jpg                   # ヒーロー背景画像
├── .env.example                      # 環境変数テンプレート
├── next.config.ts                    # Next.js設定
├── package.json                      # 依存関係・スクリプト
├── tsconfig.json                     # TypeScript設定
├── tailwind.config.ts                # Tailwind CSS設定
├── postcss.config.mjs                # PostCSS設定
└── README.md                         # このファイル
```

---

## 👨‍💻 開発ガイド

### 🚀 クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/shuhei0720/keion-circle-site.git
cd keion-circle-site

# 依存関係のインストール
npm install

# 環境変数の設定（.env.exampleをコピーして編集）
cp .env.example .env.local
# .env.localを開いて、Supabaseの接続情報を設定してください

# データベースの初期化
npx prisma generate
npx prisma db push

# 管理者ユーザーの作成
node scripts/create-admin.js admin@example.com password123 "管理者名"

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 📝 有用なコマンド

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

### 🔧 環境変数の設定

`.env.local` ファイル:

```env
# 認証設定
AUTH_URL=http://localhost:3000
AUTH_SECRET=your-random-secret-key-at-least-32-chars
AUTH_TRUST_HOST=true

# NextAuth v5用（本番環境でも同じ値を設定）
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-at-least-32-chars

# データベース設定（Supabase PostgreSQL）
# Supabase Dashboard → Project Settings → Database → Connection String (Transaction pooler)
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Google OAuth認証（Google Cloud Consoleで取得）
# 承認済みのリダイレクトURI: http://localhost:3000/api/auth/callback/google
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

### 🧪 テスト

現在、テストは未実装ですが、以下のフレームワークの導入を推奨します:

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **API Tests**: Supertest

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
