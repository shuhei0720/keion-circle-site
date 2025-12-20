# Vercel環境変数設定手順

## 1. Vercelダッシュボードにアクセス

https://vercel.com/shuheis-projects-9dfe3053/keion-circle-site/settings/environment-variables

## 2. 以下の環境変数を追加

### Google OAuth認証情報

**変数名:** `GOOGLE_CLIENT_ID`
**値:** Google Cloud Consoleで取得したクライアントID
**環境:** Production, Preview, Development すべてにチェック

**変数名:** `GOOGLE_CLIENT_SECRET`
**値:** Google Cloud Consoleで取得したクライアントシークレット
**環境:** Production, Preview, Development すべてにチェック

## 3. 既存の環境変数を確認

以下の環境変数がすでに設定されているはずです:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `DATABASE_URL`

## 4. 保存後、プロジェクトを再デプロイ

環境変数を追加/変更した後は必ず再デプロイが必要です。

### 再デプロイ方法:
1. Vercelダッシュボードの「Deployments」タブに移動
2. 最新のデプロイメントの右側にある「...」メニューをクリック
3. 「Redeploy」を選択

または、新しいコミットをpushすれば自動的に再デプロイされます。

## Google Cloud Consoleの設定確認

https://console.cloud.google.com/apis/credentials

### 承認済みのリダイレクトURIに以下が含まれていることを確認:

1. ローカル環境用:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

2. 本番環境用:
   ```
   https://keion-circle-site-gfp5c34p1-shuheis-projects-9dfe3053.vercel.app/api/auth/callback/google
   ```

もしVercelのカスタムドメインを使用している場合は、そのドメインのURLも追加してください:
   ```
   https://your-custom-domain.com/api/auth/callback/google
   ```

## トラブルシューティング

### エラー: redirect_uri_mismatch
- Google Cloud Consoleで正しいリダイレクトURIが設定されているか確認
- URIの末尾にスラッシュがないことを確認
- プロトコル(https://)が正しいことを確認

### Googleログインボタンをクリックしても反応しない
- Vercelで環境変数が正しく設定されているか確認
- 再デプロイが完了しているか確認
- ブラウザのキャッシュをクリア

### エラー: Missing required parameter: client_id
- Vercelの環境変数 `GOOGLE_CLIENT_ID` が設定されているか確認
- 環境変数の値にスペースや改行が含まれていないか確認
- 再デプロイを実行
