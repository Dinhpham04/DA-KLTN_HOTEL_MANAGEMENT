import { parkingStatusApi } from '@/api/parking-status.api'
import type { ParkingStatusFilterParams } from '@/types/parking-status'
import { useQuery } from '@tanstack/react-query'

interface UseParkingStatusParams {
  params?: ParkingStatusFilterParams
  enabled?: boolean
}

export function useParkingStatus({ params, enabled = true }: UseParkingStatusParams = {}) {
  return useQuery({
    queryKey: ['parking-status', params],
    queryFn: async () => {
      const response = await parkingStatusApi.getParkingStatus(params)
      return response.data ?? []
    },
    enabled,
  })
}
