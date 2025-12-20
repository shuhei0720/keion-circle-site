import NextAuth from "next-auth"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"

// 環境変数の確認とフォールバック
const isDevelopment = process.env.NODE_ENV === 'development'
const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

console.log('NextAuth Base URL:', baseUrl)
console.log('Environment:', process.env.NODE_ENV)
console.log('AUTH_URL:', process.env.AUTH_URL)
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  trustHost: true,
  basePath: '/api/auth',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return user
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      console.log('[jwt callback] Starting', { hasUser: !!user, provider: account?.provider, email: user?.email })
      
      // 初回ログイン時
      if (user) {
        // Google OAuth経由の場合、メールアドレスでDBからユーザー情報を取得
        if (account?.provider === "google" && user.email) {
          try {
            console.log('[jwt callback] Fetching user from DB')
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email }
            })
            if (dbUser) {
              console.log('[jwt callback] User found in DB', { id: dbUser.id, role: dbUser.role })
              token.id = dbUser.id
              token.role = dbUser.role
              token.avatarUrl = dbUser.avatarUrl
            } else {
              console.log('[jwt callback] User not found in DB')
            }
          } catch (error) {
            console.error('[jwt callback] Error fetching user:', error)
          }
        } else {
          // 通常のログイン
          console.log('[jwt callback] Regular login')
          token.id = user.id as string
          token.role = user.role || "member"
          token.avatarUrl = user.avatarUrl || null
        }
      }
      
      // プロフィール更新時にトークンを更新
      if (trigger === "update" && session) {
        token.avatarUrl = session.avatarUrl
      }
      
      console.log('[jwt callback] Returning token', { hasId: !!token.id })
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.avatarUrl = token.avatarUrl as string | null
      }
      return session
    },
    async signIn({ user, account, profile }) {
      console.log('[signIn callback] Starting', { provider: account?.provider, email: user?.email })
      
      // Google OAuth経由の場合、ユーザーを手動でDBに保存
      if (account?.provider === "google" && user.email) {
        try {
          console.log('[signIn callback] Checking existing user')
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            console.log('[signIn callback] Creating new user')
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email,
                image: user.image,
                avatarUrl: user.image,
                role: "member",
              }
            })
            console.log('[signIn callback] User created successfully')
          } else {
            console.log('[signIn callback] User already exists')
          }
        } catch (error) {
          console.error('[signIn callback] Error:', error)
          // エラーが発生してもログインは継続
        }
      }
      console.log('[signIn callback] Returning true')
      return true
    }
  }
})
