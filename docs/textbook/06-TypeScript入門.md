# 第6章：TypeScript入門

この章では、**TypeScript**の基本を学びます。本プロジェクトもTypeScriptで書かれており、型安全なコードを書くために重要な知識です。

## 6.1 TypeScriptとは

### TypeScriptの特徴

**TypeScript**は、JavaScriptに**型システム**を追加した言語です。Microsoft社が開発しています。

**JavaScriptとの違い：**

```javascript
// JavaScript（型なし）
function add(a, b) {
  return a + b;
}

add(1, 2);        // 3
add("1", "2");    // "12" （文字列連結）
add(1, "2");      // "12" （予期しない動作）
```

```typescript
// TypeScript（型あり）
function add(a: number, b: number): number {
  return a + b;
}

add(1, 2);        // 3
add("1", "2");    // エラー！文字列は渡せない
add(1, "2");      // エラー！型が違う
```

**TypeScriptの利点：**

1. **バグの早期発見**: コンパイル時にエラーを検出
2. **IDEの補完**: エディタが自動補完してくれる
3. **リファクタリングが安全**: 型があるので変更の影響範囲がわかる
4. **ドキュメントになる**: 型が仕様書の役割を果たす

---

## 6.2 基本的な型

### プリミティブ型

```typescript
// 文字列
let name: string = '田中';
name = 123;  // エラー！数値は代入できない

// 数値
let age: number = 25;
age = '25';  // エラー！

// 真偽値
let isStudent: boolean = true;
isStudent = 'true';  // エラー！

// null と undefined
let empty: null = null;
let notDefined: undefined = undefined;
```

### 型推論

TypeScriptは型を自動的に推論してくれます：

```typescript
// 型を明示的に書く
let name: string = '田中';

// 型推論（自動で型が決まる）
let name = '田中';  // string型と推論される

// 型推論の例
let count = 0;           // number
let flag = true;         // boolean
let list = [1, 2, 3];    // number[]
```

> 💡 **ポイント**: 型推論が効く場合は、わざわざ型を書かなくてもOKです。

### 配列

```typescript
// 数値の配列
let numbers: number[] = [1, 2, 3, 4, 5];

// 文字列の配列
let names: string[] = ['田中', '佐藤', '鈴木'];

// ジェネリック構文（同じ意味）
let numbers: Array<number> = [1, 2, 3];

// エラー例
let numbers: number[] = [1, 2, '3'];  // エラー！文字列が混ざっている
```

### タプル

**タプル**は、固定長で各要素の型が決まっている配列です：

```typescript
// [文字列, 数値]のタプル
let user: [string, number] = ['田中', 25];

console.log(user[0]);  // '田中' (string)
console.log(user[1]);  // 25 (number)

// エラー例
let user: [string, number] = [25, '田中'];  // エラー！順序が逆
let user: [string, number] = ['田中'];      // エラー！要素が足りない
```

### オブジェクト

```typescript
// オブジェクトの型定義
let user: {
  name: string;
  age: number;
  email: string;
} = {
  name: '田中',
  age: 25,
  email: 'tanaka@example.com'
};

// エラー例
let user: {
  name: string;
  age: number;
} = {
  name: '田中'
  // エラー！ageが足りない
};
```

### any型（なるべく避ける）

**any**は「どんな型でもOK」という型です：

```typescript
let anything: any = 'hello';
anything = 123;       // OK
anything = true;      // OK
anything.foo();       // OK（実行時エラーになる可能性あり）
```

> ⚠️ **注意**: `any`を使うとTypeScriptの利点が失われるので、なるべく避けましょう。

### unknown型（anyの安全版）

```typescript
let value: unknown = 'hello';

// エラー！unknownは直接使えない
console.log(value.toUpperCase());

// 型チェックしてから使う
if (typeof value === 'string') {
  console.log(value.toUpperCase());  // OK
}
```

### void型

関数が値を返さないときに使います：

