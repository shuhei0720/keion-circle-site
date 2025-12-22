# Supabase Storage セットアップガイド

このアプリケーションはアバター画像の保存にSupabase Storageを使用します。

## 1. Supabaseプロジェクトの設定

### ストレージバケットの作成

1. [Supabase Dashboard](https://app.supabase.com)にアクセス
2. プロジェクトを選択
3. 左サイドバーから「Storage」を選択
4. 「New bucket」をクリック
5. バケット名: `avatars`
6. **Public bucket**にチェックを入れる（重要！）
7. 「Create bucket」をクリック

### ポリシーの設定（重要！）

Public bucketを作成しても、書き込みにはポリシーが必要です。以下の手順で設定してください。

**簡単な方法（推奨）:**

1. `avatars`バケットを選択
2. 「Policies」タブを開く
3. 「New policy」をクリック
4. 「For full customization」を選択
5. 以下のポリシーを**1つずつ**作成:

**すべての操作を許可（開発用・最も簡単）:**
```sql
CREATE POLICY "Allow all operations"
ON storage.objects FOR ALL
USING (bucket_id = 'avatars');
```

このポリシー1つで、すべてのユーザー（認証済み・未認証）がアップロード・更新・削除・読み取りを行えます。

---

**より安全な方法（本番推奨）:**

個別のポリシーを作成する場合は以下を使用:

**アップロードを許可:**
```sql
CREATE POLICY "Anyone can upload avatars"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');
```

**更新を許可:**
```sql
CREATE POLICY "Anyone can update avatars"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars');
```

**削除を許可:**
```sql
CREATE POLICY "Anyone can delete avatars"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'avatars');
```

**読み取りを許可:**
```sql
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

⚠️ **注意**: `TO public` は認証の有無に関わらずすべてのユーザーを意味します。
より厳密な制御が必要な場合は、RLS（Row Level Security）で条件を追加してください。

## 2. 環境変数の設定

### ローカル開発環境

`.env.local`ファイルに以下を追加:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel本番環境

Vercel Dashboardで以下の環境変数を追加:

1. [Vercel Dashboard](https://vercel.com)にアクセス
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」
4. 以下を**1つずつ**追加:

**変数1: NEXT_PUBLIC_SUPABASE_URL**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://your-project.supabase.co` (実際のSupabase URLを入力)
- Environment: Production, Preview, Development すべてにチェック
- 「Save」をクリック

**変数2: NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `your-anon-key` (実際のAnon Keyを入力)
- Environment: Production, Preview, Development すべてにチェック
- 「Save」をクリック

5. 「Deployments」タブに移動
6. 最新のデプロイメントの「...」メニューから「Redeploy」をクリック

⚠️ **重要**: 環境変数を追加・変更した後は必ず再デプロイが必要です！

## 3. Supabase認証情報の取得

1. [Supabase Dashboard](https://app.supabase.com)にアクセス
2. プロジェクトを選択
3. 左サイドバーの歯車アイコン「Project Settings」をクリック
4. 左メニューから「API」を選択
5. **Configuration**セクションで以下をコピー:
   - **URL**（Project URLの下に表示）: `NEXT_PUBLIC_SUPABASE_URL`に使用
   - 例: `https://abcdefghijklmnop.supabase.co`
6. **Project API keys**セクションで以下をコピー:
   - **anon public**キー: `NEXT_PUBLIC_SUPABASE_ANON_KEY`に使用
   - 「Reveal」ボタンをクリックして表示されるキーをコピー

## 4. デプロイ

環境変数を設定後、Vercelで再デプロイしてください:

```bash
git add .
git commit -m "feat: Supabase Storageを使用したアバターアップロードを実装"
git push
```

または、Vercel Dashboardから手動で再デプロイできます。

## 注意事項

- `NEXT_PUBLIC_`プレフィックスは必須です（クライアントサイドで使用するため）
- Supabaseの無料プランでは1GBのストレージが利用可能です
- アップロードされたファイルは自動的にCDN経由で配信されます
- 画像は最大5MBまでアップロード可能です

## トラブルシューティング

### "Supabase URL and Anon Key must be provided"エラー
→ 環境変数が正しく設定されているか確認してください

### 403 Forbiddenエラー
→ ストレージポリシーが正しく設定されているか確認してください

### バケットが見つからないエラー
→ `avatars`という名前のバケットが作成されているか確認してください
