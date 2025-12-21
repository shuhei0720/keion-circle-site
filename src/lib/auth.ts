import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

/**
 * NextAuth v5 認証設定
 * - Google OAuth: Google アカウントでログイン
 * - Credentials: メールアドレスとパスワードでログイン
 * - JWT Strategy: 最小限の情報のみトークンに含める
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  trustHost: true,
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Google OAuth でログインした場合、ユーザー情報を DB に保存
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split('@')[0],
                avatarUrl: user.image,
                role: "member",
              }
            })
          }
        } catch (error) {
          console.error('Error saving user:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // 初回ログイン時
      if (user && user.email) {
        // DBからユーザー情報を取得してIDとroleのみ保存
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true }
        })
        
        if (dbUser) {
          token.sub = dbUser.id
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      // セッションには最小限の情報のみ
      if (token.sub) {
        session.user.id = token.sub
        session.user.role = (token.role as string) || 'member'
      }
      return session
    },
  },
})
