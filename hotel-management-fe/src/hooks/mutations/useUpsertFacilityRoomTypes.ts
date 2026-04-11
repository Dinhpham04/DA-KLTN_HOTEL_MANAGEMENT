import { facilityRoomTypeApi } from '@/api/facility-room-type.api'
import type { UpsertFacilityRoomTypeBody } from '@/types/facility-room-type'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseUpsertFacilityRoomTypesParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpsertFacilityRoomTypes({
  onSuccess,
  onError,
}: UseUpsertFacilityRoomTypesParams = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['upsert-facility-room-types'],
    mutationFn: (data: UpsertFacilityRoomTypeBody) => facilityRoomTypeApi.upsertMatrix(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-room-types'] })
      onSuccess?.()
    },
    onError,
  })
}
