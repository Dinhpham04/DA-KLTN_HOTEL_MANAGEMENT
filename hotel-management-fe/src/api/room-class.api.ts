import apiClient from '@/lib/axios'

export interface RoomClass {
  roomClassId: number
  dataStatus: number
  roomClassName: string
  orderNum: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedRoomClassResponse {
  data: RoomClass[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const roomClassApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedRoomClassResponse>('/room-classes', { params }),
}
