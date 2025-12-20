<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements

- [x] Scaffold the Project

- [x] Customize the Project

- [x] Install Required Extensions

- [x] Compile the Project

- [x] Create and Run Task

- [x] Launch the Project

- [x] Ensure Documentation is Complete

- [x] Implement Password Authentication

- [x] Implement Admin Role System

- [x] Improve Schedule Features

- [x] Implement Public Access

## プロジェクト概要

軽音サークルメンバー用Webサイトが完成しました。

### 実装済み機能

1. **パスワード認証システム**: NextAuth.js v5 + bcryptjs による安全な認証
2. **役割ベースアクセス制御**: 管理者と通常ユーザーの2つの役割
3. **投稿機能**: YouTubeと連携した動画投稿（管理者のみ作成・編集・削除、公開閲覧可能）
4. **スケジュール調整**: 複数候補日への投票、コメント、最有力候補の自動表示
5. **リアルタイムチャット**: Socket.ioによるリアルタイムメッセージング
6. **レスポンシブUI**: Tailwind CSSとLucide Reactを使用

### 起動方法

```bash
npm run dev
```

サーバーは http://localhost:3000 で起動します。

### 初回セットアップ時の注意

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

