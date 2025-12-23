# 第32章：アクセシビリティとSEO

この章では、WebアクセシビリティとSEO最適化について学びます。

## 32.1 アクセシビリティの基礎

### WCAG 2.1ガイドライン

Web Content Accessibility Guidelines (WCAG) 2.1の4つの原則：

1. **知覚可能（Perceivable）**: 情報とUIコンポーネントがユーザーに知覚できる方法で提示される
2. **操作可能（Operable）**: UIコンポーネントとナビゲーションが操作可能である
3. **理解可能（Understandable）**: 情報とUIの操作が理解可能である
4. **堅牢（Robust）**: コンテンツが様々な支援技術で解釈できる

### 適合レベル

- **Level A**: 最低限のアクセシビリティ
- **Level AA**: 推奨される適合レベル（多くの法規制の基準）
- **Level AAA**: 最高レベルのアクセシビリティ

---

## 32.2 セマンティックHTML

### 適切なHTML要素の使用

```typescript
// components/AccessibleButton.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  ariaLabel?: string;
}

// ❌ 悪い例: divをボタンとして使用
function BadButton() {
  return (
    <div className="btn" onClick={handleClick}>
      クリック
    </div>
  );
}

// ✅ 良い例: buttonタグを使用
export function AccessibleButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  ariaLabel,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="btn btn-primary"
    >
      {children}
    </button>
  );
}
```

### ランドマークの使用

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {/* ヘッダー */}
        <header role="banner">
          <nav role="navigation" aria-label="メインナビゲーション">
            {/* ナビゲーション */}
          </nav>
        </header>
        
        {/* メインコンテンツ */}
        <main role="main" id="main-content">
          {children}
        </main>
        
        {/* サイドバー */}
        <aside role="complementary" aria-label="サイドバー">
          {/* 補足情報 */}
        </aside>
        
        {/* フッター */}
        <footer role="contentinfo">
          {/* フッター情報 */}
        </footer>
      </body>
    </html>
  );
}
```

### 見出し階層

```typescript
// components/Article.tsx
export function Article({ post }: { post: Post }) {
  return (
    <article>
      {/* h1はページに1つのみ */}
      <h1>{post.title}</h1>
      
      <section>
        <h2>概要</h2>
        <p>{post.summary}</p>
        
        <h3>詳細</h3>
        <p>{post.content}</p>
      </section>
      
      <section>
        <h2>コメント</h2>
        {post.comments.map((comment) => (
          <article key={comment.id}>
            <h3>{comment.author.name}</h3>
            <p>{comment.content}</p>
          </article>
        ))}
      </section>
    </article>
  );
}
```

---

## 32.3 ARIAラベルと属性

### ARIAラベルの使用

```typescript
// components/SearchBox.tsx
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  return (
    <div role="search">
      <label htmlFor="search-input" className="sr-only">
        サイト内を検索
      </label>
      
      <div className="relative">
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="検索..."
          aria-label="検索キーワードを入力"
          aria-describedby="search-description"
          aria-controls="search-results"
          className="input"
        />
        
        <Search
          className="absolute right-3 top-3"
          aria-hidden="true"
        />
      </div>
      
      <p id="search-description" className="sr-only">
        キーワードを入力して投稿を検索できます
      </p>
      
      {/* 検索結果 */}
      <div
        id="search-results"
        role="region"
        aria-live="polite"
        aria-atomic="true"
      >
        {results.length > 0 ? (
          <ul>
            {results.map((result) => (
              <li key={result.id}>{result.title}</li>
            ))}
          </ul>
        ) : query ? (
          <p>検索結果が見つかりませんでした</p>
        ) : null}
      </div>
    </div>
  );
}
```

### ライブリージョン

```typescript
// components/LiveNotification.tsx
'use client';

import { useEffect, useState } from 'react';

