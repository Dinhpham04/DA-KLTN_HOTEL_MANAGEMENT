import apiClient from '@/lib/axios'
import type {
  AnnouncementFilterParams,
  AnnouncementListResponse,
  DailyBusinessResponse,
  SaleSettingResponse,
  UpdateSaleDateBody,
  UpsertResidualRoomBody,
} from '@/types/dashboard-header'

export const dashboardHeaderApi = {
  getDailyBusiness: (date?: string) =>
    apiClient.get<DailyBusinessResponse>('/daily-business-report', {
      params: date ? { date } : undefined,
    }),

  upsertResidualRoom: (data: UpsertResidualRoomBody) =>
    apiClient.post<{ statusCode: number }>('/residual-room', data),

  getAnnouncements: (params: AnnouncementFilterParams) =>
    apiClient.get<AnnouncementListResponse>('/task-notification', { params }),

  getSaleSetting: () => apiClient.get<SaleSettingResponse>('/sale/get-date'),

  updateSaleDate: (data: UpdateSaleDateBody) =>
    apiClient.put<{ statusCode: number }>('/sale/update-date', data),
}
