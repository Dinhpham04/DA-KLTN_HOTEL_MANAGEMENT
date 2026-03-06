import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  title?: string
}

function staffTypeToRoleKey(staffType: number | null): 'admin' | 'manager' | 'staff' | 'cleaning' {
  if (staffType === 1) return 'admin'
  if (staffType === 2) return 'manager'
  if (staffType === 3) return 'staff'
  return 'cleaning'
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth()
  const { t } = useTranslation()

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
      {/* Title */}
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={`${t('common.search')}...`}
            className="w-56 pl-9 h-9"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">
            3
          </span>
        </Button>

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2 rounded-md px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {user.staffName.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium leading-none">{user.staffName}</p>
              <p className="text-xs text-muted-foreground">
                {t(`staff.role.${staffTypeToRoleKey(user.staffType)}`)}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
