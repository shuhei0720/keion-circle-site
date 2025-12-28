# 第6章：TypeScript入門

この章では、**TypeScript**の基本を学びます。本プロジェクトもTypeScriptで書かれており、型安全なコードを書くために重要な知識です。

## 6.1 TypeScriptとは

### なぜTypeScript？

**JavaScript の問題：**

```
// JavaScript での開発
開発中:
  ↓
function add(a, b) {
  return a + b;
}

add(1, 2);        // 3 ← 正常
add("1", "2");    // "12" ← 文字列になった！
add(1, "2");      // "12" ← 予期しない動作
add(1);           // NaN ← 引数不足
add(1, 2, 3);     // 3 ← 余分な引数は無視

問題点:
❌ 実行するまでバグに気づかない
❌ 型が曖昧で予期しない動作
❌ リファクタリングが怖い
❌ チーム開発で型の不一致
```

**TypeScript の解決：**

```
// TypeScript での開発
開発中:
  ↓
function add(a: number, b: number): number {
  return a + b;
}

add(1, 2);        // 3 ← 正常
add("1", "2");    // ❌ エラー！（コンパイル時）
add(1, "2");      // ❌ エラー！（コンパイル時）
add(1);           // ❌ エラー！（コンパイル時）
add(1, 2, 3);     // ❌ エラー！（コンパイル時）

メリット:
✅ コンパイル時にバグを発見
✅ 型で仕様が明確
✅ 安全なリファクタリング
✅ チーム開発でも安心
```

---

### TypeScript の特徴

**TypeScript = JavaScript + 型システム**

```
TypeScript:
┌─────────────────────────┐
│                         │
│    TypeScript コード    │
│    (型付き JavaScript)  │
│                         │
└───────────┬─────────────┘
            │
            │ コンパイル
            ↓
┌─────────────────────────┐
│                         │
│    JavaScript コード    │
│    (ブラウザで実行)     │
│                         │
└─────────────────────────┘

特徴:
✅ JavaScriptの上位互換
✅ 既存のJSコードがそのまま使える
✅ 最終的にはJavaScriptに変換される
✅ Node.js、React、Next.jsで使える
```

---

### JavaScript vs TypeScript

**JavaScript（型なし）:**

```javascript
// 何でも入る変数
let data = "hello";
data = 123;      // OK
data = true;     // OK
data = { x: 1 }; // OK

// 関数の引数も何でもOK
function greet(name) {
  return "Hello, " + name;
}

greet("太郎");        // "Hello, 太郎"
greet(123);          // "Hello, 123"
greet();             // "Hello, undefined"
greet({ x: 1 });     // "Hello, [object Object]"

// 実行するまでわからない
```

**TypeScript（型あり）:**

```typescript
// 型を指定
let data: string = "hello";
data = 123;      // ❌ エラー！
data = true;     // ❌ エラー！
data = { x: 1 }; // ❌ エラー！

// 関数の引数に型を指定
function greet(name: string): string {
  return "Hello, " + name;
}

greet("太郎");        // "Hello, 太郎"
greet(123);          // ❌ エラー！
greet();             // ❌ エラー！
greet({ x: 1 });     // ❌ エラー！

// コンパイル時に全部わかる
```

---

### TypeScript の利点

**1. バグの早期発見**

```typescript
// JavaScript: 実行時エラー
function getUser(id) {
  return users.find(u => u.id === id);
}

const user = getUser(1);
console.log(user.name);  // ← userがundefinedの場合にエラー


// TypeScript: コンパイル時エラー
function getUser(id: number): User | undefined {
  return users.find(u => u.id === id);
}

const user = getUser(1);
console.log(user.name);  // ❌ エラー！userはundefinedかもしれない

// 正しい書き方
if (user) {
  console.log(user.name);  // ✅ OK
}
```

**2. IDE の自動補完**

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const user: User = {
  id: 1,
  name: "田中",
  email: "tanaka@example.com",
  age: 25,
};

// user. と打つと...
user.  // ← IDE が id, name, email, age を提案！
```

**3. リファクタリングが安全**

```typescript
// 関数名を変更
function getUserById(id: number): User {  // ← 名前変更
  return users.find(u => u.id === id)!;
}

// TypeScript なら...
// すべての呼び出し箇所でエラーが表示される
// → 一括で名前変更できる

getUserId(1);  // ❌ エラー！getUserById に変えて
```

**4. ドキュメントになる**

```typescript
/**
 * ユーザーをIDで検索する
 * @param id - ユーザーID（数値）
 * @returns ユーザーオブジェクト、見つからない場合はundefined
 */
function getUserById(id: number): User | undefined {
  return users.find(u => u.id === id);
}

// 型定義が仕様書の役割を果たす:
// - id は number 型
// - 戻り値は User または undefined
```

---

### TypeScript の導入

**プロジェクトに追加：**

```bash
# TypeScript をインストール
npm install -D typescript

# TypeScript の設定ファイルを生成
npx tsc --init

# TypeScript ファイルをコンパイル
npx tsc
```

**Next.js プロジェクトの場合：**

```bash
# Next.js は TypeScript を自動検出
# .ts または .tsx ファイルを作るだけでOK

# 必要な型定義を自動インストール
npm run dev
```

---

### 初心者への補足

> 💡 **TypeScript のポイント**
> 
> **基本的な考え方：**
> ```
> JavaScript:
> - 何でも入る
> - 実行するまでわからない
> - 自由だけど危険
> 
> TypeScript:
> - 型を指定
> - コンパイル時にチェック
> - 制約があるけど安全
> ```
> 
> **よくある質問：**
> 
> **Q: JavaScript のコードはそのまま使える？**
> A: はい、使えます。TypeScript は JavaScript の上位互換です。
> 
> **Q: 型を全部書かないとダメ？**
> A: いいえ、型推論があるので書かなくても大丈夫な場合が多いです。
> 
> **Q: 学習コストは高い？**
> A: 基本的な型（string, number, boolean）から始めれば、徐々に慣れます。
> 
> **Q: Next.js で使える？**
> A: はい、Next.js は TypeScript を完全サポートしています。
> 
> **覚えておくこと：**
> - TypeScript = JavaScript + 型
> - コンパイル時にエラーチェック
> - 型推論で自動的に型が決まる
> - 最終的には JavaScript に変換される

---

## 6.2 基本的な型

### TypeScript の型システム全体像

```
TypeScript の型階層:

┌─────────────────────────────────────────┐
│          すべての型 (any)               │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌───────▼────────┐
│  プリミティブ型 │   │  オブジェクト型 │
└───────┬────────┘   └───────┬────────┘
        │                     │
  ┌─────┴─────┐         ┌───┴────┐
  │           │         │        │
string    number     配列    オブジェクト
boolean   bigint     タプル  関数
null      symbol     ユニオン クラス
undefined                    インターフェース

        ┌──────────────┐
        │  never 型    │
        │ (何も入らない)│
        └──────────────┘
```

---

### プリミティブ型（基本型）

**1. string 型（文字列）**

```typescript
// 文字列型の変数
let name: string = "田中";
let message: string = '山田';
let template: string = `こんにちは、${name}さん`;

// 再代入も string のみ
name = "佐藤";  // ✅ OK
name = 123;     // ❌ エラー！

// メモリイメージ:
// name: string
//   ↓
// ["田中"] ← 文字列データ
```

**このコードの詳しい説明：**

```typescript
let name: string = "田中";
```

1. `let name`: 変数 `name` を宣言
2. `: string`: この変数は string 型（文字列のみ）
3. `= "田中"`: 初期値として "田中" を代入

**実行フロー：**

```
変数宣言:
  ↓
型チェック: "田中" は string? → ✅ OK
  ↓
メモリ確保: name に "田中" を保存
  ↓
name: "田中" (型: string)
```

---

**2. number 型（数値）**

```typescript
// 数値型の変数
let age: number = 25;
let price: number = 1000.5;
let negative: number = -10;
let hex: number = 0xFF;      // 16進数
let binary: number = 0b1010;  // 2進数

// 再代入も number のみ
age = 30;      // ✅ OK
age = "30";    // ❌ エラー！

// メモリイメージ:
// age: number
//   ↓
// [25] ← 数値データ
```

**数値の型チェック：**

```typescript
let count: number = 10;

// 算術演算も型チェック
count = count + 5;    // ✅ OK（number + number = number）
count = count + "5";  // ❌ エラー！（number + string）

// 関数の引数も型チェック
function double(n: number): number {
  return n * 2;
}

double(10);    // ✅ OK
double("10");  // ❌ エラー！
```

---

**3. boolean 型（真偽値）**

```typescript
// 真偽値型の変数
let isActive: boolean = true;
let isCompleted: boolean = false;

// true/false のみ
isActive = true;   // ✅ OK
isActive = false;  // ✅ OK
isActive = 1;      // ❌ エラー！
isActive = "true"; // ❌ エラー！

// メモリイメージ:
// isActive: boolean
//   ↓
// [true] または [false]
```

**条件式での使用：**

```typescript
let isLoggedIn: boolean = true;

if (isLoggedIn) {
  console.log("ログイン中");
} else {
  console.log("未ログイン");
}

// 実行フロー:
// isLoggedIn === true?
//   ↓
// true → "ログイン中" を表示
```

---

**4. null と undefined**

```typescript
// null: 明示的に「値がない」
let empty: null = null;

// undefined: 未定義
let notDefined: undefined = undefined;

// 変数宣言だけだと undefined
let value: number;
console.log(value);  // undefined

// オプショナルなプロパティ
interface User {
  name: string;
  age?: number;  // undefined かもしれない
}

const user: User = {
  name: "田中",
  // age は undefined
};
```

**null と undefined の違い：**

```
null:
- 意図的に「空」を表す
- 値が存在しないことを明示

