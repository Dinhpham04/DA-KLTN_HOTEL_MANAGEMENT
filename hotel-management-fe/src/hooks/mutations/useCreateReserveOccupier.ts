import { useMutation } from '@tanstack/react-query'
import { occupierApi } from '@/api/occupier.api'
import type { CreateReserveOccupierBody, CreateReserveOccupierBatchBody } from '@/types/occupier'

interface UseCreateReserveOccupierParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateReserveOccupier({
  onSuccess,
  onError,
}: UseCreateReserveOccupierParams = {}) {
  return useMutation({
    mutationFn: (payload: { data: CreateReserveOccupierBody; reserveId: number }) =>
      occupierApi.create(payload.data, payload.reserveId),
    onSuccess,
    onError,
  })
}

export function useCreateReserveOccupierBatch({
  onSuccess,
  onError,
}: UseCreateReserveOccupierParams = {}) {
  return useMutation({
    mutationFn: (data: CreateReserveOccupierBatchBody) => occupierApi.createBatch(data),
    onSuccess,
    onError,
  })
}
