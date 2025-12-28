# 第 10 章：データベースと Prisma の基礎

> **この章では、Prisma を使ったデータベース操作を実際に体験しながら学びます**

## 📚 この章で学ぶこと

- ✅ ORM と Prisma の基本概念
- ✅ Prisma スキーマの読み方と構造
- ✅ 基本的な CRUD 操作（作成・読み取り・更新・削除）
- ✅ Prisma Studio でのデータ確認
- ✅ リレーションデータの取得方法
- ✅ 実践的なクエリの書き方

---

## 10.1 ORM と Prisma とは

### ORM の概念

**ORM（Object-Relational Mapping）** は、データベース（SQL）とプログラミング言語（TypeScript）を橋渡しするツールです。

**ORM なし（生の SQL）:**

```typescript
// ❌ SQLを直接書く必要がある
const result = await db.query(
  "SELECT * FROM users WHERE email = ? AND role = ?",
  ["user@example.com", "admin"]
);
const user = result.rows[0];

// ❌ 型安全性がない
console.log(user.namee); // タイポがあってもエラーにならない
```

**ORM あり（Prisma）:**

```typescript
// ✅ TypeScriptで直感的に書ける
const user = await prisma.user.findUnique({
  where: {
    email: "user@example.com",
  },
});

// ✅ 型安全！タイポはエラーになる
console.log(user.namee); // ← TypeScriptエラー！
console.log(user.name); // ✅ OK
```

### Prisma の特徴

| 特徴                    | 説明                      | メリット               |
| ----------------------- | ------------------------- | ---------------------- |
| 🔒 **型安全**           | TypeScript の型が自動生成 | タイポやバグを防げる   |
| 📝 **直感的な API**     | SQL を書かずにデータ操作  | 学習コストが低い       |
| 🔄 **マイグレーション** | スキーマ変更を管理        | データベース更新が簡単 |
| 🔗 **リレーション**     | 関連データ取得が簡単      | 複雑な JOIN も簡単に   |
| 📊 **Prisma Studio**    | GUI でデータ確認          | 開発効率アップ         |

---

## 10.2 Prisma スキーマの理解

### スキーマファイルを開いてみよう

**Step 1:** VSCode で `prisma/schema.prisma` を開いてください

**Step 2:** ファイルの構造を確認しましょう

```prisma
// ========================================
// 1. Prisma Clientの設定
// ========================================
generator client {
  provider = "prisma-client-js"
}

// ========================================
// 2. データソース設定
// ========================================
datasource db {
  provider = "postgresql"          // PostgreSQL (Supabase)
  url      = env("DATABASE_URL")   // 環境変数から接続先を取得
}

// ========================================
// 3. Enumの定義（選択肢）
// ========================================
enum UserRole {
  admin   // 管理者
  member  // 一般メンバー
}

enum VoteStatus {
  available    // 参加可能
  maybe        // 未定
  unavailable  // 参加不可
}

// ========================================
// 4. モデル（テーブル）の定義
// ========================================
model User {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String?
  password      String?
  role          UserRole    @default(member)
  image         String?
  bio           String?
  instrument    String?

  // リレーション（他のテーブルとの関係）
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  // ... 他のリレーション

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

### スキーマの各要素の意味

#### フィールドの型

| Prisma 型  | TypeScript 型    | 説明             | 例                   |
| ---------- | ---------------- | ---------------- | -------------------- |
| `String`   | `string`         | 文字列           | "太郎"               |
| `Int`      | `number`         | 整数             | 123                  |
| `Boolean`  | `boolean`        | 真偽値           | true/false           |
| `DateTime` | `Date`           | 日時             | 2025-12-23T10:00:00Z |
| `String?`  | `string \| null` | 省略可能な文字列 | "太郎" または null   |

#### フィールド属性

```prisma
model User {
  id        String   @id @default(cuid())
  //        ^^^^^^   ^^^  ^^^^^^^^^^^^^^^^
  //        型       主キー  デフォルト値

  email     String   @unique
  //        ^^^^^^   ^^^^^^^
  //        型       ユニーク制約（重複不可）

  name      String?
  //        ^^^^^^
  //        ? = 省略可能（null許可）

  createdAt DateTime @default(now())
  //        ^^^^^^^^  ^^^^^^^^^^^^^^^
  //        型       作成時に現在時刻を自動設定

  updatedAt DateTime @updatedAt
  //        ^^^^^^^^  ^^^^^^^^^^
  //        型       更新時に自動更新
}
```

#### リレーション（関連）

```prisma
model User {
  id     String @id @default(cuid())
  name   String

  // 1対多: 1人のユーザーは複数の投稿を持つ
  posts  Post[]
  //     ^^^^
  //     配列 [] = 複数の投稿
}

