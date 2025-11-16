"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout'
import { CommandPalette } from '@/components/common'

export default function AppLayout({ children, categoryStats, className = "" }) {
  const router = useRouter()

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      const tag = e.target.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return

      // 'N' — new experience
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        router.push('/experiences/new')
      }

      // '/' — open command palette (search)
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true })
        window.dispatchEvent(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return (
    <div className={`flex min-h-screen ${className}`}>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <Sidebar categoryStats={categoryStats} />
      <main id="main-content" className="flex-1 overflow-y-auto pt-16 lg:pt-0" role="main">
        {children}
      </main>
      <CommandPalette />
    </div>
  )
}
