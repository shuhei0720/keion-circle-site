# 第29章：CI/CDの実装

この章では、**GitHub Actions**を使った**CI/CD（継続的インテグレーション/継続的デリバリー）**の実装を学びます。自動テスト、自動デプロイ、環境変数管理、デプロイ戦略など、実践的なCI/CDパイプラインを構築します。

## 29.1 CI/CDとは

### CI/CDの概念

```
CI (Continuous Integration) - 継続的インテグレーション:
├─ コードをpushするたびに自動テスト
├─ ビルドが通ることを確認
├─ 問題を早期発見
└─ チーム開発の品質向上

CD (Continuous Delivery/Deployment) - 継続的デリバリー/デプロイ:
├─ テストが通ったコードを自動デプロイ
├─ 本番環境への迅速なリリース
├─ 手動デプロイのミスを削減
└─ ユーザーへの迅速なフィードバック
```

### GitHub Actions の特徴

```
GitHub Actions = GitHubの公式CI/CDツール

主な特徴:
✅ GitHub に統合（追加設定不要）
✅ YAML で設定
✅ 豊富なアクション（再利用可能）
✅ マトリックステスト（複数環境で並列実行）
✅ 無料枠あり（public: 無制限、private: 2000分/月）
```

---

## 29.2 基本的なワークフロー

### CI ワークフローの作成

**.github/workflows/ci.yml を作成:**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  # mainとdevelopブランチへのpush
  push:
    branches: [main, develop]
  # mainとdevelopへのPull Request
  pull_request:
    branches: [main, develop]

jobs:
  # Lintとビルドチェック
  lint-and-build:
    name: Lint and Build
    runs-on: ubuntu-latest

    steps:
      # リポジトリをチェックアウト
      - name: Checkout code
        uses: actions/checkout@v4

      # Node.jsのセットアップ
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # 依存関係のインストール
      - name: Install dependencies
        run: npm ci

      # Lintチェック
      - name: Run ESLint
        run: npm run lint

      # TypeScriptの型チェック
      - name: TypeScript type check
        run: npx tsc --noEmit

      # ビルドテスト
      - name: Build project
        run: npm run build
        env:
          # ビルド時の環境変数
          AUTH_URL: http://localhost:3000
          AUTH_SECRET: ci-test-secret
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          NEXT_PUBLIC_SUPABASE_URL: https://test.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: test-key

      # ビルド成果物をアップロード（デバッグ用）
      - name: Upload build artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: .next/
```

**解説:**

| ステップ | 説明 |
|---------|------|
| `checkout` | コードをダウンロード |
| `setup-node` | Node.js環境を準備（キャッシュ有効） |
| `npm ci` | 依存関係を高速インストール |
| `npm run lint` | ESLintでコード品質チェック |
| `tsc --noEmit` | TypeScriptの型チェック |
| `npm run build` | Next.jsビルド |
| `upload-artifact` | 失敗時にビルド結果を保存 |

---

## 29.3 単体テストワークフロー

### Jest 単体テストの自動実行

**.github/workflows/unit-tests.yml を作成:**

```yaml
# .github/workflows/unit-tests.yml
name: Unit Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Run Unit Tests
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

      - name: Run tests with coverage
        run: npm run test:ci
        env:
          NODE_ENV: test

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

**解説:**

- **Codecov**: カバレッジを可視化
- **test-results**: テスト結果を保存
- **lcov-reporter**: PR にカバレッジをコメント

---

## 29.4 結合テストワークフロー

### API と結合テストの自動実行

**.github/workflows/integration-tests.yml を作成:**

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Run Integration Tests
    runs-on: ubuntu-latest

    services:
      # PostgreSQL サービス
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup database
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: |
          npx prisma generate
          npx prisma db push

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          AUTH_URL: http://localhost:3000
          AUTH_SECRET: test-secret
          NEXT_PUBLIC_SUPABASE_URL: https://test.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: test-key
        run: npm run test:integration

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: integration-test-results
          path: test-results/
```

**ポイント:**

- **services**: PostgreSQLコンテナを起動
- **health-check**: データベースが準備できるまで待機
- **prisma db push**: テスト用DBスキーマを作成

---

## 29.5 E2Eテストワークフロー

### Playwright E2Eテストの自動実行

**.github/workflows/e2e-tests.yml を作成:**

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  # 手動実行も可能
  workflow_dispatch:

jobs:
  test:
    name: Run E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Setup database
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: |
          npx prisma generate
          npx prisma db push

      - name: Create test users
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: |
          node scripts/create-admin.js admin@test.com admin123 "Admin User"
          node scripts/create-user.js member@test.com member123 "Member User" member

      - name: Run Playwright tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          AUTH_URL: http://localhost:3000
          AUTH_SECRET: test-secret-for-e2e
          NEXTAUTH_URL: http://localhost:3000
          NEXTAUTH_SECRET: test-secret-for-e2e
          NEXT_PUBLIC_SUPABASE_URL: https://test.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: test-anon-key
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-videos
          path: test-results/
          retention-days: 7
```

