# 第35章：ドキュメントとAPIリファレンス

この章では、プロジェクトのドキュメント作成とAPIリファレンスの整備について学びます。

## 35.1 プロジェクトドキュメント

### README.md

```markdown
# BOLD軽音 メンバーサイト

Next.js 16とTailwind CSSで構築された軽音サークルのメンバー専用Webサイトです。

## 📋 目次

- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [開発ガイド](#開発ガイド)
- [デプロイ](#デプロイ)
- [トラブルシューティング](#トラブルシューティング)
- [ライセンス](#ライセンス)

## ✨ 主な機能

- 🔐 **認証システム**: NextAuth.js v5によるGoogle OAuth/メールログイン
- 📝 **投稿機能**: YouTubeとの連携、画像アップロード、いいね・コメント
- 📅 **スケジュール調整**: 複数候補日の設定、投票、参加者管理
- 🎸 **イベント管理**: 活動報告の作成、参加者記録
- 👥 **ユーザー管理**: プロフィール編集、役割管理
- 🔍 **検索機能**: 投稿・ユーザーの全文検索

## 🛠 技術スタック

### フロントエンド
- **Next.js 16**: React フレームワーク (App Router)
- **React 19**: UIライブラリ
- **TypeScript 5**: 型安全な開発
- **Tailwind CSS v4**: ユーティリティファーストCSS
- **Lucide React**: アイコンライブラリ

### バックエンド
- **NextAuth.js 5**: 認証
- **Prisma 5**: ORM
- **PostgreSQL/SQLite**: データベース
- **Zod**: バリデーション

### インフラ
- **Vercel**: ホスティング
- **Supabase**: ストレージ・データベース
- **GitHub Actions**: CI/CD

## 🚀 セットアップ

### 必要な環境

- Node.js 18.x以上
- npm または yarn
- Git

### インストール手順

1. リポジトリのクローン

\`\`\`bash
git clone https://github.com/your-org/keion-circle-site.git
cd keion-circle-site
\`\`\`

2. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

3. 環境変数の設定

\`\`\`bash
cp .env.example .env.local
\`\`\`

`.env.local`を編集：

\`\`\`env
AUTH_URL=http://localhost:3000
AUTH_SECRET=<openssl rand -base64 32>
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID=<Google Cloud Console>
GOOGLE_CLIENT_SECRET=<Google Cloud Console>
NEXT_PUBLIC_SUPABASE_URL=<Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
\`\`\`

4. データベースのセットアップ

\`\`\`bash
export DATABASE_URL="file:./dev.db"
npx prisma generate
npx prisma db push
\`\`\`

5. 管理者ユーザーの作成

\`\`\`bash
node scripts/create-admin.js admin@example.com password123 "管理者名"
\`\`\`

6. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで http://localhost:3000 を開いてください。

## 📖 開発ガイド

### プロジェクト構成

\`\`\`
keion-circle-site/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # 認証ページ
│   │   ├── api/          # APIルート
│   │   ├── posts/        # 投稿ページ
│   │   ├── schedules/    # スケジュールページ
│   │   └── users/        # ユーザーページ
│   ├── components/       # 共通コンポーネント
│   │   ├── ui/           # UIコンポーネント
│   │   └── features/     # 機能別コンポーネント
│   └── lib/              # ユーティリティ
│       ├── actions/      # Server Actions
│       ├── utils/        # ヘルパー関数
│       └── validations/  # バリデーションスキーマ
├── prisma/               # データベーススキーマ
├── public/               # 静的ファイル
└── scripts/              # ユーティリティスクリプト
\`\`\`

### コーディング規約

#### TypeScript

\`\`\`typescript
// 明示的な型定義を使用
interface User {
  id: string;
  name: string;
  email: string;
}

// 型推論を活用
const users = await prisma.user.findMany();

// async/awaitを使用
async function fetchUser(id: string): Promise<User> {
  return await prisma.user.findUnique({ where: { id } });
}
\`\`\`

#### React コンポーネント

\`\`\`typescript
// 関数コンポーネントを使用
export function UserCard({ user }: { user: User }) {
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

// Server Componentをデフォルトに
// Client Componentは'use client'ディレクティブを使用
'use client';
export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

### テスト

\`\`\`bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:coverage
\`\`\`

### リント・フォーマット

\`\`\`bash
# ESLint
npm run lint

# 自動修正
npm run lint:fix

# TypeScript型チェック
npx tsc --noEmit
\`\`\`

## 🌐 デプロイ

### Vercelへのデプロイ

1. Vercelアカウントにログイン
2. GitHubリポジトリを接続
3. 環境変数を設定
4. デプロイ

詳細は[デプロイガイド](docs/DEPLOY.md)を参照してください。

## 🐛 トラブルシューティング

### よくある問題

**問題**: `Error: P2002: Unique constraint failed`

**解決策**: 重複データが存在します。データベースをリセットしてください。

\`\`\`bash
npx prisma db push --force-reset
\`\`\`

**問題**: `Module not found: Can't resolve '@/...'`

