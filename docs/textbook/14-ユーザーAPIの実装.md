# 第14章：ユーザーAPIの実装

この章では、ユーザー管理機能のAPIを実装していきます。プロフィール編集、ユーザー一覧、役割管理などを含みます。

## 14.1 ユーザーAPI設計

### エンドポイント一覧

```
GET    /api/users              - ユーザー一覧を取得
GET    /api/users/:id          - ユーザー詳細を取得
PUT    /api/users/:id          - ユーザー情報を更新（本人または管理者）
DELETE /api/users/:id          - ユーザーを削除（管理者のみ）

PUT    /api/users/:id/role     - ユーザーの役割を変更（管理者のみ）
POST   /api/users/:id/avatar   - プロフィール画像をアップロード
```

### ユーザーデータの形式

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'admin' | 'member';
  bio?: string;
  instrument?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 14.2 ユーザー一覧API

### app/api/users/route.ts（GET）

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        bio: true,
        instrument: true,
        createdAt: true,
        updatedAt: true,
        // パスワードは含めない
        
        // 統計情報
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
// app/users/page.tsx
async function getUsers() {
  const response = await fetch('/api/users', {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return response.json();
}

export default async function UsersPage() {
  const users = await getUsers();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">メンバー一覧</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="border rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.instrument || '楽器未設定'}</p>
              </div>
            </div>
            
            {user.bio && (
              <p className="text-gray-700 mb-4">{user.bio}</p>
            )}
            
            <div className="flex gap-4 text-sm text-gray-600">
              <span>📝 {user._count.posts} 投稿</span>
              <span>💬 {user._count.comments} コメント</span>
              <span>❤️ {user._count.likes} いいね</span>
            </div>
            
            <a
              href={`/users/${user.id}`}
              className="mt-4 block text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              プロフィールを見る
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 14.3 ユーザー詳細API

### app/api/users/[id]/route.ts（GET）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        bio: true,
        instrument: true,
        createdAt: true,
        updatedAt: true,
        
        // 関連データ
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // 最新10件
        },
        
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
// app/users/[id]/page.tsx
async function getUser(id: string) {
  const response = await fetch(`/api/users/${id}`, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 mb-8">
        <div className="flex items-center gap-6">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center text-blue-600 text-4xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            {user.instrument && (
              <p className="text-xl opacity-90 mb-2">🎸 {user.instrument}</p>
            )}
            <p className="opacity-75">
              メンバー登録日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
      </div>
      
      {/* 自己紹介 */}
      {user.bio && (
        <div className="bg-white rounded-lg p-6 mb-8 shadow">
          <h2 className="text-xl font-bold mb-4">自己紹介</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
        </div>
      )}
      
      {/* 統計 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 text-center shadow">
          <p className="text-3xl font-bold text-blue-600">{user._count.posts}</p>
          <p className="text-gray-600">投稿</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow">
          <p className="text-3xl font-bold text-green-600">{user._count.comments}</p>
          <p className="text-gray-600">コメント</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow">
          <p className="text-3xl font-bold text-red-600">{user._count.likes}</p>
          <p className="text-gray-600">いいね</p>
        </div>
      </div>
      
      {/* 最近の投稿 */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold mb-4">最近の投稿</h2>
        
        {user.posts.length === 0 ? (
          <p className="text-gray-600">まだ投稿がありません</p>
        ) : (
          <div className="space-y-4">
            {user.posts.map((post) => (
              <a
                key={post.id}
                href={`/posts/${post.id}`}
                className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{new Date(post.createdAt).toLocaleDateString('ja-JP')}</span>
                  <span>❤️ {post._count.likes}</span>
                  <span>💬 {post._count.comments}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 14.4 プロフィール更新API

### app/api/users/[id]/route.ts（PUT）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // 本人または管理者のみ編集可能
    if (session.user.id !== id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '他のユーザーのプロフィールは編集できません' },
        { status: 403 }
      );
    }
    
    // ユーザーが存在するか確認
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { name, bio, instrument, image } = body;
    
    // バリデーション
    if (name && name.trim() === '') {
      return NextResponse.json(
        { error: '名前は必須です' },
        { status: 400 }
      );
    }
    
    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: '自己紹介は500文字以内にしてください' },
        { status: 400 }
      );
    }
    
    // プロフィールを更新
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(instrument !== undefined && { instrument }),
        ...(image !== undefined && { image }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        bio: true,
        instrument: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    bio?: string;
    instrument?: string;
    image?: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || '',
    instrument: user.instrument || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'プロフィールの更新に失敗しました');
      }
      
      router.push(`/users/${user.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">プロフィール編集</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">名前 *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">担当楽器</label>
        <input
          type="text"
          value={formData.instrument}
          onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
          placeholder="例：ギター、ドラム、ボーカル"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          自己紹介（500文字以内）
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="あなたについて教えてください"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={6}
          maxLength={500}
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.bio.length} / 500 文字
        </p>
      </div>
      
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
```

---

## 14.5 役割変更API（管理者機能）

### app/api/users/[id]/role/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // 管理者チェック
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者のみ実行可能です' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { role } = body;
    
    // バリデーション
    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: '無効な役割です' },
        { status: 400 }
      );
    }
    
    // 自分自身の役割は変更できない
    if (session.user.id === id) {
      return NextResponse.json(
        { error: '自分自身の役割は変更できません' },
        { status: 400 }
      );
    }
    
    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    // 役割を更新
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: '役割の変更に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（管理者画面）:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoleToggleProps {
  userId: string;
  currentRole: string;
}

