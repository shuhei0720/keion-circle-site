-- ActivityScheduleテーブルにlocationとlocationUrlカラムを追加
-- Supabase SQL Editorで実行してください

-- 1. locationカラムを追加（場所名）
ALTER TABLE "ActivitySchedule" 
ADD COLUMN IF NOT EXISTS "location" TEXT;

-- 2. locationUrlカラムを追加（場所のURL）
ALTER TABLE "ActivitySchedule" 
ADD COLUMN IF NOT EXISTS "locationUrl" TEXT;

-- 確認クエリ（実行後に確認）
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'ActivitySchedule';
