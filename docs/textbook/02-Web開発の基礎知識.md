# 第2章：Web開発の基礎知識

この章では、Web開発の基本となる **HTML**、**CSS**、**JavaScript** について学びます。これらはWebページを作る上で必須の技術です。

## 2.1 Webページの仕組み

### クライアントとサーバー

Webページを見るとき、実は裏側でこんなやり取りが行われています：

```
あなたのブラウザ           Webサーバー
（クライアント）
      |                        |
      |  ① ページください！      |
      |----------------------->|
      |                        |
      |  ② HTMLを送ります       |
      |<-----------------------|
      |                        |
      |  ③ 画像ください！        |
      |----------------------->|
      |                        |
      |  ④ 画像を送ります       |
      |<-----------------------|
```

**用語の説明：**

- **クライアント**: ユーザーが使うブラウザ（Chrome、Safari、Firefoxなど）
- **サーバー**: Webページのデータを保存して送ってくれるコンピューター
- **リクエスト**: クライアントがサーバーに「データください」と頼むこと
- **レスポンス**: サーバーがクライアントにデータを返すこと

### HTTPプロトコル

**HTTP**（HyperText Transfer Protocol）は、クライアントとサーバーが会話するときのルールです。

```
リクエスト:
GET /index.html HTTP/1.1        ← index.htmlを取得したい
Host: example.com               ← example.comというサーバーに
```

```
レスポンス:
HTTP/1.1 200 OK                 ← 成功しました！
Content-Type: text/html         ← HTMLファイルを送ります

<html>
  <body>こんにちは</body>
</html>
```

**主なHTTPメソッド：**

| メソッド | 意味 | 例 |
|---------|------|-----|
| GET | データを取得 | ページを表示 |
| POST | データを送信 | フォームの送信 |
| PUT | データを更新 | プロフィールの編集 |
| DELETE | データを削除 | 投稿の削除 |

### URLの構造

URLは住所のようなものです：

```
https://example.com:443/posts/123?sort=new#comments
  │       │         │     │     │   │        │
  │       │         │     │     │   │        └─ フラグメント（ページ内の位置）
  │       │         │     │     │   └────────── クエリパラメータ
  │       │         │     │     └────────────── パス
  │       │         │     └──────────────────── ポート番号
  │       │         └────────────────────────── ドメイン
  │       └──────────────────────────────────── サブドメイン
  └──────────────────────────────────────────── プロトコル
```

**例：**
```
https://keion-circle-site.vercel.app/posts/123
```
- `https://` - 安全な通信（暗号化あり）
- `keion-circle-site.vercel.app` - サイトのドメイン
- `/posts/123` - 123番の投稿ページ

---

## 2.2 HTML入門

### HTMLとは

**HTML**（HyperText Markup Language）は、Webページの**構造**を作る言語です。

「これは見出し」「これは段落」「これはリンク」というように、文書の構造を定義します。

### タグと要素

HTMLは**タグ**で囲んで書きます：

```html
<タグ名>内容</タグ名>
```

**例：**
```html
<p>これは段落です</p>
```

- `<p>` - **開始タグ**（ここから段落が始まる）
- `これは段落です` - **内容**（実際に表示される文字）
- `</p>` - **終了タグ**（ここで段落が終わる）

この全体を**要素**と呼びます。

### 基本的なHTMLの構造

すべてのHTMLファイルは、この構造で始まります：

```html
<!DOCTYPE html>                 <!-- HTML5を使いますという宣言 -->
<html lang="ja">                <!-- HTML文書の始まり。日本語です -->
  <head>                        <!-- ページの情報（表示されない） -->
    <meta charset="UTF-8">      <!-- 文字コードはUTF-8 -->
    <title>ページのタイトル</title>  <!-- ブラウザのタブに表示される -->
  </head>
  <body>                        <!-- ページの本体（表示される） -->
    <h1>見出し</h1>
    <p>本文</p>
  </body>
</html>
```

