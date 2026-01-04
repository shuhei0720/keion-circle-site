#!/bin/bash

# 暗号化されたバックアップを復号化して復元するスクリプト
# 使用方法: ./scripts/restore-encrypted-backup.sh <暗号化バックアップファイル> <暗号化キー>

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "使用方法: ./scripts/restore-encrypted-backup.sh <暗号化バックアップファイル> <暗号化キー>"
    echo ""
    echo "例:"
    echo "  ./scripts/restore-encrypted-backup.sh db_backup_20260105_120000.sql.enc.gz 'your-secret-key'"
    exit 1
fi

ENCRYPTED_FILE=$1
ENCRYPTION_KEY=$2

if [ ! -f "$ENCRYPTED_FILE" ]; then
    echo "❌ ファイルが見つかりません: $ENCRYPTED_FILE"
    exit 1
fi

# 環境変数を読み込み
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL が設定されていません"
    exit 1
fi

echo "🔓 バックアップを復号化中..."

# 解凍
DECRYPTED_FILE="${ENCRYPTED_FILE%.gz}"
gunzip -c "$ENCRYPTED_FILE" > "$DECRYPTED_FILE"

# 復号化
SQL_FILE="${DECRYPTED_FILE%.enc}"
openssl enc -aes-256-cbc -d -pbkdf2 -in "$DECRYPTED_FILE" -out "$SQL_FILE" -k "$ENCRYPTION_KEY"

if [ $? -ne 0 ]; then
    echo "❌ 復号化に失敗しました。暗号化キーが正しいか確認してください。"
    rm -f "$DECRYPTED_FILE" "$SQL_FILE"
    exit 1
fi

rm "$DECRYPTED_FILE"
echo "✅ 復号化完了: $SQL_FILE"

# 復元の確認
echo ""
echo "⚠️  警告: データベースを復元します"
echo "📁 バックアップファイル: $SQL_FILE"
echo "🗄️  対象データベース: $DATABASE_URL"
echo ""
read -p "続行しますか？ (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "キャンセルしました"
    rm "$SQL_FILE"
    exit 0
fi

# pgbouncerパラメータを削除
RESTORE_URL=$(echo $DATABASE_URL | sed 's/?pgbouncer=true&connection_limit=1//')
RESTORE_URL=$(echo $RESTORE_URL | sed 's/?pgbouncer=true//')

echo "🔄 データベースを復元中..."

# バックアップから復元
psql "$RESTORE_URL" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo "✅ 復元完了！"
    echo ""
    echo "Prisma Clientを再生成してください:"
    echo "  npm run db:generate"
    rm "$SQL_FILE"
else
    echo "❌ 復元に失敗しました"
    exit 1
fi
