# 第4章：React入門

この章では、**React**の基本を学びます。Reactは、UIを構築するためのJavaScriptライブラリで、Facebook（現Meta）が開発しました。

## 4.1 Reactとは

### Reactの特徴

**React**は、Webアプリケーションのユーザーインターフェース（UI）を構築するためのライブラリです。

**主な特徴：**

1. **コンポーネントベース**: UIを再利用可能な部品（コンポーネント）に分割
2. **宣言的**: 「どう見えるべきか」を記述する（命令的な「どう変更するか」ではない）
3. **仮想DOM**: 効率的な画面更新
4. **単方向データフロー**: データの流れが予測しやすい

**Reactを使う理由：**

```
従来のJavaScript（命令的）：
1. 要素を取得
2. 要素の内容を変更
3. 要素のスタイルを変更
4. イベントを設定
→ 複雑になると管理が大変

React（宣言的）：
「この状態のときは、こう表示する」
→ シンプルで保守しやすい
```

---

## 4.2 JSXとは

### JSXの基本

**JSX**は、JavaScriptの中にHTMLのような構文を書ける拡張構文です。

```jsx
// JSX
const element = <h1>こんにちは、世界！</h1>;

// これは実際には以下のように変換される
const element = React.createElement('h1', null, 'こんにちは、世界！');
```

**JSXの例：**

```jsx
const name = '田中';
const element = <h1>こんにちは、{name}さん！</h1>;
```

### JSXのルール

#### 1. 単一のルート要素

JSXは必ず1つのルート要素を返す必要があります：

```jsx
// ❌ エラー：複数のルート要素
return (
  <h1>タイトル</h1>
  <p>本文</p>
);

// ✅ OK：divで囲む
return (
  <div>
    <h1>タイトル</h1>
    <p>本文</p>
  </div>
);

// ✅ OK：Fragmentを使う（余計なdivが不要）
return (
  <>
    <h1>タイトル</h1>
    <p>本文</p>
  </>
);
```

#### 2. JavaScriptの式を埋め込む

`{}`の中にJavaScriptの式を書けます：

```jsx
const name = '田中';
const age = 25;

return (
  <div>
    <h1>{name}さん</h1>
    <p>年齢: {age}歳</p>
    <p>来年は{age + 1}歳です</p>
    <p>{age >= 20 ? '成人' : '未成年'}</p>
  </div>
);
```

#### 3. 属性の書き方

HTML属性はキャメルケースで書きます：

```jsx
// HTML
<div class="container" onclick="handleClick()">

// JSX
<div className="container" onClick={handleClick}>

// よく使う属性
<div
  className="box"           // class → className
  htmlFor="input"           // for → htmlFor
  onClick={handleClick}     // onclick → onClick
  onChange={handleChange}   // onchange → onChange
  style={{ color: 'red' }}  // styleはオブジェクト
>
```

#### 4. すべてのタグを閉じる

JSXではすべてのタグを閉じる必要があります：

```jsx
// HTML（閉じなくてもOK）
<input type="text">
<img src="image.jpg">
<br>

// JSX（必ず閉じる）
<input type="text" />
<img src="image.jpg" />
<br />
```

#### 5. コメントの書き方

```jsx
return (
  <div>
    {/* これはコメント */}
    <h1>タイトル</h1>
    
    {/*
      複数行の
      コメント
    */}
  </div>
);
```

#### 6. 条件付きレンダリング

```jsx
// if文は使えない（式ではないため）
// 代わりに三項演算子や&&を使う

// 三項演算子
return (
  <div>
    {isLoggedIn ? (
      <p>ようこそ！</p>
    ) : (
      <p>ログインしてください</p>
    )}
  </div>
);

// &&演算子（trueのときだけ表示）
return (
  <div>
    {isLoggedIn && <p>ようこそ！</p>}
    {error && <p className="error">{error}</p>}
  </div>
);

// 複雑な条件は外に出す
const content = () => {
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;
  return <p>データ: {data}</p>;
};

return <div>{content()}</div>;
```

