import { Badge } from '@/components/ui/badge'
import { CleaningStatus } from '@/types/cleaning-shift'

const STATUS_LABEL: Record<number, string> = {
  [CleaningStatus.NOT_STARTED]: 'Chưa bắt đầu',
  [CleaningStatus.IN_PROGRESS]: 'Đang dọn',
  [CleaningStatus.PAUSED]: 'Tạm dừng',
  [CleaningStatus.FINISHED]: 'Đã xong',
  [CleaningStatus.CHECKED]: 'Đã kiểm tra',
  [CleaningStatus.REOPENED]: 'Mở lại',
  [CleaningStatus.CANCELLED]: 'Đã hủy',
}

const STATUS_VARIANT: Record<number, string> = {
  [CleaningStatus.NOT_STARTED]: 'bg-slate-200 text-slate-800',
  [CleaningStatus.IN_PROGRESS]: 'bg-blue-200 text-blue-900',
  [CleaningStatus.PAUSED]: 'bg-amber-200 text-amber-900',
  [CleaningStatus.FINISHED]: 'bg-emerald-200 text-emerald-900',
  [CleaningStatus.CHECKED]: 'bg-emerald-500 text-white',
  [CleaningStatus.REOPENED]: 'bg-orange-200 text-orange-900',
  [CleaningStatus.CANCELLED]: 'bg-rose-200 text-rose-900',
}

interface Props {
  status: number
}

export function CleaningStatusBadge({ status }: Props) {
  const label = STATUS_LABEL[status] ?? `#${status}`
  const cls = STATUS_VARIANT[status] ?? 'bg-slate-200 text-slate-800'
  return <Badge className={cls}>{label}</Badge>
}
