import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { UpsertCleansBody } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpsertCleans({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['upsert-cleans'],
    mutationFn: (data: UpsertCleansBody) => cleaningShiftApi.upsertCleans(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