**解決策**: TypeScriptのパスマッピングが正しく設定されているか確認してください。

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
\`\`\`

詳細は[トラブルシューティングガイド](docs/TROUBLESHOOTING.md)を参照してください。

## 📄 ライセンス

MIT License

## 👥 コントリビューター

- [Your Name](https://github.com/yourusername)

## 🤝 コントリビューション

プルリクエストを歓迎します！詳細は[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

## 📞 サポート

問題や質問がある場合は、[Issue](https://github.com/your-org/keion-circle-site/issues)を作成してください。
```

---

## 35.2 APIドキュメント

### API概要

```markdown
# API リファレンス

## 認証

すべてのAPIエンドポイントは認証が必要です（一部の公開エンドポイントを除く）。

### 認証方法

NextAuth.jsのセッションCookieを使用します。

\`\`\`typescript
// クライアント側
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
if (session) {
  // 認証済み
}

// サーバー側
import { auth } from '@/auth';

const session = await auth();
if (session?.user) {
  // 認証済み
}
\`\`\`

## エンドポイント

### 投稿 API

#### GET /api/posts

投稿一覧を取得

**パラメータ**

| 名前 | 型 | 必須 | 説明 |
|------|------|------|------|
| page | number | No | ページ番号（デフォルト: 1） |
| limit | number | No | 取得件数（デフォルト: 20） |
| sort | string | No | ソート順（latest, popular） |
| search | string | No | 検索キーワード |

**レスポンス**

\`\`\`typescript
{
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
\`\`\`

**例**

\`\`\`bash
curl "https://your-app.vercel.app/api/posts?page=1&limit=20"
\`\`\`

#### POST /api/posts

新規投稿を作成（管理者のみ）

**リクエストボディ**

\`\`\`typescript
{
  title: string;
  content: string;
  youtubeUrls?: string[];
  published?: boolean;
}
\`\`\`

**レスポンス**

\`\`\`typescript
{
  post: Post;
}
\`\`\`

**例**

\`\`\`bash
curl -X POST "https://your-app.vercel.app/api/posts" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "新しい投稿",
    "content": "投稿内容",
    "published": true
  }'
\`\`\`

#### GET /api/posts/[id]

特定の投稿を取得

**レスポンス**

\`\`\`typescript
{
  post: Post & {
    author: User;
    likes: Like[];
    comments: Comment[];
    participants: Participant[];
  };
}
\`\`\`

#### PUT /api/posts/[id]

投稿を更新（管理者のみ）

**リクエストボディ**

\`\`\`typescript
{
  title?: string;
  content?: string;
  youtubeUrls?: string[];
  published?: boolean;
}
\`\`\`

#### DELETE /api/posts/[id]

投稿を削除（管理者のみ）

**レスポンス**

\`\`\`typescript
{
  success: true;
}
\`\`\`

### いいね API

#### POST /api/posts/[id]/like

投稿にいいねする

**レスポンス**

\`\`\`typescript
{
  liked: boolean;
  likesCount: number;
}
\`\`\`

### コメント API

#### GET /api/posts/[id]/comments

投稿のコメント一覧を取得

**レスポンス**

\`\`\`typescript
{
  comments: Comment[];
}
\`\`\`

#### POST /api/posts/[id]/comments

コメントを投稿

**リクエストボディ**

\`\`\`typescript
{
  content: string;
}
\`\`\`

### スケジュール API

#### GET /api/schedules

スケジュール一覧を取得

**パラメータ**

| 名前 | 型 | 必須 | 説明 |
|------|------|------|------|
| status | string | No | ステータス（upcoming, past, all） |

**レスポンス**

\`\`\`typescript
{
  schedules: Schedule[];
}
\`\`\`

#### POST /api/schedules

新規スケジュールを作成（管理者のみ）

**リクエストボディ**

\`\`\`typescript
{
  title: string;
  description: string;
  candidateDates: {
    date: string; // ISO 8601形式
    location?: string;
  }[];
}
\`\`\`

#### POST /api/schedules/[id]/vote

スケジュールに投票

**リクエストボディ**

\`\`\`typescript
{
  candidateDateId: string;
  status: 'available' | 'maybe' | 'unavailable';
}
\`\`\`

### ユーザー API

#### GET /api/users

ユーザー一覧を取得

**レスポンス**

\`\`\`typescript
{
  users: User[];
}
\`\`\`

#### GET /api/users/[id]

特定のユーザーを取得

**レスポンス**

\`\`\`typescript
{
  user: User & {
    posts: Post[];
    _count: {
      posts: number;
      comments: number;
    };
  };
}
\`\`\`

#### PUT /api/users/[id]

ユーザー情報を更新

**リクエストボディ**

\`\`\`typescript
{
  name?: string;
  bio?: string;
  instrument?: string;
}
\`\`\`

### 画像アップロード API

#### POST /api/upload

画像をアップロード

**リクエスト**

- Content-Type: multipart/form-data
- フィールド名: file

**制限**

- 最大サイズ: 5MB
- 対応形式: JPEG, PNG, GIF, WebP

**レスポンス**

\`\`\`typescript
{
  url: string;
  width: number;
  height: number;
}
\`\`\`

### 検索 API

#### GET /api/search

全文検索

**パラメータ**

| 名前 | 型 | 必須 | 説明 |
|------|------|------|------|
| q | string | Yes | 検索キーワード |
| type | string | No | 検索対象（posts, users, all） |

**レスポンス**

\`\`\`typescript
{
  posts: Post[];
  users: User[];
}
\`\`\`

## エラーレスポンス

### エラー形式

\`\`\`typescript
{
  error: string;
  details?: any;
}
\`\`\`

### HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | 不正なリクエスト |
| 401 | 認証が必要 |
| 403 | 権限なし |
| 404 | リソースが見つからない |
| 500 | サーバーエラー |

## レート制限

APIには以下のレート制限があります：

- 認証済みユーザー: 100リクエスト/分
- 未認証ユーザー: 20リクエスト/分

レート制限を超えると、429 Too Many Requestsが返されます。
```

