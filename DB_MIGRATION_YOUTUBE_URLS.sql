-- PostモデルのyoutubeUrlをyoutubeUrls配列に変更
-- 既存のyoutubeUrlデータを配列に変換

-- 新しい列を追加
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "youtubeUrls" TEXT[] DEFAULT '{}';

-- 既存のyoutubeUrlデータをyoutubeUrls配列に移行
UPDATE "Post" 
SET "youtubeUrls" = ARRAY["youtubeUrl"]::TEXT[]
WHERE "youtubeUrl" IS NOT NULL AND "youtubeUrl" != '';

-- 古い列を削除
ALTER TABLE "Post" DROP COLUMN IF EXISTS "youtubeUrl";

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_post_youtube_urls ON "Post" USING GIN ("youtubeUrls");