undefined:
- 値が未定義
- まだ値が設定されていない

例:
let result: string | null = null;      // 検索結果なし（意図的）
let userName: string | undefined;      // まだ設定されていない
```

---

### 型推論（Type Inference）

**TypeScript が自動的に型を推測：**

```typescript
// 明示的な型指定
let name: string = "田中";
let age: number = 25;

// 型推論（型を書かない）
let name = "田中";     // string と推論
let age = 25;         // number と推論
let isActive = true;  // boolean と推論

// 推論の仕組み:
let x = 10;
//  ↓
// x は number 型と推論
//  ↓
// x = "hello";  ❌ エラー！
```

**型推論の流れ：**

```
変数宣言:
let count = 0;
  ↓
初期値をチェック: 0 は number
  ↓
型を推論: count は number 型
  ↓
再代入もチェック:
  count = 5;     ✅ OK
  count = "5";   ❌ エラー！
```

**配列の型推論：**

```typescript
// 配列の型も推論される
let numbers = [1, 2, 3];        // number[]
let names = ["田中", "山田"];    // string[]
let mixed = [1, "hello", true]; // (number | string | boolean)[]

// 実行フロー:
let numbers = [1, 2, 3];
  ↓
要素をチェック: 1, 2, 3 → すべて number
  ↓
型を推論: numbers は number[] 型
  ↓
numbers.push(4);     ✅ OK
numbers.push("5");   ❌ エラー！
```

---

### 配列型

**配列の型定義：**

```typescript
// 基本的な書き方
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["田中", "山田", "佐藤"];

// ジェネリクスの書き方
let numbers: Array<number> = [1, 2, 3, 4, 5];
let names: Array<string> = ["田中", "山田", "佐藤"];

// メモリイメージ:
// numbers: number[]
//   ↓
// [1, 2, 3, 4, 5] ← すべて number
```

**配列の操作：**

```typescript
let scores: number[] = [80, 90, 75];

// 要素の追加
scores.push(85);       // ✅ OK: [80, 90, 75, 85]
scores.push("100");    // ❌ エラー！string は入れられない

// 要素の取得
let first: number = scores[0];  // 80

// 配列の長さ
let length: number = scores.length;  // 4

// 実行フロー:
scores.push(85);
  ↓
型チェック: 85 は number?
  ↓
✅ OK → 配列に追加
  ↓
scores: [80, 90, 75, 85]
```

**多次元配列：**

```typescript
// 2次元配列
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// アクセス
let value: number = matrix[0][0];  // 1

// メモリイメージ:
// matrix: number[][]
//   ↓
// [
//   [1, 2, 3],  ← number[]
//   [4, 5, 6],  ← number[]
//   [7, 8, 9],  ← number[]
// ]
```

---

### タプル型

**固定長・固定型の配列：**

```typescript
// [文字列, 数値] の組
let user: [string, number] = ["田中", 25];

// 順序も型も固定
let user: [string, number] = [25, "田中"];  // ❌ エラー！

// 要素へのアクセス
let name: string = user[0];  // "田中"
let age: number = user[1];   // 25

// メモリイメージ:
// user: [string, number]
//   ↓
// ["田中", 25]
//    ↑      ↑
//  string  number
```

**タプルの使用例：**

```typescript
// 座標を表すタプル
let point: [number, number] = [100, 200];
let x: number = point[0];  // 100
let y: number = point[1];  // 200

// 関数の戻り値として
function getUser(): [string, number, boolean] {
  return ["田中", 25, true];
}

const [name, age, isActive] = getUser();
//     ↑     ↑    ↑
//   string number boolean

// 実行フロー:
getUser()
  ↓
return ["田中", 25, true]
  ↓
型チェック: [string, number, boolean]?
  ↓
✅ OK → タプルを返す
```

**オプショナルな要素：**

```typescript
// 3番目の要素はオプション
let user: [string, number, boolean?] = ["田中", 25];
//                                               ↑
//                                        boolean は省略可能

// 3番目を指定してもOK
let user2: [string, number, boolean?] = ["山田", 30, true];
```

---

### オブジェクト型

**オブジェクトの形を定義：**

```typescript
// オブジェクトの型
let user: { name: string; age: number } = {
  name: "田中",
  age: 25,
};

// プロパティへのアクセス
console.log(user.name);  // "田中"
console.log(user.age);   // 25

// メモリイメージ:
// user: { name: string; age: number }
//   ↓
// {
//   name: "田中",   ← string
//   age: 25,       ← number
// }
```

**必須プロパティのチェック：**

```typescript
// 必須のプロパティがないとエラー
let user: { name: string; age: number } = {
  name: "田中",
  // age がない！
};  // ❌ エラー！

// 余分なプロパティもエラー
let user: { name: string; age: number } = {
  name: "田中",
  age: 25,
  email: "tanaka@example.com",  // ❌ エラー！
};
```

**オプショナルなプロパティ：**

```typescript
// email はオプション（あってもなくてもOK）
let user: {
  name: string;
  age: number;
  email?: string;  // ? をつけるとオプション
} = {
  name: "田中",
  age: 25,
  // email は省略可能
};

// email があるかチェック
if (user.email) {
  console.log(user.email);  // email があれば実行
}
```

**読み取り専用プロパティ：**

```typescript
// readonly で変更不可に
let user: {
  readonly id: number;
  name: string;
} = {
  id: 1,
  name: "田中",
};

user.name = "山田";  // ✅ OK
user.id = 2;         // ❌ エラー！readonly なので変更不可
```

---

### any 型（避けるべき）

**何でも入る型：**

```typescript
let value: any = "hello";
value = 123;      // ✅ OK
value = true;     // ✅ OK
value = { x: 1 }; // ✅ OK

// any は型チェックをオフにする
value.toUpperCase();     // 実行時エラー（number に toUpperCase はない）
value.nonExistent();     // 実行時エラー

// any の問題点:
any を使うと...
  ↓
型チェックが無効化される
  ↓
TypeScript の利点がなくなる
  ↓
バグの発見が遅れる
  ↓
❌ できるだけ使わない！
```

**any を使うべき場合：**

```typescript
// サードパーティライブラリで型定義がない場合
import someLibrary from "legacy-library";  // 型定義なし
let result: any = someLibrary.doSomething();

// 段階的な移行（JavaScript → TypeScript）
// 一時的に any を使って、後で型を追加
```

---

### unknown 型（安全な any）

**型を確認してから使う：**

```typescript
let value: unknown = "hello";

// そのまま使うとエラー
console.log(value.toUpperCase());  // ❌ エラー！

// 型を確認してから使う（型ガード）
if (typeof value === "string") {
  console.log(value.toUpperCase());  // ✅ OK
}

// 実行フロー:
let value: unknown = "hello";
  ↓
typeof value === "string"?
  ↓
✅ true → value は string として扱える
  ↓
value.toUpperCase()  // OK
```

**unknown vs any：**

```
any:
- 何でも入る
- 型チェックなし
- 危険

unknown:
- 何でも入る
- 型チェックあり
- 安全

使い分け:
- any: 避ける
- unknown: 型が不明な値に使う
```

---

### void 型

**何も返さない関数：**

```typescript
function log(message: string): void {
  console.log(message);
  // return がない
}

function alert(message: string): void {
  window.alert(message);
  // return; だけでもOK
}

// 実行フロー:
log("Hello")
  ↓
console.log("Hello") を実行
  ↓
何も返さない（void）
  ↓
戻り値: undefined
```

**void と undefined の違い：**

```typescript
// void: 戻り値を使わない
function log(message: string): void {
  console.log(message);
}

// undefined: undefined を明示的に返す
function getNothing(): undefined {
  return undefined;
}

// 実用上の違い:
log("Hello");  // 戻り値を使わない想定
let result = getNothing();  // undefined を返す想定
```

---

### never 型

**決して到達しない値：**

```typescript
// エラーを投げる関数（決して return しない）
function error(message: string): never {
  throw new Error(message);
  // ここには到達しない
}

// 無限ループ（決して終わらない）
function loop(): never {
  while (true) {
    // 無限ループ
  }
}

// 実行フロー:
error("エラー発生")
  ↓
throw new Error("エラー発生")
  ↓
関数を抜ける（例外）
  ↓
ここには到達しない（never）
```

**never の使用例：**

```typescript
// すべてのケースを処理（網羅性チェック）
type Shape = "circle" | "square";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI * 10 * 10;
    case "square":
      return 10 * 10;
    default:
      // ここには到達しないはず
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// Shape に新しい値を追加すると...
type Shape = "circle" | "square" | "triangle";

// default に到達してエラーになる
// → 処理漏れを防げる
```

---

### 初心者への補足

> 💡 **型の選び方**
> 
> **基本的な型：**
> ```
> string  → 文字列
> number  → 数値
> boolean → 真偽値
> 
> 配列:
> number[]        → 数値の配列
> string[]        → 文字列の配列
> Array<number>   → 数値の配列（別の書き方）
> 
> タプル:
> [string, number]  → 固定長・固定型
> 
> オブジェクト:
> { name: string; age: number }  → 形を定義
> 
> 特殊な型:
> any      → 何でも入る（避ける）
> unknown  → 何でも入る（安全）
> void     → 何も返さない
> never    → 決して到達しない
> ```
> 
> **型推論を活用：**
> ```typescript
> // 型を書かなくてもOK
> let name = "田中";  // string と推論
> let age = 25;      // number と推論
> 
> // 配列も推論される
> let numbers = [1, 2, 3];  // number[]
> ```
> 
> **よくある質問：**
> 
> **Q: 型を書かないとエラーになる？**
> A: いいえ、型推論で自動的に型が決まります。
> 
> **Q: any と unknown の違いは？**
> A: any は型チェックなし、unknown は型チェックあり。unknown を使いましょう。
> 
> **Q: null と undefined の使い分けは？**
> A: null は「意図的に空」、undefined は「未定義」。
> 
> **Q: タプルと配列の違いは？**
> A: タプルは固定長・固定型、配列は可変長・同じ型。
> 
> **覚えておくこと：**
> - プリミティブ型: string, number, boolean
> - 配列: number[], string[]
> - オブジェクト: { name: string }
> - any は避ける、unknown を使う
> - 型推論で自動的に型が決まる

---

## 6.3 型エイリアスとインターフェース

### なぜ型に名前をつけるのか？

**名前なしの型（毎回書く）：**

```typescript
// 同じ型を毎回書く
let user1: { id: number; name: string; email: string } = {
  id: 1,
  name: "田中",
  email: "tanaka@example.com",
};

