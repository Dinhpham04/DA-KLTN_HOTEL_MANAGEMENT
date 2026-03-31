import { stayTypeApi } from '@/api/stay-type.api'
import { useQuery } from '@tanstack/react-query'

export function useGetStayTypes() {
  return useQuery({
    queryKey: ['stay-types'],
    queryFn: async () => {
      const response = await stayTypeApi.getStayTypes()
      // Axios interceptor already unwraps the ApiEnvelope → response.data is StayType[]
      return (response.data) ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
}
