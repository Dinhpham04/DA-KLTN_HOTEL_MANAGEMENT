import apiClient from '@/lib/axios'
import type { StayType } from '@/types/stay-type'

export const stayTypeApi = {
  getStayTypes: () => apiClient.get<StayType[]>('/stay-types'),
}
