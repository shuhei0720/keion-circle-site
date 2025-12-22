#!/bin/bash
# 本番データベースに新しいテーブルを追加

echo "本番データベースを更新します..."
echo "DATABASE_URL: $DATABASE_URL"

# Prisma クライアントを生成
npx prisma generate

# データベースにスキーマを適用（既存データは保持）
npx prisma db push --skip-generate

echo "完了しました！"