model Post {
  id       String @id @default(cuid())
  title    String

  // 多対1: 1つの投稿は1人のユーザーに属する
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
  //       ^^^^^^
  //       外部キー（Userのidを参照）
}
```

---

## 10.3 Prisma Client の基本

### データベース接続の設定

**Step 1:** `src/lib/db.ts` を開いてください

```typescript
import { PrismaClient } from "@prisma/client";

// グローバル変数の型定義
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prisma Clientのインスタンスを作成
export const prisma =
  globalForPrisma.prisma || // すでにインスタンスがあればそれを使う
  new PrismaClient({
    log: ["query", "error", "warn"], // SQLクエリをログ出力
  });

// 開発環境では、ホットリロード時に新しいインスタンスが
// 作られないようにグローバルに保存
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**このコードの意味：**

1. **シングルトンパターン**: データベース接続を 1 つだけ作成
2. **ホットリロード対応**: Next.js の開発サーバーでファイル変更時に接続が増え続けるのを防ぐ
3. **ログ出力**: 実行される SQL クエリを確認できる

### Prisma Client の使い方

**基本的な使い方：**

```typescript
import { prisma } from "@/lib/db";

// ユーザーを全件取得
const users = await prisma.user.findMany();

// ユーザーを1件取得
const user = await prisma.user.findUnique({
  where: { id: "user-id" },
});

// ユーザーを作成
const newUser = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "ユーザー名",
    password: "hashed-password",
  },
});
```

---

## 10.4 基本的な CRUD 操作

実際にコードを書いて、データベース操作を体験しましょう！

### 📝 演習準備

まず、練習用のスクリプトファイルを作成します。

**Step 1:** `scripts/` ディレクトリに `test-prisma.js` を作成

```bash
# ターミナルで実行
touch scripts/test-prisma.js
```

**Step 2:** VSCode で `scripts/test-prisma.js` を開いて、以下のコードを入力

```javascript
// scripts/test-prisma.js
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient({
  log: ["query"], // SQLクエリを表示
});

async function main() {
  console.log("🔄 Prismaのテストを開始します...\n");

  // ここに練習コードを書きます

  console.log("\n✅ テスト完了！");
}

main()
  .catch((e) => {
    console.error("❌ エラーが発生しました:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 3:** `package.json` の `type` を確認

```json
{
  "type": "module",  // ← これがあればOK（ES Modulesを使用）
  ...
}
```

### Create（作成）

#### 1 件作成: `create()`

```javascript
// scripts/test-prisma.js の main() 関数内に追加

// ========================================
// 1. ユーザーを1件作成
// ========================================
console.log("📝 ユーザーを作成します...");

const newUser = await prisma.user.create({
  data: {
    email: "test@example.com",
    name: "テストユーザー",
    password: "hashed-password-123",
    role: "member",
    instrument: "ギター",
  },
});

console.log("✅ ユーザーが作成されました:");
console.log({
  id: newUser.id,
  name: newUser.name,
  email: newUser.email,
  createdAt: newUser.createdAt,
});
```

**実行してみよう：**

```bash
# ターミナルで実行
node scripts/test-prisma.js
```

**期待される出力：**

```
🔄 Prismaのテストを開始します...

prisma:query SELECT ...
📝 ユーザーを作成します...
prisma:query INSERT INTO "User" ...
✅ ユーザーが作成されました:
{
  id: 'cm4a1b2c3d4e5f6g7h8i9j0k',
  name: 'テストユーザー',
  email: 'test@example.com',
  createdAt: 2025-12-23T10:30:00.000Z
}