#### 7. リストのレンダリング

```jsx
const users = [
  { id: 1, name: '田中' },
  { id: 2, name: '佐藤' },
  { id: 3, name: '鈴木' }
];

return (
  <ul>
    {users.map(user => (
      <li key={user.id}>{user.name}</li>
    ))}
  </ul>
);
```

> ⚠️ **重要**: `key`属性は必須です。各要素を一意に識別するために使います。

---

## 4.3 コンポーネント

### 関数コンポーネント

Reactでは、UIを**コンポーネント**という部品に分割します。

**最もシンプルなコンポーネント：**

```jsx
function Welcome() {
  return <h1>こんにちは！</h1>;
}

// アロー関数でも書ける
const Welcome = () => {
  return <h1>こんにちは！</h1>;
};

// 1行なら{}とreturnを省略できる
const Welcome = () => <h1>こんにちは！</h1>;
```

**コンポーネントの使用：**

```jsx
function App() {
  return (
    <div>
      <Welcome />
      <Welcome />
      <Welcome />
    </div>
  );
}
```

### Props（プロパティ）

**Props**は、親コンポーネントから子コンポーネントにデータを渡す仕組みです。

```jsx
// 子コンポーネント
function Welcome(props) {
  return <h1>こんにちは、{props.name}さん！</h1>;
}

// 分割代入を使うのが一般的
function Welcome({ name }) {
  return <h1>こんにちは、{name}さん！</h1>;
}

// 親コンポーネント
function App() {
  return (
    <div>
      <Welcome name="田中" />
      <Welcome name="佐藤" />
      <Welcome name="鈴木" />
    </div>
  );
}
```

**複数のProps：**

```jsx
function UserCard({ name, age, email, avatarUrl }) {
  return (
    <div className="card">
      <img src={avatarUrl} alt={name} />
      <h2>{name}</h2>
      <p>年齢: {age}歳</p>
      <p>メール: {email}</p>
    </div>
  );
}

// 使用
<UserCard
  name="田中太郎"
  age={25}
  email="tanaka@example.com"
  avatarUrl="/avatar.jpg"
/>
```

**デフォルトProps：**

```jsx
function Button({ text = 'クリック', color = 'blue' }) {
  return (
    <button style={{ backgroundColor: color }}>
      {text}
    </button>
  );
}

// 使用
<Button />                           // デフォルト値
<Button text="送信" color="green" /> // カスタム値
```

**children（子要素）：**

```jsx
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// 使用
<Card title="プロフィール">
  <p>名前: 田中</p>
  <p>年齢: 25歳</p>
</Card>
```

### Propsのベストプラクティス

```jsx
// ❌ 悪い例：オブジェクト全体を渡す
<UserCard user={user} />

// ✅ 良い例：必要なプロパティだけ渡す
<UserCard
  name={user.name}
  age={user.age}
  email={user.email}
/>

// ただし、スプレッド構文で全部渡すのはOK
<UserCard {...user} />
```

---

## 4.4 State（状態）

### useStateフック

**State**は、コンポーネントが持つ状態（データ）です。Stateが変わると、コンポーネントが再レンダリングされます。

```jsx
import { useState } from 'react';

function Counter() {
  // [現在の値, 値を更新する関数] = useState(初期値)
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}
```

**useStateの基本：**

```jsx
// 文字列
const [name, setName] = useState('');

// 数値
const [count, setCount] = useState(0);

// 真偽値
const [isOpen, isOpen] = useState(false);

// 配列
const [items, setItems] = useState([]);

// オブジェクト
const [user, setUser] = useState({ name: '', age: 0 });
```

### Stateの更新

#### 基本的な更新

