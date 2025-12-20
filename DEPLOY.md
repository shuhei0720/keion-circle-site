# Vercelデプロイ手順

## 前提条件

- Vercelアカウント（https://vercel.com/signup）
- GitHubリポジトリにコードをプッシュ済み

## 1. データベースの準備

### Supabase（選択済み）

**無料プラン**: 500MB ストレージ、50,000リクエスト/月、100,000 MB 転送量/月

#### 1. プロジェクトの作成

1. [Supabase](https://supabase.com/) にアクセスしてサインアップ
2. 「New project」をクリック
3. プロジェクト設定:
   - **Name**: `keion-circle-site`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（**必ず保存**）
   - **Region**: `Northeast Asia (Tokyo)` を選択
   - **Pricing Plan**: Free を選択
4. 「Create new project」をクリック（プロジェクト作成に1-2分かかります）

#### 2. 接続文字列の取得

1. プロジェクトダッシュボードで、左サイドバーから「Project Settings」（⚙️歯車アイコン）をクリック
2. 「Database」タブを選択
3. 下にスクロールして「Connection string」セクションを表示
4. **「Connection Pooling」** のタブを選択（重要！）
5. **Mode: Transaction** を選択（Prismaに最適）
6. 接続文字列をコピー:
   ```
   postgres://postgres.xxxxx:[YOUR-PASSWORD]@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
7. `[YOUR-PASSWORD]`を先ほど設定したデータベースパスワードに置き換え

**⚠️ 重要**: 必ず「Connection Pooling」（Transaction mode）の接続文字列を使用してください。Direct connectionではなく、pgBouncerを経由する接続文字列を使います。

---

### その他のオプション

<details>
<summary>オプションA: Vercel Postgres</summary>

1. Vercelダッシュボードにログイン
2. 「Storage」タブから「Create Database」
3. 「Postgres」を選択
4. リージョンを選択（Tokyo推奨）
5. データベースが作成されたら、「.env.local」タブから`DATABASE_URL`をコピー
</details>

<details>
<summary>オプションB: Neon</summary>

1. https://neon.tech にサインアップ
2. 新しいプロジェクトを作成
3. リージョンを選択（Tokyo推奨）
4. 接続文字列（DATABASE_URL）をコピー
</details>

## 2. Vercelにデプロイ

### 方法1: Vercel CLI（推奨）

```bash
# Vercel CLIをインストール（初回のみ）
npm install -g vercel

# プロジェクトディレクトリでログイン
vercel login

# デプロイ（初回）
vercel

# 質問に答える：
# - Set up and deploy: Yes
# - Which scope: あなたのアカウント
# - Link to existing project: No
# - Project name: keion-circle-site（または任意の名前）
# - Directory: ./
# - Override settings: No

# 本番環境にデプロイ
vercel --prod
```

### 方法2: GitHubから自動デプロイ

1. https://vercel.com/new にアクセス
2. GitHubリポジトリを接続
3. リポジトリを選択
4. 「Import」をクリック
5. プロジェクト名とルートディレクトリを確認
6. 「Deploy」をクリック

## 3. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

### 必須の環境変数

1. プロジェクトの「Settings」→「Environment Variables」に移動

2. 以下の変数を追加：

```
DATABASE_URL=postgres://...（データベース接続文字列）
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=（ランダムな32文字以上の文字列）
```

### NEXTAUTH_SECRETの生成

```bash
openssl rand -base64 32
```

または

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Google OAuth（オプション）

Google OAuth認証を使用する場合：

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**重要**: Google Cloud ConsoleのOAuth設定で、以下のリダイレクトURIを追加：
```
https://your-app-name.vercel.app/api/auth/callback/google
```

## 4. データベースの初期化

### 方法1: Vercel CLI経由

```bash
# 本番環境のデータベースURLを使用
export DATABASE_URL="postgres://..."

# Prismaマイグレーション実行
npx prisma migrate deploy

# または、開発中の場合
npx prisma db push
```

### 方法2: Vercel Dashboard経由

1. プロジェクトの「Settings」→「Environment Variables」
2. `DATABASE_URL`を追加
3. 「Deployments」タブでRedeploy

## 5. 管理者ユーザーの作成

```bash
# 本番環境のDATABASE_URLを設定
export DATABASE_URL="postgres://..."

# 管理者作成スクリプトを実行
node scripts/create-admin.js admin@example.com securepassword "管理者名"
```

または、Vercel CLIで：

```bash
vercel env pull .env.production
export $(cat .env.production | xargs)
node scripts/create-admin.js admin@example.com securepassword "管理者名"
```

## 6. デプロイの確認

1. デプロイが完了したら、Vercelが提供するURLにアクセス
2. ログイン画面が表示されることを確認
3. 管理者アカウントでログイン
4. 各機能（投稿、スケジュール、チャット）が動作することを確認

## トラブルシューティング

### データベース接続エラー

- `DATABASE_URL`が正しく設定されているか確認
- データベースが起動しているか確認
- IPアドレス制限がある場合は、Vercelのアウトバウンドアドレスを許可

### ビルドエラー

```bash
# ローカルでビルドテスト
npm run build
```

エラーがある場合は修正してからデプロイ

### NextAuth エラー

- `NEXTAUTH_URL`が正しいドメインに設定されているか確認
- `NEXTAUTH_SECRET`が設定されているか確認
- Google OAuthの場合、リダイレクトURIが正しいか確認

## カスタムドメインの設定（オプション）

1. Vercelダッシュボードの「Settings」→「Domains」
2. 「Add Domain」をクリック
3. ドメイン名を入力
4. DNSレコードを設定（Vercelの指示に従う）
5. `NEXTAUTH_URL`を新しいドメインに更新

## 継続的デプロイ

GitHubと連携している場合：

- `main`ブランチへのプッシュで自動的に本番環境にデプロイ
- その他のブランチへのプッシュでプレビュー環境を作成

## コスト

- **Vercel**: Hobby（無料）プランで開始可能、商用利用はProプラン推奨
- **Vercel Postgres**: 無料プランあり（データベース容量制限あり）
- **Neon**: 無料プランあり（0.5GB storage、1つのプロジェクト）

## セキュリティのベストプラクティス

1. **環境変数**: 機密情報は必ず環境変数で管理
2. **NEXTAUTH_SECRET**: 強力なランダム文字列を使用
3. **データベース**: 強力なパスワードを設定
4. **HTTPS**: Vercelは自動的にHTTPSを有効化
5. **CORS**: 必要に応じてCORS設定を追加

## サポート

問題が発生した場合：
- Vercel Documentation: https://vercel.com/docs
- Prisma Documentation: https://www.prisma.io/docs
- NextAuth Documentation: https://next-auth.js.org/
