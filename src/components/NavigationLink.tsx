'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface NavigationLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function NavigationLink({ href, children, className = '', onClick }: NavigationLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (onClick) {
      onClick()
    }
    
    startTransition(() => {
      router.push(href)
    })
  }
  
  return (
    <a
      href={href}
      onClick={handleClick}
      className={`${className} ${isPending ? 'opacity-70 cursor-wait' : ''} transition-opacity`}
    >
      {children}
      {isPending && (
        <span className="ml-2 inline-block animate-spin">⏳</span>
      )}
    </a>
  )
}
