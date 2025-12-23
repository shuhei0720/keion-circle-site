# 第3章：モダンJavaScriptの基礎

この章では、**ES6以降のモダンJavaScript**の機能を学びます。これらはReactやNext.jsを使う上で必須の知識です。

## 3.1 ES6とは

**ES6**（ECMAScript 2015）は、JavaScriptの大幅なアップデートです。それ以降も毎年新機能が追加されています。

**主な新機能：**
- letとconst
- アロー関数
- テンプレートリテラル
- 分割代入
- スプレッド構文
- プロミス（非同期処理）
- クラス
- モジュール

---

## 3.2 let と const（再確認）

```javascript
// const: 再代入できない（基本はこちらを使う）
const name = '田中';
// name = '佐藤';  // エラー！

// ただし、オブジェクトや配列の中身は変更できる
const user = { name: '田中' };
user.name = '佐藤';  // OK

const numbers = [1, 2, 3];
numbers.push(4);     // OK
// numbers = [5, 6];  // エラー！

// let: 再代入できる
let count = 0;
count = 1;  // OK
```

> 💡 **ベストプラクティス**: 基本的に`const`を使い、再代入が必要なときだけ`let`を使います。

---

## 3.3 アロー関数

アロー関数は、関数をより短く書ける書き方です。

### 基本の書き方

```javascript
// 従来の関数
function add(a, b) {
  return a + b;
}

// アロー関数
const add = (a, b) => {
  return a + b;
};

// 1行なら{}とreturnを省略できる
const add = (a, b) => a + b;

// 引数が1つなら()も省略できる
const double = n => n * 2;

// 引数がないときは()が必要
const greet = () => 'こんにちは';
```

### オブジェクトを返すとき

```javascript
// 間違い：{}が関数のブロックと解釈される
const makePerson = name => { name: name };  // undefined

// 正しい：()で囲む
const makePerson = name => ({ name: name });

// さらに省略（後述のプロパティの省略記法）
const makePerson = name => ({ name });
```

### thisの扱い

アロー関数は`this`の扱いが通常の関数と異なります：

```javascript
// 通常の関数
const obj = {
  name: '田中',
  greet: function() {
    console.log(`こんにちは、${this.name}です`);
  }
};
obj.greet();  // 'こんにちは、田中です'

// アロー関数（thisが外側を参照）
const obj2 = {
  name: '佐藤',
  greet: () => {
    console.log(`こんにちは、${this.name}です`);
  }
};
obj2.greet();  // 'こんにちは、undefinedです'（thisがobjを指さない）
```

> ⚠️ **注意**: オブジェクトのメソッドでは通常の関数を使います。

---

## 3.4 テンプレートリテラル

バッククォート（\`）を使うと、文字列に変数や式を埋め込めます。

```javascript
const name = '田中';
const age = 25;

// 従来の書き方
const message1 = 'こんにちは、' + name + 'さん（' + age + '歳）';

// テンプレートリテラル
const message2 = `こんにちは、${name}さん（${age}歳）`;

// 式も使える
const message3 = `来年は${age + 1}歳になります`;

// 複数行
const html = `
  <div>
    <h1>${name}</h1>
    <p>年齢: ${age}</p>
  </div>
`;
```

---

## 3.5 分割代入

オブジェクトや配列から値を取り出す便利な書き方です。

### オブジェクトの分割代入

```javascript
const user = {
  name: '田中',
  age: 25,
  email: 'tanaka@example.com'
};

// 従来の書き方
const name = user.name;
const age = user.age;

// 分割代入
const { name, age } = user;
console.log(name);  // '田中'
console.log(age);   // 25

// 別名をつける
const { name: userName, age: userAge } = user;
console.log(userName);  // '田中'

// デフォルト値
const { name, city = '東京' } = user;
console.log(city);  // '東京'（userにcityがないため）

// ネストしたオブジェクト
const data = {
  user: {
    name: '田中',
    address: {
      city: '東京'
    }
  }
};

