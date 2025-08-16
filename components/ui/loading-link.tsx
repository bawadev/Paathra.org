'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePageTransition } from '@/components/ui/global-loading-overlay'
import { ComponentProps } from 'react'

interface LoadingLinkProps extends Omit<ComponentProps<typeof Link>, 'onClick'> {
  loadingLabel?: string
  onClick?: () => void
}

export function LoadingLink({ 
  children, 
  href, 
  loadingLabel = 'Loading page...',
  onClick,
  ...props 
}: LoadingLinkProps) {
  const router = useRouter()
  const { startTransition, completeTransition } = usePageTransition()

  const handleClick = async (e: React.MouseEvent) => {
    // Only show loading for different pages and when running in browser
    if (typeof window === 'undefined') return
    
    const currentPath = window.location.pathname
    const targetPath = typeof href === 'string' ? href : (href as any)?.pathname || href?.toString() || ''
    
    if (currentPath !== targetPath) {
      startTransition(loadingLabel)
      
      // Add a small delay to ensure the loading appears
      setTimeout(() => {
        if (onClick) {
          onClick()
        }
        router.push(targetPath)
        // Complete transition will be handled by the page load
        setTimeout(completeTransition, 500)
      }, 100)
      
      e.preventDefault()
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