> 💡 **補足**: `<!-- -->` はコメントです。実行されず、メモとして使います。

### 基本的なタグ一覧

#### 見出し

```html
<h1>一番大きな見出し</h1>
<h2>2番目に大きな見出し</h2>
<h3>3番目に大きな見出し</h3>
<h4>4番目の見出し</h4>
<h5>5番目の見出し</h5>
<h6>一番小さな見出し</h6>
```

表示イメージ：
```
一番大きな見出し          ← h1（最も重要）
  2番目に大きな見出し     ← h2
    3番目に大きな見出し   ← h3
```

#### 段落とテキスト

```html
<p>これは段落です。</p>
<br>                           <!-- 改行 -->
<strong>太字のテキスト</strong>
<em>斜体のテキスト</em>
<u>下線付きテキスト</u>
```

#### リンク

```html
<a href="https://example.com">リンクのテキスト</a>
<a href="https://example.com" target="_blank">新しいタブで開く</a>
```

- `href` - リンク先のURL
- `target="_blank"` - 新しいタブで開く

#### 画像

```html
<img src="image.jpg" alt="画像の説明">
```

- `src` - 画像のパス
- `alt` - 画像が表示されないときの代替テキスト

#### リスト

**箇条書きリスト（順序なし）：**
```html
<ul>
  <li>項目1</li>
  <li>項目2</li>
  <li>項目3</li>
</ul>
```

表示：
```
• 項目1
• 項目2
• 項目3
```

**番号付きリスト（順序あり）：**
```html
<ol>
  <li>最初のステップ</li>
  <li>次のステップ</li>
  <li>最後のステップ</li>
</ol>
```

表示：
```
1. 最初のステップ
2. 次のステップ
3. 最後のステップ
```

#### テーブル（表）

```html
<table>
  <thead>                      <!-- ヘッダー行 -->
    <tr>                       <!-- 行 -->
      <th>名前</th>            <!-- ヘッダーセル -->
      <th>年齢</th>
    </tr>
  </thead>
  <tbody>                      <!-- 本体 -->
    <tr>
      <td>田中</td>            <!-- データセル -->
      <td>25</td>
    </tr>
    <tr>
      <td>佐藤</td>
      <td>30</td>
    </tr>
  </tbody>
</table>
```

表示：
```
┌──────┬──────┐
│ 名前 │ 年齢 │
├──────┼──────┤
│ 田中 │  25  │
│ 佐藤 │  30  │
└──────┴──────┘
```

#### フォーム

```html
<form action="/submit" method="POST">
  <!-- テキスト入力 -->
  <input type="text" name="username" placeholder="ユーザー名">
  
  <!-- パスワード入力 -->
  <input type="password" name="password" placeholder="パスワード">
  
  <!-- メール入力 -->
  <input type="email" name="email" placeholder="メールアドレス">
  
  <!-- テキストエリア -->
  <textarea name="message" rows="5"></textarea>
  
  <!-- チェックボックス -->
  <input type="checkbox" name="agree" id="agree">
  <label for="agree">利用規約に同意する</label>
  
  <!-- ラジオボタン -->
  <input type="radio" name="gender" value="male" id="male">
  <label for="male">男性</label>
  <input type="radio" name="gender" value="female" id="female">
  <label for="female">女性</label>
  
  <!-- セレクトボックス -->
  <select name="city">
    <option value="">選択してください</option>
    <option value="tokyo">東京</option>
    <option value="osaka">大阪</option>
  </select>
  
  <!-- 送信ボタン -->
  <button type="submit">送信</button>
</form>
```

#### コンテナ（グループ化）

```html
<!-- div: 汎用的なブロック要素 -->
<div>
  <h2>セクション1</h2>
  <p>内容</p>
</div>

<!-- span: 汎用的なインライン要素 -->
<p>これは<span style="color: red">赤い文字</span>です</p>
```