---

## 35.3 データモデル

### データベーススキーマドキュメント

```markdown
# データベーススキーマ

## User（ユーザー）

ユーザー情報を管理するテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | String | ユーザーID（CUID） |
| name | String | 表示名 |
| email | String | メールアドレス（一意） |
| emailVerified | DateTime? | メール認証日時 |
| password | String? | パスワードハッシュ |
| image | String? | アバター画像URL |
| role | String | 役割（admin/member） |
| bio | String? | 自己紹介 |
| instrument | String? | 担当楽器 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |
| deletedAt | DateTime? | 削除日時 |

**リレーション**

- posts: Post[] - 作成した投稿
- comments: Comment[] - コメント
- likes: Like[] - いいね
- accounts: Account[] - OAuth連携
- sessions: Session[] - セッション

**インデックス**

- email: 一意インデックス
- role: 通常インデックス

## Post（投稿）

活動報告やお知らせを管理するテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | String | 投稿ID（CUID） |
| title | String | タイトル |
| content | String | 本文 |
| published | Boolean | 公開状態 |
| authorId | String | 作成者ID |
| eventId | String? | 関連イベントID |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

**リレーション**

- author: User - 作成者
- event: Event? - 関連イベント
- youtubeUrls: YoutubeUrl[] - YouTube動画
- images: Image[] - 画像
- likes: Like[] - いいね
- comments: Comment[] - コメント
- participants: Participant[] - 参加者

**インデックス**

- authorId: 通常インデックス
- published: 通常インデックス
- createdAt: 通常インデックス

## Schedule（スケジュール）

スケジュール調整を管理するテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | String | スケジュールID（CUID） |
| title | String | タイトル |
| description | String | 説明 |
| createdById | String | 作成者ID |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

**リレーション**

- createdBy: User - 作成者
- candidateDates: CandidateDate[] - 候補日
- comments: ScheduleComment[] - コメント

## CandidateDate（候補日）

スケジュールの候補日を管理するテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | String | 候補日ID（CUID） |
| scheduleId | String | スケジュールID |
| date | DateTime | 日時 |
| location | String? | 場所 |
| createdAt | DateTime | 作成日時 |

**リレーション**

- schedule: Schedule - スケジュール
- votes: Vote[] - 投票

## Vote（投票）

スケジュールへの投票を管理するテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | String | 投票ID（CUID） |
| candidateDateId | String | 候補日ID |
| userId | String | ユーザーID |
| status | String | available/maybe/unavailable |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

**制約**

- [candidateDateId, userId]: 複合一意キー

## Event（イベント）

活動イベントを管理するテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | String | イベントID（CUID） |
| title | String | タイトル |
| description | String | 説明 |
| date | DateTime | 開催日時 |
| location | String? | 場所 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

**リレーション**

- posts: Post[] - 活動報告
- participants: EventParticipant[] - 参加者

## ER図

\`\`\`mermaid
erDiagram
    User ||--o{ Post : creates
    User ||--o{ Comment : writes
    User ||--o{ Like : gives
    User ||--o{ Vote : casts
    User ||--o{ Schedule : creates
    Post ||--o{ Comment : has
    Post ||--o{ Like : receives
    Post ||--o{ YoutubeUrl : embeds
    Post ||--o{ Image : contains
    Post }o--|| Event : references
    Schedule ||--o{ CandidateDate : has
    CandidateDate ||--o{ Vote : receives
    Event ||--o{ EventParticipant : has
```

