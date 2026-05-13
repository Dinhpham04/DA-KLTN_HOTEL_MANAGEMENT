import { pricingApi } from '@/api/pricing.api'
import type { CalculateFeesBody } from '@/types/pricing'
import { useMutation } from '@tanstack/react-query'

interface UseCalculateFeesParams {
  onSuccess?: (data: Awaited<ReturnType<typeof pricingApi.calculateFees>>['data']) => void
  onError?: (error: unknown) => void
}

export function useCalculateFees({ onSuccess, onError }: UseCalculateFeesParams = {}) {
  return useMutation({
    mutationFn: (data: CalculateFeesBody) => pricingApi.calculateFees(data),
    onSuccess: (response) => onSuccess?.(response.data),
    onError,
  })
}
