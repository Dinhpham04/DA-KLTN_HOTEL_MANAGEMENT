import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BedDouble } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/rooms')({
  component: RoomsPage,
})

function RoomsPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('room.title')}</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BedDouble size={18} />
            {t('room.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            Chức năng đang phát triển
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