---

## 35.4 コンポーネントライブラリ

### コンポーネントカタログ

```markdown
# コンポーネントライブラリ

## ボタンコンポーネント

### Button

基本的なボタンコンポーネント

**Props**

\`\`\`typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}
\`\`\`

**使用例**

\`\`\`tsx
import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';

<Button variant="primary" size="md">
  保存
</Button>

<Button variant="outline" icon={<Save size={16} />}>
  アイコン付き
</Button>

<Button loading>
  読み込み中...
</Button>
\`\`\`

**バリアント**

- primary: 主要なアクション（青色）
- secondary: 補助的なアクション（グレー）
- outline: 枠線のみ
- ghost: 背景なし

## フォームコンポーネント

### Input

テキスト入力フィールド

**Props**

\`\`\`typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
\`\`\`

**使用例**

\`\`\`tsx
<Input
  label="メールアドレス"
  type="email"
  error="有効なメールアドレスを入力してください"
  helperText="example@domain.com"
/>
\`\`\`

### Textarea

複数行のテキスト入力

**Props**

\`\`\`typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
}
\`\`\`

### Select

選択ボックス

**Props**

\`\`\`typescript
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}
\`\`\`

## レイアウトコンポーネント

### Card

カードレイアウト

**使用例**

\`\`\`tsx
<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
  </CardHeader>
  <CardContent>
    コンテンツ
  </CardContent>
  <CardFooter>
    <Button>アクション</Button>
  </CardFooter>
</Card>
\`\`\`

### Modal

モーダルダイアログ

**Props**

\`\`\`typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
\`\`\`

**使用例**

\`\`\`tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="確認"
  size="md"
>
  <p>本当に削除しますか？</p>
  <div className="flex gap-2 mt-4">
    <Button onClick={() => setIsOpen(false)}>
      キャンセル
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      削除
    </Button>
  </div>
</Modal>
\`\`\`

## フィードバックコンポーネント

### Toast

通知メッセージ

**使用例**

\`\`\`tsx
import { useToast } from '@/contexts/ToastContext';

const { showToast } = useToast();

showToast('保存しました', 'success');
showToast('エラーが発生しました', 'error');
\`\`\`

### LoadingSpinner

読み込み中インジケーター

**Props**

\`\`\`typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}
\`\`\`

**使用例**

\`\`\`tsx
<LoadingSpinner size="md" />
<LoadingSpinner fullScreen />
\`\`\`

### ErrorMessage

エラーメッセージ表示

**Props**

\`\`\`typescript
interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}
\`\`\`

## データ表示コンポーネント

### Table

テーブル表示

**使用例**

\`\`\`tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>名前</TableHead>
      <TableHead>メール</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
\`\`\`

### Pagination

ページネーション

**Props**

\`\`\`typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
\`\`\`

## ナビゲーションコンポーネント

### Tabs

タブ切り替え

**使用例**

\`\`\`tsx
<Tabs defaultValue="profile">
  <TabsList>
    <TabsTrigger value="profile">プロフィール</TabsTrigger>
    <TabsTrigger value="posts">投稿</TabsTrigger>
    <TabsTrigger value="settings">設定</TabsTrigger>
  </TabsList>
  <TabsContent value="profile">
    プロフィール内容
  </TabsContent>
  <TabsContent value="posts">
    投稿一覧
  </TabsContent>
</Tabs>
\`\`\`

### Breadcrumb

パンくずリスト

**使用例**

\`\`\`tsx
<Breadcrumb>
  <BreadcrumbItem href="/">ホーム</BreadcrumbItem>
  <BreadcrumbItem href="/posts">投稿</BreadcrumbItem>
  <BreadcrumbItem>詳細</BreadcrumbItem>
</Breadcrumb>
\`\`\`
```

