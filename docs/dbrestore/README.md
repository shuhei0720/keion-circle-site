# データベースバックアップ復元手順

## 概要

本プロジェクトでは、GitHub ActionsによりSupabase PostgreSQLデータベースの自動バックアップが毎日実行されています。
このドキュメントでは、暗号化されたバックアップファイルから本番環境または開発環境へデータを復元する手順を説明します。

## バックアップについて

- **実行頻度**: 毎日午前3時（UTC）に自動実行
- **保存場所**: GitHub Artifacts（保持期間30日）
- **暗号化**: AES-256-CBC（PBKDF2鍵導出）で暗号化
- **ファイル形式**: `db_backup_YYYYMMDD_HHMMSS.sql.enc.gz`

## 前提条件

以下のツールがインストールされていることを確認してください：

- PostgreSQL クライアント（psql、バージョン17推奨）
- OpenSSL
- GitHub CLI（gh）
- gzip / gunzip

## 手順1: バックアップファイルのダウンロード

### GitHub Actionsからダウンロード

```bash
# GitHub CLIでログイン（初回のみ）
gh auth login

# 最新のバックアップワークフロー実行を確認
gh run list --workflow=backup-database.yml --limit 5

# 特定の実行からバックアップをダウンロード（RUN_IDは上記で確認）
gh run download <RUN_ID>

# 例: gh run download 20696351905
```

ダウンロードされたファイルは `database-backup-<番号>/db_backup_*.sql.enc.gz` に保存されます。

## 手順2: バックアップファイルの復号化

### 手動で復号化

```bash
# 暗号化キーを環境変数に設定（実際のキーはGitHub Secretsから取得）
export ENCRYPTION_KEY="your-encryption-key-here"

# 解凍と復号化を一度に実行
gunzip -c database-backup-1/db_backup_*.sql.enc.gz | \
  openssl enc -d -aes-256-cbc -pbkdf2 -pass pass:"$ENCRYPTION_KEY" > backup.sql
```

### スクリプトを使用（推奨）

```bash
# スクリプトに実行権限を付与
chmod +x scripts/restore-encrypted-backup.sh

# 復号化のみ実行する場合は、スクリプトを修正して使用
```

## 手順3: データベースへの復元

### 開発環境への復元（SQLite）

SQLiteの場合、Prismaスキーマを再適用してから復元します：

```bash
# 環境変数を設定
export DATABASE_URL="file:./dev.db"

# 既存データベースをクリーンアップ
npx prisma db push --force-reset

# データを復元（PostgreSQL形式のバックアップは直接復元できないため、手動で調整が必要）
# 開発環境ではSupabase Developmentデータベースの使用を推奨
```

### 開発環境への復元（Supabase Development）

```bash
# 開発用データベースURL（.env.localから取得）
export DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

# データベースをクリーンアップ
PGPASSWORD='your-password' psql "$DATABASE_URL" <<'EOF'
TRUNCATE TABLE "Message" CASCADE;
TRUNCATE TABLE "Comment" CASCADE;
TRUNCATE TABLE "ActivityParticipant" CASCADE;
TRUNCATE TABLE "EventParticipant" CASCADE;
TRUNCATE TABLE "PostParticipant" CASCADE;
TRUNCATE TABLE "PostLike" CASCADE;
TRUNCATE TABLE "Post" CASCADE;
TRUNCATE TABLE "ActivitySchedule" CASCADE;
TRUNCATE TABLE "Event" CASCADE;
TRUNCATE TABLE "User" CASCADE;
EOF

# バックアップを復元（正しい順序で）
PGPASSWORD='your-password' psql "$DATABASE_URL" < backup.sql
```

### 本番環境への復元

⚠️ **警告**: 本番環境への復元は慎重に行ってください。既存データは上書きされます。