let user2: { id: number; name: string; email: string } = {
  id: 2,
  name: "山田",
  email: "yamada@example.com",
};

// 関数の引数も毎回書く
function greetUser(user: { id: number; name: string; email: string }) {
  console.log(`こんにちは、${user.name}さん`);
}

// 問題点:
// ❌ 同じ型を何度も書く
// ❌ 変更が大変（すべての箇所を修正）
// ❌ コードが読みにくい
```

**名前付きの型（再利用）：**

```typescript
// 型に名前をつける
type User = {
  id: number;
  name: string;
  email: string;
};

// 同じ名前で使い回せる
let user1: User = {
  id: 1,
  name: "田中",
  email: "tanaka@example.com",
};

let user2: User = {
  id: 2,
  name: "山田",
  email: "yamada@example.com",
};

// 関数の引数もシンプル
function greetUser(user: User) {
  console.log(`こんにちは、${user.name}さん`);
}

// メリット:
// ✅ 型を一箇所で定義
// ✅ 変更が簡単
// ✅ コードが読みやすい
```

---

### 型エイリアス（Type Alias）

**基本的な使い方：**

```typescript
// type キーワードで型に名前をつける
type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

// 使用
const user: User = {
  id: 1,
  name: "田中",
  email: "tanaka@example.com",
  age: 25,
};

// 実行フロー:
const user: User = { ... }
  ↓
User 型をチェック: すべてのプロパティがある?
  ↓
✅ OK → user 変数を作成
```

---

**プリミティブ型のエイリアス：**

```typescript
// 数値型に名前をつける
type Age = number;
type Price = number;

let userAge: Age = 25;
let productPrice: Price = 1000;

// ユニオン型のエイリアス
type ID = number | string;

let userId: ID = 123;      // ✅ OK
let postId: ID = "abc";    // ✅ OK

// リテラル型のエイリアス
type Status = "active" | "inactive" | "pending";

let userStatus: Status = "active";     // ✅ OK
let postStatus: Status = "published";  // ❌ エラー！
```

---

**関数型のエイリアス：**

```typescript
// 関数の型
type Greeter = (name: string) => string;

// Greeter 型の関数
const greet: Greeter = (name) => {
  return `こんにちは、${name}さん`;
};

// 使用
console.log(greet("田中"));  // "こんにちは、田中さん"

// 実行フロー:
const greet: Greeter = (name) => { ... }
  ↓
型チェック: 引数は string? 戻り値は string?
  ↓
✅ OK → greet 関数を作成
```

---

**配列のエイリアス：**

```typescript
// 配列の型
type Numbers = number[];
type Users = User[];

let scores: Numbers = [80, 90, 75];
let users: Users = [
  { id: 1, name: "田中", email: "tanaka@example.com", age: 25 },
  { id: 2, name: "山田", email: "yamada@example.com", age: 30 },
];
```

---

### インターフェース（Interface）

**基本的な使い方：**

```typescript
// interface キーワードでオブジェクトの形を定義
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// 使用
const user: User = {
  id: 1,
  name: "田中",
  email: "tanaka@example.com",
  age: 25,
};
```

---

**インターフェースの拡張：**

```typescript
// 基本のインターフェース
interface User {
  id: number;
  name: string;
  email: string;
}

// User を拡張
interface AdminUser extends User {
  role: "admin";
  permissions: string[];
}

// AdminUser は User のプロパティも持つ
const admin: AdminUser = {
  id: 1,
  name: "管理者",
  email: "admin@example.com",
  role: "admin",
  permissions: ["read", "write", "delete"],
};

// 実行フロー:
interface AdminUser extends User { ... }
  ↓
User のプロパティを継承:
  - id: number
  - name: string
  - email: string
  ↓
AdminUser のプロパティを追加:
  - role: "admin"
  - permissions: string[]
```

---

**複数のインターフェースを拡張：**

```typescript
interface Person {
  name: string;
  age: number;
}

interface Contact {
  email: string;
  phone: string;
}

// 複数のインターフェースを拡張
interface Employee extends Person, Contact {
  employeeId: number;
  department: string;
}

const employee: Employee = {
  name: "田中",
  age: 25,
  email: "tanaka@example.com",
  phone: "080-1234-5678",
  employeeId: 1001,
  department: "開発部",
};
```

---

### 型エイリアス vs インターフェース

**比較表：**

```
┌────────────────────────┬───────────────┬─────────────────┐
│ 機能                   │ type          │ interface       │
├────────────────────────┼───────────────┼─────────────────┤
│ オブジェクト型         │ ✅            │ ✅              │
│ プリミティブ型         │ ✅            │ ❌              │
│ ユニオン型             │ ✅            │ ❌              │
│ タプル型               │ ✅            │ ❌              │
│ 拡張                   │ & で交差      │ extends で継承  │
│ 同名の定義             │ ❌ エラー      │ ✅ マージされる │
│ パフォーマンス         │ やや高速      │ やや遅い        │
└────────────────────────┴───────────────┴─────────────────┘
```

---

**1. オブジェクト型（どちらでもOK）：**

```typescript
// type
type User = {
  id: number;
  name: string;
};

// interface
interface User {
  id: number;
  name: string;
}

// どちらも同じように使える
```

---

**2. プリミティブ型（type のみ）：**

```typescript
// type: OK
type ID = number | string;
type Status = "active" | "inactive";

// interface: 不可
interface ID number;  // ❌ エラー！
```

---

**3. ユニオン型（type のみ）：**

```typescript
// type: OK
type Result = Success | Error;
type ID = number | string;

// interface: 不可
interface Result Success | Error;  // ❌ エラー！
```

---

**4. 拡張（両方可能）：**

```typescript
// type: 交差型（&）
type User = {
  id: number;
  name: string;
};

type AdminUser = User & {
  role: "admin";
};

// interface: extends
interface User {
  id: number;
  name: string;
}

interface AdminUser extends User {
  role: "admin";
}
```

---

**5. 同名の定義（interface のみ）：**

```typescript
// interface: マージされる
interface User {
  id: number;
  name: string;
}

interface User {
  email: string;  // 追加される
}

// 結果: { id: number; name: string; email: string }

// type: エラー
type User = {
  id: number;
  name: string;
};

type User = {  // ❌ エラー！重複定義
  email: string;
};
```

---

### オプショナルプロパティ

**`?` で省略可能に：**

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;      // オプション
  bio?: string;      // オプション
}

// age と bio は省略できる
const user1: User = {
  id: 1,
  name: "田中",
  email: "tanaka@example.com",
};

// 指定してもOK
const user2: User = {
  id: 2,
  name: "山田",
  email: "yamada@example.com",
  age: 30,
  bio: "開発者です",
};

// 実行フロー:
const user1: User = { id: 1, name: "田中", email: "..." }
  ↓
必須プロパティをチェック: id, name, email がある?
  ↓
✅ OK → user1 を作成（age, bio はなくてもOK）
```

---

**オプショナルなプロパティへのアクセス：**

```typescript
interface User {
  name: string;
  bio?: string;
}

const user: User = {
  name: "田中",
};

// bio は undefined かもしれない
console.log(user.bio.toUpperCase());  // ❌ エラー！

// 安全にアクセス
if (user.bio) {
  console.log(user.bio.toUpperCase());  // ✅ OK
}

// オプショナルチェーン
console.log(user.bio?.toUpperCase());  // undefined または大文字
```

---

### 読み取り専用プロパティ

**`readonly` で変更不可に：**

```typescript
interface User {
  readonly id: number;  // 読み取り専用
  name: string;
}

const user: User = {
  id: 1,
  name: "田中",
};

user.name = "山田";  // ✅ OK
user.id = 2;         // ❌ エラー！readonly

// 実行フロー:
user.id = 2
  ↓
型チェック: id は readonly?
  ↓
✅ readonly → 変更不可
  ↓
❌ エラー！
```

---

**配列も読み取り専用に：**

```typescript
interface Config {
  readonly values: readonly number[];
}

const config: Config = {
  values: [1, 2, 3],
};

config.values.push(4);  // ❌ エラー！readonly array
config.values[0] = 10;  // ❌ エラー！readonly
```

---

### インデックスシグネチャ

**動的なプロパティ名：**

```typescript
// プロパティ名が動的な場合
interface StringDictionary {
  [key: string]: string;
}

const dict: StringDictionary = {
  name: "田中",
  email: "tanaka@example.com",
  city: "東京",
  // 任意の string キーで string 値
};

// 実行フロー:
const dict: StringDictionary = { name: "田中", ... }
  ↓
各プロパティをチェック: キーは string? 値は string?
  ↓
✅ OK → dict を作成
```

---

**数値インデックス：**

