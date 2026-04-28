import apiClient from '@/lib/axios'
import type { ParkingStatusFilterParams, ParkingStatusResponse } from '@/types/parking-status'

export const parkingStatusApi = {
  getParkingStatus: (params?: ParkingStatusFilterParams) =>
    apiClient.get<ParkingStatusResponse>('/parking-status', { params }),
}
