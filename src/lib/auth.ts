import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

/**
 * NextAuth v5 認証設定
 * - Google OAuth: Google アカウントでログイン
 * - Credentials: メールアドレスとパスワードでログイン
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
  },
  trustHost: true,
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google OAuth でログインした場合、ユーザー情報を DB に保存
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (!existingUser) {
            // 新規ユーザーを作成
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split('@')[0],
                avatarUrl: user.image,
                role: "member", // デフォルトは一般メンバー
              }
            })
          } else {
            // 既存ユーザーの情報を更新（名前やアバター画像が変更されている可能性がある）
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name || existingUser.name,
                avatarUrl: user.image || existingUser.avatarUrl,
              }
            })
          }
        } catch (error) {
          console.error('Error saving user to database:', error)
          return false
        }
      }
      
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // ログイン時にDBからユーザー情報を取得
        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (dbUser) {
            token.id = dbUser.id
            token.email = dbUser.email
            token.name = dbUser.name
            token.role = dbUser.role
            token.avatarUrl = dbUser.avatarUrl
          }
        }
      }
      
      // セッション更新時（プロフィール変更時など）
      if (trigger === "update" && session) {
        token.name = session.name || token.name
        token.avatarUrl = session.avatarUrl || token.avatarUrl
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
  },
})
