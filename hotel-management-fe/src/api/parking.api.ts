import apiClient from '@/lib/axios'
import type {
  CreateParkingBody,
  ParkingListResponse,
  ParkingFilterParams,
  UpdateParkingBody,
  UpdateParkingOrderBody,
} from '@/types/parking'

export const parkingApi = {
  getParkings: (params?: ParkingFilterParams) =>
    apiClient.get<ParkingListResponse>('/parkings', { params }),

  createParking: (data: CreateParkingBody) => apiClient.post('/parkings', data),

  updateParking: ({ parkingId, ...data }: UpdateParkingBody) =>
    apiClient.patch(`/parkings/${parkingId}`, data),

  updateParkingOrder: (data: UpdateParkingOrderBody) =>
    apiClient.patch('/parkings/order/update', data),
}
