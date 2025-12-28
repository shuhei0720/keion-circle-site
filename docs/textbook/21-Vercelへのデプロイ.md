# 第 21 章：Vercel へのデプロイ

> **この章では、作成したアプリケーションを本番環境にデプロイします**

## 📚 この章で学ぶこと

- ✅ Vercel アカウントの作成
- ✅ GitHub リポジトリとの連携
- ✅ 環境変数の設定
- ✅ Supabase の本番環境セットアップ
- ✅ 自動デプロイの仕組み
- ✅ 独自ドメインの設定
- ✅ デプロイ後の動作確認

## 💡 デプロイの全体像

```
┌──────────────────────────────────────────────────┐
│         デプロイの流れ                           │
└──────────────────────────────────────────────────┘

【ステップ1】Vercelの準備
   ├─ アカウント作成
   ├─ GitHubとの連携
   └─ プロジェクトのインポート
        ↓
【ステップ2】Supabaseの本番環境設定
   ├─ 本番用データベース作成
   ├─ Storageバケット設定
   └─ 接続情報の取得
        ↓
【ステップ3】環境変数の設定
   ├─ DATABASE_URL（本番DB）
   ├─ AUTH_SECRET
   ├─ GOOGLE_CLIENT_ID/SECRET
   └─ SUPABASE_URL/KEY
        ↓
【ステップ4】デプロイ実行
   ├─ ビルド
   ├─ デプロイ
   └─ 動作確認
        ↓
【ステップ5】独自ドメイン設定（オプション）
   └─ DNS設定とSSL証明書


┌────────────────────────────────────┐
│  開発環境 vs 本番環境               │
├────────────────────────────────────┤
│                                    │
│  開発環境 (localhost:3000)         │
│  ├─ PostgreSQL (Supabase)          │
│  ├─ Supabase Storage              │
│  └─ テストデータ                   │
│                                    │
│          ↓ デプロイ                │
│                                    │
│  本番環境 (Vercel)                 │
│  ├─ PostgreSQL (Supabase)         │
│  ├─ Supabase Storage              │
│  └─ 本番データ                     │
│                                    │
└────────────────────────────────────┘
```

---

## 21.1 Vercel の準備

### Vercel とは？

**Vercel**は、Next.js を開発している会社が提供するホスティングサービスです。

**特徴:**

- ✅ Next.js に最適化されている
- ✅ GitHub と連携した自動デプロイ
- ✅ 無料プランで十分な機能
- ✅ SSL 証明書の自動発行
- ✅ 高速な CDN 配信

### Step 1: Vercel アカウントの作成

**1-1.** https://vercel.com にアクセス

**1-2.** 「Sign Up」をクリック

**1-3.** 「Continue with GitHub」を選択

```
┌──────────────────────────────────────┐
│        Vercel サインアップ           │
├──────────────────────────────────────┤
│                                      │
│   [Continue with GitHub]            │
│                                      │
│   [Continue with GitLab]            │
│                                      │
│   [Continue with Bitbucket]         │
│                                      │
│   [Continue with Email]             │
│                                      │
└──────────────────────────────────────┘

↓ GitHubを選択すると...

┌──────────────────────────────────────┐
│     GitHubで認証                     │
├──────────────────────────────────────┤
│                                      │
│  Vercel wants to access your         │
│  GitHub account                      │
│                                      │
│  [✓] Read access to repositories    │
│  [✓] Write access to deployments    │
│                                      │
│  [Authorize Vercel]                 │
│                                      │
└──────────────────────────────────────┘
```

**1-4.** GitHub の認証を許可

→ ✅ Vercel アカウントが作成されます！

### Step 2: プロジェクトのインポート

**2-1.** Vercel ダッシュボードで「Add New...」→「Project」をクリック

**2-2.** GitHub リポジトリの一覧から「keion-circle-site」を選択

```
┌──────────────────────────────────────┐
│   Import Git Repository              │
├──────────────────────────────────────┤
│                                      │
│  Search repositories...              │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 📦 keion-circle-site           │ │
│  │    main branch                 │ │
│  │    [Import]                    │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 📦 my-other-repo               │ │
│  │    [Import]                    │ │
│  └────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

**2-3.** 「Import」をクリック

**⚠️ まだデプロイしないでください！** 環境変数を設定する必要があります。

---

## 21.2 環境変数の設定

### 環境変数とは？

環境変数は、**秘密情報やデプロイ先ごとに異なる設定**を保存する仕組みです。

```
開発環境 (.env.local)
├─ DATABASE_URL=postgresql://...  ← Supabase
└─ AUTH_URL=http://localhost:3000

