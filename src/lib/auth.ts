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
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("メールアドレスとパスワードを入力してください")
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            select: { id: true, email: true, password: true, role: true }
          })

          if (!user || !user.password) {
            throw new Error("ユーザーが見つかりません")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("パスワードが正しくありません")
          }

          // 最小限の情報のみ返す
          return {
            id: user.id,
            email: user.email,
          }
        } catch (error) {
          console.error('Authorize error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  trustHost: true,
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split('@')[0],
                avatarUrl: user.image,
                role: "member",
              }
            })
          }
        } catch (error) {
          console.error('SignIn error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true }
        })
        
        if (dbUser) {
          // トークンには最小限: subとroleのみ
          token.sub = dbUser.id
          token.role = dbUser.role
          // email, name, imageは削除
          delete token.email
          delete token.name
          delete token.picture
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.role = (token.role as string) || 'member'
      }
      return session
    },
  },
})
