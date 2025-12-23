# 第16章：画像アップロードAPIの実装

この章では、Supabase Storageを使った画像アップロード機能を実装していきます。アバター画像、投稿画像のアップロードとリサイズ処理を含みます。

## 16.1 Supabase Storageの設定

### Supabaseクライアントの作成

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

### バケットの作成

Supabaseダッシュボードで以下のバケットを作成：

1. **avatars**: ユーザーのアバター画像（Public）
2. **posts**: 投稿の画像（Public）

**設定手順:**

```
1. Supabase Dashboard → Storage → Create bucket
2. Bucket name: avatars
3. Public bucket: ON
4. File size limit: 5MB
5. Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
```

---

## 16.2 画像バリデーション

### src/lib/validators/image.ts

```typescript
// 許可される画像形式
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

// ファイルサイズの上限（バイト）
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 画像ファイルをバリデーション
 */
export function validateImage(file: File): ImageValidationResult {
  // ファイルタイプチェック
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'JPG、PNG、GIF、WebP形式の画像のみアップロード可能です',
    };
  }
  
  // ファイルサイズチェック
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `ファイルサイズは${MAX_IMAGE_SIZE / (1024 * 1024)}MB以下にしてください`,
    };
  }
  
  return { valid: true };
}

/**
 * ファイル名を安全にする
 */
export function sanitizeFilename(filename: string): string {
  // 拡張子を取得
  const ext = filename.split('.').pop() || '';
  
  // ランダムなファイル名を生成
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  return `${timestamp}-${random}.${ext}`;
}
```

---

## 16.3 アバター画像アップロードAPI