### セマンティックHTML

**セマンティック**（意味のある）HTMLタグを使うと、文書の構造がより明確になります：

```html
<header>                       <!-- ヘッダー（サイトの上部） -->
  <nav>                        <!-- ナビゲーション（メニュー） -->
    <a href="/">ホーム</a>
    <a href="/about">概要</a>
  </nav>
</header>

<main>                         <!-- メインコンテンツ -->
  <article>                    <!-- 記事 -->
    <h1>記事のタイトル</h1>
    <section>                  <!-- セクション -->
      <h2>セクション1</h2>
      <p>内容...</p>
    </section>
  </article>
  
  <aside>                      <!-- サイドバー -->
    <h3>関連記事</h3>
  </aside>
</main>

<footer>                       <!-- フッター（サイトの下部） -->
  <p>&copy; 2025 サイト名</p>
</footer>
```

**セマンティックタグの利点：**
1. コードが読みやすい
2. SEO（検索エンジン最適化）に有利
3. アクセシビリティ（障害のある方への配慮）の向上

---

## 2.3 CSS入門

### CSSとは

**CSS**（Cascading Style Sheets）は、Webページの**見た目**（デザイン）を作る言語です。

HTMLが「構造」、CSSが「装飾」を担当します。

```
HTML（構造）        CSS（装飾）           結果
<h1>見出し</h1>  +  色: 青            =  青い大きな見出し
                   サイズ: 大きく
                   太字
```

### CSSの書き方

CSSは以下の形式で書きます：

```css
セレクタ {
  プロパティ: 値;
  プロパティ: 値;
}
```

**例：**
```css
h1 {
  color: blue;           /* 文字色を青に */
  font-size: 32px;       /* 文字サイズを32pxに */
  font-weight: bold;     /* 太字に */
}
```

### CSSの適用方法

#### 1. インラインスタイル（直接書く）

```html
<p style="color: red; font-size: 20px;">赤い文字</p>
```

> ⚠️ **注意**: 管理が大変なので、あまり使わないほうが良いです。

#### 2. 内部スタイルシート（`<style>`タグ）

```html
<head>
  <style>
    p {
      color: red;
      font-size: 20px;
    }
  </style>
</head>
<body>
  <p>赤い文字</p>
</body>
```

#### 3. 外部スタイルシート（推奨）

**style.css:**
```css
p {
  color: red;
  font-size: 20px;
}
```

**index.html:**
```html
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <p>赤い文字</p>
</body>
```

### セレクタ

セレクタは「どの要素にスタイルを適用するか」を指定します。

#### 要素セレクタ

```css
p {
  color: blue;
}
/* すべての<p>タグに適用 */
```

#### クラスセレクタ

```css
.button {
  background-color: blue;
  color: white;
}
/* class="button" の要素に適用 */
```

```html
<button class="button">クリック</button>
```

#### IDセレクタ

```css
#header {
  background-color: gray;
}
/* id="header" の要素に適用 */
```

```html
<header id="header">ヘッダー</header>
```

> 💡 **補足**: IDは1ページに1つだけ、クラスは何度でも使えます。

#### 子孫セレクタ

```css
.container p {
  color: red;
}
/* .containerの中の<p>に適用 */
```

```html
<div class="container">
  <p>赤くなる</p>
</div>
<p>赤くならない</p>
```

#### 複数セレクタ

```css
h1, h2, h3 {
  color: blue;
}
/* h1, h2, h3すべてに適用 */
```

#### 擬似クラス

```css
a:hover {
  color: red;
}
/* リンクにマウスを乗せたとき */

button:active {
  background-color: gray;
}
/* ボタンをクリックしたとき */

input:focus {
  border-color: blue;
}
/* 入力欄にフォーカスしたとき */
```

### プロパティと値

#### 色

