import { countryApi } from '@/api/country.api'
import type { Country } from '@/types/country'
import { useQuery } from '@tanstack/react-query'

export function useGetCountries() {
  return useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await countryApi.getCountries()
      return response.data
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - countries don't change often
  })
}
