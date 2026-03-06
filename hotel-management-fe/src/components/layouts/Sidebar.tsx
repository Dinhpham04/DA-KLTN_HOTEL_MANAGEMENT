import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Hotel,
  LogOut,
  Users,
  Wand2,
} from 'lucide-react'
import type * as React from 'react'

interface NavItem {
  key: string
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'nav.dashboard', href: '/dashboard', icon: <BarChart3 size={18} /> },
  {
    key: 'reservations',
    label: 'nav.reservations',
    href: '/reservations',
    icon: <CalendarCheck size={18} />,
  },
  { key: 'rooms', label: 'nav.rooms', href: '/rooms', icon: <BedDouble size={18} /> },
  { key: 'clients', label: 'nav.clients', href: '/clients', icon: <Users size={18} /> },
  { key: 'billing', label: 'nav.billing', href: '/billing', icon: <CreditCard size={18} /> },
  { key: 'cleaning', label: 'nav.cleaning', href: '/cleaning', icon: <Wand2 size={18} /> },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const filteredNavItems = navItems

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Hotel size={22} className="text-sidebar-primary shrink-0" />
            <span className="font-bold text-base truncate">{t('common.appName')}</span>
          </div>
        )}
        {collapsed && <Hotel size={22} className="text-sidebar-primary mx-auto" />}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'rounded-md p-1 hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground',
            collapsed && 'mx-auto'
          )}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {filteredNavItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href))

          return (
            <Link
              key={item.key}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? t(item.label) : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{t(item.label)}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="mb-2 px-2">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user.staffName}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user.mail ?? '-'}</p>
          </div>
        )}
        <button
          type="button"
          onClick={async () => {
            await logout.mutateAsync()
            navigate({ to: '/login' })
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? t('auth.logout') : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>{t('auth.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}
