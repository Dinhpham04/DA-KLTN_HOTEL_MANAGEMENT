import apiClient from '@/lib/axios'
import type { WhiteboardFilterParams, WhiteboardResponse } from '@/types/whiteboard'

export const whiteboardApi = {
  getAll: (params?: WhiteboardFilterParams) =>
    apiClient.get<WhiteboardResponse>('/whiteboard', { params }),
}
