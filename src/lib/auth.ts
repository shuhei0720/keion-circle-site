import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

/**
 * NextAuth v5 認証設定
 * - Google OAuth: Google アカウントでログイン
 * - Credentials: メールアドレスとパスワードでログイン
 * - JWT Strategy: IDとroleのみ保存（Cookieサイズ最小化）
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[NextAuth Credentials] Authorize called')
        console.log('[NextAuth Credentials] Email:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.error('[NextAuth Credentials] Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: { id: true, email: true, password: true, role: true, emailVerified: true }
        })
        console.log('[NextAuth Credentials] User found:', !!user)

        if (!user || !user.password) {
          console.error('[NextAuth Credentials] User not found or no password')
          return null
        }

        // メールアドレス検証チェック
        if (!user.emailVerified) {
          console.error('[NextAuth Credentials] Email not verified')
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        console.log('[NextAuth Credentials] Password valid:', isPasswordValid)

        if (!isPasswordValid) {
          console.error('[NextAuth Credentials] Invalid password')
          return null
        }

        const result = {
          id: user.id,
          email: user.email,
        }
        console.log('[NextAuth Credentials] Success, returning:', JSON.stringify(result, null, 2))
        return result
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      // localhostかどうかで判定（開発環境とCI環境はHTTPなので__Secure-は使えない）
      name: (process.env.AUTH_URL?.includes('localhost') || process.env.NEXTAUTH_URL?.includes('localhost'))
        ? `next-auth.session-token`
        : `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: !(process.env.AUTH_URL?.includes('localhost') || process.env.NEXTAUTH_URL?.includes('localhost')),
      },
    },
  },
  trustHost: true,
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('[NextAuth Redirect] URL:', url)
      console.log('[NextAuth Redirect] Base URL:', baseUrl)
      
      // callbackUrlが指定されている場合
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`
        console.log('[NextAuth Redirect] Redirecting to:', fullUrl)
        return fullUrl
      }
      
      // 絶対URLの場合、同じオリジンならそのまま使用
      if (url.startsWith(baseUrl)) {
        console.log('[NextAuth Redirect] Redirecting to:', url)
        return url
      }
      
      // それ以外はホームページへ
      console.log('[NextAuth Redirect] Redirecting to base URL:', baseUrl)
      return baseUrl
    },
    async signIn({ user, account, profile }) {
      console.log('[NextAuth SignIn] Provider:', account?.provider)
      console.log('[NextAuth SignIn] User email:', user.email)
      console.log('[NextAuth SignIn] User object:', JSON.stringify(user, null, 2))
      
      if (account?.provider === "google" && user.email) {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          console.log('[NextAuth SignIn] DB User found:', !!dbUser)

          if (!dbUser) {
            console.log('[NextAuth SignIn] Creating new user...')
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split('@')[0],
                role: "member",
                emailVerified: new Date(), // Google認証済みなので検証済み
                emailNotifications: true, // デフォルトで通知を有効化
              }
            })
            console.log('[NextAuth SignIn] New user created:', dbUser.id)
          } else if (!dbUser.emailVerified) {
            // 既存ユーザーでemailVerifiedがnullの場合、検証済みに更新
            console.log('[NextAuth SignIn] Updating emailVerified for existing user...')
            await prisma.user.update({
              where: { email: user.email },
              data: { emailVerified: new Date() }
            })
          }
        } catch (error) {
          console.error('[NextAuth SignIn] Error:', error)
          return false
        }
      }
      console.log('[NextAuth SignIn] Success')
      return true
    },
    async jwt({ token, user, trigger, account }) {
      console.log('[NextAuth JWT] Trigger:', trigger)
      console.log('[NextAuth JWT] User present:', !!user)
      console.log('[NextAuth JWT] User email:', user?.email)
      console.log('[NextAuth JWT] Token before:', JSON.stringify(token, null, 2))
      
      // 初回ログイン時（userが存在する）
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true }
        })
        console.log('[NextAuth JWT] DB User:', dbUser)
        
        if (dbUser) {
          token.sub = dbUser.id
          token.role = dbUser.role
          console.log('[NextAuth JWT] Token updated with user data:', JSON.stringify(token, null, 2))
        }
      }
      
      console.log('[NextAuth JWT] Returning token:', JSON.stringify(token, null, 2))
      return token
    },
    async session({ session, token }) {
      console.log('[NextAuth Session] Token:', JSON.stringify(token, null, 2))
      console.log('[NextAuth Session] Session before:', JSON.stringify(session, null, 2))
      
      if (token.sub) {
        // データベースから最新のユーザー情報を取得
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true, name: true, email: true, role: true }
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.name = dbUser.name || null
          session.user.email = dbUser.email || ''
          session.user.role = dbUser.role
        }
      }
      
      console.log('[NextAuth Session] Session after:', JSON.stringify(session, null, 2))
      return session
    },
  },
})
