import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
      // Google OAuth経由の場合
      if (account?.provider === "google") {
        // メールアドレスが既に存在するか確認
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email || "" }
        })
        
        // 既存ユーザーの場合はそのまま使用
        if (existingUser) {
          return true
        }
        
        // 新規ユーザーの場合、デフォルト値を設定
        if (user.email && user.name) {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
              email: user.email,
              name: user.name,
              role: "member",
              avatarUrl: user.image || null,
            }
          })
        }
      }
      return true
    }
  }
})