```css
.element {
  color: red;                    /* 文字色 */
  background-color: blue;        /* 背景色 */
}
```

**色の指定方法：**

```css
/* 色名 */
color: red;
color: blue;
color: white;

/* 16進数 */
color: #FF0000;    /* 赤 */
color: #0000FF;    /* 青 */
color: #FFFFFF;    /* 白 */

/* RGB */
color: rgb(255, 0, 0);     /* 赤 */
color: rgba(255, 0, 0, 0.5); /* 半透明の赤 */
```

#### テキスト

```css
.text {
  font-size: 16px;              /* 文字サイズ */
  font-weight: bold;            /* 太字 */
  font-family: Arial, sans-serif; /* フォント */
  text-align: center;           /* 中央揃え */
  text-decoration: underline;   /* 下線 */
  line-height: 1.5;            /* 行の高さ */
  letter-spacing: 2px;         /* 文字間隔 */
}
```

#### サイズ

```css
.box {
  width: 200px;                 /* 幅 */
  height: 100px;                /* 高さ */
  max-width: 500px;             /* 最大幅 */
  min-height: 50px;             /* 最小高さ */
}
```

**単位：**
- `px` - ピクセル（固定サイズ）
- `%` - パーセント（親要素に対する割合）
- `em` - 親要素のフォントサイズに対する倍率
- `rem` - ルート要素のフォントサイズに対する倍率
- `vh` - ビューポート（画面）の高さに対する割合
- `vw` - ビューポートの幅に対する割合

### ボックスモデル

すべてのHTML要素は「箱」として扱われます：

```
┌─────────────────────────────────┐
│         margin（外側の余白）       │
│  ┌───────────────────────────┐  │
│  │   border（枠線）            │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ padding（内側の余白） │  │  │
│  │  │  ┌───────────────┐  │  │  │
│  │  │  │   content    │  │  │  │
│  │  │  │  （内容）     │  │  │  │
│  │  │  └───────────────┘  │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

```css
.box {
  /* 内容のサイズ */
  width: 200px;
  height: 100px;
  
  /* 内側の余白 */
  padding: 20px;                 /* 全方向 */
  padding-top: 10px;            /* 上だけ */
  padding-right: 15px;          /* 右だけ */
  padding-bottom: 10px;         /* 下だけ */
  padding-left: 15px;           /* 左だけ */
  padding: 10px 20px;           /* 上下 左右 */
  padding: 10px 15px 20px 15px; /* 上 右 下 左 */
  
  /* 枠線 */
  border: 2px solid black;      /* 太さ スタイル 色 */
  border-radius: 10px;          /* 角を丸く */
  
  /* 外側の余白 */
  margin: 20px;                 /* paddingと同じ指定方法 */
  margin: 0 auto;               /* 左右中央揃え */
}
```

### レイアウト

#### Display

```css
.element {
  display: block;        /* ブロック要素（縦に並ぶ） */
  display: inline;       /* インライン要素（横に並ぶ） */
  display: inline-block; /* 両方の特徴を持つ */
  display: none;         /* 非表示 */
}
```

#### Position

```css
.element {
  position: static;      /* デフォルト（通常配置） */
  position: relative;    /* 相対位置 */
  position: absolute;    /* 絶対位置 */
  position: fixed;       /* 固定位置（スクロールしても動かない） */
  position: sticky;      /* スクロール時に固定 */
  
  /* 位置の指定 */
  top: 10px;
  right: 20px;
  bottom: 10px;
  left: 20px;
}
```

#### Flexbox（重要！）

Flexboxは要素を柔軟に配置するための仕組みです：

```css
.container {
  display: flex;                  /* Flexboxを有効化 */
  
  /* 主軸の方向 */
  flex-direction: row;            /* 横並び（デフォルト） */
  flex-direction: column;         /* 縦並び */
  
  /* 主軸の配置 */
  justify-content: flex-start;    /* 左揃え */
  justify-content: center;        /* 中央揃え */
  justify-content: flex-end;      /* 右揃え */
  justify-content: space-between; /* 両端揃え */
  justify-content: space-around;  /* 均等配置 */
  
  /* 交差軸の配置 */
  align-items: flex-start;        /* 上揃え */
  align-items: center;            /* 中央揃え */
  align-items: flex-end;          /* 下揃え */
  align-items: stretch;           /* 伸ばす */
  
  /* 折り返し */
  flex-wrap: nowrap;              /* 折り返さない */
  flex-wrap: wrap;                /* 折り返す */
  
  /* 間隔 */
  gap: 10px;                      /* アイテム間の間隔 */
}

