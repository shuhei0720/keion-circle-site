import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn() {
      console.log('[signIn callback] Called')
      return true
    },
    async jwt({ token, user }) {
      console.log('[jwt callback] Called', { hasUser: !!user })
      if (user) {
        token.id = user.id || user.email
      }
      return token
    },
  },
})
