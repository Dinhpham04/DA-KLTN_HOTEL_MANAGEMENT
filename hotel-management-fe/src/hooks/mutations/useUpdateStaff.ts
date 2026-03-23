import { staffApi } from '@/api/staff.api'
import type { UpdateStaffBody } from '@/types/staff'
import { useMutation } from '@tanstack/react-query'

interface UseUpdateStaffParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateStaff({ onSuccess, onError }: UseUpdateStaffParams) {
  return useMutation({
    mutationKey: ['update-staff'],
    mutationFn: (data: UpdateStaffBody) => staffApi.updateStaff(data),
    onSuccess,
    onError,
  })
}
