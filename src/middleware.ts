import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // ミドルウェアはEdge Runtimeで動作するため、Prismaを使わない
  // セッション確認はAPI RouteやServer Componentで行う
  return NextResponse.next()
}

export const config = {
  matcher: [
    // 保護するルート（ログイン必須）
    '/schedules/:path*',
    '/chat/:path*',
    '/dashboard/:path*',
    '/users/:path*',
  ]
}
