# 第28章：デプロイとCI/CD

この章では、Next.jsアプリケーションをVercelにデプロイし、CI/CDパイプラインを構築する方法を学びます。

## 28.1 Vercelの概要

### Vercelとは

Vercelは、Next.jsの開発元が提供するクラウドプラットフォームです：

**特徴:**
- ✅ **Next.js最適化**: ゼロコンフィグでNext.jsをデプロイ
- ✅ **グローバルCDN**: 世界中で高速配信
- ✅ **自動スケーリング**: トラフィックに応じて自動拡張
- ✅ **プレビューデプロイ**: PRごとに一時的なプレビュー環境
- ✅ **Edge Functions**: エッジでのサーバーレス実行
- ✅ **無料プラン**: 個人・小規模プロジェクトに十分

**料金プラン:**
- **Hobby（無料）**: 個人プロジェクト、商用利用不可
- **Pro（$20/月）**: 商用利用、チームコラボレーション
- **Enterprise**: 大規模プロジェクト向け

---

## 28.2 事前準備

### 1. GitHubリポジトリの作成

```bash
# ローカルでGitを初期化（まだの場合）
cd keion-circle-site
git init

# .gitignoreの確認
cat > .gitignore << 'EOF'
# 依存関係
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/
build/
dist/

# 環境変数
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# データベース
*.db
*.db-journal
dev.db

# ログ
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDEファイル
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# その他
.vercel
.turbo
EOF

# 初回コミット
git add .
git commit -m "Initial commit"

# GitHubリポジトリを作成してプッシュ
# GitHub上で新しいリポジトリを作成後
git remote add origin https://github.com/YOUR_USERNAME/keion-circle-site.git
git branch -M main
git push -u origin main
```

### 2. 環境変数の整理

本番環境用の環境変数を準備：

```bash
# .env.example（Gitにコミット可能）
AUTH_URL=https://your-domain.vercel.app
AUTH_SECRET=your-secret-here
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=postgresql://user:password@host:port/database
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**重要:** `.env.example`には実際の値を入れず、プレースホルダーのみ記載します。

---

## 28.3 Vercelへのデプロイ

### 方法1: Vercel CLI

```bash
# Vercel CLIのインストール
npm install -g vercel

# ログイン
vercel login

# プロジェクトをデプロイ
vercel

# 質問に答える
# ? Set up and deploy "~/keion-circle-site"? [Y/n] y
# ? Which scope do you want to deploy to? Your Account
# ? Link to existing project? [y/N] n
# ? What's your project's name? keion-circle-site
# ? In which directory is your code located? ./
# Auto-detected Project Settings (Next.js):
# - Build Command: next build
# - Development Command: next dev --port $PORT
# - Install Command: npm install
# ? Want to modify these settings? [y/N] n

# 本番環境にデプロイ
vercel --prod
```

### 方法2: Vercelダッシュボード（推奨）

1. **https://vercel.com にアクセス**
2. **「New Project」をクリック**
3. **GitHubリポジトリを接続**
   - GitHub認証を許可
   - リポジトリを選択
4. **プロジェクト設定**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```
5. **環境変数を設定**（後述）
6. **「Deploy」をクリック**

---

## 28.4 環境変数の設定

### Vercelダッシュボードでの設定

1. **プロジェクトを選択**
2. **「Settings」→「Environment Variables」**
3. **各変数を追加:**

```
Variable Name: AUTH_SECRET
Value: <ランダムな秘密鍵>
Environment: Production, Preview, Development

Variable Name: AUTH_URL
Value: https://keion-circle-site.vercel.app
Environment: Production

Variable Name: AUTH_TRUST_HOST
Value: true
Environment: Production, Preview

Variable Name: NEXTAUTH_URL
Value: https://keion-circle-site.vercel.app
Environment: Production

Variable Name: NEXTAUTH_SECRET
Value: <AUTH_SECRETと同じ値>
Environment: Production

Variable Name: DATABASE_URL
Value: postgresql://user:password@host:port/database
Environment: Production

Variable Name: GOOGLE_CLIENT_ID
Value: <Google Cloud Consoleで取得>
Environment: Production, Preview

Variable Name: GOOGLE_CLIENT_SECRET
Value: <Google Cloud Consoleで取得>
Environment: Production, Preview

Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
Environment: Production, Preview, Development

Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: <Supabaseで取得>
Environment: Production, Preview, Development
```

### 環境変数生成スクリプト

```bash
# scripts/generate-secret.sh
#!/bin/bash

# ランダムな秘密鍵を生成
openssl rand -base64 32
```

```bash
# 実行
chmod +x scripts/generate-secret.sh
./scripts/generate-secret.sh
```

---

## 28.5 データベースの準備

### Supabase PostgreSQLの設定