```jsx
function Example() {
  const [count, setCount] = useState(0);
  
  // 直接値を設定
  const increment = () => {
    setCount(count + 1);
  };
  
  // 前の値を使って更新（関数形式）
  const increment = () => {
    setCount(prevCount => prevCount + 1);
  };
  
  return (
    <button onClick={increment}>
      カウント: {count}
    </button>
  );
}
```

> 💡 **ポイント**: 前の値を使って更新するときは、関数形式を使うと安全です。

#### オブジェクトのState

```jsx
function UserForm() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  });
  
  // ❌ 悪い例：直接変更（再レンダリングされない）
  const updateName = (name) => {
    user.name = name;  // これはダメ！
  };
  
  // ✅ 良い例：新しいオブジェクトを作る
  const updateName = (name) => {
    setUser({ ...user, name });
  };
  
  // より簡潔に
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <form>
      <input
        name="name"
        value={user.name}
        onChange={handleChange}
      />
      <input
        name="email"
        value={user.email}
        onChange={handleChange}
      />
    </form>
  );
}
```

#### 配列のState

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  // 追加
  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    };
    setTodos([...todos, newTodo]);
  };
  
  // 削除
  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // 更新
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span>{todo.text}</span>
          <button onClick={() => removeTodo(todo.id)}>
            削除
          </button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 4.5 イベント処理

### 基本的なイベント

```jsx
function EventExamples() {
  // クリックイベント
  const handleClick = () => {
    console.log('クリックされました');
  };
  
  // 引数付きイベント
  const handleClickWithArg = (name) => {
    console.log(`${name}がクリックされました`);
  };
  
  // イベントオブジェクトを受け取る
  const handleSubmit = (e) => {
    e.preventDefault();  // デフォルトの動作を防ぐ
    console.log('送信されました');
  };
  
  return (
    <div>
      {/* 基本 */}
      <button onClick={handleClick}>
        クリック
      </button>
      
      {/* インライン */}
      <button onClick={() => console.log('クリック')}>
        クリック
      </button>
      
      {/* 引数を渡す */}
      <button onClick={() => handleClickWithArg('ボタンA')}>
        ボタンA
      </button>
      
      {/* フォーム送信 */}
      <form onSubmit={handleSubmit}>
        <button type="submit">送信</button>
      </form>
    </div>
  );
}
```

### よく使うイベント

```jsx
function InputExamples() {
  const [value, setValue] = useState('');
  
  return (
    <div>
      {/* 入力変更 */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      
      {/* クリック */}
      <button onClick={() => console.log('click')}>
        クリック
      </button>
      
      {/* ダブルクリック */}
      <button onDoubleClick={() => console.log('double click')}>
        ダブルクリック
      </button>
      
      {/* マウスオーバー */}
      <div onMouseEnter={() => console.log('enter')}>
        ホバー
      </div>
      
      {/* フォーカス */}
      <input
        onFocus={() => console.log('focus')}
        onBlur={() => console.log('blur')}
      />
      
      {/* キーボード */}
      <input
        onKeyDown={(e) => console.log('keydown', e.key)}
        onKeyUp={(e) => console.log('keyup', e.key)}
      />
    </div>
  );
}
```

---

## 4.6 useEffectフック

### useEffectの基本

**useEffect**は、副作用（side effect）を扱うためのフックです。

**副作用の例：**
- データの取得
- DOM操作
- タイマーの設定
- イベントリスナーの登録

```jsx
import { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);
  
  // マウント時と更新時に実行
  useEffect(() => {
    document.title = `カウント: ${count}`;
  });
  
  return (
    <button onClick={() => setCount(count + 1)}>
      カウント: {count}
    </button>
  );
}
```

### 依存配列

```jsx
// 1. 依存配列なし：毎回実行
useEffect(() => {
  console.log('毎回実行される');
});

// 2. 空の依存配列：マウント時のみ実行
useEffect(() => {
  console.log('最初の1回だけ実行される');
}, []);

// 3. 依存配列あり：依存する値が変わったときだけ実行
useEffect(() => {
  console.log('countが変わったときだけ実行される');
}, [count]);

// 4. 複数の依存
useEffect(() => {
  console.log('countまたはnameが変わったときだけ実行される');
}, [count, name]);
```

