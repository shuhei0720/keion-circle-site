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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role || "member"
        token.avatarUrl = user.avatarUrl || null
      }
      
      // プロフィール更新時にトークンを更新
      if (trigger === "update" && session) {
        token.avatarUrl = session.avatarUrl
      }
      
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
      // PrismaAdapterがユーザー作成を自動的に処理するため、
      // 特別な処理は不要
      retGoogle OAuth経由の場合、ユーザーを手動でDBに保存
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email,
                image: user.image,
                avatarUrl: user.image,
                role: "member",
              }
            })
          }
        } catch (error) {
          console.error('Error creating user:', error)
          return false
        }
      }
  }
})
