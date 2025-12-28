# 第30章：CI/CDの実装【ハンズオン】

> **この章では、GitHub Actions で自動テスト・自動デプロイを設定します**

## 🛠️ **ハンズオン作業**

**⚠️ 重要**: この章では実際に手を動かして CI/CD パイプラインを構築します。GitHub Actions の設定ファイルを作成し、自動テスト・自動デプロイを実現します。

> 💡 **前提**: GitHub リポジトリが作成されていることを確認してください。

## 📚 この章で学ぶこと

- ✅ GitHub Actions のワークフロー作成
- ✅ 自動テストの設定
- ✅ Vercel への自動デプロイ
- ✅ 環境変数の管理
- ✅ プルリクエストのプレビュー

---

## 30.1 GitHub Actions のセットアップ

### Step 1: ワークフローディレクトリを作成

ターミナルで以下を実行：

```bash
mkdir -p .github/workflows
```

### Step 2: `.github/workflows/ci.yml` を作成して、以下のコードを**すべて**入力してください：

> 💡 **説明**: このファイルは、コードを push したときに自動でテストを実行する設定です

```yaml

### GitHub Actions の特徴

GitHub Actions は GitHub に統合された CI/CD サービスです。

```
GitHub Actions の仕組み:
┌────────────────────────────────┐
│ GitHubリポジトリ               │
│                                │
│ .github/workflows/             │
│   ├─ ci.yml       ← ワークフロー定義
│   ├─ test.yml                  │
│   └─ deploy.yml                │
└────────────────────────────────┘
       ↓ push イベント
┌────────────────────────────────┐
│ GitHub Actions ランナー         │
│ (Ubuntu/Windows/macOS)         │
│                                │
│ 1. コードをクローン             │
│ 2. Node.js インストール         │
│ 3. テスト実行                   │
│ 4. デプロイ                     │
└────────────────────────────────┘
```

**主な特徴:**

| 特徴 | 説明 | メリット |
|------|------|---------|
| **GitHub統合** | GitHub に組み込み済み | 追加設定不要 |
| **YAML設定** | `.yml` ファイルで定義 | バージョン管理可能 |
| **豊富なアクション** | 再利用可能な部品 | 車輪の再発明不要 |
| **マトリックステスト** | 複数環境で並列実行 | Node 18, 20, 22 を同時テスト |
| **無料枠** | public: 無制限 | 個人プロジェクトに最適 |

**GitHub Actions の料金:**

| プラン | 無料枠 | 超過料金 |
|--------|--------|---------|
| Public リポジトリ | 無制限 | なし |
| Private リポジトリ | 2000分/月 | $0.008/分 |

**2000分/月の目安:**

```
1回のワークフロー実行: 約5分
→ 2000分 ÷ 5分 = 400回/月

1日あたり: 400回 ÷ 30日 = 約13回/日

十分な量！（通常の開発では足りる）
```

**アクションとは？**

```
アクション = 再利用可能なステップ

公式アクション（よく使う）:
├─ actions/checkout       ← コードをチェックアウト
├─ actions/setup-node     ← Node.js をセットアップ
├─ actions/cache          ← 依存関係をキャッシュ
└─ actions/upload-artifact ← ファイルをアップロード

コミュニティアクション（便利）:
├─ codecov/codecov-action ← カバレッジアップロード
├─ vercel/action          ← Vercel デプロイ
└─ slack-notify           ← Slack 通知
```

**マトリックステストの例:**

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, windows-latest, macos-latest]

# → 3×3 = 9個のジョブが並列実行される
```

```
実行イメージ:
┌────────────────────────────────┐
│ Node 18 + Ubuntu    ✓ 3分      │
│ Node 18 + Windows   ✓ 4分      │
│ Node 18 + macOS     ✓ 5分      │ ← 並列実行
│ Node 20 + Ubuntu    ✓ 3分      │
│ Node 20 + Windows   ✓ 4分      │
│ Node 20 + macOS     ✓ 5分      │
│ Node 22 + Ubuntu    ✓ 3分      │
│ Node 22 + Windows   ✓ 4分      │
│ Node 22 + macOS     ✓ 5分      │
└────────────────────────────────┘
合計: 最長5分（並列実行のため）
```

> 💡 **初心者への補足:**
> - **ワークフロー**: 自動化の手順を定義したファイル（`.yml`）
> - **ジョブ**: ワークフローの中の1つの作業単位
> - **ステップ**: ジョブの中の1つの操作
> - **アクション**: 再利用可能なステップ
> 
> **階層構造:**
> ```
> ワークフロー（ci.yml）
>   └─ ジョブ（test）
>       └─ ステップ
>           ├─ actions/checkout
>           ├─ npm ci
>           └─ npm test
> ```

---

## 30.2 基本的なワークフロー

