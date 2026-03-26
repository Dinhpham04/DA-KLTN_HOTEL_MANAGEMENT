import apiClient from '@/lib/axios'
import type { Country } from '@/types/country'

export const countryApi = {
  getCountries: () => apiClient.get<Country[]>('/countries'),
}
