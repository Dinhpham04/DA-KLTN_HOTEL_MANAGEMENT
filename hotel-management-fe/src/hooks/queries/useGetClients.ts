import { clientApi } from '@/api/client.api'
import type {
  Client,
  ClientFilterParams,
  ClientPaginationMeta,
  PaginatedClientResponse,
} from '@/types/client'
import { useQuery } from '@tanstack/react-query'

interface UseGetClientsParams {
  params?: ClientFilterParams
  onSuccess?: (clients: Client[]) => void
  onError?: (error: unknown) => void
}

function isClientArray(value: unknown): value is Client[] {
  return Array.isArray(value)
}

function normalizeClientsResponse(payload: unknown): PaginatedClientResponse {
  if (isClientArray(payload)) {
    return {
      items: payload,
      meta: {
        total: payload.length,
        page: 1,
        limit: payload.length || 1,
        totalPages: 1,
      },
    }
  }

  if (typeof payload === 'object' && payload !== null) {
    const dataPayload = payload as Record<string, unknown>

    if (Array.isArray(dataPayload.items) && dataPayload.meta) {
      return {
        items: dataPayload.items as Client[],
        meta: dataPayload.meta as ClientPaginationMeta,
      }
    }

    if (Array.isArray(dataPayload.data) && dataPayload.meta) {
      return {
        items: dataPayload.data as Client[],
        meta: dataPayload.meta as ClientPaginationMeta,
      }
    }

    if (
      typeof dataPayload.data === 'object' &&
      dataPayload.data !== null &&
      Array.isArray((dataPayload.data as Record<string, unknown>).items)
    ) {
      const nested = dataPayload.data as Record<string, unknown>
      return {
        items: nested.items as Client[],
        meta: (nested.meta as ClientPaginationMeta) ?? {
          total: (nested.items as Client[]).length,
          page: 1,
          limit: (nested.items as Client[]).length || 1,
          totalPages: 1,
        },
      }
    }
  }

  return {
    items: [],
    meta: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  }
}

export function useGetClients({ params, onSuccess, onError }: UseGetClientsParams) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: async () => {
      try {
        const response = await clientApi.getClients(params)
        const normalized = normalizeClientsResponse(response.data)
        onSuccess?.(normalized.items)
        return normalized
      } catch (error) {
        onError?.(error)
        throw error
      }
    },
  })
}
