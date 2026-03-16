"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiPlusCircle, 
  FiGlobe, 
  FiUser, 
  FiPieChart,
  FiTrendingUp,
  FiLink,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiMonitor,
  FiSearch
} from 'react-icons/fi'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { useTheme } from './ThemeProvider'

const Sidebar = ({ categoryStats }) => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const menuButtonRef = useRef(null)
  const sidebarRef = useRef(null)
  
  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleEscape)
      // Focus the sidebar when it opens
      sidebarRef.current?.focus()
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])
  
  // Grouped navigation for better information scent and scannability
  const navigation = {
    primary: [
      { name: 'Dashboard', href: '/dashboard', icon: FiHome },
      { name: 'Explore', href: '/explore', icon: FiGlobe },
      { name: 'Memory Links', href: '/links', icon: FiLink },
    ],
    actions: [
      { name: 'New Experience', href: '/experiences/new', icon: FiPlusCircle },
    ],
    insights: [
      { name: 'Analytics', href: '/analytics', icon: FiPieChart },
      { name: 'Profile', href: '/profile', icon: FiUser },
    ],
  }

  const themeOptions = [
    { value: 'light', icon: FiSun, label: 'Light' },
    { value: 'dark', icon: FiMoon, label: 'Dark' },
    { value: 'system', icon: FiMonitor, label: 'System' },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        ref={menuButtonRef}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-lg"
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="main-sidebar"
      >
        {isMobileMenuOpen ? (
          <FiX className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <FiMenu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        id="main-sidebar"
        ref={sidebarRef}
        tabIndex={-1}
        role="navigation"
        aria-label="Main navigation"
        className={`
        fixed lg:sticky top-0 inset-y-0 left-0 z-40
        flex h-screen w-64 flex-col bg-white border-r border-gray-200 
        dark:bg-zinc-900 dark:border-zinc-800
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Logo */}
      <div className="flex h-12 items-center px-5 border-b border-gray-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Experiences🧩
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-3 overflow-y-auto" aria-label="Main">
        {/* Search shortcut hint */}
        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true })
            window.dispatchEvent(event)
          }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-1.5 mb-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-gray-200 dark:border-zinc-700/50"
          aria-label="Open search (Ctrl+K)"
        >
          <FiSearch className="h-4 w-4" />
          <span className="flex-1 text-left text-sm">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 dark:border-zinc-700 px-1.5 py-0.5 text-[10px] text-gray-400">
            ⌘K
          </kbd>
        </button>

        {/* Primary navigation (most important destinations) */}
        <div className="mb-3">
          <h3 className="sr-only">Primary</h3>
          <div className="space-y-1">
            {navigation.primary.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick actions - visually prominent to encourage primary flows */}
        <div className="mb-3">
          <h3 className="sr-only">Quick actions</h3>
          {navigation.actions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:scale-[1.01] transition-transform"
            >
              <action.icon className="h-5 w-5" />
              <span>{action.name}</span>
            </Link>
          ))}
        </div>

        {/* Insights & account */}
        <div>
          <h3 className="sr-only">Insights</h3>
          <div className="space-y-1">
            {navigation.insights.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Footer controls (theme + stats) - pinned to bottom */}
      <div className="mt-auto">
      <div className="border-t border-gray-200 p-3 dark:border-zinc-800">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <FiSun className="h-4 w-4" />
          <span>Appearance</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isActive = theme === option.value
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                aria-pressed={isActive}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700'
                }`}
                title={option.label}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px]">{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Category Stats - Bottom */}
      <div className="border-t border-gray-200 p-3 dark:border-zinc-800">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <FiTrendingUp className="h-4 w-4" />
          <span>This Month</span>
        </div>
        <div className="space-y-2">
          {categoryStats?.slice(0, 5).map((stat) => {
            const categoryConfig = CATEGORY_CONFIG[stat.category]
            const CategoryIcon = categoryConfig?.icon
            
            return (
              <div key={stat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {CategoryIcon && (
                    <CategoryIcon className={`h-3.5 w-3.5 flex-shrink-0 ${categoryConfig.color}`} />
                  )}
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    {categoryConfig?.label || stat.category}
                  </span>
                </div>
                <span className="font-semibold text-purple-600 dark:text-purple-400 ml-2">
                  {stat.count}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-700 dark:text-gray-300">Total Posts</span>
            <span className="text-purple-600 dark:text-purple-400">
              {categoryStats?.reduce((acc, stat) => acc + stat.count, 0) || 0}
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  )
}

export default Sidebar
