import apiClient from '@/lib/axios'
import type {
  CreateReserveOccupierBatchBody,
  CreateReserveOccupierBody,
  ReserveOccupier,
  ReserveOccupierFilterParams,
  UpdateReserveOccupierBody,
} from '@/types/occupier'

export const occupierApi = {
  getByReserveId: (params: ReserveOccupierFilterParams) =>
    apiClient.get<{ data: ReserveOccupier[] }>('/reserve-occupiers', { params }),

  create: (data: CreateReserveOccupierBody, reserveId: number) =>
    apiClient.post<ReserveOccupier>(`/reserve-occupiers`, {
      ...data,
      reserveId,
    }),

  createBatch: (data: CreateReserveOccupierBatchBody) =>
    apiClient.post<{ data: ReserveOccupier[] }>('/reserve-occupiers/batch', data),

  update: (id: number, data: UpdateReserveOccupierBody) =>
    apiClient.patch<ReserveOccupier>(`/reserve-occupiers/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/reserve-occupiers/${id}`),
}
