import apiClient from '@/lib/axios'
import type {
  CreateSaleDetailBody,
  SaleDetail,
  SaleDetailFilterParams,
  UpdateSaleDetailBody,
} from '@/types/billing'

export const saleDetailApi = {
  getByReserveId: (params: SaleDetailFilterParams) =>
    apiClient.get<{ data: SaleDetail[] }>('/sale-details', { params }),

  create: (data: CreateSaleDetailBody) => apiClient.post<SaleDetail>('/sale-details', data),

  update: (id: number, data: UpdateSaleDetailBody) =>
    apiClient.patch<SaleDetail>(`/sale-details/${id}`, data),

  delete: (id: number) => apiClient.delete(`/sale-details/${id}`),
}
