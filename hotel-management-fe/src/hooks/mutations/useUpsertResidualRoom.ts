import { dashboardHeaderApi } from '@/api/dashboard-header.api'
import type { UpsertResidualRoomBody } from '@/types/dashboard-header'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseUpsertResidualRoomParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpsertResidualRoom({ onSuccess, onError }: UseUpsertResidualRoomParams = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['upsert-residual-room'],
    mutationFn: (data: UpsertResidualRoomBody) => dashboardHeaderApi.upsertResidualRoom(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-business-report'] })
      onSuccess?.()
    },
    onError,
  })
}
