import apiClient from '@/lib/axios'
import type {
  CreateSmartLockPinBody,
  SmartLockPinFilterParams,
  UpdateSmartLockPinBody,
} from '@/types/smart-lock-pin'

export const smartLockPinApi = {
  getList: (params?: SmartLockPinFilterParams) =>
    apiClient.get<unknown>('/smart-lock-pins', { params }),

  create: (data: CreateSmartLockPinBody) => apiClient.post('/smart-lock-pins', data),

  update: ({ roomPinCredentialId, ...data }: UpdateSmartLockPinBody) =>
    apiClient.patch(`/smart-lock-pins/${roomPinCredentialId}`, data),
}