.item {
  flex: 1;                        /* 均等に伸縮 */
  flex-shrink: 0;                 /* 縮小しない */
}
```

**Flexboxの例：**

```html
<div class="container">
  <div class="item">アイテム1</div>
  <div class="item">アイテム2</div>
  <div class="item">アイテム3</div>
</div>
```

```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
```

表示イメージ：
```
┌────────────────────────────────────┐
│ [アイテム1]  [アイテム2]  [アイテム3] │
└────────────────────────────────────┘
```

#### Grid

Gridは2次元のレイアウトを作るための仕組みです：

```css
.container {
  display: grid;
  
  /* 列の定義 */
  grid-template-columns: 1fr 1fr 1fr;  /* 3列（均等） */
  grid-template-columns: 200px 1fr;    /* 固定幅と可変幅 */
  grid-template-columns: repeat(3, 1fr); /* 3列を繰り返し */
  
  /* 行の定義 */
  grid-template-rows: 100px 200px;
  
  /* 間隔 */
  gap: 20px;                           /* 行と列の間隔 */
  row-gap: 10px;                       /* 行の間隔 */
  column-gap: 20px;                    /* 列の間隔 */
}

.item {
  /* アイテムの配置 */
  grid-column: 1 / 3;                  /* 1列目から3列目まで */
  grid-row: 1 / 2;                     /* 1行目から2行目まで */
}
```

**Gridの例：**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
```

表示イメージ：
```
┌─────┬─────┬─────┐
│  1  │  2  │  3  │
├─────┼─────┼─────┤
│  4  │  5  │  6  │
└─────┴─────┴─────┘
```

### レスポンシブデザイン

画面サイズに応じてスタイルを変更します：

```css
/* スマートフォン（デフォルト） */
.container {
  width: 100%;
  padding: 10px;
}

/* タブレット以上 */
@media (min-width: 768px) {
  .container {
    width: 750px;
    padding: 20px;
  }
}

/* デスクトップ以上 */
@media (min-width: 1024px) {
  .container {
    width: 1000px;
    padding: 30px;
  }
}
```

---

## 2.4 JavaScript入門

### JavaScriptとは

**JavaScript**は、Webページに**動き**や**インタラクション**（ユーザーとのやり取り）を付ける言語です。

```
HTML（構造） + CSS（装飾） + JavaScript（動き） = 動的なWebページ
```

**JavaScriptでできること：**
- ボタンをクリックしたときの処理
- フォームの入力チェック
- アニメーション
- サーバーとのデータのやり取り
- ページの内容を動的に変更

### JavaScriptの書き方

#### 1. インラインスクリプト

```html
<button onclick="alert('クリックされました！')">クリック</button>
```

#### 2. 内部スクリプト

```html
<script>
  console.log('Hello, JavaScript!');
</script>
```

#### 3. 外部スクリプト（推奨）

**script.js:**
```javascript
console.log('Hello, JavaScript!');
```

**index.html:**
```html
<script src="script.js"></script>
```

### 変数と定数

変数はデータを入れる「箱」です。

#### let（変数）

```javascript
let name = '田中';        // 文字列
let age = 25;             // 数値
let isStudent = true;     // 真偽値

// 後から変更できる
name = '佐藤';
age = 26;
```

