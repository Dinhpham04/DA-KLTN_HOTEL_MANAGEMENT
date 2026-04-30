import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { CopyCleaningDetailBody } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCopyCleaningDetail({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['copy-cleaning-detail'],
    mutationFn: ({ id, data }: { id: number; data: CopyCleaningDetailBody }) =>
      cleaningShiftApi.copyDetail(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
