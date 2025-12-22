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
        
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('[NextAuth Credentials] Missing credentials')
            throw new Error("メールアドレスとパスワードを入力してください")
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            select: { id: true, email: true, password: true, role: true }
          })
          console.log('[NextAuth Credentials] User found:', !!user)

          if (!user || !user.password) {
            console.error('[NextAuth Credentials] User not found or no password')
            throw new Error("ユーザーが見つかりません")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          console.log('[NextAuth Credentials] Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.error('[NextAuth Credentials] Invalid password')
            throw new Error("パスワードが正しくありません")
          }

          const result = {
            id: user.id,
            email: user.email,
          }
          console.log('[NextAuth Credentials] Success, returning:', JSON.stringify(result, null, 2))
          return result
        } catch (error) {
          console.error('[NextAuth Credentials] Error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
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
      // ログイン後はHome画面(/)に遷移
      if (url === baseUrl || url === `${baseUrl}/`) {
        return baseUrl
      }
      // サインイン後もHomeに
      if (url.startsWith(baseUrl)) {
        return url
      }
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
              }
            })
            console.log('[NextAuth SignIn] New user created:', dbUser.id)
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
      
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true }
        })
        console.log('[NextAuth JWT] DB User:', dbUser)
        
        if (dbUser) {
          const newToken = {
            sub: dbUser.id,
            role: dbUser.role,
          }
          console.log('[NextAuth JWT] New token created:', JSON.stringify(newToken, null, 2))
          return newToken
        }
      }
      
      console.log('[NextAuth JWT] Returning existing token')
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