**ポイント:**

- **timeout-minutes**: 長時間実行を防ぐ
- **playwright install --with-deps**: ブラウザと依存関係をインストール
- **test-videos**: 失敗時の動画を保存
- **retention-days**: アーティファクトの保存期間

---

## 29.6 マトリックステスト

### 複数のNode.jsバージョンでテスト

```yaml
# .github/workflows/matrix-test.yml
name: Matrix Tests

on:
  push:
    branches: [main]

jobs:
  test:
    name: Test on Node ${{ matrix.node-version }}
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 21]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

**解説:**

- 3つのOS × 3つのNode.jsバージョン = 9並列実行
- `matrix.os`, `matrix.node-version` で動的に変更

---

## 29.7 自動デプロイ（Vercel）

### Vercel への自動デプロイ

**Vercel は自動的に GitHub と連携しますが、ワークフローで制御することも可能:**

**.github/workflows/deploy.yml を作成:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest

    # E2Eテストが成功した場合のみデプロイ
    needs: [e2e-tests]

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Comment PR with deploy URL
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ デプロイ完了: https://your-app.vercel.app'
            })
```

**必要なシークレット:**

GitHub リポジトリの Settings → Secrets に追加:

| シークレット | 取得方法 |
|------------|---------|
| `VERCEL_TOKEN` | Vercel Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel プロジェクトの `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | 同上 |

---

## 29.8 環境変数の管理

### GitHub Secrets の活用

```yaml
jobs:
  deploy:
    steps:
      - name: Deploy with secrets
        env:
          # Secrets から環境変数を設定
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        run: npm run deploy
```

### Environment Variables vs Secrets

```
通常の環境変数（env:）:
├─ ログに表示される
├─ public な値（NEXT_PUBLIC_*）
└─ 例: NEXT_PUBLIC_SUPABASE_URL

Secrets（${{ secrets.* }}）:
├─ ログでマスクされる ***
├─ 機密情報（パスワード、APIキー）
└─ 例: DATABASE_URL, AUTH_SECRET
```

---

## 29.9 プルリクエストチェック

### PR にステータスチェックを追加

```yaml
# .github/workflows/pr-check.yml
name: PR Checks

on:
  pull_request:
    branches: [main, develop]

jobs:
  checks:
    name: PR Quality Checks
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 全履歴を取得

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # コミットメッセージのチェック
      - name: Lint commit messages
        uses: wagoid/commitlint-github-action@v5

      # コード変更の差分チェック
      - name: Check changed files
        run: |
          git diff --name-only origin/main...HEAD
          echo "Changed files:"
          git diff --name-only origin/main...HEAD

      # Lintエラーがあるファイルのみチェック
      - name: Lint changed files only
        run: |
          CHANGED_FILES=$(git diff --name-only origin/main...HEAD | grep -E '\.(ts|tsx|js|jsx)$' || true)
          if [ -n "$CHANGED_FILES" ]; then
            npx eslint $CHANGED_FILES
          fi

      # PR のサイズチェック
      - name: Check PR size
        run: |
          LINES_CHANGED=$(git diff --shortstat origin/main...HEAD | awk '{print $4+$6}')
          if [ "$LINES_CHANGED" -gt 500 ]; then
            echo "::warning::PR が大きすぎます (${LINES_CHANGED} 行)。分割を検討してください。"
          fi

      # テストカバレッジの変化をチェック
      - name: Check test coverage
        run: |
          npm run test:coverage
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          echo "Test coverage: $COVERAGE%"
          
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "::error::テストカバレッジが 70% 未満です"
            exit 1
          fi
```

---

## 29.10 定期実行（Scheduled Workflow）

### 毎日深夜にテストを実行

```yaml
# .github/workflows/nightly-tests.yml
name: Nightly Tests

on:
  schedule:
    # 毎日午前3時（UTC）に実行
    - cron: '0 3 * * *'
  # 手動実行も可能
  workflow_dispatch:

jobs:
  full-test-suite:
    name: Full Test Suite
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

      - name: Run all tests
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:e2e

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '🔥 Nightly tests failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**cron 構文:**