本番環境 (Vercel)
├─ DATABASE_URL=postgresql://... ← 同じSupabase
└─ AUTH_URL=https://your-app.vercel.app
```

### Step 1: 必要な環境変数の確認

以下の環境変数が必要です：

| 変数名                          | 説明                    | 例                            |
| ------------------------------- | ----------------------- | ----------------------------- |
| `DATABASE_URL`                  | データベース接続 URL    | `postgresql://...`            |
| `AUTH_URL`                      | アプリの URL            | `https://your-app.vercel.app` |
| `AUTH_SECRET`                   | 認証用シークレット      | ランダムな文字列              |
| `AUTH_TRUST_HOST`               | ホスト信頼設定          | `true`                        |
| `NEXTAUTH_URL`                  | NextAuth 用 URL         | `AUTH_URL`と同じ              |
| `NEXTAUTH_SECRET`               | NextAuth 用シークレット | `AUTH_SECRET`と同じ           |
| `GOOGLE_CLIENT_ID`              | Google OAuth ID         | Google Console から取得       |
| `GOOGLE_CLIENT_SECRET`          | Google OAuth Secret     | Google Console から取得       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase URL            | Supabase から取得             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key       | Supabase から取得             |

### Step 2: AUTH_SECRET の生成

ターミナルで以下を実行して、ランダムな文字列を生成します：

```bash
openssl rand -base64 32
```

**出力例:**

```
XtW9Q2k5n8J7vL3m1P6r4s8u2v5y8B1e4g7j0k3n6p9r=
```

→ この文字列をコピーしておきます。

### Step 3: Vercel で環境変数を設定

**3-1.** Vercel のプロジェクト設定画面で「Settings」タブを開く

**3-2.** 左メニューから「Environment Variables」を選択

**3-3.** 以下の環境変数を追加：

```
┌──────────────────────────────────────┐
│   Environment Variables              │
├──────────────────────────────────────┤
│                                      │
│  Key: AUTH_SECRET                    │
│  Value: **********************      │
│  Environment: [✓] Production        │
│              [✓] Preview            │
│              [✓] Development        │
│                                      │
│  [Add]                               │
│                                      │
└──────────────────────────────────────┘
```

**追加する環境変数:**

1. **AUTH_SECRET**

   - Value: `（Step 2で生成した文字列）`
   - Environment: すべてチェック

2. **AUTH_TRUST_HOST**

   - Value: `true`
   - Environment: すべてチェック

3. **NEXTAUTH_SECRET**
   - Value: `（AUTH_SECRETと同じ値）`
   - Environment: すべてチェック

**⚠️ 注意:** `DATABASE_URL`, `GOOGLE_CLIENT_ID/SECRET`, `SUPABASE_URL/KEY` は後ほど設定します。

---

## 21.3 Supabase の本番環境設定

### Step 1: Supabase プロジェクトの作成

**1-1.** https://supabase.com にアクセスしてログイン

**1-2.** 「New Project」をクリック

**1-3.** プロジェクト情報を入力：

```
┌──────────────────────────────────────┐
│   Create a new project               │
├──────────────────────────────────────┤
│                                      │
│  Organization: [Your Organization]   │
│                                      │
│  Name: keion-circle-site-prod       │
│                                      │
│  Database Password: ****************│
│  (自動生成 - メモしておく)           │
│                                      │
│  Region: Northeast Asia (Tokyo)     │
│                                      │
│  Pricing Plan: Free                 │
│                                      │
│  [Create new project]               │
│                                      │
└──────────────────────────────────────┘
```

**1-4.** プロジェクトが作成されるまで待つ（1〜2 分）

→ ✅ 本番用データベースが作成されます！

### Step 2: データベース接続情報の取得

**2-1.** Supabase ダッシュボードで「Settings」→「Database」を開く

**2-2.** 「Connection string」セクションで「URI」を選択

**2-3.** 接続 URL をコピー

```
postgresql://postgres.[プロジェクト名]:[パスワード]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**⚠️ 重要:** `[パスワード]` の部分を、プロジェクト作成時に設定したパスワードに置き換えてください。

**2-4.** URL の末尾に `?pgbouncer=true&connection_limit=1` を追加

**最終的な URL:**

```
postgresql://postgres.[プロジェクト名]:[パスワード]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Step 3: Supabase API 情報の取得

**3-1.** Supabase ダッシュボードで「Settings」→「API」を開く

**3-2.** 以下の情報をコピー：

- **Project URL**: `https://xxxxx.supabase.co`
- **Anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（長い文字列）

