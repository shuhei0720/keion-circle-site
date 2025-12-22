-- Postモデルに画像URL配列を追加
-- Supabaseで実行してください

ALTER TABLE "Post" 
ADD COLUMN "images" TEXT[];

-- インデックスを追加（任意）
CREATE INDEX idx_post_images ON "Post" USING GIN ("images");
