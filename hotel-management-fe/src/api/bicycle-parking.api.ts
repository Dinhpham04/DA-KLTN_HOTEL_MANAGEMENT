import apiClient from '@/lib/axios'
import type {
  BicycleParking,
  BicycleParkingFilterParams,
  CreateBicycleParkingBody,
  UpdateBicycleParkingBody,
  UpdateBicycleParkingOrderBody,
} from '@/types/bicycle-parking'

export const bicycleParkingApi = {
  getBicycleParkings: (params?: BicycleParkingFilterParams) =>
    apiClient.get<BicycleParking[]>('/bicycle-parkings', { params }),

  createBicycleParking: (data: CreateBicycleParkingBody) =>
    apiClient.post('/bicycle-parkings', data),

  updateBicycleParking: ({ bicycleParkingId, ...data }: UpdateBicycleParkingBody) =>
    apiClient.patch(`/bicycle-parkings/${bicycleParkingId}`, data),

  updateBicycleParkingOrder: (data: UpdateBicycleParkingOrderBody) =>
    apiClient.patch('/bicycle-parkings/order/update', data),
}
