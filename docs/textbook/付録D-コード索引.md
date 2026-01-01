# 付録D：コード索引

> **この付録では、プロジェクト内の主要なファイルとコードをまとめています**

## 📚 この付録の目的

- ✅ プロジェクト全体の構造を把握できる
- ✅ 必要なコードをすぐに見つけられる
- ✅ ファイル間の関係を理解できる

---

## 📁 プロジェクト構造

```
keion-circle-site/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── auth/              # 認証ページ
│   │   ├── posts/             # 投稿ページ
│   │   ├── events/            # イベントページ
│   │   ├── activity-schedules/ # 活動スケジュールページ
│   │   ├── users/             # ユーザーページ
│   │   ├── profile/           # プロフィールページ
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx           # ホームページ
│   ├── components/            # 共通コンポーネント
│   ├── lib/                   # ユーティリティ
│   └── types/                 # 型定義
├── prisma/
│   └── schema.prisma          # データベーススキーマ
├── public/                    # 静的ファイル
├── scripts/                   # ユーティリティスクリプト
├── docs/                      # ドキュメント
│   └── textbook/             # この教科書
├── .env.local                 # 環境変数（開発）
├── .env.example               # 環境変数のテンプレート
├── package.json               # パッケージ設定
├── tsconfig.json              # TypeScript設定
├── next.config.ts             # Next.js設定
├── tailwind.config.ts         # Tailwind CSS設定
└── README.md                  # プロジェクト概要
```

---

## 🗂️ ファイル別コード一覧

### 設定ファイル

#### package.json

**場所**: `/package.json`

**役割**: プロジェクトの依存関係とスクリプトを管理

**主な内容**:
```json
{
  "name": "keion-circle-site",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "eslint",
    "postinstall": "prisma generate",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "test": "jest --watch",
    "test:unit": "jest --coverage",
    "test:integration": "jest --testPathPatterns=api",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  },
  "dependencies": {
    "next": "16.1.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "@prisma/client": "^5.22.0",
    "next-auth": "^5.0.0-beta.30",
    "bcryptjs": "^3.0.3",
    "@supabase/supabase-js": "^2.89.0",
    "lucide-react": "^0.562.0",
    "prisma": "^5.22.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^22",
    "@types/react": "^19",
    "@playwright/test": "^1.49.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^16.1.0",
    "tailwindcss": "^4.0.0"
  }
}
```

#### tsconfig.json

**場所**: `/tsconfig.json`

**役割**: TypeScriptのコンパイル設定

**主な設定**:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### next.config.ts

**場所**: `/next.config.ts`

**役割**: Next.jsの設定

**主な設定**:
```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

export default nextConfig
```

#### tailwind.config.ts

**場所**: `/tailwind.config.ts`

**役割**: Tailwind CSSの設定

**主な設定**:
```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
}

export default config
```

---

### データベース

#### schema.prisma

**場所**: `/prisma/schema.prisma`

**役割**: データベーススキーマ定義

**主要モデル**:

```prisma
// ユーザー
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String?
  name          String?
  role          String   @default("member")
  avatarUrl     String?
  bio           String?
  instrument    String?
  createdAt     DateTime @default(now())
  
  posts         Post[]
  events        Event[]
  activitySchedules ActivitySchedule[]
  // ... リレーション
}

// 投稿
model Post {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  youtubeUrls   String[]
  images        String[]
  createdAt     DateTime @default(now())
  userId        String
  
  user          User     @relation(fields: [userId], references: [id])
  participants  Participant[]
  likes         Like[]
  comments      Comment[]
}

// イベント
model Event {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  date          DateTime
  locationName  String?
  locationUrl   String?
  createdAt     DateTime @default(now())
  userId        String
  
  user          User     @relation(fields: [userId], references: [id])
  participants  EventParticipant[]
  comments      EventComment[]
}

// 活動スケジュール
model ActivitySchedule {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  date          DateTime
  location      String?
  locationUrl   String?
  createdAt     DateTime @default(now())
  userId        String
  
  user          User     @relation(fields: [userId], references: [id])
  participants  ActivityParticipant[]
  comments      ActivityComment[]
}
```

---

### 認証・権限

#### src/lib/auth.ts

**場所**: `/src/lib/auth.ts`

**役割**: NextAuth.js認証設定

**エクスポート**:
- `handlers`: API Route用ハンドラー
- `signIn`: サインイン関数
- `signOut`: サインアウト関数
- `auth`: セッション取得関数

**主要な設定**:
- Google OAuth プロバイダー
- Credentials プロバイダー（メール+パスワード）
- JWT セッション戦略
- カスタムコールバック（signIn, jwt, session）

#### src/lib/permissions.ts

**場所**: `/src/lib/permissions.ts`

**役割**: 権限チェック関数

