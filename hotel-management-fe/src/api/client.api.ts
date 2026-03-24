import apiClient from '@/lib/axios'
import type { ClientFilterParams, CreateClientBody, UpdateClientBody } from '@/types/client'

export const clientApi = {
  getClients: (params?: ClientFilterParams) => apiClient.get<unknown>('/clients', { params }),

  getClientById: (clientId: number) => apiClient.get<unknown>(`/clients/${clientId}`),

  createClient: (data: CreateClientBody) => apiClient.post('/clients', data),

  updateClient: ({ clientId, ...data }: UpdateClientBody) =>
    apiClient.patch(`/clients/${clientId}`, data),

  deleteClient: (clientId: number) => apiClient.delete(`/clients/${clientId}`),

  // Convenience methods for suspend/reactivate
  suspendClient: (clientId: number) => apiClient.patch(`/clients/${clientId}`, { dataStatus: 0 }),

  reactivateClient: (clientId: number) =>
    apiClient.patch(`/clients/${clientId}`, { dataStatus: 1 }),
}
