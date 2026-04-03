import apiClient from '@/lib/axios'
import type {
  CreateReservationBody,
  ReservationFilterParams,
  UpdateReservationBody,
} from '@/types/reservation'

export const reservationApi = {
  getList: (params?: ReservationFilterParams) =>
    apiClient.get<unknown>('/reservations', { params }),

  getById: (id: number) => apiClient.get<unknown>(`/reservations/${id}`),

  create: (data: CreateReservationBody) => apiClient.post('/reservations', data),

  update: ({ reserveId, ...data }: UpdateReservationBody) =>
    apiClient.patch(`/reservations/${reserveId}`, data),

  delete: (id: number) => apiClient.delete(`/reservations/${id}`),

  confirm: (id: number) => apiClient.post(`/reservations/${id}/confirm`),

  checkIn: (id: number) => apiClient.post(`/reservations/${id}/check-in`),

  checkOut: (id: number) => apiClient.post(`/reservations/${id}/check-out`),

  cancel: (id: number, cancelReason?: string) =>
    apiClient.post(`/reservations/${id}/cancel`, { cancelReason }),
}