**エクスポート**:
```typescript
// 管理者チェック
export async function isAdmin(): Promise<boolean>

// 管理者要求（エラーをスロー）
export async function requireAdmin(): Promise<void>
```

---

### データベース接続

#### src/lib/prisma.ts

**場所**: `/src/lib/prisma.ts`

**役割**: Prisma Clientのシングルトンインスタンス

**エクスポート**:
```typescript
export const prisma: PrismaClient
export default prisma
```

---

### ストレージ

#### src/lib/supabase.ts

**場所**: `/src/lib/supabase.ts`

**役割**: Supabase Storageクライアント

**エクスポート**:
```typescript
export const supabase: SupabaseClient | null
```

---

### 型定義

#### src/types/next-auth.d.ts

**場所**: `/src/types/next-auth.d.ts`

**役割**: NextAuth.jsの型拡張

**拡張内容**:
```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    avatarUrl?: string | null
  }
}
```

---

### API Routes

#### 投稿API

**場所**: `/src/app/api/posts/`

**エンドポイント**:
- `GET /api/posts` - 投稿一覧取得
- `POST /api/posts` - 投稿作成（管理者のみ）
- `GET /api/posts/[id]` - 投稿詳細取得
- `PATCH /api/posts/[id]` - 投稿更新（管理者のみ）
- `DELETE /api/posts/[id]` - 投稿削除（管理者のみ）
- `POST /api/posts/[id]/like` - いいね追加
- `DELETE /api/posts/[id]/like` - いいね削除
- `GET /api/posts/[id]/comments` - コメント一覧取得
- `POST /api/posts/[id]/comments` - コメント作成

#### イベントAPI

**場所**: `/src/app/api/events/`

**エンドポイント**:
- `GET /api/events` - イベント一覧取得
- `POST /api/events` - イベント作成（管理者のみ）
- `GET /api/events/[id]` - イベント詳細取得
- `PATCH /api/events/[id]` - イベント更新（管理者のみ）
- `DELETE /api/events/[id]` - イベント削除（管理者のみ）
- `POST /api/events/[id]/participate` - 参加登録
- `DELETE /api/events/[id]/participate` - 参加取り消し

#### 活動スケジュールAPI

**場所**: `/src/app/api/activity-schedules/`

**エンドポイント**:
- `GET /api/activity-schedules` - スケジュール一覧取得
- `POST /api/activity-schedules` - スケジュール作成（管理者のみ）
- `GET /api/activity-schedules/[id]` - スケジュール詳細取得
- `PATCH /api/activity-schedules/[id]` - スケジュール更新（管理者のみ）
- `DELETE /api/activity-schedules/[id]` - スケジュール削除（管理者のみ）
- `POST /api/activity-schedules/[id]/participate` - 参加登録
- `DELETE /api/activity-schedules/[id]/participate` - 参加取り消し

#### ユーザーAPI

**場所**: `/src/app/api/users/`

**エンドポイント**:
- `GET /api/users` - ユーザー一覧取得
- `GET /api/users/[id]` - ユーザー詳細取得
- `GET /api/profile` - プロフィール取得
- `PATCH /api/profile` - プロフィール更新

---

### ページ

#### ホームページ

**場所**: `/src/app/page.tsx`

**役割**: ランディングページ

**主要機能**:
- Hero セクション
- 機能紹介
- 最新の投稿表示
- 人気の投稿表示

#### 投稿ページ

**場所**: `/src/app/posts/page.tsx`

**役割**: 投稿一覧ページ

**主要機能**:
- 投稿一覧表示
- いいね機能
- コメント機能
- ページネーション

**関連ページ**:
- `/src/app/posts/new/page.tsx` - 新規投稿作成
- `/src/app/posts/[id]/page.tsx` - 投稿詳細
- `/src/app/posts/[id]/edit/page.tsx` - 投稿編集

#### イベントページ

**場所**: `/src/app/events/page.tsx`

**役割**: イベント管理ページ

**主要機能**:
- イベント一覧表示
- イベント作成（管理者のみ）
- 参加登録
- コメント機能

**関連ページ**:
- `/src/app/events/[id]/page.tsx` - イベント詳細

#### 活動スケジュールページ

**場所**: `/src/app/activity-schedules/page.tsx`

**役割**: 活動スケジュール管理ページ

**主要機能**:
- スケジュール一覧表示
- スケジュール作成（管理者のみ）
- 参加登録
- コメント機能

**関連ページ**:
- `/src/app/activity-schedules/[id]/page.tsx` - スケジュール詳細

#### ユーザーページ

**場所**: `/src/app/users/page.tsx`

**役割**: ユーザー一覧ページ

**主要機能**:
- ユーザー一覧表示
- 投稿数・コメント数表示

**関連ページ**:
- `/src/app/users/[id]/page.tsx` - ユーザー詳細

#### プロフィールページ

**場所**: `/src/app/profile/page.tsx`