```bash
# 本番データベースURL（Vercelの環境変数から取得）
export DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

# 1. データベースの現状をバックアップ（念のため）
PGPASSWORD='production-password' pg_dump "$DATABASE_URL" > current_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. データベースをクリーンアップ
PGPASSWORD='production-password' psql "$DATABASE_URL" <<'EOF'
TRUNCATE TABLE "Message" CASCADE;
TRUNCATE TABLE "Comment" CASCADE;
TRUNCATE TABLE "ActivityParticipant" CASCADE;
TRUNCATE TABLE "EventParticipant" CASCADE;
TRUNCATE TABLE "PostParticipant" CASCADE;
TRUNCATE TABLE "PostLike" CASCADE;
TRUNCATE TABLE "Post" CASCADE;
TRUNCATE TABLE "ActivitySchedule" CASCADE;
TRUNCATE TABLE "Event" CASCADE;
TRUNCATE TABLE "User" CASCADE;
EOF

# 3. バックアップを復元
PGPASSWORD='production-password' psql "$DATABASE_URL" < backup.sql

# 4. 復元結果を確認
PGPASSWORD='production-password' psql "$DATABASE_URL" -c "SELECT 'User', COUNT(*) FROM \"User\" UNION ALL SELECT 'Post', COUNT(*) FROM \"Post\";"
```

## 手順4: データ整合性の確認

復元後、以下を確認してください：

```bash
# レコード数の確認
psql "$DATABASE_URL" <<'EOF'
SELECT 'User' as table_name, COUNT(*) as count FROM "User"
UNION ALL SELECT 'Event', COUNT(*) FROM "Event"
UNION ALL SELECT 'ActivitySchedule', COUNT(*) FROM "ActivitySchedule"
UNION ALL SELECT 'Post', COUNT(*) FROM "Post"
UNION ALL SELECT 'PostLike', COUNT(*) FROM "PostLike"
ORDER BY table_name;
EOF

# サンプルデータの確認
psql "$DATABASE_URL" -c 'SELECT id, name, role FROM "User" LIMIT 5;'
psql "$DATABASE_URL" -c 'SELECT id, title, date FROM "Event" LIMIT 5;'
```

## トラブルシューティング

### 外部キー制約エラーが発生する場合

復元時に外部キー制約エラーが発生する場合は、以下の順序でデータを復元してください：

1. `User`（依存なし）
2. `Event`（Userに依存）
3. `ActivitySchedule`（Userに依存）
4. `Post`（Userに依存）
5. `PostLike`、`PostParticipant`（UserとPostに依存）
6. `EventParticipant`（UserとEventに依存）
7. `ActivityParticipant`（UserとActivityScheduleに依存）
8. `Comment`（UserとPostに依存）
9. `Message`（Userに依存）

手動で順序を指定する例：

```bash
# 復号化したSQLファイルからテーブルごとに抽出して実行
awk '/^COPY public\."User"/,/^\\.$/{print}' backup.sql | psql "$DATABASE_URL"
awk '/^COPY public\."Event"/,/^\\.$/{print}' backup.sql | psql "$DATABASE_URL"
awk '/^COPY public\."ActivitySchedule"/,/^\\.$/{print}' backup.sql | psql "$DATABASE_URL"
# ... 他のテーブルも同様
```

### PostgreSQLバージョン警告

pg_dumpのバージョンとサーバーバージョンが異なる場合の警告は、通常問題ありません。
ただし、大きなバージョン差がある場合は、適切なバージョンのクライアントを使用してください。

### スキーマ不一致エラー

バックアップに含まれるスキーマとPrismaスキーマが一致しない場合、復元に失敗することがあります。
`prisma/schema.prisma` が本番データベースと同期していることを確認してください。

## セキュリティに関する注意事項

- **暗号化キー**: `BACKUP_ENCRYPTION_KEY` は厳重に管理してください。GitHub Secretsに保存されています。
- **アクセス制限**: バックアップファイルには個人情報が含まれます。アクセス権限を適切に管理してください。
- **本番データベース**: 本番環境のデータベース認証情報は、Vercelの環境変数として安全に保存されています。

## 定期的なバックアップテスト

定期的にバックアップの復元テストを実施することを推奨します：

- 月次: 開発環境への復元テスト
- 四半期: 本番環境の復元手順の確認（実際には復元せず、手順のみ確認）

## 参考リンク

- [GitHub Actions バックアップワークフロー](../../.github/workflows/backup-database.yml)
- [バックアップクリーンアップワークフロー](../../.github/workflows/cleanup-old-backups.yml)
- [復元スクリプト](../../scripts/restore-encrypted-backup.sh)
- [Supabase ダッシュボード](https://supabase.com/dashboard)
