# Google OAuth 設定手順

## 1. Google Cloud Console にアクセス
https://console.cloud.google.com/

## 2. プロジェクトの作成（または既存のプロジェクトを選択）
- 左上のプロジェクトセレクターをクリック
- 「新しいプロジェクト」をクリック
- プロジェクト名: 「keion-circle-site」または任意の名前
- 「作成」をクリック

## 3. OAuth同意画面の設定
- 左メニュー → 「APIとサービス」→「OAuth同意画面」
- User Type: **外部** を選択して「作成」
- アプリ情報:
  - アプリ名: `軽音サークル`
  - ユーザーサポートメール: あなたのメールアドレス
  - デベロッパーの連絡先情報: あなたのメールアドレス
- 「保存して次へ」
- スコープ: そのまま「保存して次へ」
- テストユーザー: 「保存して次へ」
- 完了

## 4. OAuth 2.0 クライアントIDの作成
- 左メニュー → 「APIとサービス」→「認証情報」
- 上部の「+ 認証情報を作成」→「OAuth 2.0 クライアント ID」
- アプリケーションの種類: **ウェブ アプリケーション**
- 名前: `軽音サークル Web`
- 承認済みのリダイレクト URI:
  - 「+ URI を追加」をクリック
  - 追加する URI:
    ```
    http://localhost:3000/api/auth/callback/google
    https://keion-circle-site-gfp5c34p1-shuheis-projects-9dfe3053.vercel.app/api/auth/callback/google
    ```
- 「作成」をクリック

## 5. クライアントIDとシークレットをコピー
- 作成完了後、ポップアップが表示されます
- **クライアントID** と **クライアント シークレット** をコピー
- これらを `.env.local` ファイルに貼り付けます

## 6. 環境変数の設定

### ローカル環境 (.env.local)
```bash
GOOGLE_CLIENT_ID=取得したクライアントID
GOOGLE_CLIENT_SECRET=取得したクライアントシークレット
```

### Vercel環境
1. https://vercel.com にログイン
2. プロジェクト「keion-circle-site」を選択
3. Settings → Environment Variables
4. 以下の2つの環境変数を追加:
   - Name: `GOOGLE_CLIENT_ID`, Value: 取得したクライアントID
   - Name: `GOOGLE_CLIENT_SECRET`, Value: 取得したクライアントシークレット
5. 「Save」をクリック
6. プロジェクトを再デプロイ

## 7. 開発サーバーの再起動
環境変数を更新したら、開発サーバーを再起動してください:
```bash
npm run dev
```

## トラブルシューティング

### エラー: Missing required parameter: client_id
- `.env.local` ファイルが正しく設定されているか確認
- 開発サーバーを再起動
- ブラウザのキャッシュをクリア

### エラー: redirect_uri_mismatch
- Google Cloud Consoleで設定したリダイレクトURIが正しいか確認
- `http://localhost:3000/api/auth/callback/google` が設定されているか確認
