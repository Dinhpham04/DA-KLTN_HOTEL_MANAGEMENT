import apiClient from '@/lib/axios'
import type {
  BulkUpdateRentBody,
  RentFilterParams,
  RentListResponse,
} from '@/types/rent'

export const rentApi = {
  getRentList: (params?: RentFilterParams) =>
    apiClient.get<RentListResponse>('/rents/list', { params }),

  bulkUpdateNotDeposited: (data: BulkUpdateRentBody) =>
    apiClient.put('/rents/not-deposited', data),

  bulkUpdateDeposited: (data: BulkUpdateRentBody) =>
    apiClient.put('/rents/deposited', data),
}