---

## 35.5 スタイルガイド

### デザインシステム

```markdown
# スタイルガイド

## カラーパレット

### プライマリカラー

\`\`\`css
/* 青系 */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
\`\`\`

### セカンダリカラー

\`\`\`css
/* グレー系 */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-500: #6b7280;
--color-gray-700: #374151;
--color-gray-900: #111827;
\`\`\`

### フィードバックカラー

\`\`\`css
/* 成功 */
--color-success: #10b981;
/* 警告 */
--color-warning: #f59e0b;
/* エラー */
--color-error: #ef4444;
/* 情報 */
--color-info: #3b82f6;
\`\`\`

## タイポグラフィ

### フォントファミリー

\`\`\`css
--font-sans: 'Inter', 'Noto Sans JP', sans-serif;
--font-mono: 'Fira Code', monospace;
\`\`\`

### フォントサイズ

| クラス | サイズ | 用途 |
|--------|--------|------|
| text-xs | 0.75rem | キャプション |
| text-sm | 0.875rem | 小さいテキスト |
| text-base | 1rem | 本文 |
| text-lg | 1.125rem | 大きいテキスト |
| text-xl | 1.25rem | サブ見出し |
| text-2xl | 1.5rem | 見出し |
| text-3xl | 1.875rem | 大見出し |

### 見出しスタイル

\`\`\`tsx
<h1 className="text-3xl font-bold text-gray-900">
  ページタイトル
</h1>

<h2 className="text-2xl font-semibold text-gray-800">
  セクションタイトル
</h2>

<h3 className="text-xl font-semibold text-gray-700">
  サブセクション
</h3>
\`\`\`

## スペーシング

### マージン・パディング

\`\`\`css
/* 4px単位 */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-4: 1rem;     /* 16px */
--spacing-8: 2rem;     /* 32px */
--spacing-16: 4rem;    /* 64px */
\`\`\`

## レイアウト

### コンテナ幅

\`\`\`css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
\`\`\`

### グリッドシステム

\`\`\`tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>コンテンツ1</div>
  <div>コンテンツ2</div>
  <div>コンテンツ3</div>
</div>
\`\`\`

## ボタンスタイル

### プライマリボタン

\`\`\`tsx
<button className="btn btn-primary">
  プライマリアクション
</button>
\`\`\`

スタイル:
- 背景: blue-600
- ホバー: blue-700
- テキスト: white
- 角丸: 0.5rem

### セカンダリボタン

\`\`\`tsx
<button className="btn btn-secondary">
  セカンダリアクション
</button>
\`\`\`

スタイル:
- 背景: gray-200
- ホバー: gray-300
- テキスト: gray-800

## フォームスタイル

### 入力フィールド

\`\`\`tsx
<input
  type="text"
  className="input"
  placeholder="入力してください"
/>
\`\`\`

スタイル:
- ボーダー: gray-300
- フォーカス: blue-500
- パディング: 0.5rem 0.75rem
- 角丸: 0.375rem

## アイコン

### サイズ

| サイズ | ピクセル | 用途 |
|--------|----------|------|
| sm | 16px | インラインアイコン |
| md | 20px | ボタンアイコン |
| lg | 24px | ナビゲーション |
| xl | 32px | 強調表示 |

### 使用例

\`\`\`tsx
import { Home, User, Settings } from 'lucide-react';

<Home size={20} className="text-gray-600" />
<User size={24} className="text-blue-600" />
<Settings size={32} />
\`\`\`

## アニメーション

### トランジション

\`\`\`css
/* 標準 */
transition: all 200ms ease;

/* ゆっくり */
transition: all 300ms ease;

/* 速い */
transition: all 150ms ease;
\`\`\`

### ホバー効果

\`\`\`tsx
<div className="transition-transform hover:scale-105">
  ホバーで拡大
</div>

<div className="transition-colors hover:bg-gray-100">
  ホバーで背景色変更
</div>
\`\`\`
```

