import { dashboardHeaderApi } from '@/api/dashboard-header.api'
import type { UpdateSaleDateBody } from '@/types/dashboard-header'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseUpdateSaleDateParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateSaleDate({ onSuccess, onError }: UseUpdateSaleDateParams = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['update-sale-date'],
    mutationFn: (data: UpdateSaleDateBody) => dashboardHeaderApi.updateSaleDate(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sale-setting'] })
      onSuccess?.()
    },
    onError,
  })
}
