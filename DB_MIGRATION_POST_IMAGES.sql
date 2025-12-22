-- Postモデルに画像URL配列を追加
-- Supabaseで実行してください

-- imagesカラムを追加（デフォルト値を空配列に設定）
ALTER TABLE "Post" 
ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT '{}';

-- インデックスを追加（任意、検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_post_images ON "Post" USING GIN ("images");