export function LiveNotification() {
  const [message, setMessage] = useState('');
  
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// 使用例: いいねボタン
export function LikeButton({ postId }: { postId: string }) {
  const [isLiked, setIsLiked] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  const handleLike = async () => {
    await likePost(postId);
    setIsLiked(true);
    setAnnouncement('投稿にいいねしました');
  };
  
  return (
    <>
      <button
        onClick={handleLike}
        aria-pressed={isLiked}
        aria-label={isLiked ? 'いいね済み' : 'いいねする'}
      >
        {isLiked ? '♥' : '♡'}
      </button>
      
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </>
  );
}
```

### モーダルダイアログ

```typescript
// components/AccessibleModal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // モーダルが開いたときの処理
  useEffect(() => {
    if (isOpen) {
      // フォーカスを閉じるボタンに移動
      closeButtonRef.current?.focus();
      
      // 背景のスクロールを無効化
      document.body.style.overflow = 'hidden';
      
      // Escキーで閉じる
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);
  
  // フォーカストラップ
  const handleTabKey = (e: React.KeyboardEvent) => {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements || focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* 背景オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* モーダルコンテンツ */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
        onKeyDown={handleTabKey}
      >
        {/* タイトル */}
        <h2 id="modal-title" className="text-2xl font-bold mb-4">
          {title}
        </h2>
        
        {/* 閉じるボタン */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="モーダルを閉じる"
          className="absolute top-4 right-4"
        >
          <X size={24} />
        </button>
        
        {/* コンテンツ */}
        <div id="modal-description">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## 32.4 キーボードナビゲーション

### フォーカス管理

```typescript
// components/SkipLink.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
    >
      メインコンテンツへスキップ
    </a>
  );
}
```

### カスタムキーボード操作

```typescript
// components/Tabs.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function AccessibleTabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    
    switch (e.key) {
      case 'ArrowLeft':
        newIndex = index > 0 ? index - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        newIndex = index < tabs.length - 1 ? index + 1 : 0;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    setActiveTab(newIndex);
    tabRefs.current[newIndex]?.focus();
  };
  
  return (
    <div>
      {/* タブリスト */}
      <div role="tablist" aria-label="タブナビゲーション">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[index] = el)}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={activeTab === index ? 'active' : ''}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* タブパネル */}
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== index}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

---

## 32.5 色とコントラスト

### 色のコントラスト比

WCAG AA基準：
- **通常テキスト**: 4.5:1以上
- **大きなテキスト（18pt以上）**: 3:1以上

```css
/* globals.css - アクセシブルなカラーパレット */

/* ✅ 良い例: 十分なコントラスト比 */
.text-on-white {
  color: #1a1a1a; /* 背景#ffffffに対して18.5:1 */
}

.text-primary {
  color: #0066cc; /* 背景#ffffffに対して4.54:1 */
}

/* ❌ 悪い例: コントラスト比が不十分 */
.text-low-contrast {
  color: #cccccc; /* 背景#ffffffに対して1.6:1 - NG */
}

/* フォーカス表示 */
*:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* ハイコントラストモードサポート */
@media (prefers-contrast: high) {
  .btn {
    border: 2px solid currentColor;
  }
}
```

### カラーバリア対応

```typescript
// components/StatusIndicator.tsx
interface StatusProps {
  status: 'success' | 'warning' | 'error';
  message: string;
}

export function StatusIndicator({ status, message }: StatusProps) {
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
  };
  
  return (
    <div
      className={`status status-${status}`}
      role="status"
      aria-live="polite"
    >
      {/* アイコンで視覚的に区別 */}
      <span aria-hidden="true">{icons[status]}</span>
      
      {/* スクリーンリーダー用のテキスト */}
      <span className="sr-only">
        {status === 'success' && '成功: '}
        {status === 'warning' && '警告: '}
        {status === 'error' && 'エラー: '}
      </span>
      
      {message}
    </div>
  );
}
```

---

## 32.6 フォームアクセシビリティ

### アクセシブルなフォーム

```typescript
// components/AccessibleForm.tsx
'use client';

import { useState } from 'react';

export function AccessibleForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* メールアドレス */}
      <div className="form-group">
        <label htmlFor="email" className="required">
          メールアドレス
        </label>
        
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : 'email-hint'}
          className={errors.email ? 'input-error' : 'input'}
        />
        
        <p id="email-hint" className="text-sm text-gray-600">
          例: user@example.com
        </p>
        
        {errors.email && (
          <p id="email-error" role="alert" className="text-red-600">
            {errors.email}
          </p>
        )}
      </div>
      
      {/* パスワード */}
      <div className="form-group">
        <label htmlFor="password" className="required">
          パスワード
        </label>
        
        <input
          id="password"
          name="password"
          type="password"
          required
          aria-required="true"
          aria-invalid={!!errors.password}
          aria-describedby="password-requirements"
          className={errors.password ? 'input-error' : 'input'}
        />
        
        <ul id="password-requirements" className="text-sm text-gray-600">
          <li>8文字以上</li>
          <li>大文字・小文字を含む</li>
          <li>数字を含む</li>
        </ul>
        
        {errors.password && (
          <p id="password-error" role="alert" className="text-red-600">
            {errors.password}
          </p>
        )}
      </div>
      
      {/* 送信ボタン */}
      <button type="submit" className="btn btn-primary">
        登録
      </button>
    </form>
  );
}
```

---

## 32.7 SEO最適化

### メタデータ設定

```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'BOLD軽音 - メンバーサイト',
    template: '%s | BOLD軽音',
  },
  description: 'BOLD軽音サークルのメンバー専用サイト。活動報告、スケジュール調整、メンバー交流の場。',
  keywords: ['軽音', 'サークル', 'バンド', '音楽', 'ライブ'],
  authors: [{ name: 'BOLD軽音' }],
  creator: 'BOLD軽音',
  publisher: 'BOLD軽音',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://keion.example.com',
    siteName: 'BOLD軽音',
    title: 'BOLD軽音 - メンバーサイト',
    description: 'BOLD軽音サークルのメンバー専用サイト',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BOLD軽音',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@bold_keion',
    creator: '@bold_keion',
    title: 'BOLD軽音 - メンバーサイト',
    description: 'BOLD軽音サークルのメンバー専用サイト',
    images: ['/twitter-image.jpg'],
  },
  
  // robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // その他
  alternates: {
    canonical: 'https://keion.example.com',
  },
  verification: {
    google: 'google-site-verification-code',
  },
};
```

### ページ固有のメタデータ

```typescript
// app/posts/[id]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await getPost(params.id);
  
  if (!post) {
    return {
      title: '投稿が見つかりません',
    };
  }
  
  return {
    title: post.title,
    description: post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author.name],
      images: post.images?.map((img) => ({
        url: img.url,
        width: 1200,
        height: 630,
        alt: post.title,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content.substring(0, 160),
      images: post.images?.[0]?.url,
    },
  };
}
```

---

## 32.8 構造化データ

### JSON-LD形式

```typescript
// components/StructuredData.tsx
interface ArticleData {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
}

