# 第7章：Tailwind CSS入門

この章では、**Tailwind CSS**の基本を学びます。本プロジェクトでも使用している、ユーティリティファーストのCSSフレームワークです。

## 7.1 Tailwind CSSとは

### Tailwind CSSの特徴

**Tailwind CSS**は、**ユーティリティクラス**を組み合わせてスタイリングするCSSフレームワークです。

```
従来のCSSアプローチ          Tailwind CSSアプローチ
────────────────────      ──────────────────────
HTML ───┐                 HTML + Utility Classes
        │                     │
        ▼                     ▼
   CSS ファイル              直接スタイル適用
   (.button)                 (px-4 py-2 bg-blue-500...)
        │                     │
        ▼                     ▼
   ブラウザ表示              ブラウザ表示
```

### なぜTailwind CSSなのか？

従来のCSSとTailwind CSSを比較してみましょう。

#### 従来のCSSアプローチ

```html
<!-- HTML -->
<button class="primary-button">クリック</button>

<!-- CSS -->
<style>
  .primary-button {
    padding: 0.5rem 1rem;
    background-color: #3b82f6;
    color: white;
    border-radius: 0.25rem;
    font-weight: 600;
    transition: background-color 0.3s;
  }
  
  .primary-button:hover {
    background-color: #2563eb;
  }
  
  /* 似たようなボタンが増えると... */
  .secondary-button {
    padding: 0.5rem 1rem;
    background-color: #6b7280;
    color: white;
    border-radius: 0.25rem;
    font-weight: 600;
    transition: background-color 0.3s;
  }
  
  .secondary-button:hover {
    background-color: #4b5563;
  }
</style>
```

**従来のCSSの課題：**
1. **ファイルを往復する**: HTMLとCSSファイルを行ったり来たり
2. **クラス名を考える**: 適切なクラス名を考えるのに時間がかかる
3. **重複が多い**: 似たスタイルを何度も書く
4. **CSSが肥大化**: 使わないスタイルも残りがち
5. **スコープの問題**: グローバルなクラス名の衝突

#### Tailwind CSSアプローチ

```html
<!-- プライマリボタン -->
<button class="px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-700 transition">
  クリック
</button>

<!-- セカンダリボタン -->
<button class="px-4 py-2 bg-gray-500 text-white rounded font-semibold hover:bg-gray-700 transition">
  クリック
</button>
```

**このコードの詳しい説明：**

各クラスが単一の責任を持っています：

```
px-4          → padding-left: 1rem; padding-right: 1rem;
py-2          → padding-top: 0.5rem; padding-bottom: 0.5rem;
bg-blue-500   → background-color: #3b82f6;
text-white    → color: white;
rounded       → border-radius: 0.25rem;
font-semibold → font-weight: 600;
hover:bg-blue-700 → (ホバー時) background-color: #1d4ed8;
transition    → transition: all 0.3s;
```

**実行フロー：**

```
1. HTMLを書く
   ↓
2. ユーティリティクラスを追加
   ↓
3. Tailwindが使用されたクラスを検出
   ↓
4. 必要なCSSだけを生成
   ↓
5. ブラウザで表示
```

### Tailwind CSSの利点

#### 1. 高速な開発

```html
<!-- CSSファイルを書かずに完結 -->
<div class="flex items-center justify-between p-4 bg-white shadow rounded">
  <h2 class="text-xl font-bold">タイトル</h2>
  <button class="px-4 py-2 bg-blue-500 text-white rounded">
    編集
  </button>
</div>
```

**メモリイメージ：**

```
開発者の頭の中
──────────────
「flexで並べて...」   → flex
「中央揃えで...」     → items-center justify-between
「余白を付けて...」   → p-4
「白い背景で...」     → bg-white
「影を付けて...」     → shadow

↓ すぐにクラスとして書ける！
```

#### 2. 一貫性のあるデザインシステム

Tailwindには標準のデザイントークンが組み込まれています：

```
色の段階（50-950）
──────────────────
gray-50   #f9fafb  （最も明るい）
gray-100  #f3f4f6
gray-200  #e5e7eb
gray-300  #d1d5db
gray-400  #9ca3af
gray-500  #6b7280  （中間）
gray-600  #4b5563
gray-700  #374151
gray-800  #1f2937
gray-900  #111827  （最も暗い）
gray-950  #030712

スペーシング（0.25rem = 4px単位）
──────────────────────────
0     0rem     0px
1     0.25rem  4px
2     0.5rem   8px
3     0.75rem  12px
4     1rem     16px
6     1.5rem   24px
8     2rem     32px
12    3rem     48px
16    4rem     64px
```

#### 3. 軽量な最終CSS

Tailwindは**PurgeCSS**を使って、使用していないクラスを削除します：

```
開発時のCSS         本番のCSS
────────────       ──────────
3-4MB              5-10KB
（全クラス）         （使用分のみ）

    ↓ ビルド時に最適化
    
使ったクラスだけが残る！
```

#### 4. カスタマイズ可能

`tailwind.config.js`で自由にカスタマイズできます：

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1e40af',
        'brand-red': '#dc2626',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
}
```

### Tailwind CSSの欠点と対策

#### 欠点1: HTMLが長くなる

```html
<!-- クラス名が長い -->
<button class="px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-700 transition duration-300 shadow-lg">
  クリック
</button>
```

**対策: コンポーネント化**

```tsx
// Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-700 transition duration-300 shadow-lg">
      {children}
    </button>
  );
}

// 使用
<Button>クリック</Button>
```

#### 欠点2: クラス名を覚える必要がある

**対策: エディタの拡張機能**

- **Tailwind CSS IntelliSense**: VSCodeの拡張機能で、クラス名の補完とプレビューが表示される
- **公式ドキュメント**: わかりやすい検索機能

#### 欠点3: チームで統一が必要

**対策: ルールの策定**

```typescript
// 同じスタイルでも書き方が色々...
"p-4"              // OK: padding全方向
"px-4 py-4"        // NG: 冗長
"pt-4 pr-4 pb-4 pl-4"  // NG: さらに冗長

// チームで統一ルールを決める
```

### 比較表：CSS手法の違い

| 手法 | 記述場所 | 再利用性 | 学習コスト | ファイルサイズ | おすすめ度 |
|------|----------|----------|------------|----------------|------------|
| **インラインCSS** | HTML内 | ×低い | ○低い | △普通 | × |
| **従来のCSS** | 別ファイル | ○高い | ○低い | △肥大化しがち | △ |
| **CSS Modules** | 別ファイル | ○高い | △普通 | ○適切 | ○ |
| **CSS-in-JS** | JS内 | ○高い | △高い | ○適切 | ○ |
| **Tailwind CSS** | HTML内 | ◎最高 | △普通 | ◎最小 | ◎ |

### Tailwind CSSが向いているプロジェクト

#### ✅ 向いている

1. **プロトタイプ開発**: 素早くUIを作りたい
2. **チーム開発**: デザインの一貫性を保ちたい
3. **Reactプロジェクト**: コンポーネント指向との相性が良い
4. **頻繁な変更**: デザインの変更が多い
5. **レスポンシブ**: モバイル対応が必須

#### ❌ 向いていない

1. **複雑なアニメーション**: keyframesが多い場合
2. **既存プロジェクト**: すでに大量のCSSがある
3. **学習時間がない**: すぐに使える人が少ない

### BOLD軽音サークルでの利用例

このプロジェクトでは、Tailwind CSSを全面的に採用しています：

```tsx
// src/app/posts/page.tsx（活動報告一覧）
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <h1 className="text-3xl font-bold mb-8">活動報告</h1>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {posts.map(post => (
      <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
        {/* 投稿カード */}
      </article>
    ))}
  </div>
</div>
```

**このコードの詳しい説明：**

```
max-w-7xl     → 最大幅を制限（1280px）
mx-auto       → 左右中央揃え
px-4          → 左右にpadding 16px
sm:px-6       → 640px以上でpadding 24px
lg:px-8       → 1024px以上でpadding 32px
py-8          → 上下にpadding 32px