```bash
# 1. Supabase プロジェクトを作成
# https://supabase.com でアカウント作成

# 2. 新規プロジェクトを作成
# - Project name: keion-circle-site
# - Database password: <強力なパスワード>
# - Region: Northeast Asia (Tokyo)

# 3. 接続情報を取得
# Settings → Database → Connection string
# 例: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### Prismaマイグレーション

```bash
# ローカルでマイグレーションファイルを生成
npx prisma migrate dev --name init

# 本番データベースに適用
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# または、package.json に追加
# "scripts": {
#   "db:migrate": "prisma migrate deploy",
#   "db:generate": "prisma generate"
# }
```

### Vercel ビルドコマンドの設定

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma db push && next build",
    "vercel-build": "prisma generate && prisma db push && next build"
  }
}
```

**注意:** `prisma db push` は開発用です。本番では `prisma migrate deploy` を推奨します。

---

## 28.6 Google OAuth設定

### Google Cloud Consoleでの設定

```
1. Google Cloud Console にアクセス
   https://console.cloud.google.com

2. 新規プロジェクトを作成
   - プロジェクト名: BOLD軽音サイト

3. OAuth 同意画面を設定
   - ユーザータイプ: 外部
   - アプリ名: BOLD軽音メンバーサイト
   - サポートメール: your-email@example.com
   - スコープ: email, profile, openid

4. 認証情報を作成
   - OAuth 2.0 クライアント ID
   - アプリケーションの種類: ウェブアプリケーション
   - 名前: Vercel Production
   
5. 承認済みのリダイレクト URI
   本番環境:
   https://keion-circle-site.vercel.app/api/auth/callback/google
   
   プレビュー環境:
   https://*.vercel.app/api/auth/callback/google
   
   開発環境:
   http://localhost:3000/api/auth/callback/google

6. クライアントIDとシークレットを取得
   - Vercelの環境変数に設定
```

---

## 28.7 Supabase Storageの設定

### バケットの作成

```sql
-- Supabase SQL Editor で実行

-- avatars バケットを作成（公開）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- ポリシーを設定（誰でも読み取り可能）
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- ポリシーを設定（認証済みユーザーのみアップロード可能）
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- ポリシーを設定（自分のアバターのみ削除可能）
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid() = owner);
```

---

## 28.8 自動デプロイの設定

### GitHubとVercelの連携

Vercelは自動的にGitHubと連携し、以下のワークフローが実行されます：

```yaml
# 自動実行されるワークフロー（設定不要）

# main ブランチへのプッシュ → 本番デプロイ
git push origin main
# ➡️ Production deployment

# プルリクエストの作成 → プレビューデプロイ
git checkout -b feature/new-feature
git push origin feature/new-feature
# GitHubでPR作成
# ➡️ Preview deployment (独自URL)

# プルリクエストのマージ → 本番デプロイ
# PR をマージ
# ➡️ Production deployment
```

### デプロイ設定のカスタマイズ

```javascript
// vercel.json（オプション）
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["hnd1"], // Tokyo region
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

---

## 28.9 GitHub Actionsの設定

### 自動テスト＆デプロイ

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # リントとタイプチェック
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: TypeScript check
        run: npx tsc --noEmit

  # ビルドテスト
  build:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: file:./test.db
          AUTH_SECRET: test-secret
          AUTH_URL: http://localhost:3000
          NEXT_PUBLIC_SUPABASE_URL: https://test.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: test-key

  # テスト実行
  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: file:./test.db
          AUTH_SECRET: test-secret
```

### Vercel専用デプロイワークフロー

```yaml
# .github/workflows/deploy.yml
name: Vercel Production Deployment

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**必要なシークレット（GitHubリポジトリ設定）:**
- `VERCEL_TOKEN`: Vercelアカウント設定で生成
- `VERCEL_ORG_ID`: Vercelプロジェクト設定から取得
- `VERCEL_PROJECT_ID`: Vercelプロジェクト設定から取得

---

## 28.10 デプロイの確認とモニタリング

### デプロイログの確認

```bash
# Vercel CLI でログ確認
vercel logs

# 本番環境のログ
vercel logs --prod

# リアルタイムログ
vercel logs --follow
```

### ドメインの設定

```bash
# カスタムドメインの追加
vercel domains add yourdomain.com

# ドメインの確認
vercel domains ls

# DNSレコードの設定
# A Record: 76.76.21.21
# CNAME: cname.vercel-dns.com
```

### パフォーマンスモニタリング

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // アナリティクスを有効化
  experimental: {
    instrumentationHook: true,
  },
  
  // ビルド時の設定
  typescript: {
    // 本番ビルド時にTypeScriptエラーを無視しない
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // 本番ビルド時にESLintエラーを無視しない
    ignoreDuringBuilds: false,
  },
  
  // 画像最適化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google avatars
      },
    ],
  },
};

module.exports = nextConfig;
```

---

