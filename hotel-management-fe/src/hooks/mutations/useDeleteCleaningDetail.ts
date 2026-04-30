import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useDeleteCleaningDetail({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['delete-cleaning-detail'],
    mutationFn: (id: number) => cleaningShiftApi.deleteDetail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