### app/api/users/[id]/avatar/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { validateImage, sanitizeFilename } from '@/lib/validators/image';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: userId } = await params;
    
    // 認証チェック
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    // 自分または管理者のみ実行可能
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'アクセスが拒否されました' },
        { status: 403 }
      );
    }
    
    // フォームデータを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }
    
    // バリデーション
    const validation = validateImage(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // 既存のアバター画像を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    // ファイル名を生成
    const filename = sanitizeFilename(file.name);
    const filepath = `avatars/${userId}/${filename}`;
    
    // ファイルをArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filepath, buffer, {
        contentType: file.type,
        upsert: false,
      });
    
    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'アップロードに失敗しました' },
        { status: 500 }
      );
    }
    
    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filepath);
    
    const publicUrl = urlData.publicUrl;
    
    // ユーザーのimageフィールドを更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: publicUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        instrument: true,
      },
    });
    
    // 古い画像を削除（Google OAuth画像以外）
    if (user.image && !user.image.includes('googleusercontent.com')) {
      try {
        const oldFilepath = user.image.split('/avatars/')[1];
        if (oldFilepath) {
          await supabase.storage.from('avatars').remove([oldFilepath]);
        }
      } catch (error) {
        console.error('Failed to delete old avatar:', error);
        // 削除失敗は無視
      }
    }
    
    return NextResponse.json({
      user: updatedUser,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: 'アバター画像のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}

// アバター画像を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: userId } = await params;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'アクセスが拒否されました' },
        { status: 403 }
      );
    }
    
    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });
    
    if (!user || !user.image) {
      return NextResponse.json(
        { error: '削除する画像がありません' },
        { status: 404 }
      );
    }
    
    // Google OAuth画像は削除しない
    if (user.image.includes('googleusercontent.com')) {
      return NextResponse.json(
        { error: 'Google OAuth画像は削除できません' },
        { status: 400 }
      );
    }
    
    // Storageから削除
    const filepath = user.image.split('/avatars/')[1];
    if (filepath) {
      await supabase.storage.from('avatars').remove([filepath]);
    }
    
    // DBから削除
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });
    
    return NextResponse.json({
      success: true,
      message: 'アバター画像を削除しました',
    });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return NextResponse.json(
      { error: 'アバター画像の削除に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 16.4 投稿画像アップロードAPI

### app/api/posts/images/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { validateImage, sanitizeFilename } from '@/lib/validators/image';

// 複数画像の一括アップロード
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
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
        { error: '画像のアップロードは管理者のみ可能です' },
        { status: 403 }
      );
    }
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }
    
    // 最大5枚まで
    if (files.length > 5) {
      return NextResponse.json(
        { error: '一度にアップロードできるのは5枚までです' },
        { status: 400 }
      );
    }
    
    // 全ファイルをバリデーション
    for (const file of files) {
      const validation = validateImage(file);
      if (!validation.valid) {
        return NextResponse.json(
          { error: `${file.name}: ${validation.error}` },
          { status: 400 }
        );
      }
    }
    
    // アップロード処理
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const filename = sanitizeFilename(file.name);
        const filepath = `posts/${session.user.id}/${filename}`;
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const { data, error } = await supabase.storage
          .from('posts')
          .upload(filepath, buffer, {
            contentType: file.type,
            upsert: false,
          });
        
        if (error) {
          throw new Error(`${file.name}のアップロードに失敗しました`);
        }
        
        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(filepath);
        
        return {
          filename: file.name,
          url: urlData.publicUrl,
          size: file.size,
          type: file.type,
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      images: uploadResults,
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '画像のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 16.5 画像アップロードコンポーネント

### components/ImageUpload.tsx

```typescript
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  existingImages?: string[];
}

export default function ImageUpload({
  onUpload,
  maxFiles = 5,
  existingImages = [],
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // 最大枚数チェック
    if (previews.length + files.length > maxFiles) {
      alert(`最大${maxFiles}枚までアップロードできます`);
      return;
    }
    
    setUploading(true);
    
    try {
      // FormDataを作成
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // アップロード
      const response = await fetch('/api/posts/images', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      
      const data = await response.json();
      const urls = data.images.map((img: any) => img.url);
      
      // プレビューを追加
      setPreviews([...previews, ...urls]);
      
      // 親コンポーネントに通知
      onUpload([...previews, ...urls]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'アップロードに失敗しました');
    } finally {
      setUploading(false);
      // inputをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onUpload(newPreviews);
  };
  
  return (
    <div>
      {/* アップロードボタン */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || previews.length >= maxFiles}
          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span>アップロード中...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>画像を選択 ({previews.length}/{maxFiles})</span>
            </>
          )}
        </button>
      </div>
      
      {/* プレビュー */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* 画像がない場合 */}
      {previews.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
          <p>画像がアップロードされていません</p>
        </div>
      )}
    </div>
  );
}
```

---

## 16.6 アバター画像アップロードコンポーネント

### components/AvatarUpload.tsx

```typescript
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
  userId: string;
  currentImage?: string | null;
}

export default function AvatarUpload({ userId, currentImage }: AvatarUploadProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // クライアント側でのバリデーション
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPG、PNG、GIF、WebP形式の画像のみアップロード可能です');
      return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }
    
    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
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
      setPreview(data.url);
      
      // ページをリフレッシュしてデータを更新
      router.refresh();
      
      alert('アバター画像を更新しました');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'アップロードに失敗しました');
      // エラー時は元の画像に戻す
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      // inputをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* アバター表示 */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Camera className="w-12 h-12" />
            </div>
          )}
        </div>
        
        {/* アップロードボタン */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-sm text-gray-600 text-center">
        クリックして画像を変更<br />
        （JPG、PNG、GIF、WebP / 最大5MB）
      </p>
    </div>
  );
}
```

---

## 16.7 画像のリサイズ（Sharp）

より高度な実装として、サーバー側で画像をリサイズすることもできます。

### パッケージのインストール

```bash
npm install sharp
npm install --save-dev @types/sharp
```

### app/api/users/[id]/avatar/route.ts（Sharpを使用）

```typescript
import sharp from 'sharp';

// ... 前略

// ファイルをArrayBufferに変換
const arrayBuffer = await file.arrayBuffer();
let buffer = Buffer.from(arrayBuffer);

// Sharpでリサイズと最適化
buffer = await sharp(buffer)
  .resize(400, 400, {
    fit: 'cover',
    position: 'center',
  })
  .jpeg({
    quality: 85,
    progressive: true,
  })
  .toBuffer();

// ... アップロード処理
```

**処理内容:**

1. **リサイズ**: 400x400pxに縮小
2. **最適化**: JPEG品質85%で圧縮
3. **プログレッシブJPEG**: 段階的に読み込み

---

## 16.8 画像の削除

### app/api/posts/images/[filename]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await auth();
    const { filename } = await params;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者のみ実行可能です' },
        { status: 403 }
      );
    }
    
    // ファイルパスを構築
    const filepath = `posts/${session.user.id}/${filename}`;
    
    // Storageから削除
    const { error } = await supabase.storage
      .from('posts')
      .remove([filepath]);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      message: '画像を削除しました',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: '画像の削除に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## まとめ

この章では、画像アップロード機能について学びました：

### 基本機能
- ✅ **Supabase Storage**: バケットの作成と設定
- ✅ **バリデーション**: ファイルタイプ、サイズのチェック
- ✅ **ファイル名**: 安全なファイル名の生成

### API実装
- ✅ **POST /api/users/:id/avatar**: アバター画像のアップロード
- ✅ **DELETE /api/users/:id/avatar**: アバター画像の削除
- ✅ **POST /api/posts/images**: 投稿画像の一括アップロード
- ✅ **DELETE /api/posts/images/:filename**: 投稿画像の削除

### フロントエンド
- ✅ **AvatarUpload**: アバター画像アップロードコンポーネント
- ✅ **ImageUpload**: 複数画像アップロードコンポーネント
- ✅ **プレビュー**: アップロード前のプレビュー表示
- ✅ **エラーハンドリング**: バリデーションとエラー表示

### 高度な機能
- ✅ **Sharp**: 画像のリサイズと最適化
- ✅ **プログレッシブJPEG**: 段階的な読み込み
- ✅ **古い画像の削除**: アップロード時に自動削除

次の章では、**検索・フィルタリングAPIの実装**について詳しく見ていきます。

---

[← 前の章：第15章 イベントAPIの実装](15-イベントAPIの実装.md) | [目次に戻る](00-目次.md) | [次の章へ：第17章 検索・フィルタリングAPIの実装 →](17-検索・フィルタリングAPIの実装.md)
