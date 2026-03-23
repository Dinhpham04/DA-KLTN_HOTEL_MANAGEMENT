import { roomTypeApi } from '@/api/room-type.api'
import type { PaginatedRoomTypeResponse, RoomType, RoomTypeFilterParams } from '@/types/room-type'
import { useQuery } from '@tanstack/react-query'

interface UseGetRoomTypesParams {
  params?: RoomTypeFilterParams
  onSuccess?: (data: RoomType[]) => void
  onError?: (error: unknown) => void
}

function isRoomTypeArray(payload: unknown): payload is RoomType[] {
  return (
    Array.isArray(payload) &&
    (payload.length === 0 ||
      (typeof payload[0] === 'object' && 'roomTypeId' in (payload[0] as object)))
  )
}

function normalizeRoomTypesResponse(payload: unknown): PaginatedRoomTypeResponse {
  if (isRoomTypeArray(payload)) {
    return {
      data: payload,
      meta: { total: payload.length, page: 1, limit: payload.length, totalPages: 1 },
    }
  }

  if (typeof payload === 'object' && payload !== null) {
    const obj = payload as Record<string, unknown>
    if ('data' in obj && Array.isArray(obj.data)) {
      return {
        data: obj.data as RoomType[],
        meta: (obj.meta as PaginatedRoomTypeResponse['meta']) ?? {
          total: (obj.data as RoomType[]).length,
          page: 1,
          limit: (obj.data as RoomType[]).length,
          totalPages: 1,
        },
      }
    }
  }

  return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
}

export function useGetRoomTypes({ params, onSuccess, onError }: UseGetRoomTypesParams = {}) {
  return useQuery({
    queryKey: ['get-room-types', params],
    queryFn: async () => {
      try {
        const response = await roomTypeApi.getRoomTypes(params)
        const normalized = normalizeRoomTypesResponse(response.data)
        onSuccess?.(normalized.data)
        return normalized
      } catch (error) {
        onError?.(error)
        throw error
      }
    },
  })
}