### CI ワークフローの作成

GitHub Actions のワークフローは `.github/workflows/` ディレクトリに YAML ファイルで定義します。

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

**このコードの詳しい説明:**

#### 1. ワークフローの基本構造

```yaml
name: CI  # ワークフローの名前（GitHub UI に表示される）

on:       # トリガー（いつ実行するか）
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:     # 実行するジョブ
  lint-and-build:  # ジョブID
    name: Lint and Build  # ジョブ名
    runs-on: ubuntu-latest  # 実行環境
    steps:  # 実行するステップ
      - name: ...
        uses: ...
```

**階層構造:**

```
ワークフロー（ci.yml）
  ├─ name: CI
  ├─ on: push, pull_request
  └─ jobs:
      └─ lint-and-build:
          ├─ runs-on: ubuntu-latest
          └─ steps:
              ├─ Checkout code
              ├─ Setup Node.js
              ├─ Install dependencies
              ├─ Run ESLint
              ├─ TypeScript type check
              ├─ Build project
              └─ Upload build artifacts
```

#### 2. `on`（トリガー） - いつ実行するか

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**`push` トリガー:**

```
開発者がコードを push
  ↓
main または develop ブランチ？
  ├─ Yes → ワークフロー実行 ✓
  └─ No  → 実行しない
```

**`pull_request` トリガー:**

```
Pull Request を作成/更新
  ↓
main または develop へのPR？
  ├─ Yes → ワークフロー実行 ✓
  └─ No  → 実行しない
```

**他のトリガー例:**

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**'          # src/ 配下が変更された時のみ
  pull_request:
  schedule:
    - cron: '0 0 * * *'   # 毎日0時（定期実行）
  workflow_dispatch:      # 手動実行ボタン
```

#### 3. `jobs`（ジョブ） - 何を実行するか

```yaml
jobs:
  lint-and-build:       # ジョブID（任意の名前）
    name: Lint and Build  # 表示名
    runs-on: ubuntu-latest  # 実行環境
```

**`runs-on`（実行環境）の選択肢:**

| 環境 | 説明 | 用途 |
|------|------|------|
| `ubuntu-latest` | Ubuntu Linux（最速） | 一般的なCI/CD |
| `windows-latest` | Windows Server | Windows専用テスト |
| `macos-latest` | macOS | iOS/macOS アプリ |

**実行時間の違い:**

```
ubuntu-latest:   約2分  ← おすすめ（速い）
windows-latest:  約3分
macos-latest:    約5分
```

#### 4. `steps`（ステップ） - 具体的な手順

**4-1. Checkout（コードのダウンロード）**

```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

- **`uses`**: 既存のアクションを使用
- **`actions/checkout`**: GitHub 公式のチェックアウトアクション
- **`@v4`**: バージョン4を使用

**何が起こるか:**

```
GitHub リポジトリ
  ↓ ダウンロード
ランナーのファイルシステム
  ├─ src/
  ├─ package.json
  ├─ tsconfig.json
  └─ ...
```

**4-2. Setup Node.js**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

- **`with`**: アクションへのパラメータ
- **`node-version: '20'`**: Node.js 20 をインストール
- **`cache: 'npm'`**: `node_modules` をキャッシュ（高速化）

**キャッシュの効果:**

```
キャッシュなし:
npm ci → 約60秒

キャッシュあり:
キャッシュ復元 → npm ci → 約15秒
              （変更分のみインストール）

4倍速い！
```

**4-3. Install dependencies（依存関係のインストール）**

```yaml
- name: Install dependencies
  run: npm ci
```

- **`run`**: シェルコマンドを実行
- **`npm ci`**: `npm install` より速く、確実

**`npm ci` vs `npm install`:**

| | `npm ci` | `npm install` |
|---|----------|---------------|
| 速度 | 速い | 遅い |
| package-lock.json | 必須（厳密に従う） | あれば使う |
| node_modules/ | 削除してからインストール | 既存を残す |
| CI/CD | ✓ 推奨 | ✗ 非推奨 |

**4-4. Run ESLint（コード品質チェック）**

```yaml
- name: Run ESLint
  run: npm run lint
```

- **ESLint**: JavaScript/TypeScript のコード品質チェックツール
- **エラーがあると**: ワークフロー失敗 → PR マージをブロック

**検出される問題例:**

```typescript
// ✗ 未使用の変数
const unused = 1;

// ✗ console.log（本番コードに残すべきでない）
console.log('debug');

// ✗ any 型（型安全性を損なう）
const data: any = {};
```

**4-5. TypeScript type check（型チェック）**

```yaml
- name: TypeScript type check
  run: npx tsc --noEmit
```

- **`tsc --noEmit`**: 型チェックのみ（ファイル出力なし）
- **型エラーがあると**: ワークフロー失敗