const { user: { name, address: { city } } } = data;
console.log(name);  // '田中'
console.log(city);  // '東京'
```

### 配列の分割代入

```javascript
const numbers = [1, 2, 3, 4, 5];

// 従来の書き方
const first = numbers[0];
const second = numbers[1];

// 分割代入
const [first, second] = numbers;
console.log(first);   // 1
console.log(second);  // 2

// スキップ
const [first, , third] = numbers;
console.log(third);  // 3

// 残りを取得
const [first, ...rest] = numbers;
console.log(rest);  // [2, 3, 4, 5]

// デフォルト値
const [a, b, c = 10] = [1, 2];
console.log(c);  // 10

// 入れ替え
let x = 1;
let y = 2;
[x, y] = [y, x];
console.log(x, y);  // 2 1
```

### 関数の引数での分割代入

```javascript
// オブジェクトの分割代入
function greet({ name, age }) {
  return `こんにちは、${name}さん（${age}歳）`;
}

greet({ name: '田中', age: 25 });  // 'こんにちは、田中さん（25歳）'

// デフォルト値
function greet({ name = 'ゲスト', age = 0 } = {}) {
  return `こんにちは、${name}さん（${age}歳）`;
}

greet();  // 'こんにちは、ゲストさん（0歳）'

// 配列の分割代入
function sum([a, b]) {
  return a + b;
}

sum([3, 5]);  // 8
```

---

## 3.6 スプレッド構文

`...`を使って、配列やオブジェクトを展開できます。

### 配列のスプレッド

```javascript
const numbers1 = [1, 2, 3];
const numbers2 = [4, 5, 6];

// 配列の結合
const combined = [...numbers1, ...numbers2];
console.log(combined);  // [1, 2, 3, 4, 5, 6]

// 配列のコピー
const copy = [...numbers1];
console.log(copy);  // [1, 2, 3]

// 要素の追加
const withExtra = [...numbers1, 4, 5];
console.log(withExtra);  // [1, 2, 3, 4, 5]

// 関数の引数として展開
const max = Math.max(...numbers1);
console.log(max);  // 3
```

### オブジェクトのスプレッド

```javascript
const user = {
  name: '田中',
  age: 25
};

const details = {
  email: 'tanaka@example.com',
  city: '東京'
};

// オブジェクトのマージ
const merged = { ...user, ...details };
console.log(merged);
// { name: '田中', age: 25, email: 'tanaka@example.com', city: '東京' }

// オブジェクトのコピー
const copy = { ...user };

// プロパティの上書き
const updated = { ...user, age: 26 };
console.log(updated);  // { name: '田中', age: 26 }

// プロパティの追加
const withExtra = { ...user, city: '大阪' };
console.log(withExtra);  // { name: '田中', age: 25, city: '大阪' }
```

### レスト構文

スプレッド構文の逆で、残りを集めます：

```javascript
// 配列
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(rest);   // [2, 3, 4, 5]

// オブジェクト
const { name, ...others } = { name: '田中', age: 25, city: '東京' };
console.log(name);    // '田中'
console.log(others);  // { age: 25, city: '東京' }

// 関数の引数
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

console.log(sum(1, 2, 3, 4, 5));  // 15
```

---

## 3.7 オブジェクトのショートハンド

プロパティ名と変数名が同じとき、省略できます。

```javascript
const name = '田中';
const age = 25;

// 従来の書き方
const user1 = {
  name: name,
  age: age
};

// ショートハンド
const user2 = {
  name,
  age
};

// メソッドのショートハンド
const obj = {
  // 従来の書き方
  greet: function() {
    return 'こんにちは';
  },
  
  // ショートハンド
  farewell() {
    return 'さようなら';
  }
};
```

### 計算されたプロパティ名

```javascript
const key = 'name';
const value = '田中';

// 従来の書き方
const obj1 = {};
obj1[key] = value;

