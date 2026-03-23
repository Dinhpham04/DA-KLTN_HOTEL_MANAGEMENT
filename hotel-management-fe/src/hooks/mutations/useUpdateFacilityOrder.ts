import { facilityApi } from '@/api/facility.api'
import { useMutation } from '@tanstack/react-query'

interface FacilityOrderItem {
  facilityId: number
  orderNum: number
}

interface UseUpdateFacilityOrderParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateFacilityOrder({ onSuccess, onError }: UseUpdateFacilityOrderParams) {
  return useMutation({
    mutationKey: ['update-facility-order'],
    mutationFn: async (items: FacilityOrderItem[]) => {
      await Promise.all(
        items.map((item) =>
          facilityApi.updateFacility({
            facilityId: item.facilityId,
            orderNum: item.orderNum,
          })
        )
      )
    },
    onSuccess,
    onError,
  })
}