export default function RoleToggle({ userId, currentRole }: RoleToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleRoleChange = async (newRole: string) => {
    if (!confirm(`役割を「${newRole}」に変更しますか？`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : '役割の変更に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <select
      value={currentRole}
      onChange={(e) => handleRoleChange(e.target.value)}
      disabled={loading}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      <option value="member">一般メンバー</option>
      <option value="admin">管理者</option>
    </select>
  );
}
```

---

## 14.6 プロフィール画像アップロードAPI

### app/api/users/[id]/avatar/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // 本人のみアップロード可能
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: '他のユーザーの画像はアップロードできません' },
        { status: 403 }
      );
    }
    
    // FormDataを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }
    
    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      );
    }
    
    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '画像ファイルのみアップロード可能です' },
        { status: 400 }
      );
    }
    
    // ファイル名を生成（ユーザーID + タイムスタンプ）
    const ext = file.name.split('.').pop();
    const fileName = `${id}-${Date.now()}.${ext}`;
    
    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: '画像のアップロードに失敗しました' },
        { status: 500 }
      );
    }
    
    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    const imageUrl = urlData.publicUrl;
    
    // ユーザーのimageフィールドを更新
    await prisma.user.update({
      where: { id },
      data: { image: imageUrl },
    });
    
    return NextResponse.json({
      url: imageUrl,
      message: '画像をアップロードしました',
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
  userId: string;
  currentImage?: string;
}

export default function AvatarUpload({ userId, currentImage }: AvatarUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/users/${userId}/avatar`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      
      const data = await response.json();
      alert(data.message);
      
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* 現在の画像 */}
        <div className="relative">
          {currentImage ? (
            <img
              src={currentImage}
              alt="プロフィール画像"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        
        {/* プレビュー */}
        {preview && (
          <>
            <span className="text-2xl">→</span>
            <img
              src={preview}
              alt="プレビュー"
              className="w-24 h-24 rounded-full object-cover"
            />
          </>
        )}
      </div>
      
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <p className="text-sm text-gray-500 mt-1">
          JPG、PNG、GIF形式、5MB以下
        </p>
      </div>
      
      {preview && (
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'アップロード中...' : 'アップロード'}
          </button>
          <button
            onClick={() => {
              setPreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 14.7 ユーザー削除API（管理者機能）

### app/api/users/[id]/route.ts（DELETE）

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // 管理者チェック
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者のみ実行可能です' },
        { status: 403 }
      );
    }
    
    // 自分自身は削除できない
    if (session.user.id === id) {
      return NextResponse.json(
        { error: '自分自身は削除できません' },
        { status: 400 }
      );
    }
    
    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    // ユーザーを削除（関連データも自動削除）
    await prisma.user.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'ユーザーを削除しました',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 14.8 ユーザー検索API

### app/api/users/search/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const role = searchParams.get('role');
    const instrument = searchParams.get('instrument');
    
    // 検索条件を構築
    const where: any = {};
    
    // 名前で検索
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
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
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        instrument: true,
        bio: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'ユーザーの検索に失敗しました' },
      { status: 500 }
    );
  }
}
```

**使い方（フロントエンド）:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);
  
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setUsers([]);
      return;
    }
    
    const searchUsers = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    searchUsers();
  }, [debouncedQuery]);
  
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="メンバーを検索..."
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        </div>
      )}
      
      {users.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-10">
          {users.map((user: any) => (
            <a
              key={user.id}
              href={`/users/${user.id}`}
              className="flex items-center gap-3 p-3 hover:bg-gray-50"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-600">
                  {user.instrument || 'メンバー'}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## まとめ

この章では、ユーザーAPIの実装について学びました：

### CRUD API
- ✅ **GET /api/users**: ユーザー一覧取得
- ✅ **GET /api/users/:id**: ユーザー詳細取得
- ✅ **PUT /api/users/:id**: プロフィール更新（本人または管理者）
- ✅ **DELETE /api/users/:id**: ユーザー削除（管理者のみ）

### 管理機能
- ✅ **PUT /api/users/:id/role**: 役割変更（管理者のみ）
- ✅ **POST /api/users/:id/avatar**: プロフィール画像アップロード

### 検索機能
- ✅ **GET /api/users/search**: ユーザー検索（名前、メール、楽器）

### セキュリティ
- ✅ **認証・認可**: 本人または管理者のみ編集可能
- ✅ **バリデーション**: 入力値の検証
- ✅ **ファイルアップロード**: サイズ・タイプチェック

次の章では、**イベントAPIの実装**について詳しく見ていきます。

---

[← 前の章：第13章 スケジュールAPIの実装](13-スケジュールAPIの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第15章 イベントAPIの実装 →](15-イベントAPIの実装.md)
