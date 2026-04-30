import { Button } from '@/components/ui/button'
import { useUpdateCleaningStatus } from '@/hooks/mutations/useUpdateCleaningStatus'
import { CleaningStatus } from '@/types/cleaning-shift'
import { toast } from 'react-toastify'

const ACTION_LABEL: Partial<Record<number, { to: number; label: string }>> = {
  [CleaningStatus.NOT_STARTED]: { to: CleaningStatus.IN_PROGRESS, label: 'Bắt đầu' },
  [CleaningStatus.IN_PROGRESS]: { to: CleaningStatus.FINISHED, label: 'Hoàn thành' },
  [CleaningStatus.PAUSED]: { to: CleaningStatus.IN_PROGRESS, label: 'Tiếp tục' },
  [CleaningStatus.FINISHED]: { to: CleaningStatus.CHECKED, label: 'Xác nhận' },
  [CleaningStatus.REOPENED]: { to: CleaningStatus.IN_PROGRESS, label: 'Bắt đầu lại' },
}

interface Props {
  detailId: number
  status: number
  disabled?: boolean
}

export function StatusActions({ detailId, status, disabled }: Props) {
  const updateMut = useUpdateCleaningStatus({
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể đổi trạng thái'
      toast.error(message)
    },
  })

  const action = ACTION_LABEL[status]
  if (!action) return null

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled || updateMut.isPending}
      onClick={() =>
        updateMut.mutate({
          id: detailId,
          data: { cleanStatus: action.to as CleaningStatus },
        })
      }
    >
      {action.label}
    </Button>
  )
}