```typescript
function logMessage(message: string): void {
  console.log(message);
  // returnがない、またはreturn;のみ
}
```

### never型

絶対に到達しない値の型です：

```typescript
// 常にエラーを投げる関数
function throwError(message: string): never {
  throw new Error(message);
}

// 無限ループ
function infiniteLoop(): never {
  while (true) {
    // ...
  }
}
```

---

## 6.3 型エイリアスとインターフェース

### 型エイリアス（Type Alias）

型に名前を付けて再利用できます：

```typescript
// 型エイリアスの定義
type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

// 使用
const user1: User = {
  id: 1,
  name: '田中',
  email: 'tanaka@example.com',
  age: 25
};

const user2: User = {
  id: 2,
  name: '佐藤',
  email: 'sato@example.com',
  age: 30
};
```

### インターフェース（Interface）

オブジェクトの形を定義します：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const user: User = {
  id: 1,
  name: '田中',
  email: 'tanaka@example.com',
  age: 25
};
```

### 型エイリアス vs インターフェース

```typescript
// 型エイリアス：様々な型を定義できる
type ID = number | string;
type Status = 'active' | 'inactive';

// インターフェース：オブジェクトの形を定義
interface User {
  id: number;
  name: string;
}

// インターフェースは拡張できる
interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

// 型エイリアスも拡張できる（交差型）
type AdminUser = User & {
  role: 'admin';
  permissions: string[];
};
```

> 💡 **使い分け**: 基本的にはどちらでもOKですが、オブジェクトの型定義には**interface**、その他は**type**が一般的です。

### オプショナルプロパティ

`?`を付けると、省略可能なプロパティになります：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;      // オプショナル
  bio?: string;      // オプショナル
}

// ageとbioは省略できる
const user1: User = {
  id: 1,
  name: '田中',
  email: 'tanaka@example.com'
};

// もちろん指定してもOK
const user2: User = {
  id: 2,
  name: '佐藤',
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

### ユニオン型

複数の型のいずれかを表します：

```typescript
// numberまたはstring
let id: number | string;

id = 123;      // OK
id = 'abc';    // OK
id = true;     // エラー！booleanは含まれていない

// 関数の例
function printId(id: number | string) {
  console.log(`ID: ${id}`);
}

printId(123);    // OK
printId('abc');  // OK
```

### 型ガード

ユニオン型を使うとき、型を絞り込む必要があります：

```typescript
function printId(id: number | string) {
  // エラー！numberにはtoUpperCaseがない
  // console.log(id.toUpperCase());
  
  // 型ガード（typeof）
  if (typeof id === 'string') {
    console.log(id.toUpperCase());  // OK（stringと確定）
  } else {
    console.log(id.toFixed(2));     // OK（numberと確定）
  }
}
```

### リテラル型

特定の値のみを許可する型です：

```typescript
// 文字列リテラル型
let status: 'success' | 'error' | 'loading';

status = 'success';  // OK
status = 'error';    // OK
status = 'fail';     // エラー！この値は許可されていない

// 数値リテラル型
let dice: 1 | 2 | 3 | 4 | 5 | 6;

dice = 3;   // OK
dice = 7;   // エラー！

// 関数の例
function setStatus(status: 'active' | 'inactive') {
  console.log(`Status: ${status}`);
}

setStatus('active');    // OK
setStatus('pending');   // エラー！
```

---

## 6.5 関数の型

### 関数の型定義

```typescript
// パラメータと戻り値の型を指定
function add(a: number, b: number): number {
  return a + b;
}

// アロー関数
const subtract = (a: number, b: number): number => {
  return a - b;
};

// 戻り値の型は推論されるので省略できる
const multiply = (a: number, b: number) => a * b;
```

### オプショナルパラメータ

```typescript
function greet(name: string, greeting?: string): string {
  if (greeting) {
    return `${greeting}, ${name}さん`;
  }
  return `こんにちは、${name}さん`;
}

