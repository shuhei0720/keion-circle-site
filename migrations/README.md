# 新しいSupabaseプロジェクトへの移行手順

## 1. 新しいSupabaseプロジェクトを作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. "New Project" をクリック
3. プロジェクト名を入力（例: keion-circle-site-tokyo）
4. データベースパスワードを設定
5. **リージョン**: 以下のいずれかを選択
   - **Northeast Asia (Tokyo)** - 推奨（日本）
   - **Southeast Asia (Singapore)** - 次点
6. "Create new project" をクリック

## 2. 既存データのエクスポート（必要な場合のみ）

現在のSupabaseプロジェクトにユーザーデータや投稿データがある場合：

1. 古いSupabaseダッシュボード → SQL Editor
2. 以下のSQLを実行してデータをエクスポート：

```sql
-- ユーザーデータ
SELECT * FROM "User";

-- 投稿データ
SELECT * FROM "Post";

-- スケジュールデータ
SELECT * FROM "Schedule";

-- メッセージデータ
SELECT * FROM "Message";
```

3. 結果をCSVでダウンロード

## 3. 新DBにスキーマを適用

1. 新しいSupabaseプロジェクト → SQL Editor
2. `migrations/init-new-db.sql` の内容をコピー＆ペースト
3. "Run" をクリック
4. すべてのテーブルが作成されたことを確認

## 4. 新DBの接続情報を取得

1. Settings → Database
2. **Connection string** セクションで "Transaction" モードを選択
3. "URI" をコピー（形式: `postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`）
4. URLの末尾に以下を追加:
   ```
   ?pgbouncer=true&connection_limit=1&statement_cache_size=0
   ```

## 5. Vercelの環境変数を更新

1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
2. `DATABASE_URL` を編集
3. 新しいSupabaseのURLに置き換え
4. Save

## 6. Prismaスキーマを同期（ローカル）

```bash
export DATABASE_URL="<新しいSupabase URL>"
cd /home/shuhei/keion-circle-site
npx prisma db pull
npx prisma generate
```

## 7. 既存データのインポート（必要な場合）

### 管理者ユーザーの再作成:
```bash
export DATABASE_URL="<新しいSupabase URL>"
node scripts/create-admin.js admin@example.com admin123 "管理者"
```

### その他のデータ:
- 新Supabase → SQL Editor → Table Editor でCSVをインポート
- または INSERT文を実行

## 8. デプロイ

```bash
git add migrations/
git commit -m "docs: 新Supabase移行手順を追加"
git push
```

Vercelが自動的に再デプロイします。

## 9. 動作確認

1. 本番サイトにアクセス
2. ログインできるか確認
3. 投稿、スケジュール、チャットが動作するか確認

## トラブルシューティング

### 接続エラーが出る場合:
- DATABASE_URLのパラメータ（`?pgbouncer=true&connection_limit=1&statement_cache_size=0`）が含まれているか確認
- Supabaseのパスワードが正しいか確認

### 古いCookieが残っている場合:
- ブラウザでF12 → Application → Cookies → すべて削除

### パフォーマンスが改善しない場合:
- 新プロジェクトのリージョンがTokyo/Singaporeになっているか確認
- Vercelのリージョンと合わせる（Settings → General → Region）