#### const（定数）

```javascript
const PI = 3.14;          // 定数（変更できない）
const siteName = 'BOLD軽音';

// エラー！変更できない
// PI = 3.15;
```

#### var（古い書き方）

```javascript
var oldWay = 'これは古い書き方';
// 今はletとconstを使います
```

> 💡 **使い分け**: 基本的に`const`を使い、変更が必要なときだけ`let`を使います。

### データ型

#### 文字列（String）

```javascript
const str1 = 'シングルクォート';
const str2 = "ダブルクォート";
const str3 = `バッククォート（テンプレートリテラル）`;

// 文字列の結合
const firstName = '太郎';
const lastName = '山田';
const fullName = lastName + firstName;  // '山田太郎'

// テンプレートリテラル（便利！）
const greeting = `こんにちは、${fullName}さん`;  // 'こんにちは、山田太郎さん'
```

#### 数値（Number）

```javascript
const integer = 10;        // 整数
const float = 3.14;        // 小数
const negative = -5;       // 負の数

// 計算
const sum = 10 + 5;        // 15（足し算）
const diff = 10 - 5;       // 5（引き算）
const product = 10 * 5;    // 50（掛け算）
const quotient = 10 / 5;   // 2（割り算）
const remainder = 10 % 3;  // 1（余り）
```

#### 真偽値（Boolean）

```javascript
const isTrue = true;
const isFalse = false;

// 比較演算子
const isEqual = 10 === 10;        // true（等しい）
const isNotEqual = 10 !== 5;      // true（等しくない）
const isGreater = 10 > 5;         // true（より大きい）
const isLess = 10 < 5;            // false（より小さい）
const isGreaterOrEqual = 10 >= 10; // true（以上）
const isLessOrEqual = 10 <= 5;    // false（以下）
```

> ⚠️ **注意**: `===`（厳密等価）を使い、`==`（等価）は避けましょう。

#### null と undefined

```javascript
let empty = null;          // 明示的に「空」
let notDefined;            // undefined（未定義）

console.log(notDefined);   // undefined
```

### 演算子

#### 算術演算子

```javascript
const a = 10;
const b = 3;

console.log(a + b);   // 13（加算）
console.log(a - b);   // 7（減算）
console.log(a * b);   // 30（乗算）
console.log(a / b);   // 3.333...（除算）
console.log(a % b);   // 1（剰余）
console.log(a ** b);  // 1000（べき乗）

// インクリメント・デクリメント
let count = 0;
count++;              // count = count + 1
count--;              // count = count - 1
```

#### 代入演算子

```javascript
let x = 10;

x += 5;   // x = x + 5  → 15
x -= 3;   // x = x - 3  → 12
x *= 2;   // x = x * 2  → 24
x /= 4;   // x = x / 4  → 6
```

#### 論理演算子

```javascript
const a = true;
const b = false;

console.log(a && b);  // false（AND：両方true）
console.log(a || b);  // true（OR：どちらかtrue）
console.log(!a);      // false（NOT：反転）
```

### 条件分岐

#### if文

```javascript
const age = 20;

if (age >= 20) {
  console.log('成人です');
} else if (age >= 13) {
  console.log('未成年です');
} else {
  console.log('子供です');
}
```

#### 三項演算子

```javascript
const age = 20;
const message = age >= 20 ? '成人' : '未成年';
console.log(message);  // '成人'
```

#### switch文

```javascript
const day = '月曜日';

switch (day) {
  case '月曜日':
    console.log('週の始まり');
    break;
  case '金曜日':
    console.log('週末が近い！');
    break;
  case '土曜日':
  case '日曜日':
    console.log('週末です');
    break;
  default:
    console.log('平日です');
}
```

### ループ

#### for文

```javascript
// 0から4まで繰り返し
for (let i = 0; i < 5; i++) {
  console.log(i);  // 0, 1, 2, 3, 4
}
```

