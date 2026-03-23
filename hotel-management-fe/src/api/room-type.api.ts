import apiClient from '@/lib/axios'
import type { PaginatedRoomTypeResponse, RoomTypeFilterParams } from '@/types/room-type'

export const roomTypeApi = {
  getRoomTypes: (params?: RoomTypeFilterParams) =>
    apiClient.get<PaginatedRoomTypeResponse>('/room-types', { params }),
}
