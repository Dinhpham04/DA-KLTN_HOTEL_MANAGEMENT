import { whiteboardApi } from '@/api/whiteboard.api'
import type { WhiteboardFilterParams, WhiteboardResponse } from '@/types/whiteboard'
import { useInfiniteQuery } from '@tanstack/react-query'

interface UseWhiteboardParams {
  params?: WhiteboardFilterParams
  enabled?: boolean
}

export function useWhiteboard({ params, enabled = true }: UseWhiteboardParams = {}) {
  return useInfiniteQuery({
    queryKey: ['whiteboard', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await whiteboardApi.getAll({
        ...params,
        page: pageParam as number,
        perPage: params?.perPage ?? 1,
      })
      return response.data as WhiteboardResponse
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, lastPage: total } = lastPage.pagination
      return currentPage < total ? currentPage + 1 : undefined
    },
    enabled,
  })
}
