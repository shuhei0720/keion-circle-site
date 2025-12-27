#!/bin/bash

# 本番環境から開発環境へのデータ移行スクリプト

echo "🔧 本番環境から開発環境へのデータ移行"
echo "=========================================="
echo ""

# .env.localから開発環境のDATABASE_URLを読み込み
if [ -f .env.local ]; then
  export $(cat .env.local | grep DATABASE_URL | xargs)
  DEV_DATABASE_URL=$DATABASE_URL
  echo "✓ 開発環境のDATABASE_URLを読み込みました"
else
  echo "❌ .env.localが見つかりません"
  exit 1
fi

# 本番環境のDATABASE_URLを入力
echo ""
echo "本番環境のDATABASE_URLを入力してください:"
echo "(Vercelの環境変数から取得できます)"
echo ""
read -p "PROD_DATABASE_URL: " PROD_DATABASE_URL

if [ -z "$PROD_DATABASE_URL" ]; then
  echo "❌ PROD_DATABASE_URLが入力されていません"
  exit 1
fi

# 確認
echo ""
echo "⚠️  警告: 開発環境の既存データはすべて削除されます"
echo ""
read -p "続行しますか？ (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ キャンセルしました"
  exit 0
fi

# 移行実行
echo ""
export PROD_DATABASE_URL=$PROD_DATABASE_URL
export DEV_DATABASE_URL=$DEV_DATABASE_URL
node scripts/migrate-prod-to-dev.cjs
