import { useQuery } from '@tanstack/react-query'
import { staffApi } from '@/api/staff.api'
import type { PaginatedStaffResponse, Staff } from '@/types/staff'

interface UseGetStaffsParams {
  staffType?: string
  onSuccess?: (data: Staff[]) => void
  onError?: (error: unknown) => void
}

export function useGetStaffs({ staffType, onSuccess, onError }: UseGetStaffsParams) {
  return useQuery({
    queryKey: ['get-staffs', staffType],
    queryFn: async () => {
      try {
        const staffTypeNum = staffType ? Number(staffType) : undefined
        const response = await staffApi.getStaffs(
          staffTypeNum ? { staffType: staffTypeNum } : undefined,
        )

        const paginated = response.data as unknown as PaginatedStaffResponse
        const staffList = paginated.data ?? []

        onSuccess?.(staffList)
        return staffList
      } catch (error) {
        onError?.(error)
        throw error
      }
    },
  })
}