### Step 4: Storage バケットの作成

**4-1.** Supabase ダッシュボードで「Storage」を開く

**4-2.** 「Create a new bucket」をクリック

**4-3.** バケット情報を入力：

```
Bucket name: avatars
Public bucket: ON (チェック)
```

**4-4.** もう 1 つバケットを作成：

```
Bucket name: posts
Public bucket: ON (チェック)
```

**4-5.** 各バケットで「Policies」を設定

**avatars バケット:**

```
Policy Name: Allow authenticated uploads
Policy Definition:
  - Operation: INSERT
  - Target roles: authenticated
  - USING expression: true
  - WITH CHECK expression: true
```

**posts バケット:**

```
Policy Name: Allow authenticated uploads
Policy Definition:
  - Operation: INSERT
  - Target roles: authenticated
  - USING expression: true
  - WITH CHECK expression: true
```

→ ✅ Storage の準備が完了しました！

### Step 5: データベーススキーマの適用

ローカル環境で本番データベースにスキーマを適用します。

**5-1.** `.env.production` ファイルを作成

```bash
# プロジェクトのルートディレクトリで
touch .env.production
```

**5-2.** `.env.production` に本番データベースの URL を記述

```env
DATABASE_URL="postgresql://postgres.[プロジェクト名]:[パスワード]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**5-3.** スキーマを適用

```bash
# 本番環境のデータベースにスキーマを適用
npx dotenv -e .env.production -- npx prisma db push

# Prisma Clientを生成
npx prisma generate
```

**出力例:**

```
Environment variables loaded from .env.production
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public"

🚀  Your database is now in sync with your Prisma schema. Done in 2.34s

✔ Generated Prisma Client (5.22.0) to ./node_modules/@prisma/client
```

→ ✅ 本番データベースの準備が完了しました！

### Step 6: 管理者アカウントの作成

本番環境用の管理者アカウントを作成します。

**6-1.** `scripts/create-admin-production.js` を作成

```bash
# scriptsディレクトリに移動
cd scripts

# ファイルを作成
cat > create-admin-production.js << 'EOF'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('使い方: node create-admin-production.js <email> <password> <name>');
    console.log('例: node create-admin-production.js admin@example.com password123 "管理者"');
    process.exit(1);
  }

  const [email, password, name] = args;

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10);

  // ユーザーを作成
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'admin', // 管理者権限
    },
  });

  console.log('✅ 管理者アカウントを作成しました:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: ${user.role}`);
}

main()
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
EOF
```

**6-2.** 管理者アカウントを作成

```bash
# プロジェクトのルートディレクトリに戻る
cd ..

# 本番環境に管理者アカウントを作成
npx dotenv -e .env.production -- node scripts/create-admin-production.js admin@example.com your-secure-password "管理者"
```

**⚠️ 注意:**

- メールアドレスとパスワードは実際に使用するものに変更してください
- パスワードは強固なものを設定してください（本番環境です！）

→ ✅ 本番環境の準備が完了しました！

---

## 21.4 環境変数の追加設定

### Step 1: Vercel に残りの環境変数を追加

Vercel の「Environment Variables」画面に戻り、以下を追加します：

**1. DATABASE_URL**

```
Key: DATABASE_URL
Value: postgresql://postgres.[プロジェクト名]:[パスワード]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
Environment: ✓ Production, ✓ Preview
```

**2. NEXT_PUBLIC_SUPABASE_URL**

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
Environment: ✓ Production, ✓ Preview, ✓ Development
```

**3. NEXT_PUBLIC_SUPABASE_ANON_KEY**

```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: ✓ Production, ✓ Preview, ✓ Development
```

### Step 2: Google OAuth 設定の更新

