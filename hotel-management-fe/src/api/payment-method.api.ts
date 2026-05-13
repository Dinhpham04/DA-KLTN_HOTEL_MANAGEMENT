import apiClient from '@/lib/axios'
import type { PaymentMethod } from '@/types/billing'

export const paymentMethodApi = {
  getAll: () => apiClient.get<{ data: PaymentMethod[] }>('/payment-methods'),
}
