import { staffApi } from '@/api/staff.api'
import { useMutation } from '@tanstack/react-query'

interface UseDeleteStaffParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useDeleteStaff({ onSuccess, onError }: UseDeleteStaffParams) {
  return useMutation({
    mutationKey: ['delete-staff'],
    mutationFn: (staffId: number) => staffApi.deleteStaff(staffId),
    onSuccess,
    onError,
  })
}
