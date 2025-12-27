# デプロイメントガイド

## CI/CD & Vercel統合の仕組み

このプロジェクトは **GitHub Actions** (テスト) と **Vercel** (デプロイ) を組み合わせた自動化パイプラインを使用しています。

### フロー概要

```
コミット → GitHub
    ↓
    ├─→ GitHub Actions (並列実行)
    │   ├─ Lint
    │   ├─ Type Check
    │   ├─ Unit Tests
    │   ├─ Integration Tests
    │   ├─ E2E Tests
    │   └─ Build Check
    │
    └─→ Vercel (自動デプロイ)
        ├─ mainブランチ → 本番環境
        └─ developブランチ → プレビュー環境
```

### GitHub Actions（テスト）

**役割**: コード品質とテストの自動実行

- **Lint**: ESLintでコードスタイルチェック
- **Type Check**: TypeScript型チェック
- **Unit Tests**: Jestユニットテスト
- **Integration Tests**: API Routes統合テスト
- **E2E Tests**: Playwrightエンドツーエンドテスト
- **Build**: Next.jsビルドの成功確認

**実行タイミング**:
- `main`または`develop`ブランチへのプッシュ
- `main`または`develop`への Pull Request

### Vercel（デプロイ）

**役割**: 本番環境とプレビュー環境への自動デプロイ

**デプロイ設定**:
- **Production**: `main`ブランチへのプッシュ
- **Preview**: `develop`ブランチまたはPull Request

**Vercel環境変数** (必須):
```
AUTH_URL=https://your-domain.vercel.app
AUTH_SECRET=<ランダムな文字列>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<AUTH_SECRETと同じ値>
DATABASE_URL=postgresql://user:password@host:port/database
GOOGLE_CLIENT_ID=<Google Cloud Console>
GOOGLE_CLIENT_SECRET=<Google Cloud Console>
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

## Vercelの設定確認

### 1. GitHub統合の確認

Vercel Dashboard → Project Settings → Git

- ✅ **Production Branch**: `main`
- ✅ **Automatic Deployments**: 有効
- ✅ **Preview Branches**: `develop`

### 2. ビルド設定

Vercel Dashboard → Project Settings → Build & Development Settings

- **Framework Preset**: `Next.js`
- **Build Command**: `npm run build` (デフォルト)
- **Install Command**: `npm ci` (デフォルト)
- **Output Directory**: `.next` (デフォルト)

### 3. 環境変数の設定

Vercel Dashboard → Project Settings → Environment Variables

すべての環境変数を以下の環境に設定:
- ✅ Production
- ✅ Preview
- ✅ Development

## テストが失敗した場合のデプロイ

Vercelは **GitHub Actionsのテスト結果に関係なく** デプロイを実行します。

**推奨ワークフロー**:
1. developブランチで開発・テスト
2. GitHub ActionsでテストをPassすることを確認
3. mainブランチへマージ
4. Vercelが自動で本番デプロイ

**重要**: mainブランチへのマージ前に、必ずGitHub Actionsのテストが全てパスしていることを確認してください。

## トラブルシューティング

### ビルドエラー: `Can't reach database server`

**原因**: ビルド時にデータベース接続を試みている

**解決済み**: `package.json`の`build`スクリプトから`prisma db push`を削除しました
```json
"build": "prisma generate && next build"
```

### Vercelデプロイが失敗する

1. **環境変数の確認**: すべての必須環境変数が設定されているか
2. **Supabase接続**: `DATABASE_URL`が正しいか
3. **Google OAuth**: リダイレクトURIにVercelドメインが登録されているか
4. **ローカルでビルド確認**: `npm run build`が成功するか

### GitHub Actionsが失敗する

1. **Secrets確認** (不要): Vercel統合を使用するため、`VERCEL_TOKEN`などは不要
2. **PostgreSQLサービス**: E2E/統合テストでDBコンテナが起動しているか
3. **Playwright**: ブラウザがインストールされているか

## 手動デプロイ

緊急時の手動デプロイ方法:

```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login

# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

## Codecov統合（オプション）

カバレッジレポートをCodecovにアップロード:

1. https://codecov.io でアカウント作成
2. リポジトリを追加
3. `CODECOV_TOKEN`をGitHub Secretsに追加

GitHub Actionsが自動でカバレッジをアップロードします。

## まとめ

- ✅ **テスト**: GitHub Actionsで自動実行
- ✅ **デプロイ**: VercelのGitHub統合で自動実行
- ✅ **本番**: mainブランチへのプッシュ
- ✅ **プレビュー**: developブランチまたはPR
- ⚠️ **重要**: mainマージ前にテストがパスすることを確認
