import { useQuery } from '@tanstack/react-query'

import { smartLockPinApi } from '@/api/smart-lock-pin.api'
import type {
  PaginatedSmartLockPinResponse,
  SmartLockPinFilterParams,
} from '@/types/smart-lock-pin'

interface UseGetSmartLockPinsParams {
  params?: SmartLockPinFilterParams
  enabled?: boolean
}

export function useGetSmartLockPins({ params, enabled = true }: UseGetSmartLockPinsParams = {}) {
  return useQuery({
    queryKey: ['get-smart-lock-pins', params],
    enabled,
    queryFn: async () => {
      const response = await smartLockPinApi.getList(params)
      return response.data as PaginatedSmartLockPinResponse
    },
  })
}