// 計算されたプロパティ名
const obj2 = {
  [key]: value
};

console.log(obj2);  // { name: '田中' }

// 式も使える
const obj3 = {
  [`user_${key}`]: value
};

console.log(obj3);  // { user_name: '田中' }
```

---

## 3.8 配列のメソッド（詳細）

### map

各要素を変換した新しい配列を返します：

```javascript
const numbers = [1, 2, 3, 4, 5];

// 各要素を2倍に
const doubled = numbers.map(n => n * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// オブジェクトの配列
const users = [
  { id: 1, name: '田中' },
  { id: 2, name: '佐藤' }
];

const names = users.map(user => user.name);
console.log(names);  // ['田中', '佐藤']

// インデックスも使える
const withIndex = numbers.map((n, index) => `${index}: ${n}`);
console.log(withIndex);  // ['0: 1', '1: 2', ...]
```

### filter

条件に合う要素だけを抽出：

```javascript
const numbers = [1, 2, 3, 4, 5];

// 偶数だけ
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);  // [2, 4]

// オブジェクトの配列
const users = [
  { id: 1, name: '田中', age: 25 },
  { id: 2, name: '佐藤', age: 30 },
  { id: 3, name: '鈴木', age: 20 }
];

const adults = users.filter(user => user.age >= 25);
console.log(adults);  // [{ id: 1, ... }, { id: 2, ... }]
```

### reduce

配列を1つの値にまとめる：

```javascript
const numbers = [1, 2, 3, 4, 5];

// 合計
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log(sum);  // 15

// 最大値
const max = numbers.reduce((acc, n) => (n > acc ? n : acc), numbers[0]);
console.log(max);  // 5

// オブジェクトの作成
const users = [
  { id: 1, name: '田中' },
  { id: 2, name: '佐藤' }
];

const userMap = users.reduce((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {});

console.log(userMap);
// { 1: { id: 1, name: '田中' }, 2: { id: 2, name: '佐藤' } }
```

### find と findIndex

```javascript
const numbers = [1, 2, 3, 4, 5];

// 条件に合う最初の要素
const found = numbers.find(n => n > 3);
console.log(found);  // 4

// そのインデックス
const index = numbers.findIndex(n => n > 3);
console.log(index);  // 3

// オブジェクトの配列
const users = [
  { id: 1, name: '田中' },
  { id: 2, name: '佐藤' }
];

const user = users.find(u => u.id === 2);
console.log(user);  // { id: 2, name: '佐藤' }
```

### some と every

```javascript
const numbers = [1, 2, 3, 4, 5];

// どれか1つでも条件に合うか
const hasEven = numbers.some(n => n % 2 === 0);
console.log(hasEven);  // true

// すべて条件に合うか
const allPositive = numbers.every(n => n > 0);
console.log(allPositive);  // true

const allEven = numbers.every(n => n % 2 === 0);
console.log(allEven);  // false
```

### sort

```javascript
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];

// 昇順
const sorted = [...numbers].sort((a, b) => a - b);
console.log(sorted);  // [1, 1, 2, 3, 4, 5, 6, 9]

// 降順
const desc = [...numbers].sort((a, b) => b - a);
console.log(desc);  // [9, 6, 5, 4, 3, 2, 1, 1]

// オブジェクトの配列
const users = [
  { name: '田中', age: 25 },
  { name: '佐藤', age: 30 },
  { name: '鈴木', age: 20 }
];

const sortedByAge = [...users].sort((a, b) => a.age - b.age);
console.log(sortedByAge);
// [{ name: '鈴木', age: 20 }, { name: '田中', age: 25 }, ...]
```

> ⚠️ **注意**: `sort()`は元の配列を変更するので、`[...array]`でコピーしてから使うのがおすすめです。

---

## 3.9 非同期処理

JavaScriptは**シングルスレッド**なので、時間のかかる処理を同期的に実行するとブラウザが固まってしまいます。そのため、**非同期処理**が重要です。

### コールバック（古い方法）

```javascript
// 1秒後に実行
setTimeout(() => {
  console.log('1秒経ちました');
}, 1000);

