# 第10章：NextAuth.jsによる認証システム

この章では、NextAuth.js v5を使った認証システムの実装について詳しく学びます。

## 10.1 NextAuth.jsとは

NextAuth.jsは、Next.jsアプリケーションで認証を簡単に実装できるライブラリです。

### 主な機能

- **多様な認証方法**
  - Google、GitHub、Twitter等のOAuth
  - メールアドレス + パスワード
  - メール認証（パスワードレス）

- **セッション管理**
  - JWT（JSON Web Token）
  - データベースセッション

- **セキュリティ**
  - CSRF保護
  - パスワードハッシュ化
  - セッショントークン管理

---

## 10.2 認証の基本概念

### 認証（Authentication）と認可（Authorization）

```
認証（Authentication）: あなたは誰ですか？
  → ログイン：メールアドレスとパスワードで本人確認

認可（Authorization）: あなたは何ができますか？
  → 権限チェック：管理者だけが投稿を削除できる
```

### セッション管理

```
1. ユーザーがログイン
   ↓
2. サーバーがセッショントークンを発行
   ↓
3. ブラウザがCookieにトークンを保存
   ↓
4. 以降のリクエストでトークンを送信
   ↓
5. サーバーがトークンを検証してユーザーを特定
```

---

## 10.3 NextAuth.jsのセットアップ

### 1. パッケージのインストール

```bash
npm install next-auth@beta @auth/core @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

### 2. 環境変数の設定

**.env.local:**

```env
# NextAuth.js設定
AUTH_URL=http://localhost:3000
AUTH_SECRET=your-random-secret-key-here
AUTH_TRUST_HOST=true

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**AUTH_SECRETの生成：**

```bash
openssl rand -base64 32
```

### 3. Prismaスキーマの設定