```typescript
interface NumberArray {
  [index: number]: string;
}

const arr: NumberArray = ["a", "b", "c"];

console.log(arr[0]);  // "a"
console.log(arr[1]);  // "b"
```

---

**固定プロパティと動的プロパティの組み合わせ：**

```typescript
interface User {
  id: number;           // 固定
  name: string;         // 固定
  [key: string]: any;   // その他は何でもOK
}

const user: User = {
  id: 1,
  name: "田中",
  age: 25,              // ✅ OK
  email: "...",         // ✅ OK
  hobby: "音楽",         // ✅ OK
};
```

---

### 初心者への補足

> 💡 **型エイリアスとインターフェースの使い分け**
> 
> **基本的なルール：**
> ```typescript
> // オブジェクト型 → interface（推奨）
> interface User {
>   id: number;
>   name: string;
> }
> 
> // ユニオン型、プリミティブ型 → type
> type Status = "active" | "inactive";
> type ID = number | string;
> 
> // どちらでも良い場合は interface（拡張性が高い）
> ```
> 
> **拡張の違い：**
> ```typescript
> // interface: extends（継承のイメージ）
> interface AdminUser extends User {
>   role: "admin";
> }
> 
> // type: & で交差（結合のイメージ）
> type AdminUser = User & {
>   role: "admin";
> };
> ```
> 
> **よくある質問：**
> 
> **Q: type と interface、どっちを使うべき？**
> A: オブジェクト型は interface、その他は type を使うのが一般的です。
> 
> **Q: オプショナルなプロパティはどう書く？**
> A: プロパティ名の後に `?` をつけます（例: `age?: number`）。
> 
> **Q: readonly と const の違いは？**
> A: readonly はプロパティの変更を防ぎ、const は変数の再代入を防ぎます。
> 
> **Q: インデックスシグネチャはいつ使う？**
> A: プロパティ名が動的な場合や、辞書のようなオブジェクトに使います。
> 
> **覚えておくこと：**
> - type: 型に名前をつける（すべての型）
> - interface: オブジェクトの形を定義
> - オプション: `?` をつける
> - readonly: 変更不可
> - extends: インターフェースの拡張

---
  email: 'sato@example.com',
  age: 30,
  bio: 'エンジニアです'
};
```

### 読み取り専用プロパティ

`readonly`を付けると、値を変更できなくなります：

```typescript
interface User {
  readonly id: number;
  name: string;
}

const user: User = {
  id: 1,
  name: '田中'
};

user.name = '佐藤';  // OK
user.id = 2;         // エラー！readonlyは変更できない
```

---

## 6.4 ユニオン型とリテラル型

### ユニオン型（Union Types）

**複数の型を許容する：**

```typescript
// number または string を許容
let id: number | string;

id = 123;      // ✅ OK
id = "abc";    // ✅ OK
id = true;     // ❌ エラー！boolean は含まれていない

// 実行フロー:
id = 123
  ↓
型チェック: number | string に number は含まれる?
  ↓
✅ OK → id に 123 を代入

id = true
  ↓
型チェック: number | string に boolean は含まれる?
  ↓
❌ エラー！
```

---

**関数の引数でユニオン型：**

```typescript
function printId(id: number | string) {
  console.log(`ID: ${id}`);
}

printId(123);    // ✅ OK
printId("abc");  // ✅ OK
printId(true);   // ❌ エラー！

// 実行フロー:
printId(123)
  ↓
引数の型チェック: 123 は number | string?
  ↓
✅ OK（number は含まれる）
  ↓
console.log("ID: 123")
```

---

**配列やオブジェクトでもユニオン型：**

```typescript
// 配列の要素がユニオン型
let mixed: (number | string)[] = [1, "hello", 2, "world"];

// オブジェクトのプロパティがユニオン型
interface User {
  id: number | string;
  name: string;
}

const user1: User = { id: 1, name: "田中" };
const user2: User = { id: "abc", name: "山田" };
```

---

### 型ガード（Type Guards）

**ユニオン型を絞り込む：**

```typescript
function printId(id: number | string) {
  // そのまま使うとエラー
  // console.log(id.toUpperCase());  // ❌ number には toUpperCase がない
  
  // typeof で型を絞り込む
  if (typeof id === "string") {
    // この中では id は string 型
    console.log(id.toUpperCase());  // ✅ OK
  } else {
    // この中では id は number 型
    console.log(id.toFixed(2));     // ✅ OK
  }
}

// 実行フロー:
printId("hello")
  ↓
typeof id === "string"?
  ↓
✅ true → id は string として扱う
  ↓
id.toUpperCase() → "HELLO"
```

---

**型ガードの種類：**

```typescript
// 1. typeof（プリミティブ型）
function example1(value: number | string) {
  if (typeof value === "string") {
    // value は string
  } else {
    // value は number
  }
}

// 2. instanceof（クラス）
function example2(value: Date | string) {
  if (value instanceof Date) {
    // value は Date
    console.log(value.getFullYear());
  } else {
    // value は string
    console.log(value.toUpperCase());
  }
}

// 3. in（プロパティの存在チェック）
interface Cat {
  meow: () => void;
}

interface Dog {
  bark: () => void;
}

function example3(animal: Cat | Dog) {
  if ("meow" in animal) {
    // animal は Cat
    animal.meow();
  } else {
    // animal は Dog
    animal.bark();
  }
}

// 4. カスタム型ガード
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function example4(value: unknown) {
  if (isString(value)) {
    // value は string
    console.log(value.toUpperCase());
  }
}
```

---

### リテラル型（Literal Types）

**特定の値のみを許可：**

```typescript
// 文字列リテラル型
let status: "success" | "error" | "loading";

status = "success";  // ✅ OK
status = "error";    // ✅ OK
status = "fail";     // ❌ エラー！この値は許可されていない

// 実行フロー:
status = "success"
  ↓
型チェック: "success" は許可された値?
  ↓
✅ OK（"success" | "error" | "loading" に含まれる）

status = "fail"
  ↓
型チェック: "fail" は許可された値?
  ↓
❌ エラー！
```

---

**数値リテラル型：**

```typescript
// サイコロの目（1〜6）
let dice: 1 | 2 | 3 | 4 | 5 | 6;

dice = 3;   // ✅ OK
dice = 7;   // ❌ エラー！

// HTTP ステータスコード
type HttpStatus = 200 | 404 | 500;

let status: HttpStatus = 200;  // ✅ OK
```

---

**真偽値リテラル型：**

```typescript
// true のみ許可（利用規約への同意など）
let agreed: true;

agreed = true;   // ✅ OK
agreed = false;  // ❌ エラー！
```

---

### リテラル型の実用例

**ステータス管理：**

```typescript
type Status = "idle" | "loading" | "success" | "error";

interface ApiState {
  status: Status;
  data?: any;
  error?: string;
}

const state: ApiState = {
  status: "loading",
};

// ステータスに応じた処理
function handleState(state: ApiState) {
  switch (state.status) {
    case "idle":
      console.log("待機中");
      break;
    case "loading":
      console.log("読み込み中...");
      break;
    case "success":
      console.log("成功:", state.data);
      break;
    case "error":
      console.log("エラー:", state.error);
      break;
  }
}
```

---

**ボタンのバリエーション：**

```typescript
type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  variant: ButtonVariant;
  size: ButtonSize;
  label: string;
}

function Button({ variant, size, label }: ButtonProps) {
  // variant と size に応じてスタイルを変える
  console.log(`${size} ${variant} button: ${label}`);
}

Button({
  variant: "primary",
  size: "large",
  label: "送信",
});
```

---

### 判別可能なユニオン型（Discriminated Unions）

**タグ付きユニオン：**

```typescript
// 共通のプロパティ（type）で判別
interface Success {
  type: "success";
  data: any;
}

interface Error {
  type: "error";
  message: string;
}

interface Loading {
  type: "loading";
}

type ApiResponse = Success | Error | Loading;

// type プロパティで判別
function handleResponse(response: ApiResponse) {
  switch (response.type) {
    case "success":
      // response は Success 型
      console.log(response.data);
      break;
    case "error":
      // response は Error 型
      console.log(response.message);
      break;
    case "loading":
      // response は Loading 型
      console.log("読み込み中...");
      break;
  }
}

// 実行フロー:
handleResponse({ type: "success", data: { ... } })
  ↓
switch (response.type)
  ↓
case "success" にマッチ
  ↓
response は Success 型として扱われる
  ↓
response.data にアクセス可能
```

---

**図形の例：**

```typescript
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  size: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

type Shape = Circle | Square | Rectangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.size ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}

// 実行フロー:
getArea({ kind: "circle", radius: 10 })
  ↓
shape.kind === "circle"
  ↓
shape は Circle 型
  ↓
shape.radius にアクセス可能
  ↓
Math.PI * 10 ** 2 = 314.159...
```

---

### 網羅性チェック（Exhaustiveness Checking）

**すべてのケースを処理：**

```typescript
type Shape = "circle" | "square" | "rectangle";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return 0;
    case "square":
      return 0;
    case "rectangle":
      return 0;
    default:
      // すべてのケースを処理した場合、ここには到達しない
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// 新しい形を追加すると...
type Shape = "circle" | "square" | "rectangle" | "triangle";