✅ テスト完了！
```

#### 複数件作成: `createMany()`

```javascript
// ========================================
// 2. ユーザーを複数件作成
// ========================================
console.log("\n📝 複数のユーザーを作成します...");

const result = await prisma.user.createMany({
  data: [
    {
      email: "user1@example.com",
      name: "ユーザー1",
      password: "pass1",
      instrument: "ドラム",
    },
    {
      email: "user2@example.com",
      name: "ユーザー2",
      password: "pass2",
      instrument: "ベース",
    },
    {
      email: "user3@example.com",
      name: "ユーザー3",
      password: "pass3",
      instrument: "キーボード",
    },
  ],
});

console.log(`✅ ${result.count}件のユーザーが作成されました`);
```

**実行結果：**

```
📝 複数のユーザーを作成します...
prisma:query INSERT INTO "User" ...
✅ 3件のユーザーが作成されました
```

### Read（読み取り）

#### 全件取得: `findMany()`

```javascript
// ========================================
// 3. ユーザーを全件取得
// ========================================
console.log("\n🔍 全ユーザーを取得します...");

const allUsers = await prisma.user.findMany();

console.log(`✅ ${allUsers.length}件のユーザーが見つかりました:`);
allUsers.forEach((user, index) => {
  console.log(`  ${index + 1}. ${user.name} (${user.email})`);
});
```

**実行結果：**

```
🔍 全ユーザーを取得します...
prisma:query SELECT * FROM "User"
✅ 4件のユーザーが見つかりました:
  1. テストユーザー (test@example.com)
  2. ユーザー1 (user1@example.com)
  3. ユーザー2 (user2@example.com)
  4. ユーザー3 (user3@example.com)
```

#### 条件付き取得: `where`

```javascript
// ========================================
// 4. 条件付きでユーザーを取得
// ========================================
console.log("\n🔍 ギタリストを検索します...");

const guitarists = await prisma.user.findMany({
  where: {
    instrument: "ギター",
  },
});

console.log(`✅ ${guitarists.length}人のギタリストが見つかりました:`);
guitarists.forEach((user) => {
  console.log(`  - ${user.name}`);
});
```

#### 1 件取得: `findUnique()` と `findFirst()`

```javascript
// ========================================
// 5. IDで1件取得（ユニークキー）
// ========================================
console.log("\n🔍 特定のユーザーを取得します...");

// まず、最初のユーザーのIDを取得
const firstUser = await prisma.user.findFirst();
const userId = firstUser.id;

// そのIDでユーザーを取得
const user = await prisma.user.findUnique({
  where: { id: userId },
});

console.log("✅ ユーザーが見つかりました:");
console.log(`  名前: ${user.name}`);
console.log(`  メール: ${user.email}`);
console.log(`  楽器: ${user.instrument || "なし"}`);
```

#### ソート: `orderBy`

```javascript
// ========================================
// 6. ソートして取得
// ========================================
console.log("\n🔍 名前順でユーザーを取得します...");

const sortedUsers = await prisma.user.findMany({
  orderBy: {
    name: "asc", // 昇順（asc: A→Z, desc: Z→A）
  },
});

console.log("✅ ユーザー（名前順）:");
sortedUsers.forEach((user, index) => {
  console.log(`  ${index + 1}. ${user.name}`);
});
```

#### ページネーション: `skip` と `take`

```javascript
// ========================================
// 7. ページネーション
// ========================================
console.log("\n🔍 最初の2件のみ取得します...");

const paginatedUsers = await prisma.user.findMany({
  take: 2, // 2件取得
  skip: 0, // 0件スキップ（最初のページ）
  orderBy: {
    createdAt: "desc", // 新しい順
  },
});

console.log("✅ ユーザー（ページ1）:");
paginatedUsers.forEach((user, index) => {
  console.log(`  ${index + 1}. ${user.name}`);
});

// 次のページ
const page2Users = await prisma.user.findMany({
  take: 2, // 2件取得
  skip: 2, // 2件スキップ（2ページ目）
  orderBy: {
    createdAt: "desc",
  },
});

