# 第21章：Vercelへのデプロイ

> **この章では、作成したアプリケーションを本番環境にデプロイします**

## 📚 この章で学ぶこと

- ✅ Vercelアカウントの作成
- ✅ GitHubリポジトリとの連携
- ✅ 環境変数の設定
- ✅ Supabaseの本番環境セットアップ
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
│  ├─ SQLite (dev.db)               │
│  ├─ ローカルファイル               │
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

## 21.1 Vercelの準備

### Vercelとは？

**Vercel**は、Next.jsを開発している会社が提供するホスティングサービスです。

**特徴:**
- ✅ Next.jsに最適化されている
- ✅ GitHubと連携した自動デプロイ
- ✅ 無料プランで十分な機能
- ✅ SSL証明書の自動発行
- ✅ 高速なCDN配信

### Step 1: Vercelアカウントの作成

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

**1-4.** GitHubの認証を許可

→ ✅ Vercelアカウントが作成されます！

### Step 2: プロジェクトのインポート

**2-1.** Vercelダッシュボードで「Add New...」→「Project」をクリック

**2-2.** GitHubリポジトリの一覧から「keion-circle-site」を選択

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
├─ DATABASE_URL="file:./dev.db"  ← SQLite
└─ AUTH_URL=http://localhost:3000

本番環境 (Vercel)
├─ DATABASE_URL=postgresql://... ← PostgreSQL
└─ AUTH_URL=https://your-app.vercel.app
```

### Step 1: 必要な環境変数の確認

以下の環境変数が必要です：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | データベース接続URL | `postgresql://...` |
| `AUTH_URL` | アプリのURL | `https://your-app.vercel.app` |
| `AUTH_SECRET` | 認証用シークレット | ランダムな文字列 |
| `AUTH_TRUST_HOST` | ホスト信頼設定 | `true` |
| `NEXTAUTH_URL` | NextAuth用URL | `AUTH_URL`と同じ |
| `NEXTAUTH_SECRET` | NextAuth用シークレット | `AUTH_SECRET`と同じ |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | Google Consoleから取得 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | Google Consoleから取得 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Supabaseから取得 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Supabaseから取得 |

### Step 2: AUTH_SECRETの生成

ターミナルで以下を実行して、ランダムな文字列を生成します：

```bash
openssl rand -base64 32
```

**出力例:**
```
XtW9Q2k5n8J7vL3m1P6r4s8u2v5y8B1e4g7j0k3n6p9r=
```

→ この文字列をコピーしておきます。

### Step 3: Vercelで環境変数を設定

**3-1.** Vercelのプロジェクト設定画面で「Settings」タブを開く

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

## 21.3 Supabaseの本番環境設定

### Step 1: Supabaseプロジェクトの作成

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

**1-4.** プロジェクトが作成されるまで待つ（1〜2分）

→ ✅ 本番用データベースが作成されます！

### Step 2: データベース接続情報の取得

**2-1.** Supabaseダッシュボードで「Settings」→「Database」を開く

**2-2.** 「Connection string」セクションで「URI」を選択

**2-3.** 接続URLをコピー

```
postgresql://postgres.[プロジェクト名]:[パスワード]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**⚠️ 重要:** `[パスワード]` の部分を、プロジェクト作成時に設定したパスワードに置き換えてください。

**2-4.** URLの末尾に `?pgbouncer=true&connection_limit=1` を追加

**最終的なURL:**
```
postgresql://postgres.[プロジェクト名]:[パスワード]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Step 3: Supabase API情報の取得

**3-1.** Supabaseダッシュボードで「Settings」→「API」を開く

**3-2.** 以下の情報をコピー：

- **Project URL**: `https://xxxxx.supabase.co`
- **Anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（長い文字列）

### Step 4: Storageバケットの作成

**4-1.** Supabaseダッシュボードで「Storage」を開く

**4-2.** 「Create a new bucket」をクリック

**4-3.** バケット情報を入力：

```
Bucket name: avatars
Public bucket: ON (チェック)
```

**4-4.** もう1つバケットを作成：

```
Bucket name: posts
Public bucket: ON (チェック)
```

**4-5.** 各バケットで「Policies」を設定

**avatarsバケット:**
```
Policy Name: Allow authenticated uploads
Policy Definition: 
  - Operation: INSERT
  - Target roles: authenticated
  - USING expression: true
  - WITH CHECK expression: true
```

**postsバケット:**
```
Policy Name: Allow authenticated uploads
Policy Definition:
  - Operation: INSERT
  - Target roles: authenticated
  - USING expression: true
  - WITH CHECK expression: true
```

→ ✅ Storageの準備が完了しました！

### Step 5: データベーススキーマの適用

ローカル環境で本番データベースにスキーマを適用します。

**5-1.** `.env.production` ファイルを作成

```bash
# プロジェクトのルートディレクトリで
touch .env.production
```

**5-2.** `.env.production` に本番データベースのURLを記述

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

### Step 1: Vercelに残りの環境変数を追加

Vercelの「Environment Variables」画面に戻り、以下を追加します：

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

### Step 2: Google OAuth設定の更新