// データの取得（擬似コード）
function fetchData(callback) {
  setTimeout(() => {
    const data = { name: '田中' };
    callback(data);
  }, 1000);
}

fetchData((data) => {
  console.log(data);  // { name: '田中' }
});
```

**問題点: コールバック地獄**

```javascript
fetchUser((user) => {
  fetchPosts(user.id, (posts) => {
    fetchComments(posts[0].id, (comments) => {
      console.log(comments);
      // ネストが深くなって読みにくい...
    });
  });
});
```

### Promise

**Promise**は、非同期処理をより扱いやすくした仕組みです。

```javascript
// Promiseの作成
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('成功！');
    } else {
      reject('失敗...');
    }
  }, 1000);
});

// Promiseの利用
promise
  .then((result) => {
    console.log(result);  // '成功！'
  })
  .catch((error) => {
    console.error(error);
  });
```

**Promise のチェーン:**

```javascript
fetchUser()
  .then((user) => {
    console.log('ユーザー取得:', user);
    return fetchPosts(user.id);
  })
  .then((posts) => {
    console.log('投稿取得:', posts);
    return fetchComments(posts[0].id);
  })
  .then((comments) => {
    console.log('コメント取得:', comments);
  })
  .catch((error) => {
    console.error('エラー:', error);
  });
```

### async/await（モダンな方法）

**async/await**は、Promiseをより直感的に書ける構文です。

```javascript
// async関数の定義
async function fetchData() {
  // awaitでPromiseの完了を待つ
  const user = await fetchUser();
  console.log('ユーザー取得:', user);
  
  const posts = await fetchPosts(user.id);
  console.log('投稿取得:', posts);
  
  const comments = await fetchComments(posts[0].id);
  console.log('コメント取得:', comments);
  
  return comments;
}

// 実行
fetchData()
  .then((comments) => {
    console.log('完了:', comments);
  })
  .catch((error) => {
    console.error('エラー:', error);
  });

// またはtry-catchで
async function fetchDataWithErrorHandling() {
  try {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    return comments;
  } catch (error) {
    console.error('エラー:', error);
    throw error;
  }
}
```

**async/awaitのルール:**

1. `await`は`async`関数の中でしか使えない
2. `async`関数は常にPromiseを返す
3. エラー処理は`try-catch`を使う

### fetch API

`fetch`は、サーバーからデータを取得する関数です：

```javascript
// GETリクエスト
async function getPosts() {
  try {
    const response = await fetch('/api/posts');
    
    if (!response.ok) {
      throw new Error('エラー');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('取得失敗:', error);
    throw error;
  }
}

// POSTリクエスト
async function createPost(post) {
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('作成失敗:', error);
    throw error;
  }
}

// 使用例
const posts = await getPosts();
console.log(posts);

const newPost = await createPost({ title: 'テスト', content: '内容' });
console.log(newPost);
```

### Promise.all（並列処理）

複数のPromiseを並列で実行：

```javascript
// 順次実行（遅い）
async function sequential() {
  const user = await fetchUser();      // 1秒待つ
  const posts = await fetchPosts();    // さらに1秒待つ
  const events = await fetchEvents();  // さらに1秒待つ
  // 合計3秒
}

// 並列実行（速い）
async function parallel() {
  const [user, posts, events] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchEvents()
  ]);
  // すべて同時に実行されるので約1秒
}

// 1つでも成功すれば良い場合
async function race() {
  const result = await Promise.race([
    fetchFromServer1(),
    fetchFromServer2(),
    fetchFromServer3()
  ]);
  // 最初に完了したものが返される
}
```

---

## 3.10 モジュール

大きなプログラムは、複数のファイルに分割して管理します。

### export（エクスポート）

**utils.js:**
```javascript
// 名前付きエクスポート
export const PI = 3.14;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// まとめてエクスポート
const subtract = (a, b) => a - b;
const divide = (a, b) => a / b;