#### while文

```javascript
let count = 0;

while (count < 5) {
  console.log(count);
  count++;
}
```

#### do...while文

```javascript
let count = 0;

do {
  console.log(count);
  count++;
} while (count < 5);
// 少なくとも1回は実行される
```

#### break と continue

```javascript
// break: ループを抜ける
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i);  // 0, 1, 2, 3, 4
}

// continue: 次のループへ
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  console.log(i);  // 0, 1, 3, 4（2をスキップ）
}
```

### 関数

関数は処理をまとめたものです。

#### 関数宣言

```javascript
function greet(name) {
  return `こんにちは、${name}さん`;
}

const message = greet('田中');
console.log(message);  // 'こんにちは、田中さん'
```

#### アロー関数（モダンな書き方）

```javascript
const greet = (name) => {
  return `こんにちは、${name}さん`;
};

// 1行なら{}とreturnを省略できる
const greet2 = (name) => `こんにちは、${name}さん`;

// 引数が1つなら()も省略できる
const greet3 = name => `こんにちは、${name}さん`;
```

#### デフォルト引数

```javascript
function greet(name = 'ゲスト') {
  return `こんにちは、${name}さん`;
}

console.log(greet());        // 'こんにちは、ゲストさん'
console.log(greet('田中'));  // 'こんにちは、田中さん'
```

### オブジェクトと配列

#### オブジェクト

```javascript
const user = {
  name: '田中太郎',
  age: 25,
  email: 'tanaka@example.com',
  isStudent: true
};

// プロパティへのアクセス
console.log(user.name);       // '田中太郎'
console.log(user['age']);     // 25

// プロパティの追加
user.city = '東京';

// プロパティの削除
delete user.isStudent;

// メソッド（オブジェクトの中の関数）
const user2 = {
  name: '田中',
  greet: function() {
    return `こんにちは、${this.name}です`;
  }
};

console.log(user2.greet());  // 'こんにちは、田中です'
```

#### 配列

```javascript
const fruits = ['りんご', 'バナナ', 'オレンジ'];

// インデックスでアクセス（0から始まる）
console.log(fruits[0]);      // 'りんご'
console.log(fruits[1]);      // 'バナナ'

// 長さ
console.log(fruits.length);  // 3

// 要素の追加
fruits.push('ぶどう');       // 末尾に追加
fruits.unshift('いちご');    // 先頭に追加

// 要素の削除
fruits.pop();                // 末尾から削除
fruits.shift();              // 先頭から削除

// 要素の検索
console.log(fruits.includes('りんご'));  // true
console.log(fruits.indexOf('バナナ'));   // 1
```

#### 配列の便利なメソッド

```javascript
const numbers = [1, 2, 3, 4, 5];

// map: 各要素を変換
const doubled = numbers.map(n => n * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// filter: 条件に合う要素を抽出
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);    // [2, 4]

// reduce: 累積計算
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log(sum);      // 15

// find: 条件に合う最初の要素
const found = numbers.find(n => n > 3);
console.log(found);    // 4

// forEach: 各要素に対して処理
numbers.forEach(n => console.log(n));
```

### DOM操作

**DOM**（Document Object Model）は、HTMLをJavaScriptで操作するための仕組みです。

#### 要素の取得

```javascript
// IDで取得
const element = document.getElementById('myId');

// クラスで取得（最初の1つ）
const element2 = document.querySelector('.myClass');

// クラスで取得（すべて）
const elements = document.querySelectorAll('.myClass');

// タグで取得
const paragraphs = document.getElementsByTagName('p');
```

#### 要素の操作

```javascript
// テキストの変更
element.textContent = '新しいテキスト';

// HTMLの変更
element.innerHTML = '<strong>太字のテキスト</strong>';

// 属性の取得・設定
const href = element.getAttribute('href');
element.setAttribute('href', 'https://example.com');

// スタイルの変更
element.style.color = 'red';
element.style.fontSize = '20px';

// クラスの操作
element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('selected');
element.classList.contains('active');  // true/false
```