---

## まとめ

この章では、プロジェクトのドキュメント整備について学びました：

### プロジェクトドキュメント
- ✅ **README.md**: プロジェクト概要、セットアップ手順
- ✅ **開発ガイド**: プロジェクト構成、コーディング規約
- ✅ **トラブルシューティング**: よくある問題と解決方法

### APIドキュメント
- ✅ **エンドポイント**: 全APIの詳細仕様
- ✅ **認証方法**: 認証の実装方法
- ✅ **エラーハンドリング**: エラーレスポンス形式
- ✅ **レート制限**: API使用制限

### データモデル
- ✅ **スキーマ定義**: 全テーブルの詳細
- ✅ **リレーション**: テーブル間の関係
- ✅ **インデックス**: パフォーマンス最適化
- ✅ **ER図**: 視覚的なデータ構造

### コンポーネントライブラリ
- ✅ **UIコンポーネント**: 再利用可能なコンポーネント
- ✅ **Props定義**: 各コンポーネントのAPI
- ✅ **使用例**: 実装サンプル
- ✅ **カタログ**: コンポーネント一覧

### スタイルガイド
- ✅ **カラーパレット**: ブランドカラー定義
- ✅ **タイポグラフィ**: フォントシステム
- ✅ **スペーシング**: 余白の統一
- ✅ **アニメーション**: 一貫したインタラクション

### ドキュメントのベストプラクティス
- ✅ **明確さ**: わかりやすい説明
- ✅ **完全性**: すべての機能をカバー
- ✅ **最新性**: コードと同期
- ✅ **検索性**: 目次とインデックス

次の章では、**プロジェクトの未来と拡張性**について詳しく見ていきます。

---

[← 前の章：第34章 保守とトラブルシューティング](34-保守とトラブルシューティング.md) | [目次に戻る](00-目次.md) | [次の章へ：第36章 プロジェクトの未来と拡張性 →](36-プロジェクトの未来と拡張性.md)
