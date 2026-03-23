import { staffApi } from '@/api/staff.api'
import type { CreateStaffBody } from '@/types/staff'
import { useMutation } from '@tanstack/react-query'

interface UseCreateStaffParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateStaff({ onSuccess, onError }: UseCreateStaffParams) {
  return useMutation({
    mutationKey: ['create-staff'],
    mutationFn: (data: CreateStaffBody) => staffApi.createStaff(data),
    onSuccess,
    onError,
  })
}
