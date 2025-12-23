# 第7章：Tailwind CSS入門

この章では、**Tailwind CSS**の基本を学びます。本プロジェクトでも使用している、ユーティリティファーストのCSSフレームワークです。

## 7.1 Tailwind CSSとは

### Tailwind CSSの特徴

**Tailwind CSS**は、**ユーティリティクラス**を組み合わせてスタイリングするCSSフレームワークです。

**従来のCSS vs Tailwind CSS:**

```html
<!-- 従来のCSS -->
<style>
  .button {
    padding: 0.5rem 1rem;
    background-color: blue;
    color: white;
    border-radius: 0.25rem;
  }
</style>

<button class="button">クリック</button>

<!-- Tailwind CSS -->
<button class="px-4 py-2 bg-blue-500 text-white rounded">
  クリック
</button>
```

**Tailwind CSSの利点：**

1. **高速な開発**: CSSファイルを書かずにHTML/JSXだけで完結
2. **一貫性**: デザインシステムが組み込まれている（色、サイズ等）
3. **軽量**: 使ったクラスだけが最終的なCSSに含まれる
4. **カスタマイズ可能**: 設定ファイルで自由にカスタマイズ

---

## 7.2 基本的なユーティリティクラス

### レイアウト

#### Display

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

#### 幅と高さ

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
数値 × 0.25rem = ピクセル

w-1  = 0.25rem = 4px
w-2  = 0.5rem  = 8px
w-4  = 1rem    = 16px
w-8  = 2rem    = 32px
w-16 = 4rem    = 64px
w-32 = 8rem    = 128px
```

### 余白（Padding / Margin）

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

### Flexbox

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

### Grid

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

---

## 7.3 テキストとフォント

### テキストサイズ

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

### テキスト色

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

### フォントウェイト

```html
<p class="font-thin">100</p>
<p class="font-light">300</p>
<p class="font-normal">400（デフォルト）</p>
<p class="font-medium">500</p>
<p class="font-semibold">600</p>
<p class="font-bold">700</p>
<p class="font-extrabold">800</p>
```

### テキスト揃え

```html
<p class="text-left">左揃え</p>
<p class="text-center">中央揃え</p>
<p class="text-right">右揃え</p>
<p class="text-justify">両端揃え</p>
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

### 不透明度

```html
<!-- 背景の不透明度 -->
<div class="bg-blue-500 bg-opacity-50">半透明</div>
<div class="bg-blue-500 bg-opacity-25">25%</div>
<div class="bg-blue-500 bg-opacity-75">75%</div>

<!-- テキストの不透明度 -->
<p class="text-black text-opacity-50">半透明のテキスト</p>
```

---

## 7.5 ボーダーと角丸

### ボーダー

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
<div class="border border-dashed">破線</div>
<div class="border border-dotted">点線</div>
```

### 角丸

```html
<!-- 基本の角丸 -->
<div class="rounded">少し丸い（4px）</div>
<div class="rounded-lg">中くらい（8px）</div>
<div class="rounded-xl">大きい（12px）</div>
<div class="rounded-2xl">とても大きい（16px）</div>
<div class="rounded-full">完全な円形</div>

<!-- 特定の角だけ -->
<div class="rounded-tl">左上だけ</div>
<div class="rounded-tr">右上だけ</div>
<div class="rounded-bl">左下だけ</div>
<div class="rounded-br">右下だけ</div>

<!-- 実用例：アバター -->
<img src="/avatar.jpg" class="w-16 h-16 rounded-full" />

<!-- 実用例：ボタン -->
<button class="bg-blue-500 text-white px-4 py-2 rounded-lg">
  ボタン
</button>
```

---

## 7.6 シャドウとエフェクト

### ボックスシャドウ

```html
<div class="shadow-sm">小さい影</div>
<div class="shadow">標準の影</div>
<div class="shadow-md">中くらいの影</div>
<div class="shadow-lg">大きい影</div>
<div class="shadow-xl">とても大きい影</div>
<div class="shadow-2xl">最大の影</div>

<!-- 実用例：カード -->
<div class="bg-white shadow-lg rounded-lg p-6">
  カードコンテンツ
</div>
```

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
npm install clsx
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

この章では、Tailwind CSSの基本を学びました：

### 基本概念
- ✅ **ユーティリティクラス**: 小さな単一目的のクラスを組み合わせる
- ✅ **レスポンシブ**: ブレークポイントで画面サイズに対応

### 主要なクラス
- ✅ **レイアウト**: Flexbox、Grid、余白
- ✅ **テキスト**: サイズ、色、太さ、揃え
- ✅ **色**: 背景色、テキスト色、ボーダー色
- ✅ **エフェクト**: シャドウ、ホバー、トランジション

### 実践
- ✅ **コンポーネント**: ボタン、カード、フォーム
- ✅ **Next.js連携**: TypeScriptとの組み合わせ
- ✅ **動的クラス**: clsxで条件付きスタイリング

次の章では、**プロジェクトのセットアップ**について学びます。実際にBOLD軽音サークルのプロジェクトがどのように構成されているかを詳しく見ていきます。

---

[← 前の章：第6章 TypeScript入門](06-TypeScript入門.md) | [目次に戻る](00-目次.md) | [次の章へ：第8章 プロジェクトのセットアップ →](08-プロジェクトのセットアップ.md)