grid                → Gridレイアウト
grid-cols-1         → スマホ: 1列
md:grid-cols-2      → タブレット: 2列
lg:grid-cols-3      → PC: 3列
gap-6               → アイテム間の間隔 24px

bg-white            → 背景白
rounded-lg          → 角丸（8px）
shadow-md           → 中程度の影
hover:shadow-xl     → ホバー時に大きな影
transition          → スムーズな変化
```

### 初心者への補足

#### 💡 ユーティリティファーストとは？

「小さな単一目的のクラス」を組み合わせてスタイリングする手法です：

```html
<!-- ✅ 良い例：単一目的のクラスを組み合わせ -->
<div class="p-4 bg-white rounded shadow">

<!-- ❌ 悪い例：大きな包括的なクラス -->
<div class="card">
```

#### 💡 よくある質問

**Q1: クラス名が長すぎませんか？**

A: Reactのコンポーネント化で解決できます。共通のスタイルはコンポーネントにまとめましょう。

**Q2: CSSを書けなくなりませんか？**

A: Tailwindは内部的には普通のCSSです。むしろCSSの理解が深まります。

**Q3: カスタムデザインはできますか？**

A: `tailwind.config.js`で自由にカスタマイズできます。プロジェクト独自の色やサイズも定義可能です。

**Q4: 既存のCSSライブラリと併用できますか？**

A: 可能ですが、クラス名の衝突に注意が必要です。

**Q5: パフォーマンスは大丈夫ですか？**

A: PurgeCSSにより、本番環境では使用したクラスだけが含まれるため、非常に軽量です。

#### 💡 覚えておくべきこと

1. **命名規則は直感的**: `text-blue-500`は「青いテキスト」、`p-4`は「padding 16px」
2. **ブレークポイント**: `md:`、`lg:`などで画面サイズごとにスタイルを変更
3. **hover/focus**: `hover:bg-blue-700`のように状態でスタイル変更
4. **組み合わせ**: 複数のクラスを組み合わせて複雑なスタイルを実現

---

## 7.2 基本的なユーティリティクラス

この節では、Tailwind CSSで最もよく使う基本的なユーティリティクラスを学びます。

### レイアウト

#### Display

Displayプロパティは要素の表示方法を制御します。

```html
<!-- Block（ブロック要素） -->
<div class="block">ブロック</div>

<!-- Inline Block -->
<span class="inline-block">インラインブロック</span>

<!-- Inline -->
<span class="inline">インライン</span>

<!-- Flex -->
<div class="flex">
  <div>アイテム1</div>
  <div>アイテム2</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

<!-- Hidden（非表示） -->
<div class="hidden">見えません</div>
```

**このコードの詳しい説明：**

各display値がどのように要素を配置するか：

```
block
──────────────────────
[アイテム1        ]
[アイテム2        ]
[アイテム3        ]
（縦に積み重なる）

inline-block
──────────────────────
[アイテム1][アイテム2][アイテム3]
（横並び、幅・高さ設定可能）

inline
──────────────────────
アイテム1 アイテム2 アイテム3
（テキストのように扱われる）

flex
──────────────────────
[アイテム1] [アイテム2] [アイテム3]
（柔軟な配置が可能）

grid
──────────────────────
[1] [2] [3]
[4] [5] [6]
（グリッド状に配置）

hidden
──────────────────────
（何も表示されない）
display: none; と同じ
```

**実行フロー：**

```
1. HTMLタグに display クラスを指定
   ↓
2. ブラウザがクラスを読み取る
   ↓
3. 対応する CSS display プロパティを適用
   ↓
4. 要素が指定された方法で配置される
```

#### 幅と高さ

要素のサイズを制御するクラスです。

```html
<!-- 固定幅 -->
<div class="w-64">幅256px</div>
<div class="w-96">幅384px</div>

<!-- パーセント -->
<div class="w-full">幅100%</div>
<div class="w-1/2">幅50%</div>
<div class="w-1/3">幅33.33%</div>
<div class="w-2/3">幅66.66%</div>

<!-- ビューポート -->
<div class="w-screen">画面の幅</div>
<div class="h-screen">画面の高さ</div>

<!-- 最小・最大 -->
<div class="min-w-0">最小幅0</div>
<div class="max-w-md">最大幅448px</div>
<div class="max-w-xl">最大幅576px</div>
<div class="max-w-2xl">最大幅672px</div>
```

**サイズの単位：**

```
Tailwindのスペーシングスケール
────────────────────────────
クラス   rem      px     用途
────────────────────────────
w-0      0        0      なし
w-1      0.25rem  4px    極小
w-2      0.5rem   8px    小
w-4      1rem     16px   標準
w-8      2rem     32px   中
w-16     4rem     64px   大
w-32     8rem     128px  特大
w-64     16rem    256px  超大
w-96     24rem    384px  巨大

パーセント幅
────────────────────────────
w-full   100%   親要素いっぱい
w-1/2    50%    親要素の半分
w-1/3    33.33% 親要素の1/3
w-2/3    66.66% 親要素の2/3
w-1/4    25%    親要素の1/4
w-3/4    75%    親要素の3/4

特殊な幅
────────────────────────────
w-screen  100vw  画面幅いっぱい
w-auto    auto   自動調整
w-fit     fit-content コンテンツに合わせる

最大幅（max-w-*）
────────────────────────────
max-w-sm   384px   小さいコンテナ
max-w-md   448px   中くらいコンテナ
max-w-lg   512px   大きいコンテナ
max-w-xl   576px   特大コンテナ
max-w-2xl  672px   超大コンテナ
max-w-7xl  1280px  最大級コンテナ
```

**このコードの詳しい説明：**

```tsx
// 実用例：中央寄せコンテナ
<div className="max-w-4xl mx-auto px-4">
  {/* コンテンツ */}
</div>
```

```
親要素（画面幅いっぱい）
├─────────────────────────────┤
    │                        │
    │  [コンテンツ]          │
    │  max-w-4xl (896px)     │
    │  mx-auto (左右中央)    │
    │                        │

スマホ（375px）
├──────────┤
  [コンテンツ]
  (画面幅100%)

PC（1920px）
├──────────────────────────────────┤
          [コンテンツ]
          (896pxに制限)
```

### 余白（Padding / Margin）

**Padding（内側の余白）** と **Margin（外側の余白）** を制御します。

```html
<!-- Padding（内側の余白） -->
<div class="p-4">全方向に16px</div>
<div class="px-4">左右に16px</div>
<div class="py-4">上下に16px</div>
<div class="pt-4">上に16px</div>
<div class="pr-4">右に16px</div>
<div class="pb-4">下に16px</div>
<div class="pl-4">左に16px</div>

<!-- Margin（外側の余白） -->
<div class="m-4">全方向に16px</div>
<div class="mx-4">左右に16px</div>
<div class="my-4">上下に16px</div>
<div class="mt-4">上に16px</div>

<!-- 自動マージン（中央揃え） -->
<div class="mx-auto">左右中央</div>

<!-- 負のマージン -->
<div class="-mt-4">上に-16px</div>
```

**メモリイメージ：Padding vs Margin**

```
Margin (m-*)
────────────────────────────
                ↑
                mt-4 (上マージン)
                ↑
┌──────────────────────────┐
│← ml-4    Border    mr-4 →│
│  ┌─────────────────────┐ │
│  │← pl-4  Padding  pr-4│ │
│  │  ┌───────────────┐  │ │
│  │  │               │  │ │
│  │pt│   Content     │pb│ │
│  │-4│               │-4│ │
│  │  └───────────────┘  │ │
│  └─────────────────────┘ │
└──────────────────────────┘
                ↓
                mb-4 (下マージン)
                ↓

Paddingは内側の余白 → 背景色が適用される
Marginは外側の余白 → 背景色は適用されない
```

**命名規則：**

```
方向の略語
──────────────────
p   → padding
m   → margin

