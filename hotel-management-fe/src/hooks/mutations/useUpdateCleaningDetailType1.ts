import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { UpdateCleaningDetailType1Body } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateCleaningDetailType1({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['update-cleaning-detail-type1'],
    mutationFn: ({ id, data }: { id: number; data: UpdateCleaningDetailType1Body }) =>
      cleaningShiftApi.updateDetailType1(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
