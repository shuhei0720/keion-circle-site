# 付録B：よく使うコマンド

> **この付録では、開発で頻繁に使用するコマンドをまとめています**

## 📚 この付録の目的

- ✅ コマンドをすぐに参照できる
- ✅ オプションの意味を理解できる
- ✅ トラブル時にコマンドで対処できる

---

## 📦 npm/yarn コマンド

### プロジェクトのセットアップ

```bash
# 依存パッケージをインストール
npm install
# または
yarn install

# 特定のパッケージをインストール
npm install パッケージ名
npm install react next

# 開発用パッケージとしてインストール
npm install --save-dev パッケージ名
npm install -D typescript

# グローバルにインストール
npm install -g パッケージ名
npm install -g vercel
```

### 開発サーバー

```bash
# 開発サーバーを起動
npm run dev
# → http://localhost:3000 で起動

# ポートを指定して起動
npm run dev -- -p 3001
# → http://localhost:3001 で起動
```

### ビルドとデプロイ

```bash
# 本番用ビルド（Prisma Clientを生成してからビルド）
npm run build
# 実行内容: prisma generate && next build

# 本番サーバーを起動
npm run start

# ビルドして起動（連続実行）
npm run build && npm run start
```

### パッケージ管理

```bash
# インストール済みパッケージ一覧
npm list
npm list --depth=0  # トップレベルのみ

# パッケージの更新
npm update
npm update パッケージ名

# パッケージの削除
npm uninstall パッケージ名

# 古いパッケージをチェック
npm outdated

# セキュリティ脆弱性をチェック
npm audit
npm audit fix  # 自動修正
```

### キャッシュクリア

```bash
# npm キャッシュをクリア
npm cache clean --force

# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

---

## 🗄️ Prisma コマンド

### セットアップ

```bash
# Prisma を初期化
npx prisma init

# Prisma Client を生成
npx prisma generate
```

### データベース操作

```bash
# スキーマをデータベースに適用（開発環境）
npx prisma db push

# マイグレーションを作成
npx prisma migrate dev --name マイグレーション名
npx prisma migrate dev --name add_user_role

# マイグレーションを適用（本番環境）
npx prisma migrate deploy

# データベースをリセット
npx prisma migrate reset
# ⚠️ 全データが削除されます
```

### Prisma Studio

```bash
# Prisma Studio を起動（GUI でデータベースを操作）
npx prisma studio
# → http://localhost:5555 で起動
```

### 環境変数を指定して実行

```bash
# .env.production を使用
npx dotenv -e .env.production -- npx prisma db push

# DATABASE_URL を直接指定
DATABASE_URL="postgresql://..." npx prisma db push
```

### スキーマの確認

```bash
# スキーマをフォーマット
npx prisma format

# スキーマの検証
npx prisma validate

# 現在の状態を確認
npx prisma migrate status
```

---

## 📂 Git コマンド

### 基本操作

```bash
# Git リポジトリを初期化
git init

# ファイルをステージング
git add .                    # 全ファイル
git add src/app/page.tsx    # 特定のファイル

# コミット
git commit -m "コミットメッセージ"
git commit -m "機能を追加"

# プッシュ
git push origin main
git push origin ブランチ名

# プル（リモートの変更を取得）
git pull origin main
```

### ブランチ操作

```bash
# ブランチ一覧
git branch

# 新しいブランチを作成
git branch feature/new-feature

# ブランチを切り替え
git checkout feature/new-feature

# 作成と切り替えを同時に
git checkout -b feature/new-feature

# ブランチをマージ
git checkout main
git merge feature/new-feature

# ブランチを削除
git branch -d feature/new-feature
```

### 状態確認

```bash
# 変更状態を確認
git status

# コミット履歴を表示
git log
git log --oneline  # 1行表示
git log --graph    # グラフ表示

# 差分を表示
git diff
git diff src/app/page.tsx  # 特定のファイル
```

### 変更の取り消し

```bash
# ステージングを取り消し
git reset HEAD ファイル名
git reset HEAD .  # 全ファイル

# ファイルの変更を取り消し
git checkout -- ファイル名

# 直前のコミットを取り消し
git reset --soft HEAD^  # コミットのみ取り消し
git reset --hard HEAD^  # 変更も取り消し
```

### リモートリポジトリ

```bash
# リモートリポジトリを追加
git remote add origin https://github.com/ユーザー名/リポジトリ名.git

# リモートリポジトリ一覧
git remote -v

# リモートリポジトリから clone
git clone https://github.com/ユーザー名/リポジトリ名.git
```

---

## 🚀 Vercel コマンド

### セットアップ

```bash
# Vercel CLI をインストール
npm install -g vercel