t   → top (上)
r   → right (右)
b   → bottom (下)
l   → left (左)
x   → left + right (左右)
y   → top + bottom (上下)
(なし) → all (全方向)

組み合わせ
──────────────────
pt-4  → padding-top: 1rem;
px-4  → padding-left: 1rem; padding-right: 1rem;
m-4   → margin: 1rem;
-mt-4 → margin-top: -1rem; (負の値)
```

**このコードの詳しい説明：**

```tsx
// カード型コンポーネント
<div className="p-6 m-4 bg-white rounded shadow">
  <h2 className="mb-2">タイトル</h2>
  <p>本文</p>
</div>
```

```
余白の適用順序
──────────────────────────────
1. m-4 (外側のマージン 16px)
   └→ 周囲の要素との距離

2. p-6 (内側のパディング 24px)
   └→ コンテンツとボーダーの距離

3. mb-2 (h2の下マージン 8px)
   └→ タイトルと本文の距離

視覚イメージ
──────────────────────────────
        ↑ m-4 (16px)
┌──────────────────┐
│ ↑ p-6 (24px)     │
│ ┌─────────────┐  │
│ │ タイトル    │  │
│ │ ↓ mb-2 (8px)│  │
│ │ 本文        │  │
│ └─────────────┘  │
│                  │
└──────────────────┘
```

### Flexbox

Flexboxは要素を柔軟に配置するレイアウト手法です。

```html
<!-- 基本のFlex -->
<div class="flex">
  <div>アイテム1</div>
  <div>アイテム2</div>
  <div>アイテム3</div>
</div>

<!-- 方向 -->
<div class="flex flex-row">横並び（デフォルト）</div>
<div class="flex flex-col">縦並び</div>

<!-- 主軸の配置（justify-content） -->
<div class="flex justify-start">左揃え</div>
<div class="flex justify-center">中央揃え</div>
<div class="flex justify-end">右揃え</div>
<div class="flex justify-between">両端揃え</div>
<div class="flex justify-around">均等配置</div>

<!-- 交差軸の配置（align-items） -->
<div class="flex items-start">上揃え</div>
<div class="flex items-center">中央揃え</div>
<div class="flex items-end">下揃え</div>
<div class="flex items-stretch">伸ばす</div>

<!-- 折り返し -->
<div class="flex flex-wrap">折り返す</div>

<!-- 間隔 -->
<div class="flex gap-4">アイテム間に16px</div>
<div class="flex gap-x-4">横方向に16px</div>
<div class="flex gap-y-4">縦方向に16px</div>

<!-- 実用例：中央揃え -->
<div class="flex items-center justify-center h-screen">
  <p>画面の中央</p>
</div>

<!-- 実用例：左右に配置 -->
<div class="flex justify-between items-center">
  <div>左側</div>
  <div>右側</div>
</div>
```

**Flexboxの配置イメージ：**

```
flex-row (横並び・デフォルト)
────────────────────────────
主軸 (Main Axis) →
┌────────────────────────┐
│[1] [2] [3]             │
└────────────────────────┘
交差軸 (Cross Axis) ↓

flex-col (縦並び)
────────────────────────────
主軸 (Main Axis) ↓
┌──────┐
│ [1]  │
│ [2]  │
│ [3]  │
└──────┘
交差軸 (Cross Axis) →

justify-content (主軸の配置)
────────────────────────────
justify-start
[1][2][3]                 

justify-center
      [1][2][3]           

justify-end
                  [1][2][3]

justify-between
[1]      [2]      [3]

justify-around
  [1]    [2]    [3]

items (交差軸の配置)
────────────────────────────
items-start (上揃え)
┌─────────────────┐
│[1] [2] [3]      │
│                 │
└─────────────────┘

items-center (中央揃え)
┌─────────────────┐
│                 │
│[1] [2] [3]      │
│                 │
└─────────────────┘

items-end (下揃え)
┌─────────────────┐
│                 │
│      [1] [2] [3]│
└─────────────────┘

items-stretch (伸ばす)
┌─────────────────┐
│[1] [2] [3]      │
│ │   │   │       │
│ │   │   │       │
└─────────────────┘
```

**このコードの詳しい説明：**

```tsx
// ヘッダーコンポーネント
<header className="flex items-center justify-between p-4 bg-white shadow">
  <div className="flex items-center gap-2">
    <img src="/logo.png" className="h-8" />
    <span className="font-bold">BOLD軽音</span>
  </div>
  
  <nav className="flex gap-4">
    <a href="/">ホーム</a>
    <a href="/posts">活動報告</a>
    <a href="/schedule">スケジュール</a>
  </nav>
</header>
```

```
実行フロー
──────────────────────────────
1. flex → ヘッダーをFlexboxコンテナに
   ├─ ロゴ部分
   └─ ナビゲーション

2. items-center → 縦方向の中央揃え
   （ロゴとナビを同じ高さに）

3. justify-between → 横方向の両端揃え
   （ロゴを左、ナビを右に）

4. gap-4 → アイテム間に16pxの間隔

視覚イメージ
──────────────────────────────
┌─────────────────────────────┐
│ [ロゴ BOLD軽音]    [ホーム 活動報告 スケジュール] │
│                                               │
└─────────────────────────────┘
  ↑                            ↑
  justify-between で左右に配置
```

**実用例：カードのレイアウト**

```tsx
<div className="flex flex-col h-full">
  {/* 画像 */}
  <img src="/post.jpg" className="w-full h-48 object-cover" />
  
  {/* コンテンツ（伸縮） */}
  <div className="flex-1 p-4">
    <h3 className="font-bold">タイトル</h3>
    <p>説明文...</p>
  </div>
  
  {/* フッター（固定） */}
  <div className="p-4 border-t">
    <button>詳細を見る</button>
  </div>
</div>
```

```
カードの構造
──────────────────────
┌──────────────────┐
│      画像        │ ← 固定高さ (h-48)
├──────────────────┤
│ タイトル         │
│ 説明文...        │ ← flex-1 (伸縮)
│                  │
├──────────────────┤
│ [詳細を見る]     │ ← 固定（常に下に）
└──────────────────┘
```

### Grid

CSS Gridは要素を格子状に配置するレイアウト手法です。

```html
<!-- 基本のGrid -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
</div>

<!-- 列数の指定 -->
<div class="grid grid-cols-2">2列</div>
<div class="grid grid-cols-3">3列</div>
<div class="grid grid-cols-4">4列</div>

<!-- 行数の指定 -->
<div class="grid grid-rows-2">2行</div>

<!-- アイテムのスパン -->
<div class="grid grid-cols-4">
  <div class="col-span-2">2列分</div>
  <div>1列</div>
  <div>1列</div>
</div>

<!-- レスポンシブGrid（後述） -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- スマホ: 1列、タブレット: 2列、PC: 3列 -->
</div>
```

**Gridの配置イメージ：**

```
grid-cols-3 gap-4
──────────────────────────────
┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │
└───┘ └───┘ └───┘
  ↕ gap-4 (16px)
┌───┐ ┌───┐ ┌───┐
│ 4 │ │ 5 │ │ 6 │
└───┘ └───┘ └───┘

col-span-2 (2列分)
──────────────────────────────
┌─────────────┐ ┌───┐
│      1      │ │ 2 │
│ (2列分)     │ │   │
└─────────────┘ └───┘
┌───┐ ┌───┐ ┌───┐
│ 3 │ │ 4 │ │ 5 │
└───┘ └───┘ └───┘

row-span-2 (2行分)
──────────────────────────────
┌───┐ ┌───┐
│ 1 │ │   │
└───┘ │ 2 │
┌───┐ │   │
│ 3 │ │(2行分)
└───┘ └───┘
```

**このコードの詳しい説明：**

```tsx
// 活動報告一覧
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {posts.map(post => (
    <article key={post.id} className="bg-white rounded-lg shadow-md p-4">
      <h3>{post.title}</h3>
      <p>{post.content}</p>
    </article>
  ))}
