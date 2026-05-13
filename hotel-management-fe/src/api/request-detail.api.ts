import apiClient from '@/lib/axios'
import type {
  CreateRequestDetailBody,
  RequestDetail,
  RequestDetailFilterParams,
  UpdateRequestDetailBody,
} from '@/types/billing'

export const requestDetailApi = {
  getByReserveId: (params: RequestDetailFilterParams) =>
    apiClient.get<{ data: RequestDetail[] }>('/request-details', { params }),

  create: (data: CreateRequestDetailBody) =>
    apiClient.post<RequestDetail>('/request-details', data),

  update: (id: number, data: UpdateRequestDetailBody) =>
    apiClient.patch<RequestDetail>(`/request-details/${id}`, data),

  delete: (id: number) => apiClient.delete(`/request-details/${id}`),
}
