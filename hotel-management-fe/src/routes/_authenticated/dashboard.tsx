import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/queries/useDashboard'
import { formatCurrency } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import {
  BedDouble,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  Hotel,
  TrendingUp,
  Users,
  Wand2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

function StatCard({ title, value, icon, description, variant = 'default' }: StatCardProps) {
  const iconColors = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${iconColors[variant]}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-1 h-3 w-28" />
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.title')}</h2>
          <p className="text-sm text-muted-foreground">Tổng quan hoạt động khách sạn hôm nay</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Trực tuyến
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }, (_, i) => `dashboard-skeleton-${i}`).map((key) => (
            <StatCardSkeleton key={key} />
          ))
        ) : (
          <>
            <StatCard
              title={t('dashboard.totalRooms')}
              value={stats?.totalRooms ?? 0}
              icon={<Hotel size={18} />}
            />
            <StatCard
              title={t('dashboard.occupiedRooms')}
              value={stats?.occupiedRooms ?? 0}
              icon={<BedDouble size={18} />}
              description={`${stats?.occupancyRate ?? 0}% ${t('dashboard.occupancyRate')}`}
              variant="warning"
            />
            <StatCard
              title={t('dashboard.availableRooms')}
              value={stats?.availableRooms ?? 0}
              icon={<CheckCircle2 size={18} />}
              variant="success"
            />
            <StatCard
              title={t('dashboard.monthlyRevenue')}
              value={formatCurrency(stats?.monthlyRevenue ?? 0)}
              icon={<TrendingUp size={18} />}
              variant="success"
            />
            <StatCard
              title={t('dashboard.todayCheckIns')}
              value={stats?.todayCheckIns ?? 0}
              icon={<CalendarCheck size={18} />}
            />
            <StatCard
              title={t('dashboard.todayCheckOuts')}
              value={stats?.todayCheckOuts ?? 0}
              icon={<CalendarX size={18} />}
            />
            <StatCard
              title={t('dashboard.pendingCleanings')}
              value={stats?.pendingCleanings ?? 0}
              icon={<Wand2 size={18} />}
              variant={stats && stats.pendingCleanings > 5 ? 'warning' : 'default'}
            />
            <StatCard
              title="Tỷ lệ lấp đầy"
              value={`${stats?.occupancyRate ?? 0}%`}
              icon={<Users size={18} />}
              description="Tháng này"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            Chức năng sẽ được phát triển
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
