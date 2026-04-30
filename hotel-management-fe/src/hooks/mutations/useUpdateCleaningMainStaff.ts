import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { UpdateMainStaffBody } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateCleaningMainStaff({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['update-cleaning-main-staff'],
    mutationFn: ({ id, data }: { id: number; data: UpdateMainStaffBody }) =>
      cleaningShiftApi.updateMainStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