**2-1.** Google Cloud Console (https://console.cloud.google.com) を開く

**2-2.** 「APIs & Services」→「Credentials」を開く

**2-3.** 既存のOAuth 2.0クライアントIDを選択

**2-4.** 「承認済みのリダイレクトURI」に追加：

```
https://your-project-name.vercel.app/api/auth/callback/google
```

**⚠️ 注意:** `your-project-name` の部分は、Vercelが自動生成したドメイン名に置き換えてください。

Vercelのプロジェクト設定の「Domains」で確認できます：
```
your-project-name.vercel.app
```

**2-5.** 「保存」をクリック

### Step 3: VercelにGoogle OAuth情報を追加

**3-1.** Vercelの「Environment Variables」に追加：

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

### Step 4: AUTH_URLとNEXTAUTH_URLの設定

**⚠️ 重要:** まずVercelにデプロイして、URLを取得する必要があります。

**4-1.** Vercelの「Deployments」タブで「Deploy」をクリック

**4-2.** デプロイが完了したら、URLを確認（例: `https://your-project-name.vercel.app`）

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

**1-1.** ローカルで最新のコードをpush

```bash
# 最新の変更をコミット
git add .
git commit -m "🚀 準備完了: 本番環境へデプロイ"

# GitHubにpush
git push origin main
```

**1-2.** Vercelが自動的にデプロイを開始

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

**1-3.** デプロイが完了するまで待つ（2〜5分）

**1-4.** 「Visit」ボタンをクリックして、デプロイされたサイトを確認

→ ✅ デプロイ成功！

### Step 2: ビルドエラーの対処

もしビルドエラーが発生した場合：

**エラー例1: Prisma Client生成エラー**
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

**エラー例2: 環境変数エラー**
```
Error: DATABASE_URL is not defined
```

**解決方法:**
Vercelの環境変数設定を確認。特に `DATABASE_URL` が正しく設定されているか確認。

### Step 3: デプロイ後の動作確認

**3-1.** デプロイされたURLにアクセス

**3-2.** 以下を確認：

- [ ] トップページが表示される
- [ ] ログインページが表示される
- [ ] Google OAuthログインが動作する
- [ ] メール+パスワードログインが動作する
- [ ] 管理者アカウントでログインできる
- [ ] 投稿一覧が表示される
- [ ] 画像アップロードが動作する

**3-3.** エラーが発生した場合

Vercelの「Logs」タブでエラーログを確認：

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

**1-1.** Vercelプロジェクトの「Settings」→「Domains」を開く

**1-2.** 「Add Domain」をクリック

**1-3.** ドメイン名を入力（例: `keion-circle.com`）

**1-4.** 「Add」をクリック

### Step 2: DNS設定

Vercelが表示する指示に従ってDNSレコードを設定します。

**パターン1: Vercel DNSを使用**
```
Nameservers:
  ns1.vercel-dns.com
  ns2.vercel-dns.com
```

**パターン2: CNAMEレコードを使用**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**パターン3: Aレコードを使用**
```
Type: A
Name: @
Value: 76.76.21.21
```

### Step 3: SSL証明書の自動発行

DNSが正しく設定されると、Vercelが自動的にSSL証明書を発行します。

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

→ ✅ HTTPSで安全にアクセスできます！

### Step 4: Google OAuthの更新

独自ドメインを使用する場合、Google Cloud Consoleの設定も更新が必要です。

**4-1.** Google Cloud Console の OAuth 2.0 設定を開く

**4-2.** 「承認済みのリダイレクトURI」に追加：

```
https://keion-circle.com/api/auth/callback/google
```

**4-3.** Vercelの環境変数も更新：

```
AUTH_URL=https://keion-circle.com
NEXTAUTH_URL=https://keion-circle.com
```

---

## 21.7 確認チェックリスト

Chapter 21の内容を理解できたか確認しましょう。

### Vercelの準備

- [ ] Vercelアカウントを作成できる
- [ ] GitHubリポジトリと連携できる
- [ ] プロジェクトをインポートできる

### Supabaseの本番環境

- [ ] Supabaseプロジェクトを作成できる
- [ ] データベース接続情報を取得できる
- [ ] Storageバケットを作成できる
- [ ] Storageのポリシーを設定できる
- [ ] データベーススキーマを適用できる
- [ ] 管理者アカウントを作成できる

### 環境変数の設定

- [ ] AUTH_SECRETを生成できる
- [ ] Vercelで環境変数を設定できる
- [ ] 本番用環境変数と開発用環境変数の違いを理解できる

### デプロイ

- [ ] GitHubにpushしてデプロイできる
- [ ] 自動デプロイの仕組みを理解できる
- [ ] デプロイログを確認できる
- [ ] ビルドエラーに対処できる

### 独自ドメイン（オプション）

- [ ] ドメインを追加できる
- [ ] DNSレコードを設定できる
- [ ] SSL証明書の発行を確認できる

---

## まとめ

この章では、作成したアプリケーションをVercelにデプロイしました。

### 🎓 この章で学んだこと

#### デプロイの流れ
- ✅ ローカル環境（SQLite）から本番環境（PostgreSQL）への移行
- ✅ Vercelを使った自動デプロイ
- ✅ GitHubとの連携による継続的デプロイ

#### 本番環境の設定
- ✅ Supabaseでの本番データベース作成
- ✅ Storageバケットの設定
- ✅ 環境変数の適切な管理
- ✅ OAuth設定の更新

#### セキュリティ
- ✅ 環境変数による秘密情報の保護
- ✅ SSL証明書の自動発行
- ✅ 強固なパスワードの設定

### 💡 重要なポイント

#### 環境の違い

```typescript
// 開発環境
DATABASE_URL="file:./dev.db"  // SQLite
AUTH_URL="http://localhost:3000"  // HTTP

// 本番環境
DATABASE_URL="postgresql://..."  // PostgreSQL
AUTH_URL="https://your-app.vercel.app"  // HTTPS
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
  - Core Web Vitalsの改善

デプロイが完了したので、より快適なユーザー体験を提供するための最適化を行いましょう！

---

[← 前の章：第20章 共通コンポーネントの実装](20-共通コンポーネントの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第22章 パフォーマンス最適化 →](22-パフォーマンス最適化.md)
