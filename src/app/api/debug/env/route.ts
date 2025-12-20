export const runtime = 'nodejs'

export async function GET() {
  return Response.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET (hidden)' : 'NOT SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
  })
}
