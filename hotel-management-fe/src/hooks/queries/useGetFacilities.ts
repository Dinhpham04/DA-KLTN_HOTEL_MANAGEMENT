import { useQuery } from '@tanstack/react-query'
import { facilityApi } from '@/api/facility.api'
import type {
  Facility,
  FacilityFilterParams,
  FacilityPaginationMeta,
  PaginatedFacilityResponse,
} from '@/types/facility'

interface UseGetFacilitiesParams {
  params?: FacilityFilterParams
  onSuccess?: (facilities: Facility[]) => void
  onError?: (error: unknown) => void
}

function isFacilityArray(value: unknown): value is Facility[] {
  return Array.isArray(value)
}

function normalizeFacilitiesResponse(payload: unknown): PaginatedFacilityResponse {
  if (isFacilityArray(payload)) {
    return {
      data: payload,
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

    if (Array.isArray(dataPayload.data) && dataPayload.meta) {
      return {
        data: dataPayload.data as Facility[],
        meta: dataPayload.meta as FacilityPaginationMeta,
      }
    }

    if (Array.isArray(dataPayload.items) && dataPayload.meta) {
      return {
        data: dataPayload.items as Facility[],
        meta: dataPayload.meta as FacilityPaginationMeta,
      }
    }

    if (
      typeof dataPayload.data === 'object' &&
      dataPayload.data !== null &&
      Array.isArray((dataPayload.data as Record<string, unknown>).items)
    ) {
      const nested = dataPayload.data as Record<string, unknown>
      return {
        data: nested.items as Facility[],
        meta: (nested.meta as FacilityPaginationMeta) ?? {
          total: (nested.items as Facility[]).length,
          page: 1,
          limit: (nested.items as Facility[]).length || 1,
          totalPages: 1,
        },
      }
    }
  }

  return {
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  }
}

export function useGetFacilities({ params, onSuccess, onError }: UseGetFacilitiesParams) {
  return useQuery({
    queryKey: ['facilities', params],
    queryFn: async () => {
      try {
        const response = await facilityApi.getFacilities(params)
        const normalized = normalizeFacilitiesResponse(response.data)
        onSuccess?.(normalized.data)
        return normalized
      } catch (error) {
        onError?.(error)
        throw error
      }
    },
  })
}