NextAuth.jsに必要なモデルを追加します：

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?   // パスワード認証用
  role          String    @default("member")  // 役割管理用
  
  accounts      Account[]
  sessions      Session[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

**データベースに反映：**

```bash
npx prisma db push
```

---

## 10.4 認証設定ファイルの作成

### src/lib/auth.ts

NextAuth.jsの設定を定義します。

```typescript
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Prismaアダプターを使用
  adapter: PrismaAdapter(prisma),
  
  // セッション管理方法
  session: {
    strategy: 'jwt',  // JWTトークンを使用
  },
  
  // 認証プロバイダー
  providers: [
    // 1. Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // 2. メールアドレス + パスワード
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      
      // ログイン処理
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // ユーザーを検索
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        
        // ユーザーが存在しない、またはパスワードが設定されていない
        if (!user || !user.password) {
          return null;
        }
        
        // パスワードを検証
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        
        if (!isPasswordValid) {
          return null;
        }
        
        // 認証成功
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  
  // コールバック関数
  callbacks: {
    // JWTトークンにカスタムデータを追加
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Google OAuthの場合、ユーザー情報を更新
      if (account?.provider === 'google' && user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            name: user.name,
            image: user.image,
          },
        });
      }
      
      return token;
    },
    
    // セッションにカスタムデータを追加
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  
  // カスタムページ
  pages: {
    signIn: '/login',  // ログインページ
  },
  
  // デバッグ
  debug: process.env.NODE_ENV === 'development',
});
```

### TypeScript型定義の拡張

NextAuth.jsの型に、カスタムプロパティ（`id`、`role`）を追加します。

**src/types/next-auth.d.ts:**

```typescript
import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
  
  interface User {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
```

---

## 10.5 APIルートの設定

### app/api/auth/[...nextauth]/route.ts

NextAuth.jsのすべてのAPIエンドポイントを処理します。

```typescript
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

これだけで、以下のエンドポイントが自動的に作成されます：

```
GET  /api/auth/signin          - ログインページ
POST /api/auth/signin/google   - Googleでログイン
POST /api/auth/signin/credentials - メール+パスワードでログイン
POST /api/auth/signout         - ログアウト
GET  /api/auth/session         - セッション情報取得
GET  /api/auth/csrf            - CSRFトークン取得
```

---

## 10.6 ユーザー登録APIの作成

### app/api/auth/register/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    
    // バリデーション
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '必須項目を入力してください' },
        { status: 400 }
      );
    }
    
    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'メールアドレスの形式が正しくありません' },
        { status: 400 }
      );
    }
    
    // パスワードの長さチェック
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上にしてください' },
        { status: 400 }
      );
    }
    
    // 既存ユーザーのチェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }
    
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'member',  // デフォルトは一般メンバー
      },
    });
    
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '登録に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

## 10.7 ログインページの作成

### app/login/page.tsx

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // メール+パスワードでログイン
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('メールアドレスまたはパスワードが正しくありません');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // Googleでログイン
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            ログイン
          </h2>
          <p className="mt-2 text-center text-gray-600">
            BOLD軽音 メンバーサイトへようこそ
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">または</span>
          </div>
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Googleでログイン
        </button>
        
        <p className="text-center text-sm text-gray-600">
          アカウントをお持ちでないですか？{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

## 10.8 登録ページの作成

### app/register/page.tsx

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // バリデーション
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('パスワードは8文字以上にしてください');
      return;
    }
    
    setLoading(true);
    
    try {
      // ユーザー登録
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || '登録に失敗しました');
        return;
      }
      
      // 登録成功後、自動ログイン
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('ログインに失敗しました');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            新規登録
          </h2>
          <p className="mt-2 text-center text-gray-600">
            BOLD軽音 メンバーサイトへようこそ
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              名前
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード（8文字以上）
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              パスワード（確認）
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-600">
          既にアカウントをお持ちですか？{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

## 10.9 認証ボタンコンポーネント

### src/components/AuthButton.tsx

```typescript
import { auth, signOut } from '@/lib/auth';
import Link from 'next/link';

export default async function AuthButton() {
  const session = await auth();
  
  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        ログイン
      </Link>
    );
  }
  
  return (
    <div className="flex items-center gap-4">
      <Link href={`/users/${session.user.id}`} className="flex items-center gap-2">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || ''}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium">{session.user.name}</span>
      </Link>
      
      <form
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <button
          type="submit"
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          ログアウト
        </button>
      </form>
    </div>
  );
}
```

---

## 10.10 認証が必要なページの保護

### サーバーコンポーネントで保護

```typescript
// app/posts/new/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewPostPage() {
  const session = await auth();
  
  // ログインチェック
  if (!session?.user) {
    redirect('/login');
  }
  
  // 管理者チェック
  if (session.user.role !== 'admin') {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          アクセス権限がありません
        </h2>
        <p className="text-gray-600">
          この機能は管理者のみ使用できます。
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <h1>新しい投稿を作成</h1>
      {/* フォーム */}
    </div>
  );
}
```

### クライアントコンポーネントで保護

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function ProtectedComponent() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });
  
  if (status === 'loading') {
    return <div>読み込み中...</div>;
  }
  
  return <div>保護されたコンテンツ</div>;
}
```

---

## 10.11 APIルートの保護

### ミドルウェアで保護

**middleware.ts:**

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/register');
  
  // 未ログインで保護されたページにアクセス
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // ログイン済みで認証ページにアクセス
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/posts/new',
    '/schedules/new',
    '/users/:path*',
    '/login',
    '/register',
  ],
};
```

### 個別APIルートで保護

```typescript
// app/api/posts/route.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  
  // 認証チェック
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // 管理者チェック
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // 処理...
}
```

---

## まとめ

この章では、NextAuth.jsを使った認証システムについて学びました：

### 認証の基本
- ✅ **認証と認可**: ユーザー特定と権限管理
- ✅ **セッション管理**: トークンベースのセッション
- ✅ **セキュリティ**: CSRF保護、パスワードハッシュ化

### NextAuth.js設定
- ✅ **プロバイダー**: Google OAuth、メール+パスワード
- ✅ **アダプター**: Prismaでセッション管理
- ✅ **コールバック**: JWTとセッションのカスタマイズ

### 実装
- ✅ **ログイン/登録**: フォームとGoogleログイン
- ✅ **ページ保護**: サーバー/クライアントコンポーネント
- ✅ **API保護**: ミドルウェアと個別チェック

次の章では、**Prismaを使ったデータベース操作**について詳しく見ていきます。

---

[← 前の章：第9章 プロジェクトのファイル構成](09-プロジェクトのファイル構成.md) | [目次に戻る](00-目次.md) | [次の章へ：第11章 Prismaによるデータベース操作 →](11-Prismaによるデータベース操作.md)
