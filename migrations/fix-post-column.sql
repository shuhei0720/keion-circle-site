-- PostテーブルのauthorIdカラムをuserIdにリネーム
ALTER TABLE "Post" RENAME COLUMN "authorId" TO "userId";