</div>
```

```
レスポンシブGridの動作
──────────────────────────────
スマホ (< 768px)
grid-cols-1
┌─────────────┐
│   記事1     │
├─────────────┤
│   記事2     │
├─────────────┤
│   記事3     │
└─────────────┘

タブレット (768px - 1024px)
md:grid-cols-2
┌─────────┐ ┌─────────┐
│  記事1  │ │  記事2  │
├─────────┤ ├─────────┤
│  記事3  │ │  記事4  │
└─────────┘ └─────────┘

PC (> 1024px)
lg:grid-cols-3
┌─────┐ ┌─────┐ ┌─────┐
│記事1│ │記事2│ │記事3│
├─────┤ ├─────┤ ├─────┤
│記事4│ │記事5│ │記事6│
└─────┘ └─────┘ └─────┘
```

### Positionによる配置

要素の配置方法を制御します。

```html
<!-- Static（デフォルト） -->
<div class="static">通常の配置</div>

<!-- Relative（相対位置） -->
<div class="relative top-4 left-4">
  元の位置から上に16px、左に16px
</div>

<!-- Absolute（絶対位置） -->
<div class="relative">
  <div class="absolute top-0 right-0">
    親要素の右上に配置
  </div>
</div>

<!-- Fixed（固定位置） -->
<div class="fixed bottom-4 right-4">
  画面右下に固定
</div>

<!-- Sticky（スクロール時に固定） -->
<div class="sticky top-0">
  スクロールで上に到達したら固定
</div>
```

**Positionの挙動イメージ：**

```
static（デフォルト）
──────────────────────────────
[要素1]
[要素2]
[要素3]
（通常のフロー）

relative
──────────────────────────────
        ┌───────┐ ← 元の位置
        │       │
    ┌───────┐   │
    │要素2  │   │
    │(移動) │───┘
    └───────┘
（元の位置は維持される）

absolute
──────────────────────────────
親要素 (relative)
┌─────────────────┐
│                 │
│         ┌─────┐ │
│         │要素 │←┘
│         └─────┘
│                 │
└─────────────────┘
（親要素からの絶対位置）

fixed
──────────────────────────────
ブラウザウィンドウ
┌─────────────────┐
│                 │
│  (スクロール)   │
│                 │
│         ┌─────┐ │
│         │要素 │←┘
└─────────────────┘
（画面に固定、スクロールしても動かない）

sticky
──────────────────────────────
スクロール前
┌─────────────────┐
│ コンテンツ      │
│ ┌─────────────┐ │
│ │ sticky要素  │ │
│ └─────────────┘ │
│ コンテンツ      │

スクロール後
┌─────────────────┐
│ ┌─────────────┐ │← 上に固定
│ │ sticky要素  │ │
│ └─────────────┘ │
│ コンテンツ      │
│ コンテンツ      │
```

### 初心者への補足

#### 💡 FlexboxとGridの使い分け

**Flexboxを使う場面：**
- 一方向の配置（横並び、縦並び）
- アイテム数が可変
- 中央揃え、両端揃えなど
- ナビゲーション、ヘッダー、フッター

**Gridを使う場面：**
- 二次元の配置（行と列）
- 格子状のレイアウト
- アイテムのサイズが揃っている
- カード一覧、ギャラリー

#### 💡 よくある質問

**Q1: `flex` と `inline-flex` の違いは？**

A: `flex`はブロック要素、`inline-flex`はインライン要素です。

```html
<!-- flex: 縦に積み重なる -->
<div class="flex">...</div>
<div class="flex">...</div>

<!-- inline-flex: 横並び -->
<div class="inline-flex">...</div>
<div class="inline-flex">...</div>
```

**Q2: `gap` と `space-x/y` の違いは？**

A: `gap`はFlexbox/Grid両方で使え、より直感的です。`space-x/y`は古い書き方です。

```html
<!-- 推奨: gap -->
<div class="flex gap-4">

<!-- 古い書き方: space-x -->
<div class="flex space-x-4">
```

**Q3: なぜ `w-1/2` で50%になるの？**

A: Tailwindは分数表記をサポートしています。`1/2 = 50%`、`1/3 = 33.33%`です。

**Q4: `mx-auto` で中央揃えできるのはなぜ？**

A: `margin-left: auto; margin-right: auto;` により、左右の余白が自動調整されるためです。ただし、要素に幅（`width`）が設定されている必要があります。

#### 💡 覚えておくべきパターン

**1. コンテナの中央揃え**
```html
<div class="max-w-4xl mx-auto px-4">
  <!-- 最大幅896px、左右中央、左右にpadding -->
</div>
```

**2. 完全中央配置**
```html
<div class="flex items-center justify-center h-screen">
  <!-- 画面の真ん中 -->
</div>
```

**3. ヘッダーレイアウト**
```html
<header class="flex items-center justify-between p-4">
  <div>ロゴ</div>
  <nav>メニュー</nav>
</header>
```

**4. カードグリッド**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- レスポンシブなカード一覧 -->
</div>
```

---

## 7.3 テキストとフォント

### テキストサイズ

Tailwindは読みやすいタイポグラフィスケールを提供します。

```html
<p class="text-xs">12px</p>
<p class="text-sm">14px</p>
<p class="text-base">16px（デフォルト）</p>
<p class="text-lg">18px</p>
<p class="text-xl">20px</p>
<p class="text-2xl">24px</p>
<p class="text-3xl">30px</p>
<p class="text-4xl">36px</p>
<p class="text-5xl">48px</p>
```

**テキストサイズ一覧：**

```
クラス      フォントサイズ  行の高さ   用途
─────────────────────────────────────────
text-xs     12px (0.75rem)  16px      キャプション
text-sm     14px (0.875rem) 20px      小さい本文
text-base   16px (1rem)     24px      標準の本文
text-lg     18px (1.125rem) 28px      大きい本文
text-xl     20px (1.25rem)  28px      小見出し
text-2xl    24px (1.5rem)   32px      中見出し
text-3xl    30px (1.875rem) 36px      大見出し
text-4xl    36px (2.25rem)  40px      特大見出し
text-5xl    48px (3rem)     48px      超大見出し
text-6xl    60px (3.75rem)  60px      巨大見出し
```

**このコードの詳しい説明：**

```tsx
// 記事のタイポグラフィ
<article>
  <h1 className="text-4xl font-bold mb-4">記事タイトル</h1>
  <p className="text-sm text-gray-500 mb-6">2024年12月23日</p>
  <p className="text-base leading-relaxed">
    本文はtext-baseで読みやすく...
  </p>
</article>
```

**視覚イメージ：**

```
text-5xl (48px)
────────────────────────────
大見出し

text-2xl (24px)
────────────────
中見出し

text-base (16px)
────────────
本文テキスト
本文テキスト

text-sm (14px)
───────────
キャプション
```

### テキスト色

Tailwindは豊富なカラーパレットを提供します。

```html
<!-- グレースケール -->
<p class="text-black">黒</p>
<p class="text-gray-500">グレー</p>
<p class="text-white">白</p>

<!-- カラー（50-950の範囲） -->
<p class="text-red-500">赤</p>
<p class="text-blue-500">青</p>
<p class="text-green-500">緑</p>
<p class="text-yellow-500">黄色</p>
<p class="text-purple-500">紫</p>

<!-- 明度 -->
<p class="text-blue-300">明るい青</p>
<p class="text-blue-500">標準の青</p>
<p class="text-blue-700">暗い青</p>
```

**カラーパレット（青の例）：**

```
blue-50   #eff6ff  ■ 最も明るい
blue-100  #dbeafe  ■
blue-200  #bfdbfe  ■
blue-300  #93c5fd  ■ 明るい
blue-400  #60a5fa  ■
blue-500  #3b82f6  ■ 標準（メイン）
blue-600  #2563eb  ■
blue-700  #1d4ed8  ■ 暗い
blue-800  #1e40af  ■
blue-900  #1e3a8a  ■
blue-950  #172554  ■ 最も暗い
```

