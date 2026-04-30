import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { CreateCleaningDetailBody } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateCleaningDetail({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['create-cleaning-detail'],
    mutationFn: ({ cleanId, data }: { cleanId: number; data: CreateCleaningDetailBody }) =>
      cleaningShiftApi.createDetail(cleanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