### クリーンアップ

```jsx
function Timer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // タイマーを設定
    const timer = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    // クリーンアップ関数（アンマウント時に実行）
    return () => {
      clearInterval(timer);
      console.log('タイマーをクリア');
    };
  }, []);
  
  return <p>カウント: {count}</p>;
}
```

### データ取得の例

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // ローディング開始
    setLoading(true);
    setError(null);
    
    // データ取得
    fetch(`/api/users/${userId}`)
      .then(response => {
        if (!response.ok) throw new Error('取得失敗');
        return response.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);  // userIdが変わったら再取得
  
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;
  if (!user) return <p>ユーザーが見つかりません</p>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### async/awaitを使う場合

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // useEffectの中で直接asyncは使えない
    // 代わりに関数を定義して実行
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('エラー:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  // ...
}
```

---

## 4.7 その他の重要なフック

### useRef

**useRef**は、レンダリング間で値を保持したり、DOM要素にアクセスしたりするためのフックです。

```jsx
import { useRef, useEffect } from 'react';

function InputFocus() {
  const inputRef = useRef(null);
  
  useEffect(() => {
    // マウント時に入力欄にフォーカス
    inputRef.current.focus();
  }, []);
  
  return <input ref={inputRef} type="text" />;
}

// 前の値を保持
function PreviousValue({ value }) {
  const prevValueRef = useRef();
  
  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);
  
  return (
    <div>
      <p>現在の値: {value}</p>
      <p>前の値: {prevValueRef.current}</p>
    </div>
  );
}
```

### useMemo

**useMemo**は、計算結果をメモ化（キャッシュ）するフックです。

```jsx
import { useState, useMemo } from 'react';