```
分 時 日 月 曜日
* * * * *

例:
'0 3 * * *'    → 毎日3時
'0 */6 * * *'  → 6時間ごと
'0 0 * * 0'    → 毎週日曜日0時
```

---

## 29.11 デプロイ戦略

### ブルーグリーンデプロイメント

```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to staging (green)
        run: |
          # ステージング環境にデプロイ
          vercel --env=staging

      - name: Run smoke tests on staging
        run: |
          # ステージング環境で軽いテスト
          npm run test:smoke -- --url=https://staging.example.com

      - name: Switch to production (blue)
        if: success()
        run: |
          # テスト成功時のみ本番にプロモート
          vercel --prod

      - name: Rollback on failure
        if: failure()
        run: |
          # 失敗時はロールバック
          echo "Deployment failed. Keeping previous version."
```

### カナリアリリース

```yaml
# .github/workflows/canary-deploy.yml
name: Canary Deployment

on:
  push:
    branches: [main]

jobs:
  canary:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Deploy canary (10% traffic)
        run: |
          # 10%のトラフィックを新バージョンに
          vercel --alias canary.example.com

      - name: Monitor canary for 30 minutes
        run: |
          # エラー率を監視
          sleep 1800
          ERROR_RATE=$(curl https://api.example.com/metrics/error-rate)
          
          if [ "$ERROR_RATE" -gt 5 ]; then
            echo "::error::Error rate too high: $ERROR_RATE%"
            exit 1
          fi

      - name: Promote to 100% traffic
        if: success()
        run: |
          vercel --prod
```

---

## 29.12 パフォーマンス監視

### Lighthouse CI の統合

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
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

      - name: Build project
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/posts
            http://localhost:3000/events
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Comment PR with Lighthouse results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const results = require('./lighthouse-results.json');
            const score = results[0].categories.performance.score * 100;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `⚡ Lighthouse スコア: ${score}/100`
            })
```

---

## 29.13 依存関係の自動更新

### Dependabot の設定

**.github/dependabot.yml を作成:**

```yaml
# .github/dependabot.yml
version: 2
updates:
  # npm の依存関係を毎週チェック
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    reviewers:
      - "your-username"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore"
      include: "scope"

  # GitHub Actions の更新も監視
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

**Dependabot が自動で PR を作成:**

- 依存関係の更新をPRで提案
- セキュリティ脆弱性の修正
- 自動的にテストを実行
- テストが通れば自動マージ（オプション）

---

## 29.14 ワークフローの最適化

### キャッシュの活用

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      .next/cache
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 並列実行

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]

  test:
    runs-on: ubuntu-latest
    steps: [...]

  build:
    runs-on: ubuntu-latest
    # lint と test が成功したらビルド
    needs: [lint, test]
    steps: [...]
```

### 条件付き実行

```yaml
- name: Deploy to production
  # main ブランチかつテストが成功した場合のみ
  if: github.ref == 'refs/heads/main' && success()
  run: npm run deploy
```

---

## 29.15 実践：プロジェクトのCI/CD

### 完全なワークフロー例

**.github/workflows/complete-ci-cd.yml:**

```yaml
name: Complete CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ステージ1: コード品質チェック
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  # ステージ2: 単体テスト
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci

  # ステージ3: E2Eテスト（mainブランチのみ）
  e2e-tests:
    name: E2E Tests
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: [quality, unit-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  # ステージ4: デプロイ（mainブランチのみ）
  deploy:
    name: Deploy to Production
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: [e2e-tests]
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: echo "Deploying to Vercel..."
        # 実際のデプロイコマンド
```

---

## まとめ

この章で学んだこと：

✅ **CI/CDの概念** - 継続的インテグレーション/デリバリー
✅ **GitHub Actions** - ワークフロー、ジョブ、ステップ
✅ **自動テスト** - 単体テスト、結合テスト、E2Eテスト
✅ **自動デプロイ** - Vercel、ブルーグリーン、カナリア
✅ **環境変数管理** - Secrets、環境変数
✅ **PRチェック** - コミットメッセージ、カバレッジ
✅ **定期実行** - cronスケジュール
✅ **パフォーマンス監視** - Lighthouse CI
✅ **依存関係更新** - Dependabot
✅ **最適化** - キャッシュ、並列実行

**次の章では、コード詳細解説編に入ります。**

---

[← 前の章：第28章 E2Eテストの実装](28-E2Eテストの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第30章 API Routesの詳細解説 →](30-API-Routesの詳細解説.md)
