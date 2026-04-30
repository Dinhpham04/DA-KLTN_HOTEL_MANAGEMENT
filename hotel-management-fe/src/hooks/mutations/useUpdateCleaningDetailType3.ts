import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { UpdateCleaningDetailType3Body } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateCleaningDetailType3({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['update-cleaning-detail-type3'],
    mutationFn: ({ id, data }: { id: number; data: UpdateCleaningDetailType3Body }) =>
      cleaningShiftApi.updateDetailType3(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
