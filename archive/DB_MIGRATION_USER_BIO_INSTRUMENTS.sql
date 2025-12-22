-- Userテーブルにbioとinstrumentsカラムを追加
-- Supabase SQL Editorで実行してください

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "bio" TEXT;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "instruments" TEXT;

-- 確認クエリ
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User' 
  AND column_name IN ('bio', 'instruments');