#### 要素の作成・削除

```javascript
// 要素の作成
const newDiv = document.createElement('div');
newDiv.textContent = '新しい要素';
newDiv.className = 'box';

// 要素の追加
document.body.appendChild(newDiv);

// 要素の削除
element.remove();

// 子要素の削除
parent.removeChild(child);
```

#### イベントリスナー

```javascript
const button = document.querySelector('#myButton');

// クリックイベント
button.addEventListener('click', () => {
  console.log('ボタンがクリックされました！');
});

// フォーム送信イベント
const form = document.querySelector('#myForm');
form.addEventListener('submit', (event) => {
  event.preventDefault();  // デフォルトの動作を防ぐ
  console.log('フォームが送信されました');
});

// 入力イベント
const input = document.querySelector('#myInput');
input.addEventListener('input', (event) => {
  console.log('入力値:', event.target.value);
});
```

**よく使うイベント：**
- `click` - クリック
- `dblclick` - ダブルクリック
- `mouseover` - マウスオーバー
- `mouseout` - マウスアウト
- `keydown` - キーボードを押したとき
- `keyup` - キーボードを離したとき
- `submit` - フォーム送信
- `change` - 値の変更
- `input` - 入力
- `focus` - フォーカス
- `blur` - フォーカスが外れる

---

## 実践練習

ここまでの知識を使って、簡単なWebページを作ってみましょう！

### 練習1: カウンターアプリ

**HTML:**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>カウンター</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: sans-serif;
    }
    .container {
      text-align: center;
    }
    .count {
      font-size: 72px;
      margin: 20px 0;
    }
    button {
      font-size: 20px;
      padding: 10px 20px;
      margin: 0 10px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>カウンター</h1>
    <div class="count" id="count">0</div>
    <button id="decrease">-</button>
    <button id="reset">リセット</button>
    <button id="increase">+</button>
  </div>

  <script>
    let count = 0;
    const countElement = document.getElementById('count');
    const decreaseButton = document.getElementById('decrease');
    const resetButton = document.getElementById('reset');
    const increaseButton = document.getElementById('increase');

    function updateDisplay() {
      countElement.textContent = count;
      countElement.style.color = count > 0 ? 'green' : count < 0 ? 'red' : 'black';
    }

    increaseButton.addEventListener('click', () => {
      count++;
      updateDisplay();
    });

    decreaseButton.addEventListener('click', () => {
      count--;
      updateDisplay();
    });

    resetButton.addEventListener('click', () => {
      count = 0;
      updateDisplay();
    });
  </script>
</body>
</html>
```

> 🎯 **実践**: このコードを試してみて、以下を追加してみましょう：
> - カウントが10になったらアラートを表示
> - +5、-5ボタンを追加
> - カウントの履歴を表示

---

## まとめ

この章では、Web開発の基礎となる**HTML**、**CSS**、**JavaScript**を学びました：

### HTML
- ✅ Webページの**構造**を作る
- ✅ タグと要素
- ✅ セマンティックHTML

### CSS
- ✅ Webページの**見た目**を作る
- ✅ セレクタとプロパティ
- ✅ ボックスモデル
- ✅ FlexboxとGrid

### JavaScript
- ✅ Webページに**動き**をつける
- ✅ 変数、関数、オブジェクト、配列
- ✅ DOM操作
- ✅ イベント処理

次の章では、**モダンJavaScript**（ES6以降の新機能）について学びます。これらはReactやNext.jsでよく使う重要な機能です。

---

[← 前の章：第1章 はじめに](01-はじめに.md) | [目次に戻る](00-目次.md) | [次の章へ：第3章 モダンJavaScriptの基礎 →](03-モダンJavaScriptの基礎.md)
