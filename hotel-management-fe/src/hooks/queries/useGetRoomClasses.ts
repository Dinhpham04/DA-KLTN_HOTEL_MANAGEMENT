import { type PaginatedRoomClassResponse, roomClassApi } from '@/api/room-class.api'
import { useQuery } from '@tanstack/react-query'

export function useGetRoomClasses() {
  return useQuery({
    queryKey: ['room-classes', 'all'],
    queryFn: async () => {
      const response = await roomClassApi.getAll({ page: 1, limit: 100 })
      return response.data as PaginatedRoomClassResponse
    },
    staleTime: 5 * 60 * 1000,
  })
}