// default に到達してエラーになる
// → 処理漏れを防げる
```

---

### 初心者への補足

> 💡 **ユニオン型とリテラル型のポイント**
> 
> **ユニオン型の使いどころ：**
> ```typescript
> // ID は数値か文字列
> type ID = number | string;
> 
> // 結果は成功か失敗
> type Result = Success | Error;
> 
> // データは string か null
> type Data = string | null;
> ```
> 
> **リテラル型の使いどころ：**
> ```typescript
> // ステータスは限定された値
> type Status = "idle" | "loading" | "success";
> 
> // ボタンの種類は3つのみ
> type ButtonType = "primary" | "secondary" | "danger";
> 
> // HTTPメソッドは決まった値
> type Method = "GET" | "POST" | "PUT" | "DELETE";
> ```
> 
> **型ガードの種類：**
> ```
> typeof    → プリミティブ型の判定
> instanceof → クラスの判定
> in        → プロパティの存在判定
> カスタム   → 独自の型判定関数
> ```
> 
> **判別可能なユニオン型：**
> ```typescript
> // 共通のプロパティ（kind, type など）で判別
> interface Cat {
>   kind: "cat";
>   meow: () => void;
> }
> 
> interface Dog {
>   kind: "dog";
>   bark: () => void;
> }
> 
> type Animal = Cat | Dog;
> 
> function speak(animal: Animal) {
>   if (animal.kind === "cat") {
>     animal.meow();  // animal は Cat 型
>   } else {
>     animal.bark();  // animal は Dog 型
>   }
> }
> ```
> 
> **よくある質問：**
> 
> **Q: ユニオン型とリテラル型の違いは？**
> A: ユニオン型は「型の選択肢」、リテラル型は「値の選択肢」です。
> 
> **Q: 型ガードはいつ必要？**
> A: ユニオン型の値を使う前に、どの型なのか絞り込む必要があります。
> 
> **Q: 判別可能なユニオン型のメリットは？**
> A: 共通のプロパティで判別でき、型安全に処理できます。
> 
> **Q: never 型を使う理由は？**
> A: 網羅性チェックで、すべてのケースを処理したことを保証できます。
> 
> **覚えておくこと：**
> - ユニオン型: `A | B`（A または B）
> - リテラル型: 特定の値のみ許可
> - 型ガード: typeof, instanceof, in
> - 判別可能なユニオン: 共通のプロパティで判別
> - 網羅性チェック: never 型で処理漏れ防止

---

## 6.5 関数の型

### 関数の型定義

**基本的な関数：**

```typescript
// パラメータと戻り値の型を指定
function add(a: number, b: number): number {
  return a + b;
}

// 実行フロー:
add(1, 2)
  ↓
引数の型チェック: 1 は number? 2 は number?
  ↓
✅ OK → 関数を実行
  ↓
return a + b → 3
  ↓
戻り値の型チェック: 3 は number?
  ↓
✅ OK → 3 を返す
```

**このコードの詳しい説明：**

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

1. `function add`: 関数名は `add`
2. `(a: number, b: number)`: 引数は2つ、どちらも number 型
3. `: number`: 戻り値は number 型
4. `return a + b`: number + number = number

---

**アロー関数：**

```typescript
// 通常の関数
function add(a: number, b: number): number {
  return a + b;
}

// アロー関数（同じ意味）
const add = (a: number, b: number): number => {
  return a + b;
};

// 短縮形（return を省略）
const add = (a: number, b: number): number => a + b;

// 型推論で戻り値の型を省略
const add = (a: number, b: number) => a + b;  // 戻り値は number と推論
```

---

**関数型の定義：**

```typescript
// 関数の型を定義
type MathOperation = (a: number, b: number) => number;

// この型に合う関数を作成
const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;
const divide: MathOperation = (a, b) => a / b;

// 使用
console.log(add(10, 5));       // 15
console.log(subtract(10, 5));  // 5
console.log(multiply(10, 5));  // 50
console.log(divide(10, 5));    // 2
```

---

### オプショナルパラメータ

**`?` で省略可能に：**

```typescript
// greeting は省略可能
function greet(name: string, greeting?: string): string {
  if (greeting) {
    return `${greeting}, ${name}さん`;
  }
  return `こんにちは、${name}さん`;
}

greet("田中");              // "こんにちは、田中さん"
greet("田中", "おはよう");  // "おはよう、田中さん"

// 実行フロー:
greet("田中")
  ↓
greeting は undefined
  ↓
if (greeting) → false
  ↓
return "こんにちは、田中さん"

greet("田中", "おはよう")
  ↓
greeting は "おはよう"
  ↓
if (greeting) → true
  ↓
return "おはよう、田中さん"
```

**オプショナルパラメータの注意点：**

```typescript
// ❌ エラー！オプショナルは最後に
function bad(a?: number, b: number) {
  // 必須パラメータの前にオプショナルは置けない
}

// ✅ OK
function good(a: number, b?: number) {
  // オプショナルパラメータは最後
}

// ✅ 複数のオプショナルパラメータ
function greet(name: string, greeting?: string, emoji?: string): string {
  let result = `${greeting || "こんにちは"}, ${name}さん`;
  if (emoji) {
    result += ` ${emoji}`;
  }
  return result;
}

greet("田中");                        // "こんにちは、田中さん"
greet("田中", "おはよう");            // "おはよう、田中さん"
greet("田中", "おはよう", "☀️");     // "おはよう、田中さん ☀️"
```

---

### デフォルトパラメータ

**デフォルト値を設定：**

```typescript
// greeting のデフォルト値は "こんにちは"
function greet(name: string, greeting: string = "こんにちは"): string {
  return `${greeting}, ${name}さん`;
}

greet("田中");              // "こんにちは、田中さん"
greet("田中", "おはよう");  // "おはよう、田中さん"

// デフォルトパラメータは型推論される
function greet(name: string, greeting = "こんにちは") {
  // greeting は string 型と推論される
  return `${greeting}, ${name}さん`;
}
```

**デフォルトパラメータの実用例：**

```typescript
// ページネーション
function getUsers(page: number = 1, limit: number = 10) {
  console.log(`ページ ${page}、表示件数 ${limit}`);
  // データ取得処理...
}

getUsers();        // ページ 1、表示件数 10
getUsers(2);       // ページ 2、表示件数 10
getUsers(2, 20);   // ページ 2、表示件数 20

// ボタンコンポーネント
function createButton(
  text: string,
  variant: "primary" | "secondary" = "primary",
  size: "small" | "medium" | "large" = "medium"
) {
  console.log(`${size} ${variant} button: ${text}`);
}

createButton("送信");                           // medium primary button: 送信
createButton("キャンセル", "secondary");        // medium secondary button: キャンセル
createButton("削除", "danger", "small");      // small danger button: 削除
```

---

### レストパラメータ

**可変長引数：**

```typescript
// 任意の個数の引数を受け取る
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3);        // 6
sum(1, 2, 3, 4, 5);  // 15
sum();               // 0

// 実行フロー:
sum(1, 2, 3, 4, 5)
  ↓
numbers = [1, 2, 3, 4, 5]
  ↓
reduce で合計を計算
  ↓
0 + 1 = 1
1 + 2 = 3
3 + 3 = 6
6 + 4 = 10
10 + 5 = 15
  ↓
return 15
```

**レストパラメータと通常のパラメータの組み合わせ：**

```typescript
// 最初の引数は通常のパラメータ、残りはレストパラメータ
function log(level: string, ...messages: string[]): void {
  console.log(`[${level}]`, ...messages);
}

log("INFO", "アプリ起動");                    // [INFO] アプリ起動
log("ERROR", "エラー発生", "詳細情報");       // [ERROR] エラー発生 詳細情報

// 配列の最大値を求める
function max(...numbers: number[]): number {
  return Math.max(...numbers);
}

max(1, 5, 3, 9, 2);  // 9

// 文字列を結合
function concat(separator: string, ...strings: string[]): string {
  return strings.join(separator);
}

concat(", ", "りんご", "みかん", "ぶどう");  // "りんご, みかん, ぶどう"
concat(" / ", "東京", "大阪", "名古屋");    // "東京 / 大阪 / 名古屋"
```

---

### 関数オーバーロード

**同じ関数名で異なる型シグネチャ：**

```typescript
// オーバーロードシグネチャ
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;

// 実装シグネチャ
function format(value: string | number | boolean): string {
  if (typeof value === "string") {
    return `"${value}"`;
  } else if (typeof value === "number") {
    return value.toFixed(2);
  } else {
    return value ? "true" : "false";
  }
}

format("hello");   // "\"hello\""
format(123.456);   // "123.46"
format(true);      // "true"

// 実行フロー:
format(123.456)
  ↓
型チェック: number のオーバーロードにマッチ
  ↓
実装を実行: typeof value === "number"
  ↓
value.toFixed(2) → "123.46"
```

**実用的なオーバーロード例：**

```typescript
// 配列またはオブジェクトから値を取得
function get(obj: string[], index: number): string | undefined;
function get(obj: Record<string, any>, key: string): any;

function get(
  obj: string[] | Record<string, any>,
  key: number | string
): any {
  return obj[key as any];
}

const arr = ["a", "b", "c"];
const obj = { name: "田中", age: 25 };

get(arr, 0);       // "a"
get(obj, "name");  // "田中"
```

---

### コールバック関数の型

**関数を引数として受け取る：**

```typescript
// コールバック関数の型
type Callback = (value: number) => void;

function processNumbers(numbers: number[], callback: Callback): void {
  numbers.forEach(callback);
}

// 使用
processNumbers([1, 2, 3], (n) => {
  console.log(n * 2);  // 2, 4, 6
});

// 実行フロー:
processNumbers([1, 2, 3], callback)
  ↓
numbers.forEach(callback)
  ↓
callback(1) → console.log(2)
callback(2) → console.log(4)
callback(3) → console.log(6)
```

**フィルター関数の実装：**

```typescript
type Predicate<T> = (value: T) => boolean;

function filter<T>(array: T[], predicate: Predicate<T>): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (predicate(item)) {
      result.push(item);
    }
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5, 6];
const even = filter(numbers, (n) => n % 2 === 0);  // [2, 4, 6]

