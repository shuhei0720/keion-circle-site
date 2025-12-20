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
      console.log('[jwt callback] Starting', { hasUser: !!user, provider: account?.provider })
      
      if (user) {
        // とりあえずユーザー情報をそのままトークンに設定
        token.id = user.id as string
        token.email = user.email
        token.name = user.name
        token.role = "member"
        token.avatarUrl = user.image || null
        console.log('[jwt callback] Token set', { id: token.id, email: token.email })
      }
      
      if (trigger === "update" && session) {
        token.avatarUrl = session.avatarUrl
      }
      
      return token
    },
    async session({ session, token }) {
      console.log('[session callback] Starting')
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.avatarUrl = token.avatarUrl as string | null
      }
      return session
    },
    async signIn({ user, account, profile }) {
      console.log('[signIn callback] Starting', { provider: account?.provider, email: user?.email })
      // とりあえず何もせずtrueを返す
      return true
    }
  }
})
