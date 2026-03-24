import { identificationApi } from '@/api/identification.api'
import type { Identification } from '@/types/identification'
import { useQuery } from '@tanstack/react-query'

interface UseGetIdentificationsParams {
  clientId: number
  onSuccess?: (identifications: Identification[]) => void
  onError?: (error: unknown) => void
  enabled?: boolean
}

function normalizeIdentificationsResponse(payload: unknown): Identification[] {
  if (Array.isArray(payload)) {
    return payload as Identification[]
  }

  if (typeof payload === 'object' && payload !== null) {
    const dataPayload = payload as Record<string, unknown>

    if (Array.isArray(dataPayload.data)) {
      return dataPayload.data as Identification[]
    }

    if (Array.isArray(dataPayload.items)) {
      return dataPayload.items as Identification[]
    }
  }

  return []
}

export function useGetIdentifications({
  clientId,
  onSuccess,
  onError,
  enabled = true,
}: UseGetIdentificationsParams) {
  return useQuery({
    queryKey: ['identifications', clientId],
    queryFn: async () => {
      try {
        const response = await identificationApi.getByClientId(clientId)
        const normalized = normalizeIdentificationsResponse(response.data)
        onSuccess?.(normalized)
        return normalized
      } catch (error) {
        onError?.(error)
        throw error
      }
    },
    enabled: enabled && !!clientId,
  })
}
