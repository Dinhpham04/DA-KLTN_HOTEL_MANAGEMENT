import apiClient from '@/lib/axios'
import type {
  CalculateFeesBody,
  CalculateFeesResponse,
  RequestType,
  RequestTypeFilterParams,
} from '@/types/pricing'

export const pricingApi = {
  getRequestTypes: (params?: RequestTypeFilterParams) =>
    apiClient.get<RequestType[]>('/pricing/request-types', { params }),

  calculateFees: (data: CalculateFeesBody) =>
    apiClient.post<CalculateFeesResponse>('/pricing/calculate-fees', data),
}
