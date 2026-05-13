import { paymentMethodApi } from '@/api/payment-method.api'
import { useQuery } from '@tanstack/react-query'

export function useGetPaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const res = await paymentMethodApi.getAll()
      return res.data
    },
  })
}