**実用例：テキスト色の使い分け**

```tsx
<div>
  <h1 className="text-gray-900">メインタイトル（濃い）</h1>
  <p className="text-gray-700">本文（やや濃い）</p>
  <span className="text-gray-500">補足情報（グレー）</span>
  <small className="text-gray-400">キャプション（薄い）</small>
</div>
```

```
視覚的な階層
────────────────────────
text-gray-900  ████████  メイン
text-gray-700  ██████    本文
text-gray-500  ████      補足
text-gray-400  ███       薄い
text-gray-300  ██        最も薄い
```

### フォントウェイト

フォントの太さを制御します。

```html
<p class="font-thin">100</p>
<p class="font-light">300</p>
<p class="font-normal">400（デフォルト）</p>
<p class="font-medium">500</p>
<p class="font-semibold">600</p>
<p class="font-bold">700</p>
<p class="font-extrabold">800</p>
<p class="font-black">900</p>
```

**フォントウェイトの視覚比較：**

```
font-thin      (100)  細い
font-light     (300)  やや細い
font-normal    (400)  標準
font-medium    (500)  やや太い
font-semibold  (600)  セミボールド
font-bold      (700)  太字
font-extrabold (800)  特太
font-black     (900)  極太
```

**このコードの詳しい説明：**

```tsx
// 見出しと本文の組み合わせ
<article>
  <h1 className="text-3xl font-bold text-gray-900">
    記事タイトル
  </h1>
  <h2 className="text-xl font-semibold text-gray-800 mt-6">
    小見出し
  </h2>
  <p className="text-base font-normal text-gray-700 leading-relaxed">
    本文は標準の太さで読みやすく
  </p>
</article>
```

### テキスト揃え

```html
<p class="text-left">左揃え</p>
<p class="text-center">中央揃え</p>
<p class="text-right">右揃え</p>
<p class="text-justify">両端揃え</p>
```

**テキスト揃えの視覚イメージ：**

```
text-left
────────────────────────
テキストが左に
揃います

text-center
────────────────────────
    テキストが
    中央に揃います

text-right
────────────────────────
              テキストが
           右に揃います

text-justify
────────────────────────
テキストが両端に揃い
ます。長い文章で効果
が現れます。
```

### その他のテキストスタイル

```html
<!-- 装飾 -->
<p class="underline">下線</p>
<p class="line-through">取り消し線</p>
<p class="no-underline">下線なし</p>

<!-- 大文字・小文字 -->
<p class="uppercase">UPPERCASE</p>
<p class="lowercase">lowercase</p>
<p class="capitalize">Capitalize</p>

<!-- 行の高さ -->
<p class="leading-tight">狭い</p>
<p class="leading-normal">標準</p>
<p class="leading-loose">広い</p>

<!-- 文字間隔 -->
<p class="tracking-tight">狭い</p>
<p class="tracking-normal">標準</p>
<p class="tracking-wide">広い</p>
```

---

## 7.4 色と背景

### 背景色

Tailwindは14色 × 11段階 = 154色の豊富なカラーパレットを提供します。

```html
<!-- カラー -->
<div class="bg-blue-500">青い背景</div>
<div class="bg-red-500">赤い背景</div>
<div class="bg-green-500">緑の背景</div>

<!-- グレースケール -->
<div class="bg-gray-100">薄いグレー</div>
<div class="bg-gray-500">グレー</div>
<div class="bg-gray-900">濃いグレー</div>

<!-- 透明 -->
<div class="bg-transparent">透明</div>

<!-- 実用例：カード -->
<div class="bg-white shadow-lg rounded-lg p-6">
  <h2 class="text-xl font-bold">カード</h2>
  <p class="text-gray-600">内容</p>
</div>
```

**カラーパレット全体像：**

```
色        50      500(標準)  900      用途
─────────────────────────────────────────────
slate    ■■■■■   ■■■■■    ■■■■■    グレー系
gray     ■■■■■   ■■■■■    ■■■■■    グレー系
red      ■■■■■   ■■■■■    ■■■■■    エラー、危険
orange   ■■■■■   ■■■■■    ■■■■■    警告
yellow   ■■■■■   ■■■■■    ■■■■■    注意
green    ■■■■■   ■■■■■    ■■■■■    成功、安全
blue     ■■■■■   ■■■■■    ■■■■■    プライマリ
indigo   ■■■■■   ■■■■■    ■■■■■    情報
purple   ■■■■■   ■■■■■    ■■■■■    アクセント
pink     ■■■■■   ■■■■■    ■■■■■    強調
```

**このコードの詳しい説明：**

```tsx
// ステータスバッジ
<div className="inline-flex gap-2">
  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
    成功
  </span>
  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
    警告
  </span>
  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
    エラー
  </span>
</div>
```

```
背景と文字色の組み合わせ
────────────────────────────
[  成功  ]  bg-green-100 + text-green-800
[  警告  ]  bg-yellow-100 + text-yellow-800
[ エラー ]  bg-red-100 + text-red-800

明るい背景 + 濃い文字 = 読みやすい
```

### グラデーション背景

Tailwindでは簡単にグラデーションを作成できます。

```html
<!-- 左から右へのグラデーション -->
<div class="bg-gradient-to-r from-blue-500 to-purple-500">
  左から右へ
</div>

<!-- 上から下へ -->
<div class="bg-gradient-to-b from-blue-500 to-purple-500">
  上から下へ
</div>

<!-- 対角線 -->
<div class="bg-gradient-to-br from-blue-500 to-purple-500">
  左上から右下へ
</div>

<!-- 3色グラデーション -->
<div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
  3色グラデーション
</div>
```

**グラデーションの方向：**

```
to-r  (→)    to-l  (←)    to-t  (↑)    to-b  (↓)
┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│■■■■→→│   │←←■■■■│   │↑↑↑↑↑↑│   │□□□□□□│
│■■■■→→│   │←←■■■■│   │↑↑↑↑↑↑│   │□□□□□□│
│■■■■→→│   │←←■■■■│   │↑↑↑↑↑↑│   │■■■■■■│
└────────┘   └────────┘   └────────┘   └────────┘

to-tr (↗)   to-tl (↖)   to-br (↘)   to-bl (↙)
┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│□□□□■■│   │■■□□□□│   │■■■■■■│   │■■■■■■│
│□□□■■■│   │■■■□□□│   │□□□□■■│   │■■□□□□│
│□■■■■■│   │■■■■■□│   │□□□■■■│   │■■■□□□│
└────────┘   └────────┘   └────────┘   └────────┘
```

**実用例：ヒーローセクション**

```tsx
<section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
  <div className="max-w-4xl mx-auto px-4 text-center">
    <h1 className="text-5xl font-bold mb-4">BOLD軽音サークル</h1>
    <p className="text-xl">音楽で繋がる仲間たち</p>
  </div>
</section>
```

### 不透明度

```html
<!-- 背景の不透明度 -->
<div class="bg-blue-500 bg-opacity-50">半透明</div>
<div class="bg-blue-500 bg-opacity-25">25%</div>
<div class="bg-blue-500 bg-opacity-75">75%</div>

<!-- 新しい書き方：bg-blue-500/50 -->
<div class="bg-blue-500/50">半透明（簡潔）</div>
<div class="bg-blue-500/25">25%</div>
<div class="bg-blue-500/75">75%</div>

<!-- テキストの不透明度 -->
<p class="text-black text-opacity-50">半透明のテキスト</p>
<p class="text-black/50">半透明のテキスト（簡潔）</p>
```

**不透明度の視覚イメージ：**

```
bg-blue-500/100  ██████████  100% 不透明
bg-blue-500/75   ████████    75%
bg-blue-500/50   ██████      50%  半透明
bg-blue-500/25   ████        25%
bg-blue-500/0    ░░░░░░░░░░  0%   完全透明
```