**2-1.** Google Cloud Console (https://console.cloud.google.com) を開く

**2-2.** 「APIs & Services」→「Credentials」を開く

**2-3.** 既存の OAuth 2.0 クライアント ID を選択

**2-4.** 「承認済みのリダイレクト URI」に追加：

```
https://your-project-name.vercel.app/api/auth/callback/google
```

**⚠️ 注意:** `your-project-name` の部分は、Vercel が自動生成したドメイン名に置き換えてください。

Vercel のプロジェクト設定の「Domains」で確認できます：

```
your-project-name.vercel.app
```

**2-5.** 「保存」をクリック

### Step 3: Vercel に Google OAuth 情報を追加

**3-1.** Vercel の「Environment Variables」に追加：

**GOOGLE_CLIENT_ID**

```
Key: GOOGLE_CLIENT_ID
Value: （Google Consoleから取得したClient ID）
Environment: ✓ Production, ✓ Preview
```

**GOOGLE_CLIENT_SECRET**

```
Key: GOOGLE_CLIENT_SECRET
Value: （Google Consoleから取得したClient Secret）
Environment: ✓ Production, ✓ Preview
```

### Step 4: AUTH_URL と NEXTAUTH_URL の設定

**⚠️ 重要:** まず Vercel にデプロイして、URL を取得する必要があります。

**4-1.** Vercel の「Deployments」タブで「Deploy」をクリック

**4-2.** デプロイが完了したら、URL を確認（例: `https://your-project-name.vercel.app`）

**4-3.** 「Environment Variables」に戻り、以下を追加：

**AUTH_URL**

```
Key: AUTH_URL
Value: https://your-project-name.vercel.app
Environment: ✓ Production, ✓ Preview
```

**NEXTAUTH_URL**

```
Key: NEXTAUTH_URL
Value: https://your-project-name.vercel.app
Environment: ✓ Production, ✓ Preview
```

---

## 21.5 デプロイの実行

### 自動デプロイの仕組み

```
┌──────────────────────────────────────────────────┐
│        Vercelの自動デプロイ                      │
└──────────────────────────────────────────────────┘

【開発フロー】

1. ローカルでコード変更
     ↓
2. GitHubにpush
     ↓
3. Vercelが自動検知
     ↓
4. 自動ビルド・デプロイ
     ↓
5. 本番環境に反映


【ブランチ別デプロイ】

main branch
  → Production デプロイ
  → https://your-app.vercel.app

feature/* branch
  → Preview デプロイ
  → https://your-app-git-feature-xxx.vercel.app
```

### Step 1: 初回デプロイ

**1-1.** ローカルで最新のコードを push

```bash
# 最新の変更をコミット
git add .
git commit -m "🚀 準備完了: 本番環境へデプロイ"

# GitHubにpush
git push origin main
```

**1-2.** Vercel が自動的にデプロイを開始

```
┌──────────────────────────────────────┐
│   Vercel - Deployments               │
├──────────────────────────────────────┤
│                                      │
│  🚀 Building...                     │
│  ├─ Installing dependencies         │
│  ├─ Running build script            │
│  ├─ Generating Prisma Client        │
│  └─ Deploying...                    │
│                                      │
│  ⏱ Estimated time: 2-3 minutes     │
│                                      │
└──────────────────────────────────────┘
```

**1-3.** デプロイが完了するまで待つ（2〜5 分）

**1-4.** 「Visit」ボタンをクリックして、デプロイされたサイトを確認

→ ✅ デプロイ成功！

### Step 2: ビルドエラーの対処

もしビルドエラーが発生した場合：

**エラー例 1: Prisma Client 生成エラー**

```
Error: Prisma Client could not be generated
```

**解決方法:**
`package.json` の `build` スクリプトを確認：

```json
{
  "scripts": {
    "build": "prisma generate && prisma db push && next build"
  }
}
```

**エラー例 2: 環境変数エラー**

```
Error: DATABASE_URL is not defined
```

**解決方法:**
Vercel の環境変数設定を確認。特に `DATABASE_URL` が正しく設定されているか確認。

### Step 3: デプロイ後の動作確認

**3-1.** デプロイされた URL にアクセス

**3-2.** 以下を確認：

- [ ] トップページが表示される
- [ ] ログインページが表示される
- [ ] Google OAuth ログインが動作する
- [ ] メール+パスワードログインが動作する
- [ ] 管理者アカウントでログインできる
- [ ] 投稿一覧が表示される
- [ ] 画像アップロードが動作する

**3-3.** エラーが発生した場合

Vercel の「Logs」タブでエラーログを確認：

```
┌──────────────────────────────────────┐
│   Function Logs                      │
├──────────────────────────────────────┤
│                                      │
│  [GET] /api/posts                   │
│  ✓ 200 OK (125ms)                   │
│                                      │
│  [POST] /api/posts                  │
│  ✗ 500 Error                        │
│  Error: Database connection failed  │
│  at ...                             │
│                                      │
└──────────────────────────────────────┘
```

---

## 21.6 独自ドメインの設定（オプション）

独自ドメインを使用する場合の設定方法です。

### Step 1: ドメインの追加

**1-1.** Vercel プロジェクトの「Settings」→「Domains」を開く

**1-2.** 「Add Domain」をクリック

**1-3.** ドメイン名を入力（例: `keion-circle.com`）

**1-4.** 「Add」をクリック

### Step 2: DNS 設定

Vercel が表示する指示に従って DNS レコードを設定します。

**パターン 1: Vercel DNS を使用**

```
Nameservers:
  ns1.vercel-dns.com
  ns2.vercel-dns.com
```

**パターン 2: CNAME レコードを使用**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**パターン 3: A レコードを使用**

```
Type: A
Name: @
Value: 76.76.21.21
```

### Step 3: SSL 証明書の自動発行

DNS が正しく設定されると、Vercel が自動的に SSL 証明書を発行します。

```
┌──────────────────────────────────────┐
│   SSL Certificate                    │
├──────────────────────────────────────┤
│                                      │
│  Status: Active ✓                   │
│                                      │
│  Issuer: Let's Encrypt              │
│                                      │
│  Valid until: 2026/03/23            │
│                                      │
│  Auto-renewal: Enabled              │
│                                      │
└──────────────────────────────────────┘
```

→ ✅ HTTPS で安全にアクセスできます！

### Step 4: Google OAuth の更新

独自ドメインを使用する場合、Google Cloud Console の設定も更新が必要です。

**4-1.** Google Cloud Console の OAuth 2.0 設定を開く

**4-2.** 「承認済みのリダイレクト URI」に追加：

```
https://keion-circle.com/api/auth/callback/google
```

**4-3.** Vercel の環境変数も更新：

```
AUTH_URL=https://keion-circle.com
NEXTAUTH_URL=https://keion-circle.com
```

---

## 21.7 確認チェックリスト

Chapter 21 の内容を理解できたか確認しましょう。

### Vercel の準備

- [ ] Vercel アカウントを作成できる
- [ ] GitHub リポジトリと連携できる
- [ ] プロジェクトをインポートできる

### Supabase の本番環境

- [ ] Supabase プロジェクトを作成できる
- [ ] データベース接続情報を取得できる
- [ ] Storage バケットを作成できる
- [ ] Storage のポリシーを設定できる
- [ ] データベーススキーマを適用できる
- [ ] 管理者アカウントを作成できる

### 環境変数の設定

- [ ] AUTH_SECRET を生成できる
- [ ] Vercel で環境変数を設定できる
- [ ] 本番用環境変数と開発用環境変数の違いを理解できる

### デプロイ

- [ ] GitHub に push してデプロイできる
- [ ] 自動デプロイの仕組みを理解できる
- [ ] デプロイログを確認できる
- [ ] ビルドエラーに対処できる

### 独自ドメイン（オプション）

- [ ] ドメインを追加できる
- [ ] DNS レコードを設定できる
- [ ] SSL 証明書の発行を確認できる

---

## まとめ

この章では、作成したアプリケーションを Vercel にデプロイしました。

### 🎓 この章で学んだこと

#### デプロイの流れ

- ✅ PostgreSQL（Supabase）を使った本番環境へのデプロイ
- ✅ Vercel を使った自動デプロイ
- ✅ GitHub との連携による継続的デプロイ

#### 本番環境の設定

- ✅ Supabase での本番データベース作成
- ✅ Storage バケットの設定
- ✅ 環境変数の適切な管理
- ✅ OAuth 設定の更新

#### セキュリティ

- ✅ 環境変数による秘密情報の保護
- ✅ SSL 証明書の自動発行
- ✅ 強固なパスワードの設定

### 💡 重要なポイント

#### 環境の違い

```typescript
// 開発環境
DATABASE_URL = "postgresql://..."; // PostgreSQL (Supabase)
AUTH_URL = "http://localhost:3000"; // HTTP

// 本番環境
DATABASE_URL = "postgresql://..."; // 同じSupabaseまたは別のSupabase
AUTH_URL = "https://your-app.vercel.app"; // HTTPS
```

#### 自動デプロイ

```bash
# ローカルで開発
git add .
git commit -m "新機能追加"

# GitHubにpush
git push origin main

# Vercelが自動でデプロイ ✨
```

#### 環境変数の管理

```
開発環境: .env.local
本番環境: Vercelの管理画面

⚠️ .env.local は .gitignore に含めて、
   GitHubにpushしない！
```

### 🚀 次のステップ

次の章では、パフォーマンス最適化について学びます：

- **Chapter 22**: パフォーマンス最適化
  - 画像最適化
  - コード分割
  - キャッシング戦略
  - Core Web Vitals の改善

デプロイが完了したので、より快適なユーザー体験を提供するための最適化を行いましょう！

---

[← 前の章：第 20 章 共通コンポーネントの実装](20-共通コンポーネントの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第 22 章 パフォーマンス最適化 →](22-パフォーマンス最適化.md)
