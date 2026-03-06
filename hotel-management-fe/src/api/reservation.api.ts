import type { PaginatedResponse, PaginationParams, Reservation } from '@/types'
import apiClient from '@/lib/axios'

export const reservationApi = {
  getList: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Reservation>>('/reservations', { params }),

  getById: (id: number) => apiClient.get<Reservation>(`/reservations/${id}`),

  create: (data: Partial<Reservation>) => apiClient.post<Reservation>('/reservations', data),

  update: (id: number, data: Partial<Reservation>) =>
    apiClient.patch<Reservation>(`/reservations/${id}`, data),

  delete: (id: number) => apiClient.delete(`/reservations/${id}`),

  checkIn: (id: number) => apiClient.post<Reservation>(`/reservations/${id}/check-in`),

  checkOut: (id: number) => apiClient.post<Reservation>(`/reservations/${id}/check-out`),

  cancel: (id: number, reason?: string) =>
    apiClient.post<Reservation>(`/reservations/${id}/cancel`, { reason }),
}