const users = [
  { name: "田中", age: 25 },
  { name: "山田", age: 30 },
  { name: "佐藤", age: 20 },
];
const adults = filter(users, (u) => u.age >= 25);  // 田中, 山田
```

---

### 初心者への補足

> 💡 **関数の型のポイント**
> 
> **関数の型定義：**
> ```typescript
> // 基本形
> function name(param: Type): ReturnType { ... }
> 
> // アロー関数
> const name = (param: Type): ReturnType => { ... };
> 
> // 関数型
> type FunctionType = (param: Type) => ReturnType;
> ```
> 
> **パラメータの種類：**
> ```
> 必須パラメータ:       (a: number)
> オプショナル:         (a?: number)
> デフォルト値:         (a: number = 0)
> レストパラメータ:     (...args: number[])
> ```
> 
> **よくある質問：**
> 
> **Q: 戻り値の型は必ず書くべき？**
> A: 型推論で決まる場合は省略できますが、明示的に書く方が安全です。
> 
> **Q: オプショナルとデフォルト値の違いは？**
> A: オプショナルは undefined、デフォルト値は指定した値になります。
> 
> **Q: レストパラメータは配列？**
> A: はい、可変長引数が配列として渡されます。
> 
> **Q: 関数オーバーロードはいつ使う？**
> A: 引数の型によって戻り値の型が変わる場合に便利です。
> 
> **覚えておくこと：**
> - 引数と戻り値に型をつける
> - オプショナルパラメータは `?` をつける
> - レストパラメータで可変長引数
> - コールバック関数も型定義

---

## 6.6 ジェネリクス

### なぜジェネリクスが必要か？

**ジェネリクスなしの問題：**

```typescript
// 数値用の関数
function identityNumber(value: number): number {
  return value;
}

// 文字列用の関数
function identityString(value: string): string {
  return value;
}

// 真偽値用の関数
function identityBoolean(value: boolean): boolean {
  return value;
}

// 問題点:
// ❌ 同じ処理を型ごとに書く必要がある
// ❌ 新しい型が増えるたびに関数を追加
// ❌ コードの重複が多い
```

**ジェネリクスで解決：**

```typescript
// 型を引数のように扱う
function identity<T>(value: T): T {
  return value;
}

// すべての型に対応
const num = identity<number>(123);      // number
const str = identity<string>("hello");  // string
const bool = identity<boolean>(true);   // boolean

// 型推論で型パラメータを省略可能
const num = identity(123);      // number と推論
const str = identity("hello");  // string と推論

// メリット:
// ✅ 1つの関数ですべての型に対応
// ✅ 型安全性を保つ
// ✅ コードの重複がない
```

---

### 基本的なジェネリクス

**型パラメータ `<T>`：**

```typescript
function identity<T>(value: T): T {
  return value;
}

// 実行フロー:
identity<number>(123)
  ↓
T を number に置き換え
  ↓
function identity(value: number): number
  ↓
return 123

identity<string>("hello")
  ↓
T を string に置き換え
  ↓
function identity(value: string): string
  ↓
return "hello"
```

**このコードの詳しい説明：**

```typescript
function identity<T>(value: T): T {
  return value;
}
```

1. `<T>`: 型パラメータ（任意の型を表す）
2. `(value: T)`: 引数は T 型
3. `: T`: 戻り値も T 型
4. `return value`: T 型の値をそのまま返す

---

### 配列とジェネリクス

**配列の要素を取得：**

```typescript
function getFirstElement<T>(array: T[]): T | undefined {
  return array[0];
}

const numbers = [1, 2, 3];
const first = getFirstElement(numbers);  // number | undefined

const names = ["田中", "佐藤"];
const firstName = getFirstElement(names);  // string | undefined

// 実行フロー:
getFirstElement([1, 2, 3])
  ↓
型推論: T は number
  ↓
array[0] → 1 (number | undefined)

getFirstElement(["田中", "佐藤"])
  ↓
型推論: T は string
  ↓
array[0] → "田中" (string | undefined)
```

**配列の最後の要素：**

```typescript
function getLastElement<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

const last = getLastElement([1, 2, 3, 4, 5]);  // 5 (number | undefined)
```

---

### インターフェースとジェネリクス

**ジェネリックなインターフェース：**

```typescript
// Box インターフェース（任意の型を格納）
interface Box<T> {
  value: T;
}

// 数値の Box
const numberBox: Box<number> = { value: 123 };

// 文字列の Box
const stringBox: Box<string> = { value: "hello" };

// オブジェクトの Box
interface User {
  name: string;
  age: number;
}

const userBox: Box<User> = {
  value: { name: "田中", age: 25 },
};

// メモリイメージ:
// numberBox: Box<number>
//   ↓
// { value: 123 }
//          ↑
//        number

// stringBox: Box<string>
//   ↓
// { value: "hello" }
//          ↑
//        string
```

**レスポンス型の定義：**

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ユーザー取得のレスポンス
const userResponse: ApiResponse<User> = {
  data: { name: "田中", age: 25 },
  status: 200,
  message: "成功",
};

// ユーザー一覧のレスポンス
const usersResponse: ApiResponse<User[]> = {
  data: [
    { name: "田中", age: 25 },
    { name: "山田", age: 30 },
  ],
  status: 200,
  message: "成功",
};
```

---

### 複数の型パラメータ

**2つの型パラメータ：**

```typescript
// キーと値のペア
interface Pair<K, V> {
  key: K;
  value: V;
}

const pair1: Pair<string, number> = {
  key: "age",
  value: 25,
};

const pair2: Pair<number, string> = {
  key: 1,
  value: "田中",
};

// Map 関数
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

const numbers = [1, 2, 3];
const strings = map(numbers, (n) => n.toString());  // ["1", "2", "3"]
//                            ↑          ↑
//                         T=number   U=string
```

---

### ジェネリックの制約

**型パラメータに制約をつける：**

```typescript
// T は length プロパティを持つ型に限定
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

getLength("hello");       // 5 (string は length を持つ)
getLength([1, 2, 3]);     // 3 (array は length を持つ)
getLength({ length: 10 }); // 10 (length プロパティを持つ)
getLength(123);            // ❌ エラー！number は length を持たない

// 実行フロー:
getLength("hello")
  ↓
型チェック: string は { length: number } を満たす?
  ↓
✅ OK (string.length は number)
  ↓
return "hello".length → 5
```

**オブジェクトのプロパティにアクセス：**

```typescript
// T のキーのみ許可
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = {
  name: "田中",
  age: 25,
};

getProperty(user, "name");   // "田中" (string)
getProperty(user, "age");    // 25 (number)
getProperty(user, "email");  // ❌ エラー！"email" は user のキーではない
```

---

### クラスとジェネリクス

**ジェネリッククラス：**

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }
}

// 数値のスタック
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);
console.log(numberStack.pop());  // 3

// 文字列のスタック
const stringStack = new Stack<string>();
stringStack.push("a");
stringStack.push("b");
console.log(stringStack.pop());  // "b"
```

---

### React でのジェネリクス

**useState フック：**

```typescript
import { useState } from "react";

// 数値の state
const [count, setCount] = useState<number>(0);
setCount(10);     // ✅ OK
setCount("10");   // ❌ エラー！

// 文字列の state
const [name, setName] = useState<string>("");
setName("田中");  // ✅ OK

// 配列の state
interface User {
  id: number;
  name: string;
}

const [users, setUsers] = useState<User[]>([]);
setUsers([{ id: 1, name: "田中" }]);  // ✅ OK

// オブジェクトの state（null許可）
const [user, setUser] = useState<User | null>(null);
setUser({ id: 1, name: "田中" });     // ✅ OK
setUser(null);                        // ✅ OK
```

**カスタムフックでジェネリクス：**

```typescript
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data: T) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// 使用
interface User {
  id: number;
  name: string;
}

const { data: user } = useFetch<User>("/api/user/1");
const { data: users } = useFetch<User[]>("/api/users");
```

---

### 初心者への補足

> 💡 **ジェネリクスのポイント**
> 
> **基本的な考え方：**
> ```typescript
> // ジェネリクスなし: 型ごとに関数を作る
> function identityNumber(x: number): number { return x; }
> function identityString(x: string): string { return x; }
> 
> // ジェネリクス: 1つの関数ですべての型に対応
> function identity<T>(x: T): T { return x; }
> ```
> 
> **型パラメータの命名：**
> ```
> T  → Type（一般的な型）
> K  → Key（キー）
> V  → Value（値）
> E  → Element（要素）
> R  → Return（戻り値）
> ```
> 
> **制約をつける：**
> ```typescript
> // 制約なし
> function func<T>(value: T) { ... }
> 
> // 制約あり
> function func<T extends SomeType>(value: T) { ... }
> ```
> 
> **よくある質問：**
> 
> **Q: いつジェネリクスを使うべき？**
> A: 複数の型で同じ処理をしたいときに使います。
> 
> **Q: 型パラメータは必ず `<T>` ？**
> A: いいえ、`<Type>` や `<U>` など、わかりやすい名前をつけられます。
> 
> **Q: 型推論で省略できる？**
> A: はい、多くの場合、引数から型を推論してくれます。
> 
> **Q: React でジェネリクスはどこで使う？**
> A: `useState`、カスタムフック、コンポーネントの Props などで使います。
> 
> **覚えておくこと：**
> - ジェネリクス: 型を引数のように扱う
> - `<T>`: 型パラメータ
> - 制約: `extends` で型を限定
> - React: `useState<Type>()` で型を指定

---

## 6.7 TypeScriptとReact

### コンポーネントのProps

**基本的なProps定義：**

```tsx
// Props の型定義
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

function Button({ 
  text, 
  onClick, 
  disabled = false, 
  variant = "primary" 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {text}
    </button>
  );
}

