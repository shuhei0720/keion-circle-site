export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: [
    // 保護するルート（ログイン必須）
    '/schedules/:path*',
    '/chat/:path*',
    '/dashboard/:path*',
    '/users/:path*',
    '/api/schedules/:path*',
    '/api/messages/:path*',
    '/api/users/:path*',
  ]
}