export function ArticleStructuredData({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
}: ArticleData) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished: datePublished,
    dateModified: dateModified,
    image: image,
    publisher: {
      '@type': 'Organization',
      name: 'BOLD軽音',
      logo: {
        '@type': 'ImageObject',
        url: 'https://keion.example.com/logo.png',
      },
    },
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// 組織情報
export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BOLD軽音',
    url: 'https://keion.example.com',
    logo: 'https://keion.example.com/logo.png',
    description: 'BOLD軽音サークルの公式サイト',
    sameAs: [
      'https://twitter.com/bold_keion',
      'https://instagram.com/bold_keion',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@keion.example.com',
      contactType: 'customer support',
    },
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// パンくずリスト
export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

---

## 32.9 Sitemap と Robots.txt

### 動的Sitemap生成

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://keion.example.com';
  
  // 静的ページ
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];
  
  // 投稿ページ
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      id: true,
      updatedAt: true,
    },
  });
  
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  return [...staticPages, ...postPages];
}
```

### Robots.txt設定

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
    ],
    sitemap: 'https://keion.example.com/sitemap.xml',
  };
}
```

---

## 32.10 パフォーマンスとSEO

### Core Web Vitals

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 32.11 アクセシビリティテスト

### 自動テストツール

```bash
# axe-coreのインストール
npm install -D @axe-core/react

# eslint-plugin-jsx-a11yのインストール
npm install -D eslint-plugin-jsx-a11y
```