console.log("\n✅ ユーザー（ページ2）:");
page2Users.forEach((user, index) => {
  console.log(`  ${index + 1}. ${user.name}`);
});
```

#### 特定のフィールドのみ取得: `select`

```javascript
// ========================================
// 8. 必要なフィールドのみ取得
// ========================================
console.log("\n🔍 名前とメールのみ取得します...");

const usersNameEmail = await prisma.user.findMany({
  select: {
    name: true,
    email: true,
    // id, password, role等は取得しない
  },
});

console.log("✅ ユーザー（名前とメール）:");
usersNameEmail.forEach((user) => {
  console.log(`  ${user.name}: ${user.email}`);
});
```

### Update（更新）

#### 1 件更新: `update()`

```javascript
// ========================================
// 9. ユーザーを更新
// ========================================
console.log("\n✏️ ユーザーを更新します...");

const updatedUser = await prisma.user.update({
  where: {
    email: "test@example.com", // 条件
  },
  data: {
    name: "テストユーザー（更新済み）", // 新しい値
    instrument: "ギター・ボーカル",
  },
});

console.log("✅ ユーザーが更新されました:");
console.log(`  名前: ${updatedUser.name}`);
console.log(`  楽器: ${updatedUser.instrument}`);
```

#### 複数件更新: `updateMany()`

```javascript
// ========================================
// 10. 複数のユーザーを一括更新
// ========================================
console.log("\n✏️ 複数のユーザーを更新します...");

const updateResult = await prisma.user.updateMany({
  where: {
    instrument: null, // 楽器が設定されていないユーザー
  },
  data: {
    instrument: "未定", // 「未定」に設定
  },
});

console.log(`✅ ${updateResult.count}件のユーザーが更新されました`);
```

#### Upsert（存在すれば更新、なければ作成）

```javascript
// ========================================
// 11. Upsert（更新 or 作成）
// ========================================
console.log("\n🔄 Upsert（更新または作成）を実行します...");

const upsertedUser = await prisma.user.upsert({
  where: {
    email: "new-user@example.com", // この条件で検索
  },
  update: {
    // 存在する場合: 更新
    name: "既存ユーザー（更新）",
  },
  create: {
    // 存在しない場合: 作成
    email: "new-user@example.com",
    name: "新規ユーザー",
    password: "new-password",
  },
});

console.log("✅ Upsertが完了しました:");
console.log(`  名前: ${upsertedUser.name}`);
console.log(`  メール: ${upsertedUser.email}`);
```

### Delete（削除）

#### 1 件削除: `delete()`

```javascript
// ========================================
// 12. ユーザーを削除
// ========================================
console.log("\n🗑️ ユーザーを削除します...");

const deletedUser = await prisma.user.delete({
  where: {
    email: "test@example.com",
  },
});

console.log("✅ ユーザーが削除されました:");
console.log(`  名前: ${deletedUser.name}`);
```

#### 複数件削除: `deleteMany()`

```javascript
// ========================================
// 13. 複数のユーザーを一括削除
// ========================================
console.log("\n🗑️ テストユーザーを一括削除します...");

const deleteResult = await prisma.user.deleteMany({
  where: {
    email: {
      contains: "example.com", // example.comを含むメールアドレス
    },
  },
});

console.log(`✅ ${deleteResult.count}件のユーザーが削除されました`);
```

---

## 10.5 リレーションデータの取得

データベースの真価は、関連するデータを効率的に取得できることです。

### 関連データを含めて取得: `include`

```javascript
// ========================================
// 14. ユーザーと投稿を一緒に取得
// ========================================
console.log("\n🔍 ユーザーと投稿を取得します...");

// まず、テスト用の投稿を作成
const userWithPost = await prisma.user.create({
  data: {
    email: "author@example.com",
    name: "投稿者",
    password: "password",
    posts: {
      create: [
        {
          title: "初めての投稿",
          content: "こんにちは！",
          published: true,
        },
        {
          title: "2つ目の投稿",
          content: "よろしくお願いします",
          published: true,
        },
      ],
    },
  },
});

// ユーザーとその投稿を取得
const userWithPosts = await prisma.user.findUnique({
  where: { id: userWithPost.id },
  include: {
    posts: true, // 投稿も含める
  },
});