**検出される型エラー例:**

```typescript
// ✗ 型が一致しない
const num: number = 'string';

// ✗ プロパティが存在しない
user.unknownProperty;

// ✗ 引数の数が違う
function add(a: number, b: number) {}
add(1); // エラー: 引数が足りない
```

**4-6. Build project（ビルドテスト）**

```yaml
- name: Build project
  run: npm run build
  env:
    AUTH_URL: http://localhost:3000
    AUTH_SECRET: ci-test-secret
    DATABASE_URL: postgresql://test:test@localhost:5432/test
    NEXT_PUBLIC_SUPABASE_URL: https://test.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY: test-key
```

- **`env`**: このステップ専用の環境変数
- **役割**: Next.js のビルドが成功するか確認

**なぜビルドテストが重要？**

```
ビルドエラーの例:
✗ import パスが間違っている
✗ 環境変数が不足している
✗ TypeScript の型エラー（--noEmit で検出漏れ）
✗ 画像ファイルが見つからない

CI でビルドエラーを検出
→ 本番デプロイ前に修正できる ✓
```

**`env` の設定理由:**

```yaml
env:
  AUTH_URL: http://localhost:3000
  # ↑ ビルド時に必要な環境変数
  # （本番の値ではなく、ダミー値でOK）
```

**4-7. Upload build artifacts（ビルド成果物のアップロード）**

```yaml
- name: Upload build artifacts
  if: failure()  # 失敗時のみ実行
  uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: .next/
```

- **`if: failure()`**: 前のステップが失敗した場合のみ実行
- **役割**: デバッグ用にビルド結果を保存

**使い方:**

```
1. ビルドが失敗
   ↓
2. .next/ ディレクトリをアップロード
   ↓
3. GitHub Actions のページからダウンロード
   ↓
4. ローカルで確認してデバッグ
```

**図解: ワークフローの実行フロー**

```
push/PR イベント
  ↓
┌─────────────────────────────────┐
│ 1. Checkout code                │
│    リポジトリをダウンロード      │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│ 2. Setup Node.js                │
│    Node.js 20 をインストール     │
│    npm キャッシュを復元          │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│ 3. npm ci                       │
│    依存関係をインストール        │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│ 4. npm run lint                 │
│    ESLint でコード品質チェック   │
└─────────────────────────────────┘
  ↓ 成功
┌─────────────────────────────────┐
│ 5. npx tsc --noEmit             │
│    TypeScript 型チェック         │
└─────────────────────────────────┘
  ↓ 成功
┌─────────────────────────────────┐
│ 6. npm run build                │
│    Next.js ビルドテスト          │
└─────────────────────────────────┘
  ↓ 成功
┌─────────────────────────────────┐
│ ✓ ワークフロー成功               │
│   PR にグリーンチェック表示      │
└─────────────────────────────────┘

  ↓ 失敗の場合
┌─────────────────────────────────┐
│ 7. Upload build artifacts       │
│    デバッグ用にファイル保存      │
└─────────────────────────────────┘
```

> 💡 **初心者への補足:**
> - **ワークフロー**: 自動化の一連の手順
> - **ジョブ**: 1つの作業単位（lint-and-build 全体）
> - **ステップ**: ジョブ内の1つの操作（Checkout, Setup Node.js等）
> - **`uses`**: 既存のアクションを使う
> - **`run`**: シェルコマンドを実行
> 
> **実行時間の目安:**
> ```
> Checkout:       5秒
> Setup Node.js:  10秒（キャッシュあり）
> npm ci:         15秒（キャッシュあり）
> ESLint:         5秒
> Type check:     10秒
> Build:          30秒
> ────────────────────
> 合計:           約75秒（1分15秒）
> ```
>
> **トラブルシューティング:**
> - **ビルドが失敗する** → ローカルで `npm run build` を実行して確認
> - **ESLint エラー** → `npm run lint -- --fix` で自動修正
> - **型エラー** → `npx tsc --noEmit` で詳細確認

---

## 30.3 単体テストワークフロー

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

## 30.4 結合テストワークフロー

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

## 30.5 E2Eテストワークフロー

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

## 30.6 マトリックステスト

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

## 30.7 自動デプロイ（Vercel）

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

## 30.8 環境変数の管理

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

## 30.9 プルリクエストチェック

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

## 30.10 定期実行（Scheduled Workflow）

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

## 30.11 デプロイ戦略

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

## 30.12 パフォーマンス監視

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

## 30.13 依存関係の自動更新

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

## 30.14 ワークフローの最適化

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

## 30.15 実践：プロジェクトのCI/CD

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

[← 前の章：第29章 E2Eテストの実装](29-E2Eテストの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第31章 API Routesの詳細解説 →](31-API-Routesの詳細解説.md)