### ESLint設定

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',
  ],
  plugins: ['jsx-a11y'],
  rules: {
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-autofocus': 'warn',
  },
};
```

### Playwrightでのアクセシビリティテスト

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('アクセシビリティテスト', () => {
  test('トップページのアクセシビリティ', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('キーボードナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // Tabキーでナビゲーション
    await page.keyboard.press('Tab');
    
    // スキップリンクがフォーカスされる
    const skipLink = page.locator('a:has-text("メインコンテンツへスキップ")');
    await expect(skipLink).toBeFocused();
    
    // Enterキーで実行
    await page.keyboard.press('Enter');
    
    // メインコンテンツにフォーカスが移動
    await expect(page.locator('#main-content')).toBeFocused();
  });
});
```

---

## 32.12 チェックリスト

### アクセシビリティチェックリスト

```markdown
## アクセシビリティチェックリスト

### HTML構造
- [ ] セマンティックHTML要素を使用
- [ ] 見出しの階層が正しい（h1→h2→h3）
- [ ] ランドマーク（header、main、nav、footer）を使用
- [ ] リストは適切なタグを使用（ul、ol、dl）

### ARIA
- [ ] 適切なARIAラベルを設定
- [ ] aria-live領域を実装
- [ ] モーダルにaria-modal属性
- [ ] ボタンにaria-pressed/aria-expanded

### キーボード操作
- [ ] すべての機能がキーボードで操作可能
- [ ] フォーカス順序が論理的
- [ ] フォーカス表示が明確
- [ ] スキップリンクを実装

### 色とコントラスト
- [ ] テキストのコントラスト比が十分（4.5:1以上）
- [ ] 色だけに依存しない情報提示
- [ ] フォーカス表示のコントラスト比（3:1以上）

### フォーム
- [ ] すべてのinputにlabelを関連付け
- [ ] 必須項目の表示
- [ ] エラーメッセージの明確な表示
- [ ] aria-invalid、aria-describedbyを使用

### 画像とメディア
- [ ] すべての画像にalt属性
- [ ] 装飾画像はalt=""またはaria-hidden
- [ ] 動画に字幕を提供
```

### SEOチェックリスト

```markdown
## SEOチェックリスト

### メタデータ
- [ ] 各ページに固有のtitle
- [ ] descriptionメタタグ（120-160文字）
- [ ] Open Graphタグ
- [ ] Twitter Cardタグ
- [ ] canonical URL

### コンテンツ
- [ ] h1タグは1ページに1つ
- [ ] 見出しの階層が適切
- [ ] 内部リンクの最適化
- [ ] 画像のalt属性に適切なキーワード

### 技術的SEO
- [ ] sitemap.xmlを生成
- [ ] robots.txtを設定
- [ ] 構造化データ（JSON-LD）
- [ ] モバイルフレンドリー
- [ ] ページ速度の最適化（Core Web Vitals）

### URL構造
- [ ] 意味のあるURL
- [ ] 階層構造が明確
- [ ] ハイフン区切り
- [ ] 小文字を使用
```

---

## まとめ

この章では、アクセシビリティとSEOについて学びました：

### アクセシビリティ
- ✅ **WCAG準拠**: Level AA基準
- ✅ **セマンティックHTML**: 適切な要素の使用
- ✅ **ARIAラベル**: 支援技術のサポート
- ✅ **キーボード操作**: 完全なキーボードアクセス
- ✅ **色とコントラスト**: 十分なコントラスト比
- ✅ **フォーム**: アクセシブルなフォーム実装
- ✅ **テスト**: 自動化されたアクセシビリティテスト

### SEO最適化
- ✅ **メタデータ**: title、description、OG tags
- ✅ **構造化データ**: JSON-LD形式
- ✅ **Sitemap**: 動的生成
- ✅ **Robots.txt**: クローラー制御
- ✅ **パフォーマンス**: Core Web Vitals
- ✅ **モバイル最適化**: レスポンシブデザイン

### ベストプラクティス
- ✅ **設計段階から考慮**: アクセシビリティファースト
- ✅ **継続的テスト**: 自動テストの実装
- ✅ **ユーザーテスト**: 実際のユーザーでの検証
- ✅ **定期的な監査**: Lighthouse、axe

次の章では、**高度な機能実装**について詳しく見ていきます。

---

[← 前の章：第31章 テスト実装](31-テスト実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第33章 高度な機能実装 →](33-高度な機能実装.md)
