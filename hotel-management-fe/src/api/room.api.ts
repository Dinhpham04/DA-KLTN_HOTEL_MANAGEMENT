import type { PaginatedResponse, PaginationParams, Room, RoomStatus } from '@/types'
import apiClient from '@/lib/axios'

export const roomApi = {
  getList: (params?: PaginationParams & { status?: RoomStatus }) =>
    apiClient.get<PaginatedResponse<Room>>('/rooms', { params }),

  getById: (id: number) => apiClient.get<Room>(`/rooms/${id}`),

  create: (data: Partial<Room>) => apiClient.post<Room>('/rooms', data),

  update: (id: number, data: Partial<Room>) => apiClient.patch<Room>(`/rooms/${id}`, data),

  delete: (id: number) => apiClient.delete(`/rooms/${id}`),

  updateStatus: (id: number, status: RoomStatus) =>
    apiClient.patch<Room>(`/rooms/${id}/status`, { status }),
}
