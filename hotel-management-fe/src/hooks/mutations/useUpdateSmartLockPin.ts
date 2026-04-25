import { useMutation, useQueryClient } from '@tanstack/react-query'

import { smartLockPinApi } from '@/api/smart-lock-pin.api'
import type { UpdateSmartLockPinBody } from '@/types/smart-lock-pin'

interface UseUpdateSmartLockPinParams {
  onSuccess?: (data: unknown) => void
  onError?: (error: unknown) => void
}

export function useUpdateSmartLockPin({ onSuccess, onError }: UseUpdateSmartLockPinParams = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['update-smart-lock-pin'],
    mutationFn: (data: UpdateSmartLockPinBody) => smartLockPinApi.update(data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['get-smart-lock-pins'] })
      onSuccess?.(data)
    },
    onError,
  })
}
