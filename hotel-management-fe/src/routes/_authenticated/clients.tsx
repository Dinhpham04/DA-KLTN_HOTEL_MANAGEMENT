import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/clients')({
  component: ClientsPage,
})

function ClientsPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('client.title')}</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users size={18} />
            {t('client.title')}
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
