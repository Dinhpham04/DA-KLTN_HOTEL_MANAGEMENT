import apiClient from '@/lib/axios'
import type { CreateFacilityBody, FacilityFilterParams, UpdateFacilityBody } from '@/types/facility'

export const facilityApi = {
  getFacilities: (params?: FacilityFilterParams) =>
    apiClient.get<unknown>('/facilities', { params }),

  getFacilityById: (facilityId: number) => apiClient.get<unknown>(`/facilities/${facilityId}`),

  createFacility: (data: CreateFacilityBody) => apiClient.post('/facilities', data),

  updateFacility: ({ facilityId, ...data }: UpdateFacilityBody) =>
    apiClient.patch(`/facilities/${facilityId}`, data),

  deleteFacility: (facilityId: number) => apiClient.delete(`/facilities/${facilityId}`),
}