# ログイン
vercel login
```

### デプロイ

```bash
# デプロイ（プレビュー）
vercel

# 本番デプロイ
vercel --prod

# 環境変数を設定してデプロイ
vercel --prod --env DATABASE_URL=...
```

### プロジェクト管理

```bash
# プロジェクト一覧
vercel list

# プロジェクトをリンク
vercel link

# プロジェクトの削除
vercel remove プロジェクト名
```

### 環境変数

```bash
# 環境変数を追加
vercel env add 変数名
vercel env add DATABASE_URL

# 環境変数一覧
vercel env ls

# 環境変数を削除
vercel env rm 変数名
```

### ログの確認

```bash
# デプロイログを表示
vercel logs

# リアルタイムでログを表示
vercel logs --follow
```

---

## 🔧 その他の便利なコマンド

### TypeScript

```bash
# 型チェック
npx tsc --noEmit

# 型定義ファイルを生成
npx tsc --declaration
```

### ESLint

```bash
# コードの静的解析
npm run lint

# 自動修正
npm run lint -- --fix
```

### Next.js

```bash
# Next.js の情報を表示
npx next info

# キャッシュをクリア
rm -rf .next

# ビルドの詳細を表示
npm run build -- --profile
```

### Supabase CLI

```bash
# Supabase CLI をインストール
npm install -g supabase

# プロジェクトをリンク
supabase link --project-ref プロジェクトID

# ローカルで Supabase を起動
supabase start

# マイグレーションを作成
supabase migration new マイグレーション名
```

### Docker

```bash
# イメージをビルド
docker build -t アプリ名 .

# コンテナを起動
docker run -p 3000:3000 アプリ名

# 実行中のコンテナ一覧
docker ps

# コンテナを停止
docker stop コンテナID

# コンテナを削除
docker rm コンテナID

# イメージを削除
docker rmi イメージ名
```

### curl (API テスト)

```bash
# GET リクエスト
curl http://localhost:3000/api/posts

# POST リクエスト（JSON）
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"タイトル","content":"内容"}'

# レスポンスヘッダーを表示
curl -I http://localhost:3000/api/posts

# クッキーを送信
curl http://localhost:3000/api/posts \
  -H "Cookie: session=..."
```

---

## 💡 よく使うコマンドの組み合わせ

### 開発環境のリセット

```bash
# キャッシュとnode_modulesをクリア
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### データベースのリセット

```bash
# データベースをリセットして再構築
npx prisma migrate reset
npx prisma db push
npx prisma generate
node scripts/create-admin.js admin@example.com password123 "管理者"
```

### 本番デプロイの準備

```bash
# 型チェック、ビルド、デプロイ
npx tsc --noEmit
npm run lint
npm run build
git add .
git commit -m "デプロイ準備"
git push origin main
```

### トラブルシューティング

```bash
# ポートが使用中の場合
lsof -i :3000
kill -9 PID番号

# または別のポートで起動
npm run dev -- -p 3001

# 環境変数を確認
echo $DATABASE_URL
printenv | grep DATABASE
```

---

## 📝 エイリアスの設定（オプション）

よく使うコマンドを短縮できます。

### bash/zsh の場合

```bash
# ~/.bashrc または ~/.zshrc に追加

alias dev='npm run dev'
alias build='npm run build'
alias lint='npm run lint'
alias db:push='npx prisma db push'
alias db:studio='npx prisma studio'
alias db:reset='npx prisma migrate reset'
alias git:push='git add . && git commit -m "update" && git push origin main'
```

設定後、ターミナルを再起動するか：

```bash
source ~/.bashrc  # または ~/.zshrc
```

### 使用例

```bash
# 短縮コマンドで実行
dev           # npm run dev
build         # npm run build
db:studio     # npx prisma studio
```

---

## まとめ

この付録では、開発で頻繁に使用するコマンドをまとめました。

### 💡 コマンドを覚えるコツ

1. **頻繁に使うコマンドから覚える**
   - `npm run dev`, `git add .`, `git commit`, `git push`

2. **エイリアスを設定する**
   - 長いコマンドを短縮

3. **ヘルプを活用する**
   - `npm help`, `git help`, `npx prisma --help`

4. **履歴を活用する**
   - `↑キー` で過去のコマンドを呼び出し
   - `Ctrl + R` で履歴を検索

5. **タブ補完を活用する**
   - コマンドやファイル名の途中で `Tab` キー

---

[← 前の章：付録A 用語集](付録A-用語集.md) | [目次に戻る](00-目次.md) | [次の章へ：付録C 参考リソース →](付録C-参考リソース.md)