export { subtract, divide };

// デフォルトエクスポート（1ファイルに1つだけ）
export default function greet(name) {
  return `こんにちは、${name}さん`;
}
```

### import（インポート）

**main.js:**
```javascript
// デフォルトエクスポートのインポート
import greet from './utils.js';

// 名前付きエクスポートのインポート
import { PI, add, multiply } from './utils.js';

// 別名をつける
import { subtract as sub } from './utils.js';

// すべてをインポート
import * as utils from './utils.js';

console.log(greet('田中'));     // 'こんにちは、田中さん'
console.log(PI);                // 3.14
console.log(add(2, 3));         // 5
console.log(utils.multiply(2, 3)); // 6
```

---

## 3.11 クラス

クラスは、オブジェクトの設計図です。

### 基本的なクラス

```javascript
class Person {
  // コンストラクタ（初期化）
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  // メソッド
  greet() {
    return `こんにちは、${this.name}です（${this.age}歳）`;
  }
  
  haveBirthday() {
    this.age++;
    return `誕生日おめでとう！${this.age}歳になりました`;
  }
}

// インスタンスの作成
const person1 = new Person('田中', 25);
const person2 = new Person('佐藤', 30);

console.log(person1.greet());  // 'こんにちは、田中です（25歳）'
console.log(person2.greet());  // 'こんにちは、佐藤です（30歳）'

person1.haveBirthday();
console.log(person1.age);      // 26
```

### 継承

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    return `${this.name}が鳴いています`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // 親クラスのコンストラクタを呼ぶ
    this.breed = breed;
  }
  
  speak() {
    return `${this.name}がワンワン鳴いています`;
  }
  
  fetch() {
    return `${this.name}がボールを取ってきました`;
  }
}

const dog = new Dog('ポチ', '柴犬');
console.log(dog.speak());  // 'ポチがワンワン鳴いています'
console.log(dog.fetch());  // 'ポチがボールを取ってきました'
```

### 静的メソッド

```javascript
class MathUtils {
  static add(a, b) {
    return a + b;
  }
  
  static multiply(a, b) {
    return a * b;
  }
}

// インスタンスを作らずに使える
console.log(MathUtils.add(2, 3));      // 5
console.log(MathUtils.multiply(2, 3)); // 6
```

### プライベートフィールド（新しい機能）

```javascript
class BankAccount {
  // プライベートフィールド（#で始まる）
  #balance = 0;
  
  constructor(initialBalance) {
    this.#balance = initialBalance;
  }
  
  deposit(amount) {
    this.#balance += amount;
    return this.#balance;
  }
  
  withdraw(amount) {
    if (amount > this.#balance) {
      throw new Error('残高不足');
    }
    this.#balance -= amount;
    return this.#balance;
  }
  
  getBalance() {
    return this.#balance;
  }
}

const account = new BankAccount(1000);
account.deposit(500);
console.log(account.getBalance());  // 1500

// エラー！外から直接アクセスできない
// console.log(account.#balance);
```

---

## 3.12 その他の便利な機能

### オプショナルチェーン（?.）

ネストしたプロパティに安全にアクセス：

```javascript
const user = {
  name: '田中',
  address: {
    city: '東京'
  }
};

// 従来の書き方（エラーチェック）
const city = user && user.address && user.address.city;

// オプショナルチェーン
const city = user?.address?.city;  // '東京'

// 存在しないプロパティ
const country = user?.address?.country;  // undefined（エラーにならない）

// 配列
const firstPost = user?.posts?.[0];

// 関数
const result = user?.greet?.();
```

### Null合体演算子（??）

`null`か`undefined`のときだけデフォルト値を使う：