console.log("✅ ユーザーと投稿が取得されました:");
console.log(`  ユーザー: ${userWithPosts.name}`);
console.log(`  投稿数: ${userWithPosts.posts.length}件`);
userWithPosts.posts.forEach((post, index) => {
  console.log(`    ${index + 1}. ${post.title}`);
});
```

### 関連データの条件指定

```javascript
// ========================================
// 15. 公開済みの投稿のみ取得
// ========================================
console.log("\n🔍 公開済みの投稿のみ取得します...");

const userWithPublishedPosts = await prisma.user.findUnique({
  where: { id: userWithPost.id },
  include: {
    posts: {
      where: {
        published: true, // 公開済みのみ
      },
      orderBy: {
        createdAt: "desc", // 新しい順
      },
    },
  },
});

console.log("✅ 公開済み投稿:");
userWithPublishedPosts.posts.forEach((post) => {
  console.log(`  - ${post.title}`);
});
```

### ネストした関連データの取得

```javascript
// ========================================
// 16. 投稿とその作成者とコメントを取得
// ========================================
console.log("\n🔍 投稿・作成者・コメントを取得します...");

const postsWithDetails = await prisma.post.findMany({
  include: {
    author: true, // 作成者情報
    comments: {
      // コメント
      include: {
        user: true, // コメント作成者
      },
    },
    likes: true, // いいね
  },
  take: 5, // 最初の5件
});

console.log("✅ 投稿の詳細:");
postsWithDetails.forEach((post, index) => {
  console.log(`  ${index + 1}. ${post.title}`);
  console.log(`     作成者: ${post.author.name}`);
  console.log(`     コメント: ${post.comments.length}件`);
  console.log(`     いいね: ${post.likes.length}件`);
});
```

---

## 10.6 高度なクエリ

### AND/OR 条件

```javascript
// ========================================
// 17. 複数条件の検索
// ========================================
console.log("\n🔍 複数条件で検索します...");

// AND条件（すべての条件を満たす）
const adminUsers = await prisma.user.findMany({
  where: {
    AND: [
      { role: "admin" },
      { instrument: { not: null } }, // 楽器が設定されている
    ],
  },
});

console.log(`✅ 管理者（楽器あり）: ${adminUsers.length}人`);

// OR条件（いずれかの条件を満たす）
const guitarOrDrums = await prisma.user.findMany({
  where: {
    OR: [{ instrument: "ギター" }, { instrument: "ドラム" }],
  },
});

console.log(`✅ ギター or ドラム: ${guitarOrDrums.length}人`);
```

### 部分一致検索

```javascript
// ========================================
// 18. 部分一致検索
// ========================================
console.log("\n🔍 名前で部分一致検索します...");

const searchUsers = await prisma.user.findMany({
  where: {
    name: {
      contains: "ユーザー", // 「ユーザー」を含む
    },
  },
});

console.log(`✅ 「ユーザー」を含む名前: ${searchUsers.length}人`);
searchUsers.forEach((user) => {
  console.log(`  - ${user.name}`);
});
```

### 集計

```javascript
// ========================================
// 19. 集計（カウント）
// ========================================
console.log("\n📊 ユーザー数を集計します...");

const userCount = await prisma.user.count();
const adminCount = await prisma.user.count({
  where: { role: "admin" },
});
const memberCount = await prisma.user.count({
  where: { role: "member" },
});

console.log("✅ ユーザー数:");
console.log(`  全体: ${userCount}人`);
console.log(`  管理者: ${adminCount}人`);
console.log(`  メンバー: ${memberCount}人`);
```

---

## 10.7 Prisma Studio の活用

Prisma Studio は、データベースの中身を GUI で確認・編集できる便利なツールです。

### Prisma Studio を起動

```bash
# ターミナルで実行
npm run db:studio
```

**自動的にブラウザが開きます:** http://localhost:5555

### Prisma Studio でできること

#### 1. データの確認

```
画面左側: モデル一覧
  - User
  - Post
  - Event
  - Schedule
  - Comment
  - Like
  ... 等

