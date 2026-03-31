import { rentApi } from '@/api/rent.api'
import type { BulkUpdateRentBody } from '@/types/rent'
import { useMutation } from '@tanstack/react-query'

interface UseUpdateRentParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useBulkUpdateNotDeposited({ onSuccess, onError }: UseUpdateRentParams) {
  return useMutation({
    mutationKey: ['bulk-update-rent-not-deposited'],
    mutationFn: (data: BulkUpdateRentBody) => rentApi.bulkUpdateNotDeposited(data),
    onSuccess,
    onError,
  })
}

export function useBulkUpdateDeposited({ onSuccess, onError }: UseUpdateRentParams) {
  return useMutation({
    mutationKey: ['bulk-update-rent-deposited'],
    mutationFn: (data: BulkUpdateRentBody) => rentApi.bulkUpdateDeposited(data),
    onSuccess,
    onError,
  })
}