```javascript
// || の問題点
const count = 0;
const result1 = count || 10;  // 10（0はfalsyなので）

// ?? の場合
const result2 = count ?? 10;  // 0（0はnullでもundefinedでもない）

// 使用例
const config = {
  timeout: 0,
  retries: null
};

const timeout = config.timeout ?? 5000;  // 0
const retries = config.retries ?? 3;     // 3
```

### 論理代入演算子

```javascript
let x = 1;
let y = null;

// ||=（falsyのときだけ代入）
x ||= 10;  // x = x || 10  →  xは1のまま
y ||= 10;  // y = y || 10  →  yは10

// &&=（truthyのときだけ代入）
x &&= 5;   // x = x && 5   →  xは5

// ??=（null/undefinedのときだけ代入）
x ??= 20;  // x = x ?? 20  →  xは5のまま
```

---

## 実践練習

### 練習1: TODOアプリ（クラス使用）

```javascript
class TodoList {
  constructor() {
    this.todos = [];
    this.nextId = 1;
  }
  
  add(title) {
    const todo = {
      id: this.nextId++,
      title,
      completed: false,
      createdAt: new Date()
    };
    this.todos.push(todo);
    return todo;
  }
  
  toggle(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
    return todo;
  }
  
  remove(id) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
      return true;
    }
    return false;
  }
  
  getAll() {
    return [...this.todos];
  }
  
  getActive() {
    return this.todos.filter(t => !t.completed);
  }
  
  getCompleted() {
    return this.todos.filter(t => t.completed);
  }
  
  clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed);
  }
}

// 使用例
const todoList = new TodoList();

todoList.add('牛乳を買う');
todoList.add('宿題をする');
todoList.add('掃除をする');

console.log(todoList.getAll());
// [
//   { id: 1, title: '牛乳を買う', completed: false, ... },
//   { id: 2, title: '宿題をする', completed: false, ... },
//   { id: 3, title: '掃除をする', completed: false, ... }
// ]

todoList.toggle(1);
console.log(todoList.getActive());
// [
//   { id: 2, title: '宿題をする', completed: false, ... },
//   { id: 3, title: '掃除をする', completed: false, ... }
// ]
```

### 練習2: データ取得（async/await）

```javascript
// ユーザー情報を取得
async function fetchUserWithPosts(userId) {
  try {
    // ユーザー情報を取得
    const userResponse = await fetch(`/api/users/${userId}`);
    if (!userResponse.ok) {
      throw new Error('ユーザーの取得に失敗');
    }
    const user = await userResponse.json();
    
    // 投稿を取得
    const postsResponse = await fetch(`/api/users/${userId}/posts`);
    if (!postsResponse.ok) {
      throw new Error('投稿の取得に失敗');
    }
    const posts = await postsResponse.json();
    
    // 結合して返す
    return {
      ...user,
      posts
    };
  } catch (error) {
    console.error('エラー:', error);
    throw error;
  }
}

// 使用例
const userWithPosts = await fetchUserWithPosts(1);
console.log(userWithPosts);
```

---

## まとめ

この章では、モダンJavaScriptの重要な機能を学びました：

### ES6以降の主要機能
- ✅ `let`と`const`
- ✅ アロー関数
- ✅ テンプレートリテラル
- ✅ 分割代入
- ✅ スプレッド構文とレスト構文
- ✅ オブジェクトのショートハンド

### 配列の便利なメソッド
- ✅ `map`、`filter`、`reduce`
- ✅ `find`、`some`、`every`

### 非同期処理
- ✅ Promise
- ✅ `async`/`await`
- ✅ `fetch` API

### モジュールとクラス
- ✅ `import`/`export`
- ✅ クラスと継承

これらの機能は、**React**や**Next.js**を使う上で必須です。次の章からは、いよいよReactの世界に入っていきます！

---

[← 前の章：第2章 Web開発の基礎知識](02-Web開発の基礎知識.md) | [目次に戻る](00-目次.md) | [次の章へ：第4章 React入門 →](04-React入門.md)