## 28.11 デプロイのトラブルシューティング

### よくある問題と解決策

#### 1. ビルドエラー

```bash
# エラー: Module not found
# 解決策: 依存関係を確認
npm install
npm run build

# エラー: Type error
# 解決策: TypeScriptの型チェック
npx tsc --noEmit
```

#### 2. 環境変数が読み込めない

```javascript
// 確認用API
// app/api/debug/env/route.ts
export async function GET() {
  return Response.json({
    NODE_ENV: process.env.NODE_ENV,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    // 実際の値は表示しない！
  });
}
```

#### 3. データベース接続エラー

```typescript
// lib/db-test.ts
import { prisma } from '@/lib/prisma';

export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
```

#### 4. Prismaマイグレーションエラー

```bash
# 本番データベースをリセット（注意！）
DATABASE_URL="postgresql://..." npx prisma migrate reset

# マイグレーション履歴の確認
DATABASE_URL="postgresql://..." npx prisma migrate status

# マイグレーションの再適用
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 28.12 ロールバック手順

### Vercelでのロールバック

```bash
# 1. デプロイ履歴を確認
vercel ls

# 2. 特定のデプロイメントに戻す
# Vercel ダッシュボード → Deployments → 過去のデプロイを選択 → "Promote to Production"

# または CLI で
vercel rollback <deployment-url>
```

### Gitでのロールバック

```bash
# 特定のコミットに戻す
git log --oneline
git revert <commit-hash>
git push origin main

# または強制的に戻す（注意！）
git reset --hard <commit-hash>
git push origin main --force
```

---

## 28.13 継続的インテグレーションのベストプラクティス

### 1. プレビューデプロイの活用

```
feature/user-profile ブランチを作成
  ↓
変更をプッシュ
  ↓
自動的にプレビュー環境が作成
  ↓
プレビューURLで動作確認
  ↓
問題なければPRをマージ
  ↓
本番環境に自動デプロイ
```

### 2. デプロイ前チェックリスト

```markdown
## デプロイ前確認事項

- [ ] すべてのテストが通過
- [ ] TypeScriptエラーがない
- [ ] ESLintエラーがない
- [ ] ビルドが成功
- [ ] 環境変数が正しく設定されている
- [ ] データベースマイグレーションが完了
- [ ] プレビュー環境で動作確認済み
- [ ] セキュリティ脆弱性がない
- [ ] パフォーマンステスト完了
- [ ] ドキュメントが更新されている
```

### 3. 段階的ロールアウト

```javascript
// middleware.ts - カナリアリリース例
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 10%のユーザーに新機能を表示
  const enableNewFeature = Math.random() < 0.1;
  
  const response = NextResponse.next();
  response.cookies.set('feature-flag', enableNewFeature.toString());
  
  return response;
}
```

---

## まとめ

この章では、Next.jsアプリケーションのデプロイとCI/CDについて学びました：

### Vercelデプロイ
- ✅ **アカウント作成**: GitHub連携で簡単セットアップ
- ✅ **プロジェクト設定**: Next.jsを自動検出
- ✅ **環境変数**: 本番・プレビュー・開発環境別に設定
- ✅ **カスタムドメイン**: 独自ドメインの設定

### データベース準備
- ✅ **Supabase PostgreSQL**: 本番環境用データベース
- ✅ **Prismaマイグレーション**: スキーマの適用
- ✅ **接続文字列**: DATABASE_URLの設定
- ✅ **Supabase Storage**: 画像保存用バケット

### OAuth設定
- ✅ **Google Cloud Console**: OAuth 2.0クライアント
- ✅ **リダイレクトURI**: 本番・プレビュー・開発用
- ✅ **認証情報**: クライアントIDとシークレット

### 自動デプロイ
- ✅ **GitHub連携**: プッシュで自動デプロイ
- ✅ **プレビュー環境**: PRごとに一時環境作成
- ✅ **GitHub Actions**: テスト自動実行
- ✅ **ロールバック**: 問題発生時の復旧手順

### モニタリング
- ✅ **デプロイログ**: リアルタイム監視
- ✅ **パフォーマンス**: ビルド時間・実行速度
- ✅ **エラー追跡**: 本番環境のエラー検知

### ベストプラクティス
- ✅ **段階的デプロイ**: プレビュー → 本番
- ✅ **自動テスト**: CI/CDパイプライン
- ✅ **チェックリスト**: デプロイ前確認
- ✅ **フィーチャーフラグ**: 段階的ロールアウト

次の章では、**セキュリティとパフォーマンス最適化**について詳しく見ていきます。

---

[← 前の章：第27章 スタイリングとテーマ設定](27-スタイリングとテーマ設定.md) | [目次に戻る](00-目次.md) | [次の章へ：第29章 セキュリティベストプラクティス →](29-セキュリティベストプラクティス.md)
