# テスト

このプロジェクトは包括的なテストスイートを備えています。

## テストの種類

### 1. 単体テスト（Unit Tests）
コンポーネントとユーティリティ関数の単体テスト

```bash
# テストを実行
npm run test:unit

# カバレッジレポート付きで実行
npm run test:unit -- --coverage

# 特定のファイルのみテスト
npm run test:unit -- Button.test.tsx
```

### 2. 統合テスト（Integration Tests）
API Routesとデータベース操作のテスト

```bash
# 統合テストを実行
npm run test:integration

# 環境変数を設定して実行
DATABASE_URL="postgresql://..." npm run test:integration
```

### 3. E2Eテスト（End-to-End Tests）
実際のユーザーフローをブラウザでテスト

```bash
# E2Eテストを実行
npm run test:e2e

# UIモードで実行（デバッグ用）
npm run test:e2e:ui

# 特定のブラウザのみテスト
npm run test:e2e -- --project=chromium
```

## テストカバレッジ

- **目標**: 70%以上のカバレッジ
- **対象**: 
  - コンポーネント
  - API Routes
  - ユーティリティ関数

カバレッジレポートは `coverage/` ディレクトリに生成されます。

```bash
# カバレッジレポートをHTMLで表示
open coverage/lcov-report/index.html
```

## CI/CDパイプライン

GitHub Actionsで以下のテストが自動実行されます：

### Pull Request時
- ✅ Lint (ESLint)
- ✅ Type Check (TypeScript)
- ✅ Unit Tests
- ✅ Integration Tests
- ✅ E2E Tests
- ✅ Build

### main/developブランチへのPush時
- 上記すべて + Vercel本番環境へのデプロイ

### セキュリティスキャン
- CodeQL（毎週日曜日自動実行）
- 依存関係の脆弱性チェック

## テストデータベースのセットアップ

E2Eテストと統合テストにはテスト用データベースが必要です。

```bash
# テスト用PostgreSQLを起動（Docker）
docker run -d \
  --name postgres-test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=test \
  -p 5433:5432 \
  postgres:15

# 環境変数を設定
export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/test"

# データベーススキーマを適用
npx prisma db push

# テスト用管理者を作成
node scripts/create-admin.js admin@example.com password123 "Test Admin"
```

## テスト環境変数

`.env.test` ファイルを作成してテスト用の環境変数を設定：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/test"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key"
AUTH_URL="http://localhost:3000"
AUTH_SECRET="test-secret-key"
AUTH_TRUST_HOST=true
```

## トラブルシューティング

### Playwrightのブラウザが見つからない

```bash
npx playwright install
```

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
docker ps | grep postgres

# DATABASE_URLが正しいか確認
echo $DATABASE_URL
```

### テストがタイムアウトする

```bash
# タイムアウト時間を延長
npm run test:e2e -- --timeout=60000
```

## ベストプラクティス

1. **テストファーストの開発**: 新機能を実装する前にテストを書く
2. **モックの適切な使用**: 外部APIやデータベースは適切にモック化
3. **E2Eテストは最小限に**: 重要なユーザーフローのみカバー
4. **CI/CDでの自動実行**: すべてのPRでテストが自動実行される
5. **カバレッジの監視**: 新しいコードは必ずテストでカバーする
