# 軽音サークル メンバーサイト

Next.jsとTailwind CSSで構築された軽音サークルのメンバー専用Webサイトです。

## 主な機能

- 🔐 **パスワード認証**: メールアドレスとパスワードによる安全な認証システム
- 🌐 **Google OAuth認証**: Googleアカウントでのログイン・新規登録が可能
- 👤 **役割ベースのアクセス制御**: 管理者と通常ユーザーの2つの役割
- 📝 **投稿機能（管理者専用）**: YouTubeと連携した動画投稿・編集・削除（公開アクセス可能）
- 📅 **スケジュール調整機能（改良版）**: 複数候補日への投票、コメント機能、最有力候補の自動表示
- 💬 **リアルタイムチャット（メンバー専用）**: Socket.ioによるリアルタイムメッセージング + ファイル送信機能
- ✨ **アニメーション対応**: スクロールに応じた動的なUI演出
- 👥 **充実したユーザープロフィール**: 自己紹介、担当楽器、参加回数の表示

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **認証**: NextAuth.js v5 (Credentials Provider + bcryptjs)
- **データベース**: Prisma + SQLite
- **リアルタイム通信**: Socket.io
- **アイコン**: Lucide React
- **YouTube埋め込み**: react-youtube
- **ファイルアップロード**: Multer

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルはすでに作成されていますが、本番環境では必ず `NEXTAUTH_SECRET` を変更してください。

#### Google OAuth認証の設定（オプション）

Googleアカウントでのログイン機能を有効にする場合：

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuth 2.0 クライアントID」を選択
5. アプリケーションの種類で「ウェブアプリケーション」を選択
6. 承認済みのリダイレクトURIに以下を追加：
   - 開発環境: `http://localhost:3000/api/auth/callback/google`
   - 本番環境: `https://your-domain.com/api/auth/callback/google`
7. クライアントIDとクライアントシークレットを取得
8. `.env.local` ファイルに追加：

```bash
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
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
node scripts/create-admin.js admin@example.com password123 "管理者名"
```

## GitHubとの連携

このプロジェクトはGit管理されています。GitHubリポジトリと連携するには：

### 新しいGitHubリポジトリを作成する場合

1. GitHubで新しいリポジトリを作成します（README等は追加しない）
2. 以下のコマンドでリモートリポジトリを追加：

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 既存のGitHubリポジトリがある場合

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### コードの更新とプッシュ

今後、コードを変更した後は：

```bash
git add .
git commit -m "適切なコミットメッセージ"
git push
```

### 5. アップロードディレクトリの作成

```bash
mkdir -p public/uploads
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## 使い方

### 管理者の操作

#### ログイン
1. トップページから「ログイン」をクリック
2. 管理者のメールアドレスとパスワードを入力
3. 全機能にアクセス可能

#### 投稿管理（管理者のみ）
- **新規投稿**: タイトル、内容、YouTube URLを入力して投稿
- **編集**: 投稿の編集ボタンをクリック
- **削除**: 投稿の削除ボタンをクリック（確認あり）
- YouTube動画は自動で埋め込まれます

#### スケジュール作成（管理者のみ）
- **新規スケジュール**: タイトル、詳細を入力
- **複数候補日の設定**: 「候補日を追加」ボタンで複数の日時を設定可能
- 投票結果は自動集計され、最有力候補が表示されます

### 通常ユーザーの操作

#### 新規登録
1. トップページから「新規登録」をクリック
2. 名前、メールアドレス、パスワードを入力
3. アカウント作成後、ログインページへ

#### 投稿閲覧（ログイン不要）
- トップページやPostsページで投稿を閲覧可能
- 最新の活動がトップページに表示されます

#### スケジュール投票（ログイン必要）
- 各候補日に対して「○（参加可能）」「△（未定）」「×（参加不可）」を選択
- コメント欄に追加情報を入力可能
- 投票結果はリアルタイムで集計され、各候補日の参加人数が表示されます
- 最も参加者が多い日が「最有力候補」として強調表示されます

#### チャット（ログイン必要）
- リアルタイムメッセージ送受信
- ファイル添付機能（画像、動画、PDF、Wordなど）
- 画像は自動でプレビュー表示
- その他のファイルはダウンロードリンクとして表示
- ファイルサイズ上限：10MB

## プロジェクト構造

```
keion-circle-site/
├── prisma/
│   └── schema.prisma          # データベーススキーマ（パスワード、役割、複数候補日対応）
├── public/
│   └── uploads/               # アップロードされたファイル
├── scripts/
│   └── create-admin.js        # 管理者ユーザー作成スクリプト
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/  # NextAuth API
│   │   │   │   └── signup/         # サインアップAPI
│   │   │   ├── posts/         # 投稿API（管理者のみ作成・編集・削除）
│   │   │   ├── schedules/     # スケジュールAPI（管理者のみ作成）
│   │   │   ├── messages/      # チャットAPI
│   │   │   └── upload/        # ファイルアップロードAPI
│   │   ├── auth/
│   │   │   ├── signin/        # ログイン画面（パスワード入力対応）
│   │   │   └── signup/        # 新規登録画面
│   │   ├── chat/              # チャットページ（ログイン必要）
│   │   ├── posts/             # 投稿ページ（公開アクセス可能）
│   │   ├── schedules/         # スケジュールページ（ログイン必要）
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx           # トップページ（投稿一覧表示）
│   ├── components/
│   │   ├── DashboardLayout.tsx # ナビゲーション
│   │   └── Providers.tsx       # SessionProvider
│   ├── lib/
│   │   ├── auth.ts            # NextAuth設定（パスワード認証）
│   │   ├── prisma.ts          # Prismaクライアント
│   │   └── permissions.ts     # 管理者権限チェック
│   ├── types/
│   │   └── next-auth.d.ts     # NextAuth型定義（role含む）
│   └── middleware.ts          # ログイン保護ミドルウェア
├── server.js                  # Socket.ioサーバー
├── .env.local                 # 環境変数
└── package.json
```

## 実装済みの機能

### ✅ パスワード認証システム

- bcryptjsによるパスワードハッシュ化
- 新規登録ページの実装
- ログイン画面でのパスワード入力

### ✅ 役割ベースのアクセス制御

- 管理者（admin）と通常ユーザー（member）の区別
- 管理者のみ：投稿の作成・編集・削除、スケジュールの作成
- 管理者作成スクリプトの提供

### ✅ スケジュール機能の大幅改善

- 1つのスケジュールに複数の候補日を設定可能
- 各候補日に対する個別投票（○△×）
- コメント機能の追加
- 投票数の自動集計と表示（○5人、△2人、×1人）
- 最有力候補（最も参加者が多い日）の自動ハイライト表示

### ✅ 公開アクセス機能

- トップページに最新投稿3件を表示
- 投稿ページはログイン不要で閲覧可能
- スケジュールとチャットはログイン必須

## 本番デプロイ

### 環境変数の設定

本番環境では以下の環境変数を設定してください：

- `NEXTAUTH_SECRET`: ランダムな秘密鍵に変更
- `NEXTAUTH_URL`: 本番環境のURL
- `DATABASE_URL`: 本番データベースのURL（PostgreSQLなど推奨）

### ビルドと起動

```bash
npm run build
npm start
```

---

© 2025 軽音サークル