function ExpensiveCalculation({ items }) {
  const [filter, setFilter] = useState('');
  
  // 重い計算をメモ化
  const filteredItems = useMemo(() => {
    console.log('フィルタリング実行');
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);  // itemsかfilterが変わったときだけ再計算
  
  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useCallback

**useCallback**は、関数をメモ化するフックです。

```jsx
import { useState, useCallback } from 'react';

function Parent() {
  const [count, setCount] = useState(0);
  
  // 関数をメモ化（依存配列が変わらない限り同じ関数）
  const handleClick = useCallback(() => {
    console.log('クリック');
  }, []);
  
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <Child onClick={handleClick} />
    </div>
  );
}

function Child({ onClick }) {
  console.log('Child再レンダリング');
  return <button onClick={onClick}>クリック</button>;
}
```

---

## 4.8 実践例：TODOアプリ

ここまでの知識を使って、完全なTODOアプリを作ってみましょう。

```jsx
import { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  
  // TODOを追加
  const addTodo = () => {
    if (inputValue.trim() === '') return;
    
    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false
    };
    
    setTodos([...todos, newTodo]);
    setInputValue('');
  };
  
  // TODOを削除
  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // TODOの完了状態を切り替え
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };
  
  // 完了済みTODOをクリア
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };
  
  // フィルタリング
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  // 統計
  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;
  
  return (
    <div className="todo-app">
      <h1>TODO アプリ</h1>
      
      {/* 入力欄 */}
      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="TODOを入力..."
        />
        <button onClick={addTodo}>追加</button>
      </div>
      
      {/* フィルター */}
      <div className="filter-section">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          すべて
        </button>
        <button
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'active' : ''}
        >
          未完了
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'active' : ''}
        >
          完了済み
        </button>
      </div>
      
      {/* TODOリスト */}
      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => removeTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
      
      {/* 統計 */}
      <div className="stats">
        <p>未完了: {activeCount}件</p>
        <p>完了済み: {completedCount}件</p>
        {completedCount > 0 && (
          <button onClick={clearCompleted}>
            完了済みをクリア
          </button>
        )}
      </div>
    </div>
  );
}

export default TodoApp;
```

**スタイル（CSS）：**

```css
.todo-app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

.input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.input-section input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-section button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filter-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-section button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
}

.filter-section button.active {
  background-color: #007bff;
  color: white;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #888;
}

.todo-list span {
  flex: 1;
}

.stats {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}
```

---

## 4.9 コンポーネント設計のベストプラクティス

### 単一責任の原則

1つのコンポーネントは1つの責任だけを持つべきです：

```jsx
// ❌ 悪い例：1つのコンポーネントに多くの責任
function UserDashboard() {
  // ユーザー情報の管理
  // 投稿の管理
  // コメントの管理
  // 通知の管理
  // ... 何百行ものコード
}

// ✅ 良い例：責任を分割
function UserDashboard() {
  return (
    <div>
      <UserProfile />
      <PostsList />
      <CommentsList />
      <Notifications />
    </div>
  );
}
```

### Propsの命名

```jsx
// ❌ 悪い例：曖昧な名前
<Button click={handleClick} txt="送信" clr="blue" />

// ✅ 良い例：明確な名前
<Button onClick={handleClick} text="送信" color="blue" />
```

### コンポーネントの分割

```jsx
// 大きなコンポーネント
function UserCard({ user }) {
  return (
    <div className="card">
      {/* アバター部分 */}
      <div className="avatar">
        <img src={user.avatarUrl} alt={user.name} />
      </div>
      
      {/* プロフィール部分 */}
      <div className="profile">
        <h2>{user.name}</h2>
        <p>{user.bio}</p>
      </div>
      
      {/* 統計部分 */}
      <div className="stats">
        <div>投稿: {user.postsCount}</div>
        <div>フォロワー: {user.followersCount}</div>
      </div>
    </div>
  );
}

// より小さなコンポーネントに分割
function UserCard({ user }) {
  return (
    <div className="card">
      <UserAvatar url={user.avatarUrl} name={user.name} />
      <UserProfile name={user.name} bio={user.bio} />
      <UserStats
        postsCount={user.postsCount}
        followersCount={user.followersCount}
      />
    </div>
  );
}

function UserAvatar({ url, name }) {
  return (
    <div className="avatar">
      <img src={url} alt={name} />
    </div>
  );
}

function UserProfile({ name, bio }) {
  return (
    <div className="profile">
      <h2>{name}</h2>
      <p>{bio}</p>
    </div>
  );
}

function UserStats({ postsCount, followersCount }) {
  return (
    <div className="stats">
      <div>投稿: {postsCount}</div>
      <div>フォロワー: {followersCount}</div>
    </div>
  );
}
```

---

## まとめ

この章では、Reactの基本を学びました：

### 主要な概念
- ✅ **JSX**: JavaScriptの中にHTMLを書く構文
- ✅ **コンポーネント**: UIを再利用可能な部品に分割
- ✅ **Props**: 親から子へデータを渡す
- ✅ **State**: コンポーネントが持つ状態

### 重要なフック
- ✅ `useState`: 状態管理
- ✅ `useEffect`: 副作用の処理
- ✅ `useRef`: DOM参照や値の保持
- ✅ `useMemo`/`useCallback`: パフォーマンス最適化

### ベストプラクティス
- ✅ 単一責任の原則
- ✅ 明確な命名
- ✅ コンポーネントの適切な分割

次の章では、**Next.js**について学びます。Next.jsは、Reactをベースにした強力なフレームワークで、サーバーサイドレンダリングやルーティングなどの機能を提供します。

---

[← 前の章：第3章 モダンJavaScriptの基礎](03-モダンJavaScriptの基礎.md) | [目次に戻る](00-目次.md) | [次の章へ：第5章 Next.js入門 →](05-Next.js入門.md)
