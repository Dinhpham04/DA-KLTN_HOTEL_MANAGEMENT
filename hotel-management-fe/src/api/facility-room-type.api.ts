import apiClient from '@/lib/axios'
import type {
  FacilityRoomTypeMatrixResponse,
  UpsertFacilityRoomTypeBody,
} from '@/types/facility-room-type'

export const facilityRoomTypeApi = {
  getMatrix: () => apiClient.get<FacilityRoomTypeMatrixResponse>('/facility-room-types'),

  upsertMatrix: (data: UpsertFacilityRoomTypeBody) => apiClient.post('/facility-room-types', data),
}
