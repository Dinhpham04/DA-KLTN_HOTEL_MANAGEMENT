import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { UpdateCleaningStatusBody } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateCleaningStatus({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['update-cleaning-status'],
    mutationFn: ({ id, data }: { id: number; data: UpdateCleaningStatusBody }) =>
      cleaningShiftApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