**役割**: プロフィール編集ページ

**主要機能**:
- プロフィール情報表示・編集
- アバター画像アップロード
- 自己紹介編集
- 担当楽器設定

---

### 共通コンポーネント

#### DashboardLayout

**場所**: `/src/components/DashboardLayout.tsx`

**役割**: 共通レイアウト

**機能**:
- ヘッダー
- サイドバー（デスクトップ）
- モバイルメニュー
- ユーザー情報表示

#### RichTextEditor

**場所**: `/src/components/RichTextEditor.tsx`

**役割**: Markdown エディタ

**機能**:
- Markdown 記法のサポート
- プレビュー表示
- 画像アップロード（Markdown記法）

#### Avatar

**場所**: `/src/components/Avatar.tsx`

**役割**: アバター画像表示

**Props**:
```typescript
interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
}
```

---

### スクリプト

#### create-admin.js

**場所**: `/scripts/create-admin.js`

**役割**: 管理者ユーザーを作成

**使い方**:
```bash
node scripts/create-admin.js admin@example.com password123 "管理者名"
```

#### create-admin-production.js

**場所**: `/scripts/create-admin-production.js`

**役割**: 本番環境で管理者ユーザーを作成

**使い方**:
```bash
npx dotenv -e .env.production -- node scripts/create-admin-production.js admin@example.com password123 "管理者名"
```

---

## 🔍 コードの見つけ方

### 機能別

#### 認証機能
- 設定: `/src/lib/auth.ts`
- ログインページ: `/src/app/auth/signin/page.tsx`
- サインアップページ: `/src/app/auth/signup/page.tsx`

#### 投稿機能
- API: `/src/app/api/posts/`
- ページ: `/src/app/posts/`
- コンポーネント: 各ページ内

#### いいね機能
- API: `/src/app/api/posts/[id]/like/route.ts`
- コンポーネント: 各投稿表示部分

#### コメント機能
- API: `/src/app/api/posts/[id]/comments/route.ts`
- コンポーネント: 各投稿詳細ページ

#### 画像アップロード
- Supabase設定: `/src/lib/supabase.ts`
- アップロード処理: プロフィールページ、投稿作成ページ

---

## 📊 コンポーネント関係図

```
App (layout.tsx)
├─ HomePage (page.tsx)
│  └─ PostCard (inline)
├─ DashboardLayout
│  ├─ Header
│  ├─ Sidebar
│  └─ Content
│     ├─ PostsPage
│     │  └─ PostCard
│     ├─ EventsPage
│     │  └─ EventCard
│     ├─ ActivitySchedulesPage
│     │  └─ ScheduleCard
│     ├─ UsersPage
│     │  └─ UserCard
│     └─ ProfilePage
│        └─ Avatar
└─ Auth Pages
   ├─ SignIn
   └─ SignUp
```

---

## まとめ

この付録では、プロジェクト内の主要なファイルとコードをまとめました。

### 💡 コードを探すコツ

1. **ファイル名で検索**
   - VS Code: `Ctrl + P` (Windows/Linux), `Cmd + P` (Mac)
   - ファイル名の一部を入力

2. **コードで検索**
   - VS Code: `Ctrl + Shift + F` (Windows/Linux), `Cmd + Shift + F` (Mac)
   - 関数名、変数名で検索

3. **定義にジャンプ**
   - VS Code: `F12` または `Ctrl + Click`
   - 関数やコンポーネントの定義場所に移動

4. **参照を検索**
   - VS Code: `Shift + F12`
   - その関数がどこで使われているか確認

5. **フォルダ構造を理解する**
   - `src/app/` - ページとAPI
   - `src/components/` - 共通コンポーネント
   - `src/lib/` - ユーティリティ
   - `prisma/` - データベーススキーマ

---

## 🎉 教科書の完成

**おめでとうございます！**

この教科書で、BOLD 軽音メンバーサイトの全てを学びました。

### 学んだこと

- ✅ Next.js 16 + React 19 の使い方
- ✅ TypeScript による型安全な開発
- ✅ Prisma による データベース管理
- ✅ NextAuth.js による認証実装
- ✅ Tailwind CSS による スタイリング
- ✅ Vercel への デプロイ
- ✅ 実践的な Web アプリケーション開発

### 次のステップ

1. **このプロジェクトをカスタマイズ**
   - 新しい機能を追加
   - デザインを変更
   - 自分だけのサイトに

2. **他のプロジェクトに挑戦**
   - ブログ、ECサイト、SNS など
   - 学んだ技術を応用

3. **コミュニティに参加**
   - GitHub で OSS に貢献
   - 技術記事を書く
   - 勉強会に参加

**Happy Coding! 🚀**

---

[← 前の章：付録C 参考リソース](付録C-参考リソース.md) | [目次に戻る](00-目次.md)