// 使用
<Button text="送信" onClick={() => console.log("clicked")} />
<Button text="キャンセル" onClick={handleCancel} variant="secondary" />
<Button text="削除" onClick={handleDelete} variant="danger" disabled />
```

**実行フロー：**

```
<Button text="送信" onClick={...} />
  ↓
Props の型チェック: ButtonProps に一致？
  ↓
text: string ✅
onClick: () => void ✅
disabled: undefined → デフォルト値 false
variant: undefined → デフォルト値 "primary"
  ↓
Button コンポーネントをレンダリング
```

---

**複雑なProps：**

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

function UserCard({ 
  user, 
  onEdit, 
  onDelete, 
  showActions = true 
}: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {showActions && (
        <div>
          {onEdit && <button onClick={() => onEdit(user)}>編集</button>}
          {onDelete && <button onClick={() => onDelete(user.id)}>削除</button>}
        </div>
      )}
    </div>
  );
}
```

---

### children を含む Props

**React.ReactNode 型：**

```tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-content">{children}</div>
    </div>
  );
}

// 使用
<Card title="プロフィール">
  <p>名前: 田中</p>
  <p>年齢: 25歳</p>
  <p>職業: エンジニア</p>
</Card>

// children の型:
// React.ReactNode = 
//   - string
//   - number
//   - React要素
//   - React要素の配列
//   - null
//   - undefined
```

---

### イベントハンドラの型

**主なイベント型：**

```tsx
function EventExample() {
  // 入力イベント（input, textarea）
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  // フォーム送信イベント
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("送信");
  };

  // クリックイベント（button, div など）
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("クリック位置:", e.clientX, e.clientY);
  };

  // キーボードイベント
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Enter キーが押されました");
    }
  };

  // フォーカスイベント
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log("フォーカス");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        onChange={handleChange} 
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      />
      <button onClick={handleClick}>送信</button>
    </form>
  );
}
```

**イベントハンドラの型一覧：**

```
React.ChangeEvent<T>     → input, textarea, select の変更
React.FormEvent<T>       → form の送信
React.MouseEvent<T>      → マウスクリック、移動
React.KeyboardEvent<T>   → キーボード入力
React.FocusEvent<T>      → フォーカス、ブラー
React.TouchEvent<T>      → タッチイベント（モバイル）
React.WheelEvent<T>      → マウスホイール
```

---

### useState の型

**基本的な使い方：**

```tsx
import { useState } from "react";

// 数値の state
const [count, setCount] = useState<number>(0);
setCount(10);     // ✅ OK
setCount("10");   // ❌ エラー！

// 文字列の state
const [name, setName] = useState<string>("");
setName("田中");  // ✅ OK

// 真偽値の state
const [isLoading, setIsLoading] = useState<boolean>(false);
setIsLoading(true);  // ✅ OK

// 型推論で省略可能
const [count, setCount] = useState(0);  // number と推論
const [name, setName] = useState("");   // string と推論
```

**配列とオブジェクトの state：**

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

// 配列の state
const [users, setUsers] = useState<User[]>([]);
setUsers([
  { id: 1, name: "田中", email: "tanaka@example.com" },
  { id: 2, name: "山田", email: "yamada@example.com" },
]);

// オブジェクトの state（null 許可）
const [user, setUser] = useState<User | null>(null);
setUser({ id: 1, name: "田中", email: "tanaka@example.com" });  // ✅ OK
setUser(null);  // ✅ OK

// undefined 許可
const [user, setUser] = useState<User | undefined>(undefined);
```

---

### useEffect の型

**基本的な使い方：**

```tsx
useEffect(() => {
  // 副作用の処理
  console.log("マウント時に実行");

  // クリーンアップ関数
  return () => {
    console.log("アンマウント時に実行");
  };
}, []); // 依存配列

// 実行フロー:
// コンポーネントマウント
//   ↓
// useEffect の処理を実行
//   ↓
// コンポーネントアンマウント
//   ↓
// クリーンアップ関数を実行
```

**データ取得の例：**

```tsx
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("エラー:", error);
    }
  };

  fetchUsers();
}, []); // 空配列: マウント時のみ実行
```

---

### useRef の型

**DOM 要素への参照：**

```tsx
import { useRef } from "react";

function InputFocus() {
  // input 要素への参照
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    // フォーカスを設定
    inputRef.current?.focus();
  };

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handleClick}>フォーカス</button>
    </div>
  );
}

// 各要素の型:
// HTMLInputElement      → <input>
// HTMLButtonElement     → <button>
// HTMLDivElement        → <div>
// HTMLTextAreaElement   → <textarea>
// HTMLSelectElement     → <select>
```

**値の保持：**

```tsx
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    intervalRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={start}>開始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}
```

---

### カスタムフックの型

**基本的なカスタムフック：**

```tsx
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

// 使用
function CounterComponent() {
  const { count, increment, decrement, reset } = useCounter(10);

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>リセット</button>
    </div>
  );
}
```

**ジェネリックなカスタムフック：**

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// 使用
function UserPreferences() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
  const [fontSize, setFontSize] = useLocalStorage<number>("fontSize", 16);

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
        <option value="light">ライト</option>
        <option value="dark">ダーク</option>
      </select>
      <input 
        type="number" 
        value={fontSize} 
        onChange={(e) => setFontSize(Number(e.target.value))}
      />
    </div>
  );
}
```

---

### 初心者への補足

> 💡 **TypeScript と React のポイント**
> 
> **Props の型定義：**
> ```tsx
> interface Props {
>   required: string;        // 必須
>   optional?: number;       // オプション
>   children?: React.ReactNode;  // 子要素
> }
> ```
> 
> **イベントハンドラの型：**
> ```
> input, textarea → React.ChangeEvent<HTMLInputElement>
> button          → React.MouseEvent<HTMLButtonElement>
> form            → React.FormEvent<HTMLFormElement>
> keyboard        → React.KeyboardEvent<HTMLInputElement>
> ```
> 
> **useState の型：**
> ```tsx
> // 明示的
> useState<Type>(initialValue)
> 
> // 型推論
> useState(initialValue)  // 型は自動で決まる
> ```
> 
> **よくある質問：**
> 
> **Q: Props の型は interface と type、どっち？**
> A: interface が一般的ですが、どちらでも OK です。
> 
> **Q: children の型は？**
> A: `React.ReactNode` を使います（文字列、数値、要素すべて OK）。
> 
> **Q: イベントハンドラの型がわからない？**
> A: エディタの補完機能を使うと、正しい型が提案されます。
> 
> **Q: useState で null を許可するには？**
> A: `useState<Type | null>(null)` と書きます。
> 
> **覚えておくこと：**
> - Props: interface で定義
> - children: React.ReactNode
> - イベント: React.XxxEvent<要素>
> - useState: 型推論が便利
> - useRef: DOM要素の型を指定

---

## 6.8 ユーティリティ型

TypeScriptには便利な組み込みの型があります。

### Partial<T>

すべてのプロパティをオプショナルにします：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// すべてのプロパティがオプショナルになる
type PartialUser = Partial<User>;

// 以下と同じ
type PartialUser = {
  id?: number;
  name?: string;
  email?: string;
  age?: number;
};

// 使用例：更新時に一部だけ指定
function updateUser(id: number, updates: Partial<User>) {
  // updatesは一部のプロパティだけでOK
}

updateUser(1, { name: '田中' });
updateUser(2, { age: 26, email: 'new@example.com' });
```

### Required<T>

すべてのプロパティを必須にします：

```typescript
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

// すべて必須になる
type RequiredConfig = Required<Config>;

const config: RequiredConfig = {
  host: 'localhost',
  port: 3000,
  debug: true
  // すべて指定しないとエラー
};
```

### Readonly<T>

すべてのプロパティを読み取り専用にします：

```typescript
interface User {
  id: number;
  name: string;
}

const user: Readonly<User> = {
  id: 1,
  name: '田中'
};

user.name = '佐藤';  // エラー！変更できない
```

### Pick<T, K>

特定のプロパティだけを抽出します：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  bio: string;
}

// idとnameだけを持つ型
type UserPreview = Pick<User, 'id' | 'name'>;

// 以下と同じ
type UserPreview = {
  id: number;
  name: string;
};
```

### Omit<T, K>

特定のプロパティを除外します：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// passwordを除外
type SafeUser = Omit<User, 'password'>;

// 以下と同じ
type SafeUser = {
  id: number;
  name: string;
  email: string;
};
```

### Record<K, T>

キーと値の型を指定したオブジェクトを作ります：

```typescript
// キーがstring、値がnumberのオブジェクト
type Scores = Record<string, number>;

const scores: Scores = {
  math: 90,
  english: 85,
  science: 95
};

// より具体的な例
type Role = 'admin' | 'editor' | 'viewer';
type Permission = { read: boolean; write: boolean; delete: boolean };

const permissions: Record<Role, Permission> = {
  admin: { read: true, write: true, delete: true },
  editor: { read: true, write: true, delete: false },
  viewer: { read: true, write: false, delete: false }
};
```

---

## 6.9 型アサーション

型アサーションは、「この値は確実にこの型だ」とコンパイラに伝える機能です。

### as構文

```typescript
// DOMからの取得（HTMLElementとして扱われる）
const input = document.getElementById('username');

// HTMLInputElementとしてアサーション
const input = document.getElementById('username') as HTMLInputElement;

// これでvalueプロパティが使える
console.log(input.value);
```

### 非nullアサーション

`!`を付けると、「この値はnullやundefinedではない」と主張できます：

```typescript
function findUser(id: number): User | undefined {
  // ...
}

const user = findUser(1);
console.log(user.name);   // エラー！undefinedの可能性

