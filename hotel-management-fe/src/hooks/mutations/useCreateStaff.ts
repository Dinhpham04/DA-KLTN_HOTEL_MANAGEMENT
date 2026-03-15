import { useMutation } from '@tanstack/react-query'
import { staffApi } from '@/api/staff.api'
import type { CreateStaffBody } from '@/types/staff'

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
