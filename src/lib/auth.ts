import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

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
  ],
  session: {
    strategy: "jwt",
  },
  trustHost: true,
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