const user = findUser(1)!;
console.log(user.name);   // OK（ただし実行時エラーの危険あり）

// より安全な方法
const user = findUser(1);
if (user) {
  console.log(user.name);  // 型ガードで安全
}
```

---

## 6.10 実践例：型安全なAPI呼び出し

```typescript
// APIのレスポンス型定義
interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface ApiResponse<T> {
  data: T;
  error: string | null;
}

// 投稿一覧を取得
async function getPosts(): Promise<Post[]> {
  const response = await fetch('/api/posts');
  const result: ApiResponse<Post[]> = await response.json();
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result.data;
}

// 投稿を作成
interface CreatePostInput {
  title: string;
  content: string;
}

async function createPost(input: CreatePostInput): Promise<Post> {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  
  const result: ApiResponse<Post> = await response.json();
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result.data;
}

// Reactコンポーネントで使用
function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <p>読み込み中...</p>;
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

---

## 6.11 tsconfig.json

TypeScriptの設定ファイルです。

**tsconfig.json:**

```json
{
  "compilerOptions": {
    // ターゲットのJavaScriptバージョン
    "target": "ES2022",
    
    // モジュールシステム
    "module": "ESNext",
    "moduleResolution": "Bundler",
    
    // JSX（React）のサポート
    "jsx": "preserve",
    
    // 型チェックの厳密さ
    "strict": true,                      // すべての厳密チェックを有効化
    "noImplicitAny": true,              // 暗黙のanyを禁止
    "strictNullChecks": true,           // null/undefinedを厳密にチェック
    "strictFunctionTypes": true,        // 関数の型を厳密にチェック
    
    // その他の設定
    "esModuleInterop": true,            // CommonJSモジュールの互換性
    "skipLibCheck": true,               // .d.tsファイルのチェックをスキップ
    "forceConsistentCasingInFileNames": true,
    
    // パスエイリアス
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## 6.12 よくあるエラーと対処法

### 1. 'xxx' is possibly 'undefined'

```typescript
// エラー
const user = users.find(u => u.id === 1);
console.log(user.name);  // エラー！userはundefinedかもしれない

// 対処法1: オプショナルチェーン
console.log(user?.name);

// 対処法2: 型ガード
if (user) {
  console.log(user.name);
}

// 対処法3: デフォルト値
const name = user?.name ?? 'ゲスト';
```

### 2. Type 'xxx' is not assignable to type 'yyy'

```typescript
// エラー
let status: 'active' | 'inactive' = 'pending';  // エラー！

// 対処法：正しい値を使う
let status: 'active' | 'inactive' = 'active';
```

### 3. Property 'xxx' does not exist on type 'yyy'

```typescript
// エラー
const input = document.getElementById('username');
input.value = 'test';  // エラー！HTMLElementにはvalueがない

// 対処法：型アサーション
const input = document.getElementById('username') as HTMLInputElement;
input.value = 'test';  // OK
```

---

## まとめ

この章では、**TypeScript** の基礎から実践的な使い方まで学びました。

### この章で学んだこと

**1. TypeScript の基本**
- ✅ TypeScript とは：JavaScript に型システムを追加した言語
- ✅ なぜ TypeScript？：バグの早期発見、IDE サポート、安全なリファクタリング
- ✅ コンパイルフロー：TypeScript (.ts) → JavaScript (.js)

**2. 基本的な型**
- ✅ プリミティブ型：string, number, boolean, null, undefined
- ✅ 配列型：number[], string[], Array<T>
- ✅ タプル型：[string, number] 固定長・固定型
- ✅ オブジェクト型：{ name: string; age: number }
- ✅ 特殊な型：any（避ける）、unknown（安全）、void、never

**3. 型の定義と再利用**
- ✅ 型エイリアス：`type User = { ... }` で型に名前をつける
- ✅ インターフェース：`interface User { ... }` でオブジェクトの形を定義
- ✅ 使い分け：オブジェクト型は interface、その他は type

**4. ユニオン型とリテラル型**
- ✅ ユニオン型：`number | string` 複数の型を許容
- ✅ リテラル型：`"active" | "inactive"` 特定の値のみ
- ✅ 型ガード：typeof, instanceof, in で型を絞り込む
- ✅ 判別可能なユニオン：共通プロパティで型を判別

**5. 関数の型**
- ✅ 基本的な型定義：引数と戻り値に型をつける
- ✅ オプショナルパラメータ：`?` で省略可能に
- ✅ デフォルトパラメータ：デフォルト値を設定
- ✅ レストパラメータ：可変長引数 `...args: number[]`
- ✅ 関数オーバーロード：同じ関数名で異なる型シグネチャ

**6. ジェネリクス**
- ✅ 型を引数のように扱う：`<T>` で型パラメータ
- ✅ 配列とジェネリクス：`Array<T>`, `T[]`
- ✅ インターフェースとジェネリクス：`interface Box<T>`
- ✅ 制約：`<T extends Type>` で型を限定
- ✅ React での利用：`useState<Type>()`

**7. TypeScript と React**
- ✅ Props の型定義：interface でコンポーネントの Props を定義
- ✅ children の型：`React.ReactNode` を使う
- ✅ イベントハンドラの型：`React.XxxEvent<HTMLElement>`
- ✅ useState の型：`useState<Type>(initialValue)`
- ✅ useRef の型：`useRef<HTMLElement>(null)`
- ✅ カスタムフック：戻り値の型を明示

**8. ユーティリティ型**
- ✅ `Partial<T>`：すべてオプショナルに
- ✅ `Required<T>`：すべて必須に
- ✅ `Readonly<T>`：すべて読み取り専用に
- ✅ `Pick<T, K>`：特定プロパティを抽出
- ✅ `Omit<T, K>`：特定プロパティを除外
- ✅ `Record<K, T>`：キーと値の型を指定

**9. 型アサーション**
- ✅ `as` 構文：型を明示的に指定
- ✅ 非 null アサーション：`!` で null/undefined でないと主張
- ✅ const アサーション：`as const` でリテラル型に

**10. 実践例**
- ✅ 型安全な API 呼び出し：型定義で安全なデータ取得
- ✅ tsconfig.json：TypeScript の設定ファイル
- ✅ よくあるエラーと対処法：実践的な問題解決

---

### TypeScript のベストプラクティス

```
1. any を避ける
   - unknown を使う
   - 型を明示的に定義する

2. 型推論を活用
   - 書かなくても型が決まる場合は省略
   - ただし関数の戻り値は明示推奨

3. strictモードを有効化
   - tsconfig.json で strict: true
   - より安全な型チェック

4. null安全を意識
   - オプショナルチェーン (?.)
   - Null合体演算子 (??)

5. 適切な型を選ぶ
   - interface: オブジェクト型
   - type: ユニオン型、リテラル型
   - enum: 定数の集合（使いすぎ注意）

6. ジェネリクスを活用
   - 再利用可能なコード
   - 型安全性を保つ

7. 型ガードで安全に
   - typeof, instanceof, in
   - カスタム型ガード関数
```

---

### よく使う型パターン

**API レスポンス：**
```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  error?: string;
}
```

**ステート管理：**
```typescript
type LoadingState = "idle" | "loading" | "success" | "error";

interface DataState<T> {
  status: LoadingState;
  data: T | null;
  error: string | null;
}
```

**React コンポーネント：**
```typescript
interface ComponentProps {
  required: string;
  optional?: number;
  children?: React.ReactNode;
  onAction: (value: string) => void;
}
```

**フォームデータ：**
```typescript
interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;
```

---

### TypeScript 学習リソース

**公式ドキュメント：**
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- TypeScript Playground: https://www.typescriptlang.org/play

**実践的な学習：**
- 本プロジェクトのコードを読む
- エディタの型エラーから学ぶ
- 型定義ファイル (.d.ts) を読む

**コミュニティ：**
- DefinitelyTyped: 型定義のリポジトリ
- TypeScript GitHub: Issue や Discussion

---

### 次のステップ

TypeScript の基礎を学んだので、次は **Tailwind CSS** を学びましょう：

**第7章：Tailwind CSS入門**
- ✅ ユーティリティファーストの CSS フレームワーク
- ✅ 本プロジェクトで使用しているスタイリング手法
- ✅ レスポンシブデザインの実装
- ✅ カスタムスタイルの作成

TypeScript の知識は、React や Next.js と組み合わせることで、より型安全で保守しやすいアプリケーション開発が可能になります。本プロジェクトのコードを読みながら、実践的な TypeScript の使い方を学んでいきましょう。

---

**💡 覚えておくべき重要ポイント：**

```typescript
// 1. 型を明示する
const name: string = "田中";

// 2. 型推論を活用
const name = "田中";  // string と推論

// 3. ユニオン型で柔軟に
const id: number | string = 123;

// 4. リテラル型で制限
const status: "active" | "inactive" = "active";

// 5. interface でオブジェクト型
interface User {
  name: string;
  age: number;
}

// 6. ジェネリクスで再利用
function identity<T>(value: T): T {
  return value;
}

// 7. React での型定義
interface Props {
  title: string;
  children: React.ReactNode;
}

// 8. 型ガードで安全に
if (typeof value === "string") {
  // value は string 型
}

// 9. any を避け、unknown を使う
let data: unknown = fetchData();
if (typeof data === "string") {
  // data は string 型
}

// 10. ユーティリティ型で便利に
type PartialUser = Partial<User>;
type UserPreview = Pick<User, "name" | "age">;
```

---

[← 前の章：第5章 Next.js入門](05-Next.js入門.md) | [目次に戻る](00-目次.md) | [次の章へ：第7章 Tailwind CSS入門 →](07-Tailwind-CSS入門.md)
