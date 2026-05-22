'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/tasks',     label: 'Tasks',     icon: '✓' },
  { href: '/team',      label: 'Team',      icon: '◈' },
  { href: '/chat',      label: 'Chat',      icon: '◉' },
  { href: '/files',     label: 'Files',     icon: '⊟' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="w-60 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-lg font-bold text-brand-600 tracking-tight">
          Task<span className="text-gray-900 dark:text-gray-100">Mate</span>
        </span>
        <button
          onClick={toggleTheme}
          className="text-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-brand-50 dark:bg-brand-600/20 text-brand-700 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
            )}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {user?.name ?? 'Loading…'}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