**実用例：オーバーレイ**

```tsx
// 画像の上に半透明の黒いオーバーレイ
<div className="relative">
  <img src="/hero.jpg" className="w-full h-96 object-cover" />
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
    <h2 className="text-white text-4xl font-bold">タイトル</h2>
  </div>
</div>
```

```
オーバーレイの構造
────────────────────────────
┌──────────────────────────┐
│   [画像]                 │
│   ┌────────────────────┐ │
│   │ bg-black/50        │ │
│   │   タイトル         │ │
│   │ (半透明の黒)       │ │
│   └────────────────────┘ │
└──────────────────────────┘
```

---

## 7.5 ボーダーと角丸

### ボーダー

ボーダーを細かく制御できます。

```html
<!-- ボーダーの有無 -->
<div class="border">全方向にボーダー</div>
<div class="border-t">上だけ</div>
<div class="border-r">右だけ</div>
<div class="border-b">下だけ</div>
<div class="border-l">左だけ</div>

<!-- ボーダーの太さ -->
<div class="border">1px（デフォルト）</div>
<div class="border-2">2px</div>
<div class="border-4">4px</div>
<div class="border-8">8px</div>

<!-- ボーダーの色 -->
<div class="border border-gray-300">グレー</div>
<div class="border border-blue-500">青</div>

<!-- ボーダーのスタイル -->
<div class="border border-solid">実線（デフォルト）</div>
<div class="border border-dashed">破線</div>
<div class="border border-dotted">点線</div>
<div class="border border-double">二重線</div>
```

**ボーダーの視覚イメージ：**

```
border（全方向）      border-t（上）
┌────────────┐       ──────────────
│            │       
│            │       [コンテンツ]
│            │       
└────────────┘       

border-b（下）       border-x（左右）
                     │            │
[コンテンツ]         │[コンテンツ]│
                     │            │
──────────────       

solid（実線）        dashed（破線）
──────────────       ─ ─ ─ ─ ─ ─ ─

dotted（点線）       double（二重線）
· · · · · · · ·     ══════════════
```

**このコードの詳しい説明：**

```tsx
// カード区切り
<div className="bg-white rounded-lg overflow-hidden">
  <div className="p-4 border-b border-gray-200">
    ヘッダー
  </div>
  <div className="p-4">
    コンテンツ
  </div>
  <div className="p-4 border-t border-gray-200">
    フッター
  </div>
</div>
```

```
カード構造
┌────────────────┐
│   ヘッダー     │
├────────────────┤ ← border-b
│   コンテンツ   │
├────────────────┤ ← border-t
│   フッター     │
└────────────────┘
```

### 角丸

要素の角を丸くします。

```html
<!-- 基本の角丸 -->
<div class="rounded-none">角丸なし（0px）</div>
<div class="rounded-sm">少し丸い（2px）</div>
<div class="rounded">標準（4px）</div>
<div class="rounded-md">やや丸い（6px）</div>
<div class="rounded-lg">中くらい（8px）</div>
<div class="rounded-xl">大きい（12px）</div>
<div class="rounded-2xl">とても大きい（16px）</div>
<div class="rounded-3xl">超大（24px）</div>
<div class="rounded-full">完全な円形</div>

<!-- 特定の角だけ -->
<div class="rounded-t-lg">上の角だけ</div>
<div class="rounded-r-lg">右の角だけ</div>
<div class="rounded-b-lg">下の角だけ</div>
<div class="rounded-l-lg">左の角だけ</div>
<div class="rounded-tl-lg">左上だけ</div>
<div class="rounded-tr-lg">右上だけ</div>
<div class="rounded-bl-lg">左下だけ</div>
<div class="rounded-br-lg">右下だけ</div>

<!-- 実用例：アバター -->
<img src="/avatar.jpg" class="w-16 h-16 rounded-full" />

<!-- 実用例：ボタン -->
<button class="bg-blue-500 text-white px-4 py-2 rounded-lg">
  ボタン
</button>
```

**角丸の視覚比較：**

```
rounded-none        rounded (4px)       rounded-xl (12px)
┌──────────┐       ╭──────────╮       ╭────────────╮
│          │       │          │       │            │
└──────────┘       ╰──────────╯       ╰────────────╯

rounded-full（円形）
  ╭────╮
  │    │
  ╰────╯

rounded-t-lg（上だけ）
╭──────────╮
│          │
└──────────┘
```

**実用例：さまざまな UI 要素**

```tsx
// アバター
<img 
  src="/user.jpg" 
  className="w-12 h-12 rounded-full border-2 border-white shadow"
/>

// バッジ
<span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
  New
</span>

// カード
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
  <img src="/post.jpg" className="w-full h-48 object-cover" />
  <div className="p-4">
    <h3 className="font-bold">タイトル</h3>
  </div>
</div>

// タブ（上だけ角丸）
<div className="flex gap-1 border-b">
  <button className="px-4 py-2 bg-white rounded-t-lg border border-b-0">
    タブ1
  </button>
  <button className="px-4 py-2 rounded-t-lg">
    タブ2
  </button>
</div>
```

---

## 7.6 シャドウとエフェクト

### ボックスシャドウ

影を付けて立体感を演出します。

```html
<div class="shadow-sm">小さい影</div>
<div class="shadow">標準の影</div>
<div class="shadow-md">中くらいの影</div>
<div class="shadow-lg">大きい影</div>
<div class="shadow-xl">とても大きい影</div>
<div class="shadow-2xl">最大の影</div>
<div class="shadow-none">影なし</div>

<!-- 内側の影 -->
<div class="shadow-inner">内側の影</div>

<!-- 実用例：カード -->
<div class="bg-white shadow-lg rounded-lg p-6">
  カードコンテンツ
</div>
```

**シャドウの視覚比較：**

```
shadow-sm
┌──────────┐
│          │
└──────────┘
  ░

shadow-md
┌──────────┐
│          │
└──────────┘
  ░░

shadow-xl
┌──────────┐
│          │
└──────────┘
  ░░░░

shadow-2xl
┌──────────┐
│          │
└──────────┘
  ░░░░░░
```

**シャドウの使い分け：**

| シャドウ | 用途 | 例 |
|---------|------|----|
| shadow-sm | 微妙な境界線 | インプットフィールド |
| shadow | 通常のカード | ブログカード |
| shadow-md | 強調したいカード | プライシングカード |
| shadow-lg | モーダル、ドロップダウン | メニュー |
| shadow-xl | 浮いている印象 | フローティングボタン |
| shadow-2xl | 最も強調 | ヒーローセクション |

### ホバーエフェクト

```html
<!-- ホバー時に色を変える -->
<button class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
  ホバーしてみて
</button>

<!-- ホバー時に影を付ける -->
<div class="border hover:shadow-lg transition">
  ホバーで影が出る
</div>

<!-- ホバー時に拡大 -->
<div class="transform hover:scale-105 transition">
  ホバーで拡大
</div>
```

### トランジション

```html
<!-- スムーズな変化 -->
<button class="bg-blue-500 hover:bg-blue-700 transition duration-300">
  スムーズな色変化
</button>

<!-- 複数のプロパティ -->
<div class="transform hover:scale-110 hover:shadow-xl transition-all duration-300">
  拡大と影
</div>
```

---

## 7.7 レスポンシブデザイン

Tailwind CSSでは、ブレークポイントのプレフィックスを付けてレスポンシブデザインを実現します。

### ブレークポイント

```
sm:  640px以上（タブレット）
md:  768px以上（小さいPC）
lg:  1024px以上（通常のPC）
xl:  1280px以上（大きいPC）
2xl: 1536px以上（とても大きい画面）
```

### 基本的な使い方

