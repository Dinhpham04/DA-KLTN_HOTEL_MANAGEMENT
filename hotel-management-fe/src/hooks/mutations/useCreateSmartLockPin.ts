import { smartLockPinApi } from '@/api/smart-lock-pin.api'
import type { CreateSmartLockPinBody } from '@/types/smart-lock-pin'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseCreateSmartLockPinParams {
  onSuccess?: (data: unknown) => void
  onError?: (error: unknown) => void
}

export function useCreateSmartLockPin({ onSuccess, onError }: UseCreateSmartLockPinParams = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-smart-lock-pin'],
    mutationFn: (data: CreateSmartLockPinBody) => smartLockPinApi.create(data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['get-smart-lock-pins'] })
      onSuccess?.(data)
    },
    onError,
  })
}
