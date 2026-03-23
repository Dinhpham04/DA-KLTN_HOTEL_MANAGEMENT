import apiClient from '@/lib/axios'
import type {
  CreateRoomBody,
  PaginatedRoomResponse,
  Room,
  RoomFilterParams,
  UpdateRoomBody,
} from '@/types/room'

export const roomApi = {
  getRooms: (params?: RoomFilterParams) =>
    apiClient.get<PaginatedRoomResponse>('/rooms', { params }),

  getRoomById: (roomId: number) => apiClient.get<Room>(`/rooms/${roomId}`),

  createRoom: (data: CreateRoomBody) => apiClient.post<Room>('/rooms', data),

  updateRoom: ({ roomId, ...data }: UpdateRoomBody) =>
    apiClient.patch<Room>(`/rooms/${roomId}`, data),

  deleteRoom: (roomId: number) => apiClient.delete(`/rooms/${roomId}`),

  updateRoomStatus: (roomId: number, roomStatus: number) =>
    apiClient.patch<Room>(`/rooms/${roomId}/status`, { roomStatus }),
}