画面右側: データ一覧（テーブル形式）
```

#### 2. データの作成

**Step 1:** 左側で `User` をクリック

**Step 2:** 右上の `Add record` ボタンをクリック

**Step 3:** フォームに入力

```
email: "studio-user@example.com"
name: "Studioユーザー"
password: "password123"
role: "member"
instrument: "ギター"
```

**Step 4:** `Save 1 change` ボタンをクリック

→ ✅ ユーザーが作成されました！

#### 3. データの編集

**Step 1:** 編集したい行をクリック

**Step 2:** フィールドを変更

```
name: "Studioユーザー（編集済み）"
```

**Step 3:** `Save 1 change` ボタンをクリック

→ ✅ データが更新されました！

#### 4. データの削除

**Step 1:** 削除したい行にマウスを合わせる

**Step 2:** 右端のゴミ箱アイコンをクリック

**Step 3:** 確認ダイアログで `Delete` をクリック

→ ✅ データが削除されました！

#### 5. リレーションの確認

**Step 1:** ユーザーの行をクリック

**Step 2:** 右側のパネルで `posts` フィールドを展開

→ ✅ そのユーザーの投稿が表示されます！

### Prisma Studio の便利な使い方

| 操作                 | 説明                             |
| -------------------- | -------------------------------- |
| **フィルタ**         | 上部の検索ボックスで絞り込み     |
| **ソート**           | カラムヘッダーをクリック         |
| **ページネーション** | 下部のページ番号で移動           |
| **リレーション表示** | リンクアイコンで関連データへ移動 |

---

## 10.8 実践演習

学んだことを実践してみましょう！

### 🔧 演習 1: ユーザーとイベントを作成

**目標:** ユーザーを作成し、そのユーザーがイベントを作成する

```javascript
// scripts/exercise-1.js を作成
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  // 1. ユーザーを作成
  const user = await prisma.user.create({
    data: {
      email: "organizer@example.com",
      name: "イベント主催者",
      password: "password",
      role: "admin",
    },
  });

  console.log(`✅ ユーザー作成: ${user.name}`);

  // 2. そのユーザーがイベントを作成
  const event = await prisma.event.create({
    data: {
      title: "ライブイベント",
      description: "年末ライブです！",
      date: new Date("2025-12-31"),
      location: "渋谷ライブハウス",
      organizerId: user.id, // 作成したユーザーのID
    },
  });

  console.log(`✅ イベント作成: ${event.title}`);

  // 3. ユーザーとイベントを一緒に取得
  const userWithEvents = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      organizedEvents: true,
    },
  });

  console.log(`\n📅 ${userWithEvents.name}の主催イベント:`);
  userWithEvents.organizedEvents.forEach((e) => {
    console.log(`  - ${e.title} (${e.date.toLocaleDateString()})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**実行：**

```bash
export DATABASE_URL="file:./dev.db"
node scripts/exercise-1.js
```

### 🔧 演習 2: スケジュール調整を作成

**目標:** スケジュールと候補日を作成し、投票する

```javascript
// scripts/exercise-2.js を作成
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  // 1. 活動スケジュールを作成
  const schedule = await prisma.activitySchedule.create({
    data: {
      title: "12月の練習会",
      content: "次回ライブに向けた練習です",
      date: new Date("2025-12-25T18:00:00"),
      location: "スタジオABC",
      locationUrl: "https://maps.google.com/...",
      user: {
        connect: { email: "organizer@example.com" },
      },
    },
  });

  console.log(`✅ スケジュール作成: ${schedule.title}`);
  console.log(`   日時: ${schedule.date.toLocaleString()}`);
  console.log(`   場所: ${schedule.location}`);

  // 2. 参加者を登録
  const participant = await prisma.activityParticipant.create({
    data: {
      activitySchedule: {
        connect: { id: schedule.id },
      },
      user: {
        connect: { email: "organizer@example.com" },
      },
    },
  });

  console.log(`✅ 参加登録完了`);

  // 3. スケジュールと参加者を取得
  const scheduleWithParticipants = await prisma.activitySchedule.findUnique({
    where: { id: schedule.id },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  console.log(`\n📊 参加状況:`);
  console.log(`  参加者数: ${scheduleWithParticipants.participants.length}名`);
  scheduleWithParticipants.participants.forEach((p) => {
    console.log(`  - ${p.user.name || p.user.email}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**実行：**

```bash
export DATABASE_URL="file:./dev.db"
node scripts/exercise-2.js
```

### 🔧 演習 3: 投稿にいいねとコメント

**目標:** 投稿を作成し、いいねとコメントを追加する

```javascript
// scripts/exercise-3.js を作成
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  // 1. ユーザーを取得
  const user = await prisma.user.findFirst({
    where: { email: "organizer@example.com" },
  });

  if (!user) {
    console.log("❌ ユーザーが見つかりません");
    return;
  }

  // 2. 投稿を作成
  const post = await prisma.post.create({
    data: {
      title: "練習風景の写真",
      content: "今日の練習、良い感じでした！",
      published: true,
      authorId: user.id,
    },
  });

  console.log(`✅ 投稿作成: ${post.title}`);

  // 3. いいねを追加
  const like = await prisma.like.create({
    data: {
      postId: post.id,
      userId: user.id,
    },
  });

  console.log(`✅ いいね追加`);

  // 4. コメントを追加
  const comment = await prisma.comment.create({
    data: {
      content: "素晴らしい演奏でした！",
      postId: post.id,
      userId: user.id,
    },
  });

  console.log(`✅ コメント追加: ${comment.content}`);

  // 5. 投稿の詳細を取得
  const postWithDetails = await prisma.post.findUnique({
    where: { id: post.id },
    include: {
      author: true,
      likes: true,
      comments: {
        include: {
          user: true,
        },
      },
    },
  });

  console.log(`\n📝 投稿詳細:`);
  console.log(`  タイトル: ${postWithDetails.title}`);
  console.log(`  作成者: ${postWithDetails.author.name}`);
  console.log(`  いいね: ${postWithDetails.likes.length}件`);
  console.log(`  コメント: ${postWithDetails.comments.length}件`);
  postWithDetails.comments.forEach((c) => {
    console.log(`    - ${c.user.name}: ${c.content}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 10.9 トラブルシューティング

よくある問題と解決方法です。

### エラー 1: `PrismaClient is unable to be run in the browser`

**原因:** クライアントコンポーネントで Prisma を使っている

**解決方法:** Prisma はサーバーサイドでのみ使用

```typescript
// ❌ クライアントコンポーネント
"use client";
import { prisma } from "@/lib/db"; // エラー！

// ✅ サーバーコンポーネント
import { prisma } from "@/lib/db"; // OK
```

### エラー 2: `Unique constraint failed`

**原因:** ユニーク制約（`@unique`）のフィールドに重複した値を入れようとした

```typescript
// ❌ エラーになる
await prisma.user.create({
  data: {
    email: 'existing@example.com',  // すでに存在するメール
    name: 'User',
    password: 'pass',
  },
});

// ✅ 存在確認してから作成
const existing = await prisma.user.findUnique({
  where: { email: 'test@example.com' },
});

if (!existing) {
  await prisma.user.create({ ... });
}

// ✅ または upsert を使う
await prisma.user.upsert({
  where: { email: 'test@example.com' },
  update: { name: 'Updated' },
  create: { email: 'test@example.com', name: 'New', password: 'pass' },
});
```

### エラー 3: `Record to delete does not exist`

**原因:** 削除しようとしたレコードが存在しない

```typescript
// ❌ エラーになる
await prisma.user.delete({
  where: { id: "non-existent-id" },
});

// ✅ 存在確認してから削除
const user = await prisma.user.findUnique({
  where: { id: userId },
});

if (user) {
  await prisma.user.delete({ where: { id: userId } });
}
```

### エラー 4: `Foreign key constraint failed`

**原因:** 関連するデータが存在しない外部キーを指定した

```typescript
// ❌ エラーになる（存在しないuserIdを指定）
await prisma.post.create({
  data: {
    title: "Post",
    content: "Content",
    authorId: "non-existent-user-id", // エラー！
  },
});

// ✅ 正しいuserIdを指定
const user = await prisma.user.findFirst();
await prisma.post.create({
  data: {
    title: "Post",
    content: "Content",
    authorId: user.id, // 存在するユーザーのID
  },
});
```

---

## 10.10 確認チェックリスト

Chapter 10 の内容を理解できたか確認しましょう。

### ORM と Prisma の理解

- [ ] ORM の概念を説明できる
- [ ] Prisma の特徴を 3 つ以上言える
- [ ] Prisma Client の使い方を理解した

### Prisma スキーマの理解

- [ ] `model`の役割を理解した
- [ ] `@id`、`@unique`、`@default`の意味を理解した
- [ ] リレーション（1 対多、多対 1）の定義方法を理解した
- [ ] `String?`と`String`の違いを理解した

### CRUD 操作の理解

- [ ] `create()`でデータを作成できる
- [ ] `createMany()`で複数件作成できる
- [ ] `findMany()`でデータを取得できる
- [ ] `findUnique()`で 1 件取得できる
- [ ] `where`で条件を指定できる
- [ ] `orderBy`でソートできる
- [ ] `take`と`skip`でページネーションできる
- [ ] `update()`でデータを更新できる
- [ ] `updateMany()`で複数件更新できる
- [ ] `upsert()`の使い方を理解した
- [ ] `delete()`でデータを削除できる

### リレーションの理解

- [ ] `include`で関連データを取得できる
- [ ] `select`で特定のフィールドのみ取得できる
- [ ] ネストした関連データの取得方法を理解した

### Prisma Studio の活用

- [ ] Prisma Studio を起動できる
- [ ] GUI でデータを確認できる
- [ ] GUI でデータを作成・編集・削除できる

### 実践的な理解

- [ ] `scripts/test-prisma.js`を作成して実行した
- [ ] 演習 1〜3 を完了した
- [ ] Prisma Studio でデータを確認した

---

## まとめ

この章では、Prisma を使ったデータベース操作を学びました。

### 🎓 この章で学んだこと

#### ORM と Prisma

- ✅ ORM の概念と利点
- ✅ Prisma の特徴（型安全、直感的な API）
- ✅ Prisma Client の使い方

#### Prisma スキーマ

- ✅ スキーマファイルの構造
- ✅ モデルの定義方法
- ✅ フィールド属性（@id, @unique, @default 等）
- ✅ リレーションの定義

#### CRUD 操作

- ✅ Create: `create()`, `createMany()`
- ✅ Read: `findMany()`, `findUnique()`, `findFirst()`
- ✅ Update: `update()`, `updateMany()`, `upsert()`
- ✅ Delete: `delete()`, `deleteMany()`

#### 高度なクエリ

- ✅ 条件指定: `where`
- ✅ ソート: `orderBy`
- ✅ ページネーション: `take`, `skip`
- ✅ 関連データ取得: `include`, `select`
- ✅ AND/OR 条件、部分一致検索
- ✅ 集計: `count()`

#### Prisma Studio

- ✅ GUI でのデータ確認
- ✅ データの作成・編集・削除
- ✅ リレーションの確認

### 🚀 次の章への準備

次の章（Chapter 11: 認証システムの実装）では、以下を学びます：

1. **NextAuth.js の設定**

   - 認証の基礎知識
   - セッション管理
   - 認証プロバイダーの設定

2. **Google OAuth 実装**

   - Google Cloud Console の設定
   - Google でログイン機能

3. **パスワード認証**
   - サインアップページ
   - ログインページ
   - パスワードのハッシュ化

**準備すること：**

- ✅ Prisma の基本操作を復習しておく
- ✅ Google アカウントを用意しておく（OAuth 設定用）
- ✅ `src/lib/auth.ts`の場所を確認しておく

### 💡 重要なポイント

1. **Prisma は型安全**: TypeScript の型チェックでバグを防げる
2. **リレーションは強力**: `include`で関連データを簡単に取得
3. **Prisma Studio は便利**: 開発中のデータ確認に必須
4. **サーバーサイドのみ**: Prisma はクライアントコンポーネントでは使えない
5. **ユニーク制約に注意**: 重複エラーを防ぐため、存在確認や upsert を活用

---

[← 前の章：第 9 章 プロジェクト構成の理解](09-プロジェクトのファイル構成.md) | [目次に戻る](00-目次.md) | [次の章へ：第 11 章 認証システムの実装 →](11-認証システムの実装.md)
