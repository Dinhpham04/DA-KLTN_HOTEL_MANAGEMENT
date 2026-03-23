import { roomApi } from '@/api/room.api'
import type { PaginatedRoomResponse, Room, RoomFilterParams } from '@/types/room'
import { useQuery } from '@tanstack/react-query'

interface UseGetRoomsParams {
  params?: RoomFilterParams
  onSuccess?: (data: Room[]) => void
  onError?: (error: unknown) => void
}

function isRoomArray(payload: unknown): payload is Room[] {
  return (
    Array.isArray(payload) &&
    (payload.length === 0 || (typeof payload[0] === 'object' && 'roomId' in (payload[0] as object)))
  )
}

function normalizeRoomsResponse(payload: unknown): PaginatedRoomResponse {
  // Handle direct array response
  if (isRoomArray(payload)) {
    return {
      data: payload,
      meta: { total: payload.length, page: 1, limit: payload.length, totalPages: 1 },
    }
  }

  // Handle object responses
  if (typeof payload === 'object' && payload !== null) {
    const obj = payload as Record<string, unknown>

    // Format: { data: Room[], meta: {...} }
    if ('data' in obj && Array.isArray(obj.data)) {
      return {
        data: obj.data as Room[],
        meta: (obj.meta as PaginatedRoomResponse['meta']) ?? {
          total: (obj.data as Room[]).length,
          page: 1,
          limit: (obj.data as Room[]).length,
          totalPages: 1,
        },
      }
    }

    // Format: { items: Room[], meta: {...} }
    if ('items' in obj && Array.isArray(obj.items)) {
      return {
        data: obj.items as Room[],
        meta: (obj.meta as PaginatedRoomResponse['meta']) ?? {
          total: (obj.items as Room[]).length,
          page: 1,
          limit: (obj.items as Room[]).length,
          totalPages: 1,
        },
      }
    }
  }

  // Default fallback
  return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
}

export function useGetRooms({ params, onSuccess, onError }: UseGetRoomsParams = {}) {
  return useQuery({
    queryKey: ['get-rooms', params],
    queryFn: async () => {
      try {
        const response = await roomApi.getRooms(params)
        const normalized = normalizeRoomsResponse(response.data)
        onSuccess?.(normalized.data)
        return normalized
      } catch (error) {
        onError?.(error)
        throw error
      }
    },
  })
}