```html
<!-- スマホ: 1列、タブレット: 2列、PC: 3列 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div>アイテム1</div>
  <div>アイテム2</div>
  <div>アイテム3</div>
</div>

<!-- スマホで非表示、PCで表示 -->
<div class="hidden lg:block">
  PCのみ表示
</div>

<!-- スマホで表示、PCで非表示 -->
<div class="block lg:hidden">
  スマホのみ表示
</div>

<!-- レスポンシブなテキストサイズ -->
<h1 class="text-2xl md:text-4xl lg:text-6xl">
  レスポンシブな見出し
</h1>

<!-- レスポンシブなパディング -->
<div class="p-4 md:p-8 lg:p-12">
  画面サイズに応じたパディング
</div>
```

### 実用例：ナビゲーションバー

```html
<nav class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex justify-between items-center h-16">
      <!-- ロゴ -->
      <div class="flex-shrink-0">
        <img src="/logo.png" class="h-8" alt="Logo" />
      </div>
      
      <!-- デスクトップメニュー -->
      <div class="hidden md:flex space-x-8">
        <a href="/" class="text-gray-700 hover:text-blue-500">ホーム</a>
        <a href="/posts" class="text-gray-700 hover:text-blue-500">投稿</a>
        <a href="/events" class="text-gray-700 hover:text-blue-500">イベント</a>
      </div>
      
      <!-- モバイルメニューボタン -->
      <button class="md:hidden">
        <svg class="w-6 h-6"><!-- ハンバーガーアイコン --></svg>
      </button>
    </div>
  </div>
</nav>
```

---

## 7.8 よく使うパターン

### ボタン

```html
<!-- プライマリボタン -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  プライマリ
</button>

<!-- セカンダリボタン -->
<button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
  セカンダリ
</button>

<!-- アウトラインボタン -->
<button class="bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent py-2 px-4 rounded">
  アウトライン
</button>

<!-- 無効化ボタン -->
<button class="bg-gray-300 text-gray-500 py-2 px-4 rounded cursor-not-allowed" disabled>
  無効
</button>

<!-- 大きいボタン -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">
  大きいボタン
</button>
```

### カード

```html
<!-- 基本のカード -->
<div class="bg-white shadow-lg rounded-lg overflow-hidden">
  <img src="/image.jpg" class="w-full h-48 object-cover" alt="画像" />
  <div class="p-6">
    <h2 class="text-xl font-bold mb-2">カードタイトル</h2>
    <p class="text-gray-600 mb-4">カードの内容がここに入ります。</p>
    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
      詳細
    </button>
  </div>
</div>

<!-- ホバーエフェクト付きカード -->
<div class="bg-white shadow-md rounded-lg overflow-hidden transform hover:scale-105 transition duration-300 cursor-pointer">
  <img src="/image.jpg" class="w-full h-48 object-cover" alt="画像" />
  <div class="p-6">
    <h2 class="text-xl font-bold">カードタイトル</h2>
  </div>
</div>
```

### フォーム

```html
<form class="max-w-md mx-auto">
  <!-- テキスト入力 -->
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
      ユーザー名
    </label>
    <input
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
      id="username"
      type="text"
      placeholder="ユーザー名"
    />
  </div>
  
  <!-- パスワード入力 -->
  <div class="mb-6">
    <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
      パスワード
    </label>
    <input
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
      id="password"
      type="password"
      placeholder="******************"
    />
  </div>
  
  <!-- 送信ボタン -->
  <div class="flex items-center justify-between">
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      type="submit"
    >
      ログイン
    </button>
  </div>
</form>
```

### モーダル

```html
<!-- オーバーレイ -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <!-- モーダル本体 -->
  <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
    <!-- ヘッダー -->
    <div class="flex justify-between items-center border-b p-4">
      <h2 class="text-xl font-bold">モーダルタイトル</h2>
      <button class="text-gray-500 hover:text-gray-700">
        <svg class="w-6 h-6"><!-- ✕アイコン --></svg>
      </button>
    </div>
    
    <!-- コンテンツ -->
    <div class="p-6">
      <p class="text-gray-600">モーダルの内容がここに入ります。</p>
    </div>
    
    <!-- フッター -->
    <div class="flex justify-end gap-2 border-t p-4">
      <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
        キャンセル
      </button>
      <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
        確認
      </button>
    </div>
  </div>
</div>
```

### ナビゲーションバー

```html
<nav class="bg-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex justify-between items-center h-16">
      <!-- ロゴ -->
      <div class="flex items-center">
        <img src="/logo.png" class="h-8 w-auto" alt="Logo" />
        <span class="ml-2 text-xl font-bold text-gray-800">BOLD軽音</span>
      </div>
      
      <!-- メニュー -->
      <div class="flex space-x-4">
        <a href="/" class="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md">
          ホーム
        </a>
        <a href="/posts" class="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md">
          投稿
        </a>
        <a href="/events" class="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md">
          イベント
        </a>
      </div>
      
      <!-- ユーザーメニュー -->
      <div class="flex items-center space-x-2">
        <img src="/avatar.jpg" class="h-8 w-8 rounded-full" alt="Avatar" />
        <span class="text-gray-700">田中</span>
      </div>
    </div>
  </div>
</nav>
```

---

## 7.9 Next.jsでのTailwind CSS

### 設定ファイル

**tailwind.config.ts:**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... カスタムカラー
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### グローバルCSS

