import { clientApi } from '@/api/client.api'
import type { Client } from '@/types/client'
import { useQuery } from '@tanstack/react-query'

interface UseGetClientByIdParams {
  clientId: number
  enabled?: boolean
  onSuccess?: (client: Client) => void
  onError?: (error: unknown) => void
}

function normalizeClientResponse(payload: unknown): Client | null {
  if (typeof payload === 'object' && payload !== null) {
    const dataPayload = payload as Record<string, unknown>

    // Handle { data: Client } format
    if (dataPayload.data && typeof dataPayload.data === 'object') {
      return dataPayload.data as Client
    }

    // Handle direct Client format
    if ('clientId' in dataPayload) {
      return dataPayload as unknown as Client
    }
  }

  return null
}

export function useGetClientById({
  clientId,
  enabled = true,
  onSuccess,
  onError,
}: UseGetClientByIdParams) {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: async () => {
      try {
        const response = await clientApi.getClientById(clientId)
        const client = normalizeClientResponse(response.data)
        if (client) {
          onSuccess?.(client)
        }
        return client
      } catch (error) {
        onError?.(error)
        throw error
      }
    },
    enabled: enabled && !!clientId,
  })
}