greet('田中');              // 'こんにちは、田中さん'
greet('田中', 'おはよう');  // 'おはよう、田中さん'
```

### デフォルトパラメータ

```typescript
function greet(name: string, greeting: string = 'こんにちは'): string {
  return `${greeting}, ${name}さん`;
}

greet('田中');              // 'こんにちは、田中さん'
greet('田中', 'おはよう');  // 'おはよう、田中さん'
```

### レストパラメータ

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3);        // 6
sum(1, 2, 3, 4, 5);  // 15
```

### 関数型

```typescript
// 関数の型を定義
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;
```

---

## 6.6 ジェネリクス

**ジェネリクス**は、型を引数のように扱える機能です。

### 基本的なジェネリクス

```typescript
// ジェネリクスを使わない場合
function identityNumber(value: number): number {
  return value;
}

function identityString(value: string): string {
  return value;
}

// ジェネリクスを使う場合
function identity<T>(value: T): T {
  return value;
}

// 使用
const num = identity<number>(123);      // number
const str = identity<string>('hello');  // string

// 型推論が効くので省略可能
const num = identity(123);      // number
const str = identity('hello');  // string
```

### 配列とジェネリクス

```typescript
function getFirstElement<T>(array: T[]): T | undefined {
  return array[0];
}

const numbers = [1, 2, 3];
const first = getFirstElement(numbers);  // number | undefined

const names = ['田中', '佐藤'];
const firstName = getFirstElement(names);  // string | undefined
```

### インターフェースとジェネリクス

```typescript
interface Box<T> {
  value: T;
}

const numberBox: Box<number> = { value: 123 };
const stringBox: Box<string> = { value: 'hello' };

// 配列もジェネリクス
const numbers: Array<number> = [1, 2, 3];
```

### Reactでのジェネリクス

```typescript
// useState（Reactのフック）
const [count, setCount] = useState<number>(0);
const [name, setName] = useState<string>('');

// 配列のstate
const [users, setUsers] = useState<User[]>([]);

// オブジェクトのstate
const [user, setUser] = useState<User | null>(null);
```

---

## 6.7 TypeScriptとReact

### コンポーネントのProps

```tsx
// Propsの型定義
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

function Button({ text, onClick, disabled = false, variant = 'primary' }: ButtonProps) {
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
<Button text="送信" onClick={() => console.log('clicked')} />
<Button text="キャンセル" onClick={handleCancel} variant="secondary" />
```

### childrenを含むProps

```tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

// 使用
<Card title="プロフィール">
  <p>名前: 田中</p>
  <p>年齢: 25歳</p>
</Card>
```

### イベントハンドラの型

```tsx
function SearchForm() {
  const [query, setQuery] = useState('');
  
  // 入力イベント
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  // フォーム送信イベント
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('検索:', query);
  };
  
  // クリックイベント
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('クリック');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={handleChange} />
      <button onClick={handleClick}>検索</button>
    </form>
  );
}
```

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

この章では、TypeScriptの基本を学びました：

### 型システム
- ✅ **基本型**: string, number, boolean, array, object
- ✅ **ユニオン型**: 複数の型のいずれか
- ✅ **リテラル型**: 特定の値のみ許可

### 型定義
- ✅ **型エイリアス**: `type`で型に名前を付ける
- ✅ **インターフェース**: `interface`でオブジェクトの形を定義

### 高度な機能
- ✅ **ジェネリクス**: 型を引数のように扱う
- ✅ **ユーティリティ型**: Partial, Required, Pick, Omit等

### React連携
- ✅ **Propsの型定義**: コンポーネントのPropsに型を付ける
- ✅ **イベントハンドラ**: React特有のイベント型

次の章では、**Tailwind CSS**について学びます。本プロジェクトでも使用しているユーティリティファーストのCSSフレームワークです。

---

[← 前の章：第5章 Next.js入門](05-Next.js入門.md) | [目次に戻る](00-目次.md) | [次の章へ：第7章 Tailwind CSS入門 →](07-Tailwind-CSS入門.md)