**src/app/globals.css:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  /* カスタムコンポーネントクラス */
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
  
  .card {
    @apply bg-white shadow-lg rounded-lg overflow-hidden;
  }
}
```

### Reactコンポーネントでの使用

```tsx
// src/components/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export default function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  const baseClasses = 'font-bold py-2 px-4 rounded transition duration-300';
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-800'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 使用
<Button variant="primary">送信</Button>
<Button variant="secondary">キャンセル</Button>
```

### clsxを使った動的クラス

```bash
# clsxをインストール
npm install clsx@2.1.1
```

```tsx
import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false
}: ButtonProps) {
  return (
    <button
      className={clsx(
        // 基本クラス
        'font-bold rounded transition duration-300',
        
        // バリアント
        {
          'bg-blue-500 hover:bg-blue-700 text-white': variant === 'primary',
          'bg-gray-300 hover:bg-gray-400 text-gray-800': variant === 'secondary',
        },
        
        // サイズ
        {
          'py-1 px-2 text-sm': size === 'sm',
          'py-2 px-4': size === 'md',
          'py-3 px-6 text-lg': size === 'lg',
        },
        
        // 無効化
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

---

## 7.10 実践例：ユーザーカード

```tsx
// src/components/UserCard.tsx
interface UserCardProps {
  name: string;
  role: string;
  avatarUrl: string;
  bio: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
}

export default function UserCard({ name, role, avatarUrl, bio, stats }: UserCardProps) {
  return (
    <div className="max-w-sm mx-auto">
      {/* カード */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* ヘッダー背景 */}
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500" />
        
        {/* プロフィール画像 */}
        <div className="relative px-6 pb-6">
          <img
            src={avatarUrl}
            alt={name}
            className="w-24 h-24 rounded-full border-4 border-white -mt-12 shadow-lg"
          />
          
          {/* ユーザー情報 */}
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
            <p className="text-sm text-gray-500">{role}</p>
            <p className="mt-2 text-gray-600">{bio}</p>
          </div>
          
          {/* 統計 */}
          <div className="flex justify-around mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.posts}</p>
              <p className="text-sm text-gray-500">投稿</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.followers}</p>
              <p className="text-sm text-gray-500">フォロワー</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.following}</p>
              <p className="text-sm text-gray-500">フォロー中</p>
            </div>
          </div>
          
          {/* ボタン -->
          <div className="flex gap-2 mt-6">
            <button className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              フォロー
            </button>
            <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-300">
              メッセージ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 使用例
<UserCard
  name="田中太郎"
  role="ギタリスト"
  avatarUrl="/avatar.jpg"
  bio="ロックが好きです🎸"
  stats={{ posts: 42, followers: 1234, following: 567 }}
/>
```

---

## まとめ

この章では、Tailwind CSSの基本を学びました。

### この章で学んだこと

#### 1. Tailwind CSSの特徴と利点

**ユーティリティファーストの考え方：**
- 小さな単一目的のクラスを組み合わせる
- CSSファイルを書かずにHTMLだけで完結
- クラス名を考える必要がない
- コンポーネント化で再利用性を確保

**主な利点：**
- 高速な開発スピード
- 一貫性のあるデザインシステム
- 軽量な最終CSS（PurgeCSSで最適化）
- 柔軟なカスタマイズ性

#### 2. 基本的なレイアウト

```
Display        → block, flex, grid, hidden
Width/Height   → w-*, h-*, max-w-*, min-h-*
Spacing        → p-*, m-*, gap-*
Flexbox        → flex, items-*, justify-*, gap-*
Grid           → grid, grid-cols-*, grid-rows-*, col-span-*
Position       → relative, absolute, fixed, sticky
```

#### 3. テキストとタイポグラフィ

```
Size           → text-xs から text-9xl
Color          → text-{color}-{50-950}
Weight         → font-thin から font-black
Alignment      → text-left, text-center, text-right
Decoration     → underline, line-through
Transform      → uppercase, lowercase, capitalize
Line Height    → leading-tight, leading-normal, leading-loose
Letter Spacing → tracking-tight, tracking-normal, tracking-wide
```

#### 4. 色と背景

```
Background     → bg-{color}-{50-950}
Gradient       → bg-gradient-to-{direction}, from-*, via-*, to-*
Opacity        → bg-opacity-*, text-opacity-*
               → 新しい書き方: bg-blue-500/50
```

#### 5. ボーダーとエフェクト

```
Border         → border, border-{t|r|b|l}, border-{width}
Border Color   → border-{color}-{shade}
Border Style   → border-solid, border-dashed, border-dotted
Border Radius  → rounded, rounded-{size}, rounded-{corner}-{size}
Shadow         → shadow-{size}
```

#### 6. インタラクティブな要素

```
Hover          → hover:bg-*, hover:text-*, hover:scale-*
Focus          → focus:ring-*, focus:outline-*
Active         → active:bg-*
Transition     → transition, duration-{time}, ease-{type}
Transform      → scale-*, rotate-*, translate-*
```

#### 7. レスポンシブデザイン

```
Breakpoints    → sm:, md:, lg:, xl:, 2xl:
Mobile First   → 小さい画面から大きい画面へ
                 text-sm md:text-base lg:text-lg
```

### Tailwind CSSのベストプラクティス

#### 1. モバイルファーストで設計する

```tsx
// ✅ 良い例：小さい画面から大きい画面へ
<div className="text-sm md:text-base lg:text-lg">

// ❌ 悪い例：大きい画面から小さい画面へ
<div className="text-lg md:text-base sm:text-sm">
```

#### 2. コンポーネント化して再利用する

```tsx
// ✅ 良い例：コンポーネント化
export function Button({ children, variant = 'primary' }) {
  return (
    <button className={variant === 'primary' 
      ? 'bg-blue-500 hover:bg-blue-700 text-white' 
      : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}>
      {children}
    </button>
  );
}

// ❌ 悪い例：毎回書く
<button className="bg-blue-500 hover:bg-blue-700 text-white">...</button>
<button className="bg-blue-500 hover:bg-blue-700 text-white">...</button>
<button className="bg-blue-500 hover:bg-blue-700 text-white">...</button>
```

#### 3. clsxを使って動的にクラスを管理する

```tsx
import clsx from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded font-bold transition',
  isActive && 'bg-blue-500 text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
```

#### 4. カスタムカラーはtailwind.config.jsで定義する

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1e40af',
        'brand-gray': '#6b7280',
      },
    },
  },
}
```

#### 5. @apply は必要最小限に

```css
/* ❌ 避ける：Tailwindの利点を失う */
.button {
  @apply px-4 py-2 bg-blue-500 text-white rounded;
}

/* ✅ 良い：コンポーネント化する */
export function Button({ children }) {
  return <button className="px-4 py-2 bg-blue-500 text-white rounded">{children}</button>;
}
```

#### 6. 一貫性のあるスペーシングを使う

```tsx
// ✅ 良い例：4の倍数を使う
<div className="p-4 m-8 gap-6">

// ❌ 悪い例：ランダムな数値
<div className="p-3 m-7 gap-5">
```

#### 7. グループホバーを活用する

```tsx
<div className="group">
  <img className="group-hover:scale-110 transition" />
  <p className="group-hover:text-blue-500">説明</p>
</div>
```

### よく使うクラスパターン

#### 1. 中央揃えコンテナ

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* コンテンツ */}
</div>
```

#### 2. 完全中央配置

```tsx
<div className="flex items-center justify-center h-screen">
  {/* 画面の真ん中 */}
</div>
```

#### 3. カードコンポーネント

```tsx
<div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6">
  {/* カード内容 */}
</div>
```

#### 4. レスポンシブグリッド

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* アイテム */}
</div>
```

#### 5. ヘッダーレイアウト

```tsx
<header className="flex items-center justify-between p-4">
  <div>{/* ロゴ */}</div>
  <nav>{/* メニュー */}</nav>
</header>
```

#### 6. ボタンのバリエーション

```tsx
// プライマリ
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">

// セカンダリ
<button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">

// アウトライン
<button className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-2 px-4 rounded">
```

### Tailwind CSS学習リソース

#### 公式ドキュメント

- **Tailwind CSS公式**: https://tailwindcss.com/
- **Play CDN**: ブラウザで即座に試せる
- **チートシート**: クラス名の一覧

#### 実践的な学習

- **Tailwind UI**: 公式のUIコンポーネント集（有料・無料あり）
- **Headless UI**: アクセシブルなコンポーネント（無料）
- **DaisyUI**: Tailwindベースのコンポーネントライブラリ

#### ツールとプラグイン

- **Tailwind CSS IntelliSense**: VSCodeの拡張機能（自動補完）
- **Prettier Plugin**: クラス名を自動整列
- **Twin.macro**: CSS-in-JSとの統合

### 次のステップ

#### このプロジェクトでの活用

BOLD軽音サークルのプロジェクトでは、Tailwind CSSを全面的に採用しています：

```
主な使用例：
├─ ナビゲーションバー（レスポンシブメニュー）
├─ 活動報告一覧（グリッドレイアウト）
├─ カードコンポーネント（ホバーエフェクト）
├─ フォーム（スタイリング、バリデーション）
├─ モーダル（オーバーレイ、トランジション）
└─ ボタン（バリエーション、状態管理）
```

#### 発展的なトピック

- **カスタムプラグイン**: 独自のユーティリティを作成
- **JIT（Just-in-Time）モード**: 必要なクラスだけを生成
- **Tailwind v4**: 新機能と変更点
- **アニメーション**: カスタムアニメーションの作成
- **ダークモード**: `dark:` プレフィックスで実装

### 💡 覚えておくべき重要ポイント

1. **ユーティリティファースト**: 小さなクラスを組み合わせる
2. **モバイルファースト**: `sm:` → `md:` → `lg:` の順
3. **コンポーネント化**: 再利用可能なコンポーネントを作る
4. **一貫性**: デザイントークン（色、スペーシング）を守る
5. **パフォーマンス**: 使用したクラスだけが含まれる
6. **カスタマイズ**: `tailwind.config.js`で柔軟に設定
7. **IntelliSense**: エディタの拡張機能を活用
8. **ドキュメント**: 公式ドキュメントを参照する習慣をつける
9. **group/peer**: 親子要素の状態管理
10. **トランジション**: `transition`で滑らかな変化を実現

次の章では、**プロジェクトのセットアップ**について学びます。実際にBOLD軽音サークルのプロジェクトがどのように構成されているか、どのようにTailwind CSSが統合されているかを詳しく見ていきます。

---

[← 前の章：第6章 TypeScript入門](06-TypeScript入門.md) | [目次に戻る](00-目次.md) | [次の章へ：第8章 プロジェクトのセットアップ →](08-プロジェクトのセットアップ.md)
