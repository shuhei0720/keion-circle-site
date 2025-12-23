# 第17章：検索・フィルタリングAPIの実装

この章では、投稿、ユーザー、イベントの検索・フィルタリング機能を実装していきます。全文検索、タグ検索、日付範囲検索などを含みます。

## 17.1 検索API設計

### エンドポイント一覧

```
GET /api/search              - 全体検索（投稿、ユーザー、イベント）
GET /api/posts?q=...         - 投稿検索
GET /api/users?q=...         - ユーザー検索
GET /api/events?q=...        - イベント検索
GET /api/posts?tag=...       - タグ検索
GET /api/posts?author=...    - 著者検索
GET /api/posts?from=...&to=... - 日付範囲検索
```

### クエリパラメータ

```typescript
interface SearchParams {
  q?: string;          // 検索キーワード
  tag?: string;        // タグ
  author?: string;     // 著者ID
  from?: string;       // 開始日
  to?: string;         // 終了日
  sort?: 'latest' | 'oldest' | 'popular'; // 並び順
  page?: number;       // ページ番号
  limit?: number;      // 取得件数
}
```

---

## 17.2 投稿検索API

### app/api/posts/search/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータを取得
    const q = searchParams.get('q') || '';
    const tag = searchParams.get('tag');
    const authorId = searchParams.get('author');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // where条件を構築
    const where: any = {};
    
    // キーワード検索（タイトルまたは内容に含まれる）
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }
    
    // タグ検索
    if (tag) {
      where.tags = {
        has: tag,
      };
    }
    
    // 著者検索
    if (authorId) {
      where.authorId = authorId;
    }
    
    // 日付範囲検索
    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }
    
    // 並び順
    let orderBy: any = {};
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'popular':
        // いいね数で並べ替え（集計が必要）
        orderBy = { likes: { _count: 'desc' } };
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }
    
    // ページネーション
    const skip = (page - 1) * limit;
    
    // 検索実行
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);
    
    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    return NextResponse.json(
      { error: '検索に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
// app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function search() {
      setLoading(true);
      try {
        const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    search();
  }, [query]);
  
  if (loading) {
    return <div className="text-center py-12">検索中...</div>;
  }
  
  if (!results || results.posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">「{query}」に一致する投稿が見つかりませんでした</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        検索結果: {query}
      </h1>
      
      <p className="text-gray-600 mb-6">
        {results.pagination.total}件の投稿が見つかりました
      </p>
      
      <div className="space-y-4">
        {results.posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {/* ページネーション */}
      <Pagination pagination={results.pagination} />
    </div>
  );
}
```

---

## 17.3 ユーザー検索API

### app/api/users/search/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const q = searchParams.get('q') || '';
    const role = searchParams.get('role'); // 'admin' | 'member'
    const instrument = searchParams.get('instrument');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const where: any = {};
    
    // キーワード検索（名前またはメールアドレス）
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }
    
    // 役割でフィルタ
    if (role) {
      where.role = role;
    }
    
    // 楽器でフィルタ
    if (instrument) {
      where.instrument = { contains: instrument, mode: 'insensitive' };
    }
    
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          instrument: true,
          role: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    
    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'ユーザー検索に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 17.4 全体検索API

### app/api/search/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    
    if (!q) {
      return NextResponse.json(
        { error: '検索キーワードを入力してください' },
        { status: 400 }
      );
    }
    
    // 投稿、ユーザー、イベントを並行して検索
    const [posts, users, events] = await Promise.all([
      // 投稿検索
      prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      
      // ユーザー検索
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { instrument: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          instrument: true,
          role: true,
        },
        orderBy: { name: 'asc' },
        take: 5,
      }),
      
      // イベント検索
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: {
          _count: {
            select: {
              participation: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);
    
    return NextResponse.json({
      query: q,
      results: {
        posts: {
          items: posts,
          total: posts.length,
        },
        users: {
          items: users,
          total: users.length,
        },
        events: {
          items: events,
          total: events.length,
        },
      },
      totalResults: posts.length + users.length + events.length,
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: '検索に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
// app/search/all/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function GlobalSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function search() {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (query) {
      search();
    }
  }, [query]);
  
  if (loading) {
    return <div className="text-center py-12">検索中...</div>;
  }
  
  if (!results || results.totalResults === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">「{query}」に一致する結果が見つかりませんでした</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        検索結果: {query}
      </h1>
      
      <p className="text-gray-600 mb-8">
        {results.totalResults}件の結果が見つかりました
      </p>
      
      {/* 投稿 */}
      {results.results.posts.total > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">📝 投稿</h2>
            <Link href={`/posts/search?q=${query}`} className="text-blue-600 hover:underline">
              すべて見る ({results.results.posts.total})
            </Link>
          </div>
          
          <div className="space-y-4">
            {results.results.posts.items.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
      
      {/* ユーザー */}
      {results.results.users.total > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">👤 ユーザー</h2>
            <Link href={`/users/search?q=${query}`} className="text-blue-600 hover:underline">
              すべて見る ({results.results.users.total})
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {results.results.users.items.map((user: any) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </section>
      )}
      
      {/* イベント */}
      {results.results.events.total > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🎉 イベント</h2>
            <Link href={`/events/search?q=${query}`} className="text-blue-600 hover:underline">
              すべて見る ({results.results.events.total})
            </Link>
          </div>
          
          <div className="space-y-4">
            {results.results.events.items.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## 17.5 検索コンポーネント

### components/SearchBox.tsx

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  placeholder?: string;
  defaultValue?: string;
}

export default function SearchBox({ placeholder = '検索...', defaultValue = '' }: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // 検索ページへ遷移
    router.push(`/search/all?q=${encodeURIComponent(query)}`);
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <button
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
}
```

---

## 17.6 タグフィルター

### components/TagFilter.tsx

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface TagFilterProps {
  tags: string[];
}

export default function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag');
  
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // 同じタグをクリックしたら解除
      router.push('/posts');
    } else {
      router.push(`/posts?tag=${encodeURIComponent(tag)}`);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selectedTag === tag
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
```

---

## 17.7 日付範囲フィルター

### components/DateRangeFilter.tsx

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DateRangeFilter() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  
  const handleApply = () => {
    const params = new URLSearchParams();
    
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    router.push(`/posts?${params.toString()}`);
  };
  
  const handleReset = () => {
    setFrom('');
    setTo('');
    router.push('/posts');
  };
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold mb-4">期間で絞り込み</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">開始日</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">終了日</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            適用
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 17.8 並び順フィルター

### components/SortFilter.tsx

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'latest';
  
  const handleChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    router.push(`?${params.toString()}`);
  };
  
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">並び順:</label>
      
      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        <option value="latest">新しい順</option>
        <option value="oldest">古い順</option>
        <option value="popular">人気順</option>
      </select>
    </div>
  );
}
```

---

## 17.9 ページネーションコンポーネント

### components/Pagination.tsx

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function Pagination({ pagination }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { page, pages } = pagination;
  
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };
  
  if (pages <= 1) return null;
  
  // ページ番号の配列を生成
  const pageNumbers: (number | string)[] = [];
  const maxVisible = 7;
  
  if (pages <= maxVisible) {
    // すべてのページを表示
    for (let i = 1; i <= pages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // 省略表示
    pageNumbers.push(1);
    
    if (page > 3) {
      pageNumbers.push('...');
    }
    
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      pageNumbers.push(i);
    }
    
    if (page < pages - 2) {
      pageNumbers.push('...');
    }
    
    pageNumbers.push(pages);
  }
  
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* 前へ */}
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {/* ページ番号 */}
      {pageNumbers.map((num, index) => (
        typeof num === 'number' ? (
          <button
            key={index}
            onClick={() => handlePageChange(num)}
            className={`px-4 py-2 border rounded transition-colors ${
              page === num
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            {num}
          </button>
        ) : (
          <span key={index} className="px-2">
            {num}
          </span>
        )
      ))}
      
      {/* 次へ */}
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === pages}
        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
```

---

## まとめ

この章では、検索・フィルタリング機能について学びました：

### 検索API
- ✅ **POST /api/posts/search**: 投稿検索（キーワード、タグ、著者、日付範囲）
- ✅ **GET /api/users/search**: ユーザー検索（名前、メール、役割、楽器）
- ✅ **GET /api/search**: 全体検索（投稿、ユーザー、イベント）

### フィルタリング
- ✅ **タグフィルター**: タグで絞り込み
- ✅ **日付範囲フィルター**: 期間で絞り込み
- ✅ **並び順**: 新しい順、古い順、人気順

### ページネーション
- ✅ **Pagination**: ページ番号、前へ/次へボタン
- ✅ **省略表示**: 多数のページを効率的に表示

### フロントエンド
- ✅ **SearchBox**: 検索入力コンポーネント
- ✅ **TagFilter**: タグ選択コンポーネント
- ✅ **DateRangeFilter**: 日付範囲選択コンポーネント
- ✅ **SortFilter**: 並び順選択コンポーネント

次の章では、**トップページの実装**について詳しく見ていきます。いよいよフロントエンド実装に入ります！

---

[← 前の章：第16章 画像アップロードAPIの実装](16-画像アップロードAPIの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第18章 トップページの実装 →](18-トップページの実装.md)
