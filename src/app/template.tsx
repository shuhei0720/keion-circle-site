'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // プロフィールページへの遷移時にスクロールをリセット
    if (pathname === '/profile') {
      // 即座にリセット
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      
      // 少し遅延させても再度リセット（念のため）
      const timer = setTimeout(() => {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }, 0)
      
      return () => clearTimeout(timer)
    }
  }, [pathname])

  return <>{children}</>
}
