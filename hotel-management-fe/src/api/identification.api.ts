import apiClient from '@/lib/axios'
import type { CreateIdentificationBody, UpdateIdentificationBody } from '@/types/identification'

export const identificationApi = {
  getByClientId: (clientId: number) =>
    apiClient.get<unknown>(`/clients/${clientId}/identifications`),

  getById: (identificationId: number) =>
    apiClient.get<unknown>(`/identifications/${identificationId}`),

  create: (clientId: number, data: CreateIdentificationBody) =>
    apiClient.post(`/clients/${clientId}/identifications`, data),

  update: ({ identificationId, ...data }: UpdateIdentificationBody) =>
    apiClient.patch(`/identifications/${identificationId}`, data),

  delete: (identificationId: number) => apiClient.delete(`/identifications/${identificationId}`),
}
